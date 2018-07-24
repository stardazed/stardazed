/**
 * debug/assert - assertions
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * asserts a condition to be true or throw an error otherwise
 * @param cond A condition that can be evaluated to true or false
 * @param msg Error message that will be thrown if cond is false
 */
export function assert(cond: any, msg?: string) {
	if (! cond) {
		console.error(msg || "assertion failed");
		throw new Error(msg || "assertion failed");
	}
}
