/**
 * inquisition/test-run - running a test tree
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export type TestImplFn = () => Promise<void> | void;

export class Test {
	private subTests_: Test[] = [];

	constructor(private name_: string, private body_: TestImplFn) {
	}

	addChild(child: Test) {
		this.subTests_.push(child);
	}

	get body() { return this.body_; }
	get subTests() { return this.subTests_; }
	get isLeaf() { return this.subTests_.length === 0; }

	get name() { return this.name_; }

	before?: TestImplFn;
	beforeAll?: TestImplFn;
	afterAll?: TestImplFn;
	after?: TestImplFn;
}

const enum TestRunPhase {
	None,
	Before,
	Test,
	ChildLoopStart,
	BeforeAll,
	SubTest,
	AfterAll,
	ChildLoopEnd,
	After,
	Exit
}

interface TestRunContext {
	test: Test;
	phase: TestRunPhase;
	childIndex: number;
	pass: boolean;
}

export interface TestReport {
	startReport(): void;
	finishReport(): void;

	enterTest(test: Test): void;
	leaveTest(test: Test): void;

	pass(): void;
	skip(): void;
	failure(msg: string, innerMsg?: string): void;
	error(err: Error, innerMsg?: string): void;

	readonly result: string;
}

class TestRun {
	private testRunStack_: TestRunContext[] = [];
	private nextStepFn_: (this: this) => Promise<void>;
	rootTest: Test;
	report: TestReport;

	constructor(rootTest: Test, report: TestReport) {
		this.rootTest = rootTest;
		this.report = report;
		this.nextStepFn_ = this.nextStep.bind(this);
	}

	private get active() {
		if (this.testRunStack_.length) {
			return this.testRunStack_[0];
		}
		return undefined;
	}

	private runPotentiallyDeferredFn(fn: TestImplFn) {
		return new Promise<void>(
			resolve => {
				resolve(fn());
			})
			.then(() => {
				if (this.active) {
					this.active.phase += 1;
					return this.nextStepFn_();
				}
				throw new Error("Lost Active test");
			})
			.catch(err => {
				if (("name" in err) && (err.name === "AssertionError")) {
					this.report.failure(err.message);
				}
				else if (("name" in err) && (err.name === "SkipError")) {
					this.report.skip();
				}
				else {
					if (!(err instanceof Error)) {
						err = new Error(err.toString());
					}
					this.report.error(err);
				}
				this.active!.pass = false;
				this.active!.phase = TestRunPhase.Exit;
				return this.nextStepFn_();
			});
	}

	private enterTest(test: Test) {
		this.testRunStack_.unshift({
			test,
			phase: TestRunPhase.None,
			childIndex: -1,
			pass: true
		});
		if (test !== this.rootTest) {
			this.report.enterTest(test);
		}
	}

	private nextStep(): Promise<void> {
		const active = this.active;
		if (!active) {
			return Promise.resolve();
		}

		// advance to the next usable step
		if (active.phase === TestRunPhase.None) { active.phase++; }
		if (active.phase === TestRunPhase.Before && (!active.test.before)) { active.phase++; }
		if (active.phase === TestRunPhase.ChildLoopStart) {
			active.childIndex += 1;
			if (active.childIndex >= active.test.subTests.length) {
				active.phase = TestRunPhase.After;
			}
			else {
				active.phase++;
			}
		}
		if (active.phase === TestRunPhase.BeforeAll && (!active.test.beforeAll)) { active.phase++; }
		if (active.phase === TestRunPhase.AfterAll && (!active.test.afterAll)) { active.phase++; }
		if (active.phase === TestRunPhase.After && (!active.test.after)) { active.phase++; }

		// jump back to start of loop
		if (active.phase === TestRunPhase.ChildLoopEnd) {
			active.phase = TestRunPhase.ChildLoopStart;
			return this.nextStepFn_();
		}
		// are we done with this test and subtests?
		else if (active.phase === TestRunPhase.Exit) {
			if (active.test.isLeaf && active.pass) {
				this.report.pass();
			}
			if (active.test !== this.rootTest) {
				this.report.leaveTest(active.test);
			}

			this.testRunStack_.shift();
			if (this.active) {
				// move parent test to next step
				this.active.phase += 1;
			}
			return this.nextStepFn_();
		}
		// recurse into each child
		else if (active.phase === TestRunPhase.SubTest) {
			const curChild = active.test.subTests[active.childIndex];
			if (!curChild) {
				throw new Error("Internal inconsistency: wrong child index");
			}
			this.enterTest(curChild);
			return this.nextStepFn_();
		}
		// one of the test's optional functions
		else {
			let fn: TestImplFn;
			switch (active.phase) {
				case TestRunPhase.Before: fn = active.test.before!; break;
				case TestRunPhase.BeforeAll: fn = active.test.beforeAll!; break;
				case TestRunPhase.Test: fn = active.test.body!; break;
				case TestRunPhase.AfterAll: fn = active.test.afterAll!; break;
				case TestRunPhase.After: fn = active.test.after!; break;
				default:
					throw new Error("Internal inconsistecy: unexpected test phase");
			}
			return this.runPotentiallyDeferredFn(fn);
		}
	}

	run() {
		this.enterTest(this.rootTest);

		this.report.startReport();
		return this.nextStepFn_()
			.then(() => {
				this.report.finishReport();
				return this.report;
			})
			.catch(err => {
				console.error("Inquisition: Internal Error:", err);
				this.report.error(err);
				this.report.finishReport();
				return this.report;
			});
	}
}

export function run(root: Test, report: TestReport) {
	const res = new TestRun(root, report);
	return res.run();
}
