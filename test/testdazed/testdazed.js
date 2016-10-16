var testdazed;
(function (testdazed) {
    var Test = (function () {
        function Test(name_, body_) {
            this.name_ = name_;
            this.body_ = body_;
            this.subTests_ = [];
            this.before = null;
            this.beforeAll = null;
            this.afterAll = null;
            this.after = null;
        }
        Test.prototype.addChild = function (child) {
            this.subTests_.push(child);
        };
        Test.prototype.run = function () {
            this.body_();
        };
        Object.defineProperty(Test.prototype, "subTests", {
            get: function () {
                return this.subTests_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Test.prototype, "name", {
            get: function () { return this.name_; },
            enumerable: true,
            configurable: true
        });
        return Test;
    }());
    testdazed.Test = Test;
    var rootTest = new Test("root", function () { });
    var curTest = rootTest;
    var curReport = null;
    var TestRun = (function () {
        function TestRun(report) {
            this.report = report;
        }
        TestRun.prototype.evalTest = function (test) {
            this.report.enterTest(test);
            try {
                if (test.before) {
                    test.before();
                }
                test.run();
                if (test.after) {
                    test.after();
                }
            }
            catch (e) {
                this.report.error("Unexpected exception", e.toString());
            }
            for (var _i = 0, _a = test.subTests; _i < _a.length; _i++) {
                var sub = _a[_i];
                if (test.beforeAll) {
                    test.beforeAll();
                }
                this.evalTest(sub);
                if (test.afterAll) {
                    test.afterAll();
                }
            }
            this.report.leaveTest(test);
        };
        TestRun.prototype.run = function (test) {
            var oldReport = curReport;
            curReport = this.report;
            this.report.startReport();
            this.evalTest(test);
            this.report.finishReport();
            curReport = oldReport;
        };
        return TestRun;
    }());
    function checkImpl(expr, failMsg) {
        var success = expr();
        if (success) {
            curReport.pass();
        }
        else {
            curReport.failure(failMsg);
        }
        return success;
    }
    function checkCustom(expr, failMsg) {
        return checkImpl(expr, failMsg);
    }
    testdazed.checkCustom = checkCustom;
    function checkTrue(expr) {
        return checkImpl(function () { return expr; }, "expression was expected to be true");
    }
    testdazed.checkTrue = checkTrue;
    function checkFalse(expr) {
        return checkImpl(function () { return !expr; }, "expression was expected to be false");
    }
    testdazed.checkFalse = checkFalse;
    function checkNull(tp) {
        return checkImpl(function () { return tp == null; }, "expected null or undefined");
    }
    testdazed.checkNull = checkNull;
    function checkNonNull(tp) {
        return checkImpl(function () { return tp != null; }, "expected a valid reference but got null or undefined");
    }
    testdazed.checkNonNull = checkNonNull;
    function checkEqual(t1, t2) {
        return checkImpl(function () { return t1 === t2; }, t1.toString() + " is not equal to " + t2.toString());
    }
    testdazed.checkEqual = checkEqual;
    function checkNotEqual(t1, t2) {
        return checkImpl(function () { return t1 !== t2; }, t1.toString() + " was expected to differ from " + t2.toString());
    }
    testdazed.checkNotEqual = checkNotEqual;
    function checkNearEqual(f1, f2, epsilon) {
        if (epsilon === void 0) { epsilon = 0.00001; }
        return checkImpl(function () { return Math.abs(f2 - f1) <= epsilon; }, f1 + " is not mostly equal to " + f2);
    }
    testdazed.checkNearEqual = checkNearEqual;
    function checkNotNearEqual(f1, f2, epsilon) {
        if (epsilon === void 0) { epsilon = 0.00001; }
        return checkImpl(function () { return Math.abs(f2 - f1) > epsilon; }, f1 + " is too similar to " + f2);
    }
    testdazed.checkNotNearEqual = checkNotNearEqual;
    function checkGT(t, u) {
        return checkImpl(function () { return t > u; }, t + " was expected to be greater than " + u);
    }
    testdazed.checkGT = checkGT;
    function checkGE(t, u) {
        return checkImpl(function () { return t >= u; }, t + " was expected to be greater than or equal to " + u);
    }
    testdazed.checkGE = checkGE;
    function checkLT(t, u) {
        return checkImpl(function () { return t < u; }, t + " was expected to be less than " + u);
    }
    testdazed.checkLT = checkLT;
    function checkLE(t, u) {
        return checkImpl(function () { return t <= u; }, t + " was expected to be less than or equal to " + u);
    }
    testdazed.checkLE = checkLE;
    function group(name, init) {
        var g = new Test(name, function () { });
        var oldTest = curTest;
        curTest.addChild(g);
        curTest = g;
        init();
        curTest = oldTest;
    }
    testdazed.group = group;
    function test(name, body) {
        curTest.addChild(new Test(name, body));
    }
    testdazed.test = test;
    function before(beforeFn) {
        curTest.before = beforeFn;
    }
    testdazed.before = before;
    function beforeAll(beforeAllFn) {
        curTest.beforeAll = beforeAllFn;
    }
    testdazed.beforeAll = beforeAll;
    function afterAll(afterAllFn) {
        curTest.afterAll = afterAllFn;
    }
    testdazed.afterAll = afterAll;
    function after(afterFn) {
        curTest.after = afterFn;
    }
    testdazed.after = after;
    function run(root, report) {
        var res = new TestRun(report);
        res.run(root);
    }
    function runAll(report) {
        run(rootTest, report);
    }
    testdazed.runAll = runAll;
})(testdazed || (testdazed = {}));
var glob = window;
glob.group = testdazed.group;
glob.test = testdazed.test;
glob.before = testdazed.before;
glob.beforeAll = testdazed.beforeAll;
glob.afterAll = testdazed.afterAll;
glob.after = testdazed.after;
var testdazed;
(function (testdazed) {
    var SimpleTestReport = (function () {
        function SimpleTestReport() {
            this.passes_ = 0;
            this.failures_ = 0;
            this.errors_ = 0;
            this.checkIndex_ = 0;
            this.nameTree_ = [];
            this.result_ = [];
        }
        SimpleTestReport.prototype.out = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this.result_.push(args.join(""));
        };
        SimpleTestReport.prototype.startReport = function () {
            this.out("Messages\n------------------");
        };
        SimpleTestReport.prototype.finishReport = function () {
            this.out("------------------");
            this.out("passes   : " + this.passes_);
            this.out("failures : " + this.failures_);
            this.out("errors   : " + this.errors_);
        };
        SimpleTestReport.prototype.enterTest = function (test) {
            this.nameTree_.push(test.name);
            this.checkIndex_ = 0;
        };
        SimpleTestReport.prototype.leaveTest = function (_test) {
            this.nameTree_.pop();
        };
        Object.defineProperty(SimpleTestReport.prototype, "nameTree", {
            get: function () {
                return this.nameTree_.join(".");
            },
            enumerable: true,
            configurable: true
        });
        SimpleTestReport.prototype.pass = function () {
            this.checkIndex_++;
            this.passes_++;
        };
        SimpleTestReport.prototype.failure = function (msg, innerMsg) {
            this.checkIndex_++;
            this.failures_++;
            this.out("FAIL (check " + this.checkIndex_ + ") " + this.nameTree + ": " + msg + " " + (innerMsg || ""));
        };
        SimpleTestReport.prototype.error = function (msg, innerMsg) {
            this.errors_++;
            this.out("ERROR in " + this.nameTree + ": " + msg + " " + (innerMsg || ""));
        };
        Object.defineProperty(SimpleTestReport.prototype, "passes", {
            get: function () { return this.passes_; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SimpleTestReport.prototype, "failures", {
            get: function () { return this.failures_; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SimpleTestReport.prototype, "errors", {
            get: function () { return this.errors_; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SimpleTestReport.prototype, "result", {
            get: function () {
                return this.result_.join("\n");
            },
            enumerable: true,
            configurable: true
        });
        return SimpleTestReport;
    }());
    testdazed.SimpleTestReport = SimpleTestReport;
})(testdazed || (testdazed = {}));
