// Inquisition mini testing harness
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace inquisition {

	export type TestBodyFn = () => void;
	export type HelperFn = () => void;

	export class Test {
		private subTests_: Test[] = [];

		constructor(private name_: string, private body_: TestBodyFn) {
		}

		addChild(child: Test) {
			this.subTests_.push(child);
		}

		run() {
			this.body_();
		}

		get subTests(): Test[] {
			return this.subTests_;
		}
		get isLeaf() { return this.subTests_.length === 0; }

		get name() { return this.name_; }

		before?: HelperFn;
		beforeAll?: HelperFn;
		afterAll?: HelperFn;
		after?: HelperFn;
	}

	const rootTest = new Test("root", () => { /* empty test */ });
	var curTest: Test = rootTest;


	// ---


	export interface TestReport {
		startReport(): void;
		finishReport(): void;

		enterTest(test: Test): void;
		leaveTest(test: Test): void;

		pass(): void;
		failure(msg: string, innerMsg?: string): void;
		error(err: Error, innerMsg?: string): void;

		passes: number;
		failures: number;
		errors: number;
	}


	class TestRun {
		constructor(public report: TestReport) {
		}

		private evalTest(test: Test) {
			if (test !== rootTest) {
				this.report.enterTest(test);
			}

			try {
				if (test.before) {
					test.before();
				}

				test.run();
				if (test.isLeaf) {
					this.report.pass();
				}

				if (test.after) {
					test.after();
				}
			}
			catch (e) {
				if (e instanceof AssertionError) {
					this.report.failure(e.message);
				}
				else {
					this.report.error(e);
				}
			}

			for (const sub of test.subTests) {
				if (test.beforeAll) {
					test.beforeAll();
				}

				this.evalTest(sub);

				if (test.afterAll) {
					test.afterAll();
				}
			}

			if (test !== rootTest) {
				this.report.leaveTest(test);
			}
		}

		run(test: Test) {
			this.report.startReport();
			this.evalTest(test);
			this.report.finishReport();
		}
	}


	// ---


	export function group(name: string, init: TestBodyFn) {
		const g = new Test(name, () => { /* group test */ });

		const oldTest = curTest;
		curTest.addChild(g);

		curTest = g;
		init();
		curTest = oldTest;
	}

	export function test(name: string, body: TestBodyFn) {
		curTest.addChild(new Test(name, body));
	}


	export function before(beforeFn: HelperFn) {
		curTest.before = beforeFn;
	}

	export function beforeAll(beforeAllFn: HelperFn) {
		curTest.beforeAll = beforeAllFn;
	}

	export function afterAll(afterAllFn: HelperFn) {
		curTest.afterAll = afterAllFn;
	}

	export function after(afterFn: HelperFn) {
		curTest.after = afterFn;
	}


	function run(root: Test, report: TestReport) {
		const res = new TestRun(report);
		res.run(root);
	}


	export function runAll(report: TestReport) {
		run(rootTest, report);
	}

} // ns testdazed


// Expose IQ for your pleasure
declare function group(name: string, init: inquisition.TestBodyFn): void;
declare function test(name: string, body: inquisition.TestBodyFn): void;

declare function before(beforeFn: inquisition.HelperFn): void;
declare function beforeAll(beforeAllFn: inquisition.HelperFn): void;
declare function afterAll(afterAllFn: inquisition.HelperFn): void;
declare function after(afterFn: inquisition.HelperFn): void;

(function(glob: any){
	glob.group = inquisition.group;
	glob.test = inquisition.test;
	glob.before = inquisition.before;
	glob.beforeAll = inquisition.beforeAll;
	glob.afterAll = inquisition.afterAll;
	glob.after = inquisition.after;
}(window));
