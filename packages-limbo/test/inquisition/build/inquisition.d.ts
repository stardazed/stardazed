declare namespace inquisition {
    interface Stringifyable {
        toString(): string;
    }
    type ExprResult = Stringifyable | null | undefined;
    interface AssertionErrorOptions {
        actual: ExprResult;
        expected: ExprResult;
        operator: string;
        message?: string;
    }
    class AssertionError extends Error {
        actual: ExprResult;
        expected: ExprResult;
        operator: string;
        constructor(options: AssertionErrorOptions);
    }
    class SkipError extends Error {
        constructor();
    }
    namespace check {
        function fail(actual: ExprResult, expected: ExprResult, operator: string, message?: string): void;
        function placeholder(): void;
        function truthy(expr: boolean, message?: string): void;
        function falsy(expr: boolean, message?: string): void;
        function present(tp: any, message?: string): void;
        function notPresent(tp: any, message?: string): void;
        function equal<T>(t1: T, t2: T, message?: string): void;
        function notEqual<T>(t1: T, t2: T, message?: string): void;
        function nearEqual(f1: number, f2: number, epsilon?: number, message?: string): void;
        function notNearEqual(f1: number, f2: number, epsilon?: number, message?: string): void;
        function greater(t: number, u: number, message?: string): void;
        function greaterEqual(t: number, u: number, message?: string): void;
        function lesser(t: number, u: number, message?: string): void;
        function lesserEqual(t: number, u: number, message?: string): void;
        function structuralEqual<T extends object>(source: T, expect: Partial<T>): void;
        function throws(throwable: any, insideFn: () => any, message?: string): void;
    }
}
declare namespace inquisition {
    type TestImplFn = () => Promise<void> | void;
    class Test {
        private name_;
        private body_;
        private subTests_;
        constructor(name_: string, body_: TestImplFn);
        addChild(child: Test): void;
        readonly body: TestImplFn;
        readonly subTests: Test[];
        readonly isLeaf: boolean;
        readonly name: string;
        before?: TestImplFn;
        beforeAll?: TestImplFn;
        afterAll?: TestImplFn;
        after?: TestImplFn;
    }
    interface TestReport {
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
    function group(name: string, init: TestImplFn): void;
    function test(name: string, body: TestImplFn): void;
    function before(beforeFn: TestImplFn): void;
    function beforeAll(beforeAllFn: TestImplFn): void;
    function afterAll(afterAllFn: TestImplFn): void;
    function after(afterFn: TestImplFn): void;
    function runAll(report: TestReport): Promise<void>;
}
declare function group(name: string, init: inquisition.TestImplFn): void;
declare function test(name: string, body: inquisition.TestImplFn): void;
declare function before(beforeFn: inquisition.TestImplFn): void;
declare function beforeAll(beforeAllFn: inquisition.TestImplFn): void;
declare function afterAll(afterAllFn: inquisition.TestImplFn): void;
declare function after(afterFn: inquisition.TestImplFn): void;
declare namespace inquisition {
    class SimpleTestReport implements TestReport {
        private passes_;
        private skips_;
        private failures_;
        private errors_;
        private nameTree_;
        private result_;
        private out(...args);
        startReport(): void;
        finishReport(): void;
        enterTest(test: Test): void;
        leaveTest(_test: Test): void;
        private readonly nameTree;
        pass(): void;
        skip(): void;
        failure(msg: string, innerMsg?: string): void;
        error(err: Error, innerMsg?: string): void;
        readonly result: string;
    }
}
