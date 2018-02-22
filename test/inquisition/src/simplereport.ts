// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace inquisition {

	export class SimpleTestReport implements TestReport {
		private passes_ = 0;
		private skips_ = 0;
		private failures_ = 0;
		private errors_ = 0;
		private nameTree_: string[] = [];
		private result_: string[] = [];

		private out(...args: any[]) {
			this.result_.push(args.join(""));
		}

		startReport() {
		}

		finishReport() {
			this.out("--------------------");
			this.out(`passes........: ${this.passes_}`);
			this.out(`placeholders..: ${this.skips_}`);
			this.out(`failures......: ${this.failures_}`);
			this.out(`errors........: ${this.errors_}`);
		}

		enterTest(test: Test) {
			this.nameTree_.push(test.name);
		}

		leaveTest(_test: Test) {
			this.nameTree_.pop();
		}

		private get nameTree(): string {
			return this.nameTree_.join(".");
		}

		pass() {
			this.passes_++;
			this.out(`PASS ${this.nameTree}`);
		}

		skip() {
			this.skips_++;
			this.out(`SKIP ${this.nameTree}`);
		}

		failure(msg: string, innerMsg?: string) {
			this.failures_++;
			this.out(`FAIL ${this.nameTree}: ${msg} ${innerMsg || ""}`);
		}

		error(err: Error, innerMsg?: string) {
			this.errors_++;
			this.out(`ERROR in ${this.nameTree}: ${err} ${innerMsg || ""}`);
		}

		get result() {
			return this.result_.join("\n");
		}
	}

} // ns testdazed
