/**
 * inquisition/context - create an installable test context
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Test, TestImplFn, TestReport, run } from "./test-run";

const _rootTest_ = new Test("root", () => { /* empty test */ });
let _curTest_ = _rootTest_;

function group(name: string, init: TestImplFn) {
	const g = new Test(name, () => { /* group test */ });

	const oldTest = _curTest_;
	_curTest_.addChild(g);

	_curTest_ = g;
	init();
	_curTest_ = oldTest;
}

function test(name: string, body: TestImplFn) {
	_curTest_.addChild(new Test(name, body));
}

function before(beforeFn: TestImplFn) {
	_curTest_.before = beforeFn;
}

function beforeAll(beforeAllFn: TestImplFn) {
	_curTest_.beforeAll = beforeAllFn;
}

function afterAll(afterAllFn: TestImplFn) {
	_curTest_.afterAll = afterAllFn;
}

function after(afterFn: TestImplFn) {
	_curTest_.after = afterFn;
}

export function runAll(report: TestReport) {
	return run(_rootTest_, report);
}

// ----
// when inquisition is included, it immediately is installed in the global scope

(function(glob: any) {
	glob.group = group;
	glob.test = test;
	glob.before = before;
	glob.beforeAll = beforeAll;
	glob.afterAll = afterAll;
	glob.after = after;
// @ts-ignore
}(typeof window === "object" ? window : global));

declare global {
	function group(name: string, init: TestImplFn): void;
	function test(name: string, body: TestImplFn): void;

	function before(beforeFn: TestImplFn): void;
	function beforeAll(beforeAllFn: TestImplFn): void;
	function afterAll(afterAllFn: TestImplFn): void;
	function after(afterFn: TestImplFn): void;
}
