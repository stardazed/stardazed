"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var inquisition;
(function (inquisition) {
    var AssertionError = (function (_super) {
        __extends(AssertionError, _super);
        function AssertionError(options) {
            var _this = this;
            var actualString = options.actual;
            var expectedString = options.expected;
            try {
                actualString = JSON.stringify(options.actual);
            }
            catch (e) { }
            try {
                expectedString = JSON.stringify(options.expected);
            }
            catch (e) { }
            var exprMessage = actualString + " " + options.operator + " " + expectedString;
            var message = options.message ? options.message + " (" + exprMessage + ")" : exprMessage;
            _this = _super.call(this, message) || this;
            _this.name = "AssertionError";
            _this.actual = options.actual;
            _this.expected = options.expected;
            _this.operator = options.operator;
            _this.message = message;
            return _this;
        }
        return AssertionError;
    }(Error));
    inquisition.AssertionError = AssertionError;
    var SkipError = (function (_super) {
        __extends(SkipError, _super);
        function SkipError() {
            var _this = this;
            var message = "Test placeholder, skipped.";
            _this = _super.call(this, message) || this;
            _this.name = "SkipError";
            _this.message = message;
            return _this;
        }
        return SkipError;
    }(Error));
    inquisition.SkipError = SkipError;
    var check;
    (function (check) {
        function fail(actual, expected, operator, message) {
            throw new AssertionError({
                actual: actual,
                expected: expected,
                operator: operator,
                message: message
            });
        }
        check.fail = fail;
        function placeholder() {
            throw new SkipError();
        }
        check.placeholder = placeholder;
        function truthy(expr, message) {
            if (!expr) {
                fail(expr, true, "==", message);
            }
        }
        check.truthy = truthy;
        function falsy(expr, message) {
            if (expr) {
                fail(expr, false, "==", message);
            }
        }
        check.falsy = falsy;
        function present(tp, message) {
            if (tp == null) {
                fail(tp, null, "!=", message);
            }
        }
        check.present = present;
        function notPresent(tp, message) {
            if (tp != null) {
                fail(tp, null, "==", message);
            }
        }
        check.notPresent = notPresent;
        function equal(t1, t2, message) {
            if (t1 !== t2) {
                fail(t1, t2, "===", message);
            }
        }
        check.equal = equal;
        function notEqual(t1, t2, message) {
            if (t1 === t2) {
                fail(t1, t2, "!==", message);
            }
        }
        check.notEqual = notEqual;
        function nearEqual(f1, f2, epsilon, message) {
            if (epsilon === void 0) { epsilon = 0.00001; }
            var success = Math.abs(f2 - f1) <= epsilon;
            if (!success) {
                fail(f1, f2, "~=", message);
            }
        }
        check.nearEqual = nearEqual;
        function notNearEqual(f1, f2, epsilon, message) {
            if (epsilon === void 0) { epsilon = 0.00001; }
            var success = Math.abs(f2 - f1) > epsilon;
            if (!success) {
                fail(f1, f2, "!~=", message);
            }
        }
        check.notNearEqual = notNearEqual;
        function greater(t, u, message) {
            if (t <= u) {
                fail(t, u, ">", message);
            }
        }
        check.greater = greater;
        function greaterEqual(t, u, message) {
            if (t < u) {
                fail(t, u, ">=", message);
            }
        }
        check.greaterEqual = greaterEqual;
        function lesser(t, u, message) {
            if (t >= u) {
                fail(t, u, "<", message);
            }
        }
        check.lesser = lesser;
        function lesserEqual(t, u, message) {
            if (t > u) {
                fail(t, u, "<=", message);
            }
        }
        check.lesserEqual = lesserEqual;
        function structuralEqual(source, expect) {
            for (var k in expect) {
                if (expect.hasOwnProperty(k)) {
                    var e = expect[k];
                    var a = source[k];
                    equal(a, e);
                }
            }
        }
        check.structuralEqual = structuralEqual;
        function throws(throwable, insideFn, message) {
            var didThrow = false;
            try {
                insideFn();
            }
            catch (e) {
                didThrow = true;
                if (typeof throwable === "function") {
                    var correctType = false;
                    if (throwable === String && typeof e === "string") {
                        correctType = true;
                    }
                    else if (throwable === Number && typeof e === "number") {
                        correctType = true;
                    }
                    else if (throwable === Boolean && typeof e === "boolean") {
                        correctType = true;
                    }
                    else {
                        correctType = e instanceof throwable;
                    }
                    if (!correctType) {
                        fail(e, throwable, "instanceof", message || "Got an exception of the wrong type");
                    }
                }
                else {
                    if (e !== throwable) {
                        fail(e, throwable, "===", message || "An unexpected value was thrown");
                    }
                }
            }
            if (!didThrow) {
                fail("<no exception>", throwable, "==", message || "An exception should have been thrown");
            }
        }
        check.throws = throws;
    })(check = inquisition.check || (inquisition.check = {}));
})(inquisition || (inquisition = {}));
var inquisition;
(function (inquisition) {
    var Test = (function () {
        function Test(name_, body_) {
            this.name_ = name_;
            this.body_ = body_;
            this.subTests_ = [];
        }
        Test.prototype.addChild = function (child) {
            this.subTests_.push(child);
        };
        Object.defineProperty(Test.prototype, "body", {
            get: function () { return this.body_; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Test.prototype, "subTests", {
            get: function () { return this.subTests_; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Test.prototype, "isLeaf", {
            get: function () { return this.subTests_.length === 0; },
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
    inquisition.Test = Test;
    var _rootTest_ = new Test("root", function () { });
    var _curTest_ = _rootTest_;
    var TestRun = (function () {
        function TestRun(report) {
            this.report = report;
            this.testRunStack_ = [];
            this.nextStepFn_ = this.nextStep.bind(this);
        }
        Object.defineProperty(TestRun.prototype, "active", {
            get: function () {
                if (this.testRunStack_.length) {
                    return this.testRunStack_[0];
                }
                return undefined;
            },
            enumerable: true,
            configurable: true
        });
        TestRun.prototype.runPotentiallyDeferredFn = function (fn) {
            var _this = this;
            return new Promise(function (resolve) {
                resolve(fn());
            })
                .then(function () {
                if (_this.active) {
                    _this.active.phase += 1;
                    return _this.nextStepFn_();
                }
                throw new Error("Lost Active test");
            })
                .catch(function (err) {
                if (("name" in err) && (err.name === "AssertionError")) {
                    _this.report.failure(err.message);
                }
                else if (("name" in err) && (err.name === "SkipError")) {
                    _this.report.skip();
                }
                else {
                    if (!(err instanceof Error)) {
                        err = new Error(err.toString());
                    }
                    _this.report.error(err);
                }
                _this.active.pass = false;
                _this.active.phase = 9;
                return _this.nextStepFn_();
            });
        };
        TestRun.prototype.enterTest = function (test) {
            this.testRunStack_.unshift({
                test: test,
                phase: 0,
                childIndex: -1,
                pass: true
            });
            if (test !== _rootTest_) {
                this.report.enterTest(test);
            }
        };
        TestRun.prototype.nextStep = function () {
            var active = this.active;
            if (!active) {
                return Promise.resolve();
            }
            if (active.phase === 0) {
                active.phase++;
            }
            if (active.phase === 1 && (!active.test.before)) {
                active.phase++;
            }
            if (active.phase === 3) {
                active.childIndex += 1;
                if (active.childIndex >= active.test.subTests.length) {
                    active.phase = 8;
                }
                else {
                    active.phase++;
                }
            }
            if (active.phase === 4 && (!active.test.beforeAll)) {
                active.phase++;
            }
            if (active.phase === 6 && (!active.test.afterAll)) {
                active.phase++;
            }
            if (active.phase === 8 && (!active.test.after)) {
                active.phase++;
            }
            if (active.phase === 7) {
                active.phase = 3;
                return this.nextStepFn_();
            }
            else if (active.phase === 9) {
                if (active.test.isLeaf && active.pass) {
                    this.report.pass();
                }
                if (active.test !== _rootTest_) {
                    this.report.leaveTest(active.test);
                }
                this.testRunStack_.shift();
                if (this.active) {
                    this.active.phase += 1;
                }
                return this.nextStepFn_();
            }
            else if (active.phase === 5) {
                var curChild = active.test.subTests[active.childIndex];
                if (!curChild) {
                    throw new Error("Internal inconsistency: wrong child index");
                }
                this.enterTest(curChild);
                return this.nextStepFn_();
            }
            else {
                var fn = void 0;
                switch (active.phase) {
                    case 1:
                        fn = active.test.before;
                        break;
                    case 4:
                        fn = active.test.beforeAll;
                        break;
                    case 2:
                        fn = active.test.body;
                        break;
                    case 6:
                        fn = active.test.afterAll;
                        break;
                    case 8:
                        fn = active.test.after;
                        break;
                    default:
                        throw new Error("SOMETHING BAD IS AFOOT!");
                }
                return this.runPotentiallyDeferredFn(fn);
            }
        };
        TestRun.prototype.run = function (test) {
            var _this = this;
            this.enterTest(test);
            this.report.startReport();
            return this.nextStepFn_()
                .then(function () {
                _this.report.finishReport();
            })
                .catch(function (err) {
                console.error("Inquisition: Internal Error:", err);
                _this.report.error(err);
                _this.report.finishReport();
            });
        };
        return TestRun;
    }());
    function group(name, init) {
        var g = new Test(name, function () { });
        var oldTest = _curTest_;
        _curTest_.addChild(g);
        _curTest_ = g;
        init();
        _curTest_ = oldTest;
    }
    inquisition.group = group;
    function test(name, body) {
        _curTest_.addChild(new Test(name, body));
    }
    inquisition.test = test;
    function before(beforeFn) {
        _curTest_.before = beforeFn;
    }
    inquisition.before = before;
    function beforeAll(beforeAllFn) {
        _curTest_.beforeAll = beforeAllFn;
    }
    inquisition.beforeAll = beforeAll;
    function afterAll(afterAllFn) {
        _curTest_.afterAll = afterAllFn;
    }
    inquisition.afterAll = afterAll;
    function after(afterFn) {
        _curTest_.after = afterFn;
    }
    inquisition.after = after;
    function run(root, report) {
        var res = new TestRun(report);
        return res.run(root);
    }
    function runAll(report) {
        return run(_rootTest_, report);
    }
    inquisition.runAll = runAll;
})(inquisition || (inquisition = {}));
(function (glob) {
    glob.group = inquisition.group;
    glob.test = inquisition.test;
    glob.before = inquisition.before;
    glob.beforeAll = inquisition.beforeAll;
    glob.afterAll = inquisition.afterAll;
    glob.after = inquisition.after;
}(window));
var inquisition;
(function (inquisition) {
    var SimpleTestReport = (function () {
        function SimpleTestReport() {
            this.passes_ = 0;
            this.skips_ = 0;
            this.failures_ = 0;
            this.errors_ = 0;
            this.nameTree_ = [];
            this.result_ = [];
        }
        SimpleTestReport.prototype.out = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.result_.push(args.join(""));
        };
        SimpleTestReport.prototype.startReport = function () {
        };
        SimpleTestReport.prototype.finishReport = function () {
            this.out("--------------------");
            this.out("passes........: " + this.passes_);
            this.out("placeholders..: " + this.skips_);
            this.out("failures......: " + this.failures_);
            this.out("errors........: " + this.errors_);
        };
        SimpleTestReport.prototype.enterTest = function (test) {
            this.nameTree_.push(test.name);
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
            this.passes_++;
            this.out("<i>PASS</i> " + this.nameTree);
        };
        SimpleTestReport.prototype.skip = function () {
            this.skips_++;
            this.out("SKIP " + this.nameTree);
        };
        SimpleTestReport.prototype.failure = function (msg, innerMsg) {
            this.failures_++;
            this.out("<b>FAIL</b> " + this.nameTree + ": " + msg + " " + (innerMsg || ""));
        };
        SimpleTestReport.prototype.error = function (err, innerMsg) {
            this.errors_++;
            this.out("<b>ERROR</b> in " + this.nameTree + ": " + err + " " + (innerMsg || ""));
        };
        Object.defineProperty(SimpleTestReport.prototype, "result", {
            get: function () {
                return this.result_.join("<br>\n");
            },
            enumerable: true,
            configurable: true
        });
        return SimpleTestReport;
    }());
    inquisition.SimpleTestReport = SimpleTestReport;
})(inquisition || (inquisition = {}));
