// testdazed mini testing harness (based on Inquisition)
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace testdazed {

	export type TestBodyFn = () => void;

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

		get name() { return this.name_; }
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
		error(msg: string, innerMsg?: string): void;

		passes: number;
		failures: number;
		errors: number;
	}

	var curReport: TestReport | null = null;


	class TestRun {
		constructor(public report: TestReport) {
		}

		private evalTest(test: Test) {
			this.report.enterTest(test);

			try {
				test.run();
			}
			catch (e) {
				this.report.error("Unexpected exception", e.toString());
			}

			for (const sub of test.subTests) {
				this.evalTest(sub);
			}

			this.report.leaveTest(test);
		}

		run(test: Test) {
			const oldReport = curReport;
			curReport = this.report;
			this.report.startReport();
			this.evalTest(test);
			this.report.finishReport();
			curReport = oldReport;
		}
	}


	// ---


	type CheckExpr = () => boolean;

	function checkImpl(expr: CheckExpr, failMsg: string) {
		const success = expr();
		if (success) {
			curReport!.pass();
		}
		else {
			curReport!.failure(failMsg);
		}
		return success;
	}


	export function checkCustom(expr: CheckExpr, failMsg: string) {
		return checkImpl(expr, failMsg);
	}

	export function checkTrue(expr: boolean) {
		return checkImpl(() => expr, "expression was expected to be true");
	}

	export function checkFalse(expr: boolean) {
		return checkImpl(() => ! expr, "expression was expected to be false");
	}

	export function checkNull(tp: any) {
		return checkImpl(() => tp == null, "expected null or undefined");
	}

	export function checkNonNull(tp: any) {
		return checkImpl(() => tp != null, "expected a valid reference but got null or undefined");
	}

	export function checkEqual<T>(t1: T, t2: T) {
		return checkImpl(() => t1 === t2, `${t1.toString()} is not equal to ${t2.toString()}`);
	}

	export function checkNotEqual<T>(t1: T, t2: T) {
		return checkImpl(() => t1 !== t2, `${t1.toString()} was expected to differ from ${t2.toString()}`);
	}

	export function checkNearEqual(f1: number, f2: number, epsilon = 0.00001) {
		return checkImpl(() => Math.abs(f2 - f1) <= epsilon, `${f1} is not mostly equal to ${f2}`);
	}

	export function checkNotNearEqual(f1: number, f2: number, epsilon = 0.00001) {
		return checkImpl(() => Math.abs(f2 - f1) > epsilon, `${f1} is too similar to ${f2}`);
	}

	export function checkGT(t: number, u: number) {
		return checkImpl(() => t > u, `${t} was expected to be greater than ${u}`);
	}

	export function checkGE(t: number, u: number) {
		return checkImpl(() => t >= u, `${t} was expected to be greater than or equal to ${u}`);
	}

	export function checkLT(t: number, u: number) {
		return checkImpl(() => t < u, `${t} was expected to be less than ${u}`);
	}

	export function checkLE(t: number, u: number) {
		return checkImpl(() => t <= u, `${t} was expected to be less than or equal to ${u}`);
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


	function run(root: Test, report: TestReport) {
		const res = new TestRun(report);
		res.run(root);
	}


	export function runAll(report: TestReport) {
		run(rootTest, report);
	}

} // ns testdazed
