// Inquisition mini testing harness
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace inquisition {

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

	const _rootTest_ = new Test("root", () => { /* empty test */ });
	let _curTest_: Test = _rootTest_;


	// ---


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


	// ---


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

	class TestRun {
		private testRunStack_: TestRunContext[] = [];
		private nextStepFn_: (this: this) => Promise<void>;

		constructor(public report: TestReport) {
			this.nextStepFn_ = this.nextStep.bind(this);
		}

		private get active() {
			if (this.testRunStack_.length) {
				return this.testRunStack_[0];
			}
			return undefined;
		}

		private runPotentiallyDeferredFn(fn: TestImplFn): Promise<void> {
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
						if (! (err instanceof Error)) {
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
			if (test !== _rootTest_) {
				this.report.enterTest(test);
			}
		}

		private nextStep(): Promise<void> {
			const active = this.active;
			if (! active) {
				return Promise.resolve();
			}

			// advance to the next usable step
			if (active.phase === TestRunPhase.None) { active.phase++; }
			if (active.phase === TestRunPhase.Before && (! active.test.before)) { active.phase++; }
			if (active.phase === TestRunPhase.ChildLoopStart) {
				active.childIndex += 1;
				if (active.childIndex >= active.test.subTests.length) {
					active.phase = TestRunPhase.After;
				}
				else {
					active.phase++;
				}
			}
			if (active.phase === TestRunPhase.BeforeAll && (! active.test.beforeAll)) { active.phase++; }
			if (active.phase === TestRunPhase.AfterAll && (! active.test.afterAll)) { active.phase++; }
			if (active.phase === TestRunPhase.After && (! active.test.after)) { active.phase++; }

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
				if (active.test !== _rootTest_) {
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
				if (! curChild) {
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
						throw new Error("SOMETHING BAD IS AFOOT!");
				}
				return this.runPotentiallyDeferredFn(fn);
			}
		}

		run(test: Test) {
			this.enterTest(test);

			this.report.startReport();
			return this.nextStepFn_()
				.then(() => {
					this.report.finishReport();
				})
				.catch(err => {
					console.error("Inquisition: Internal Error:", err);
					this.report.error(err);
					this.report.finishReport();
				});
		}
	}


	// ---


	export function group(name: string, init: TestImplFn) {
		const g = new Test(name, () => { /* group test */ });

		const oldTest = _curTest_;
		_curTest_.addChild(g);

		_curTest_ = g;
		init();
		_curTest_ = oldTest;
	}

	export function test(name: string, body: TestImplFn) {
		_curTest_.addChild(new Test(name, body));
	}


	export function before(beforeFn: TestImplFn) {
		_curTest_.before = beforeFn;
	}

	export function beforeAll(beforeAllFn: TestImplFn) {
		_curTest_.beforeAll = beforeAllFn;
	}

	export function afterAll(afterAllFn: TestImplFn) {
		_curTest_.afterAll = afterAllFn;
	}

	export function after(afterFn: TestImplFn) {
		_curTest_.after = afterFn;
	}


	function run(root: Test, report: TestReport) {
		const res = new TestRun(report);
		return res.run(root);
	}


	export function runAll(report: TestReport) {
		return run(_rootTest_, report);
	}

} // ns testdazed


// Expose IQ for your pleasure
declare function group(name: string, init: inquisition.TestImplFn): void;
declare function test(name: string, body: inquisition.TestImplFn): void;

declare function before(beforeFn: inquisition.TestImplFn): void;
declare function beforeAll(beforeAllFn: inquisition.TestImplFn): void;
declare function afterAll(afterAllFn: inquisition.TestImplFn): void;
declare function after(afterFn: inquisition.TestImplFn): void;

(function(glob: any) {
	glob.group = inquisition.group;
	glob.test = inquisition.test;
	glob.before = inquisition.before;
	glob.beforeAll = inquisition.beforeAll;
	glob.afterAll = inquisition.afterAll;
	glob.after = inquisition.after;
}(window));
