import * as td from "./testdazed";

class SimpleTestReport implements td.TestReport {
	private passes_ = 0;
	private failures_ = 0;
	private errors_ = 0;
	private checkIndex_ = 0;
	private nameTree_: string[] = [];
	
	private out(...args: any[]) {
		console.info.apply(console, args);
	}

	startReport() {
		this.out("Test Report\n------------------");
	}

	finishReport() {
		this.out("------------------");
		this.out("passes   : " + this.passes_);
		this.out("failures : " + this.failures_);
		this.out("errors   : " + this.errors_);
	}

	enterTest(test: td.Test) {
		this.nameTree_.push(test.name);
		this.checkIndex_ = 0;
	}

	leaveTest(test: td.Test) {
		this.nameTree_.pop();
	}
		
	private get nameTree(): string {
		return this.nameTree_.join(".");
	}

	pass(msg?: string, innerMsg?: string) {
		this.checkIndex_++;
		this.passes_++;
		// out("PASS (check #" + checkIndex_ + ") " + this.nameTree + msg + ' ' + (innerMsg || ""));
	}
		
	failure(msg: string, innerMsg?: string) {
		this.checkIndex_++;
		this.failures_++;
		this.out("FAIL (check #" + this.checkIndex_ + ") " + this.nameTree + ": " + msg + ' ' + (innerMsg || ""));
	}	
		
	error(msg: string, innerMsg?: string) {
		this.errors_++;
		this.out("ERROR " + this.nameTree + ": " + msg + ' ' + (innerMsg || ""));
	}

	get passes() { return this.passes_; }
	get failures() { return this.failures_; }
	get errors() { return this.errors_; }
}


// -- add tests to run from external files
import dequeTests from "./test-deque"; dequeTests();


// -- run and report on tests
var report = new SimpleTestReport();
td.runAll(report);
