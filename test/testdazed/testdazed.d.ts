declare namespace testdazed {
    type TestBodyFn = () => void;
    type HelperFn = () => void;
    class Test {
        private name_;
        private body_;
        private subTests_;
        constructor(name_: string, body_: TestBodyFn);
        addChild(child: Test): void;
        run(): void;
        readonly subTests: Test[];
        readonly name: string;
        before: HelperFn | null;
        beforeAll: HelperFn | null;
        afterAll: HelperFn | null;
        after: HelperFn | null;
    }
    interface TestReport {
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
    type CheckExpr = () => boolean;
    function checkCustom(expr: CheckExpr, failMsg: string): boolean;
    function checkTrue(expr: boolean): boolean;
    function checkFalse(expr: boolean): boolean;
    function checkNull(tp: any): boolean;
    function checkNonNull(tp: any): boolean;
    function checkEqual<T>(t1: T, t2: T): boolean;
    function checkNotEqual<T>(t1: T, t2: T): boolean;
    function checkNearEqual(f1: number, f2: number, epsilon?: number): boolean;
    function checkNotNearEqual(f1: number, f2: number, epsilon?: number): boolean;
    function checkGT(t: number, u: number): boolean;
    function checkGE(t: number, u: number): boolean;
    function checkLT(t: number, u: number): boolean;
    function checkLE(t: number, u: number): boolean;
    function group(name: string, init: TestBodyFn): void;
    function test(name: string, body: TestBodyFn): void;
    function before(beforeFn: HelperFn): void;
    function beforeAll(beforeAllFn: HelperFn): void;
    function afterAll(afterAllFn: HelperFn): void;
    function after(afterFn: HelperFn): void;
    function runAll(report: TestReport): void;
}
declare function group(name: string, init: testdazed.TestBodyFn): void;
declare function test(name: string, body: testdazed.TestBodyFn): void;
declare function before(beforeFn: testdazed.HelperFn): void;
declare function beforeAll(beforeAllFn: testdazed.HelperFn): void;
declare function afterAll(afterAllFn: testdazed.HelperFn): void;
declare function after(afterFn: testdazed.HelperFn): void;
declare const glob: any;
declare namespace testdazed {
    class SimpleTestReport implements TestReport {
        private passes_;
        private failures_;
        private errors_;
        private checkIndex_;
        private nameTree_;
        private result_;
        private out(...args);
        startReport(): void;
        finishReport(): void;
        enterTest(test: Test): void;
        leaveTest(_test: Test): void;
        private readonly nameTree;
        pass(): void;
        failure(msg: string, innerMsg?: string): void;
        error(msg: string, innerMsg?: string): void;
        readonly passes: number;
        readonly failures: number;
        readonly errors: number;
        readonly result: string;
    }
}
