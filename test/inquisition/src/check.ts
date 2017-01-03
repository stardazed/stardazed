// check: assertion-style tests
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace inquisition {

	export interface Stringifyable {
		toString(): string;
	}

	export type ExprResult = Stringifyable | null | undefined;

	export interface AssertionErrorOptions {
		actual: ExprResult;
		expected: ExprResult;
		operator: string;
		message?: string;
	}

	export class AssertionError extends Error {
		public actual: ExprResult;
		public expected: ExprResult;
		public operator: string;

		constructor(options: AssertionErrorOptions) {
			const exprMessage = `${options.actual} ${options.operator} ${options.expected}`;
			const message = options.message ? `${options.message} (${exprMessage})` : exprMessage;

			super(message);

			this.name = "AssertionError";
			this.actual = options.actual;
			this.expected = options.expected;
			this.operator = options.operator;
			this.message = message;
		}
	};


	export namespace check {
		export function fail(actual: ExprResult, expected: ExprResult, operator: string, message?: string) {
			throw new AssertionError({
				actual,
				expected,
				operator,
				message
			});
		}


		export function truthy(expr: boolean, message?: string) {
			if (! expr) { fail(expr, true, "==", message); }
		}

		export function falsy(expr: boolean, message?: string) {
			if (expr) { fail(expr, false, "==", message); }
		}

		export function present(tp: any, message?: string) {
			if (tp == null) { fail(tp, null, "!=", message); }
		}

		export function notPresent(tp: any, message?: string) {
			if (tp != null) { fail(tp, null, "==", message); }
		}

		export function equal<T>(t1: T, t2: T, message?: string) {
			if (t1 !== t2) { fail(t1, t2, "===", message); }
		}

		export function notEqual<T>(t1: T, t2: T, message?: string) {
			if (t1 === t2) { fail(t1, t2, "!==", message); }
		}

		export function nearEqual(f1: number, f2: number, epsilon = 0.00001, message?: string) {
			const success = Math.abs(f2 - f1) <= epsilon;
			if (! success) { fail(f1, f2, "~=", message); }
		}

		export function notNearEqual(f1: number, f2: number, epsilon = 0.00001, message?: string) {
			const success = Math.abs(f2 - f1) > epsilon;
			if (! success) { fail(f1, f2, "!~=", message); }
		}

		export function greater(t: number, u: number, message?: string) {
			if (t <= u) { fail(t, u, ">", message); }
		}

		export function greaterEqual(t: number, u: number, message?: string) {
			if (t < u) { fail(t, u, ">=", message); }
		}

		export function lesser(t: number, u: number, message?: string) {
			if (t >= u) { fail(t, u, "<", message); }
		}

		export function lesserEqual(t: number, u: number, message?: string) {
			if (t > u) { fail(t, u, "<=", message); }
		}


		export function throws(throwable: any, insideFn: () => void, message?: string) {
			let didThrow = false;
			try {
				insideFn();
			}
			catch(e) {
				didThrow = true;
				if (typeof throwable === "function") {
					// handle immediate values
					let correctType = false;
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
					if (! correctType) {
						fail(e, throwable, "instanceof", message || "Got an exception of the wrong type");
					}
				}
				else {
					if (e !== throwable) {
						fail(e, throwable, "===", message || "An unexpected exception was thrown");
					}
				}
			}

			if (! didThrow) {
				fail("<no exception>", throwable, "==", message || "An exception should have been thrown");
			}
		}
	}

} // ns testdazed
