/**
 * array/ordering - value ordering methods and defaults
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * A function that returns the relative order of two values.
 * If a < b, it returns a number < 0
 * If a = b, it returns 0
 * If a > b, it returns a number > 0
 */
export type FullOrderCompareFn<T> = (a: Readonly<T>, b: Readonly<T>) => number;

/**
 * Standard (string) sort comparison function, used when comparing
 * multiple string fields together or when using non-standard sort.
 * @param a left value to compare
 * @param b right value to compare
 */
export function genericFullOrder<T>(a: T, b: T) {
	return a < b ? -1 : ((a === b) ? 0 : 1);
}

/**
 * Standard numeric sort comparison function, used when comparing
 * arrays made of numbers of numeric fields in structs.
 * @param a left number to compare
 * @param b right number to compare
 */
export function numericFullOrder(a: number, b: number) {
	return a - b;
}

/**
 * A comparator function for use in a binary search.
 * Must return true if a < b (a ordered before b) and false otherwise.
 */
export type OrderBeforeCompareFn<T> = (a: Readonly<T>, b: Readonly<T>) => boolean;

/**
 * Standard ordering function for any value that supports the less-than
 * operator.
 */
export function genericOrderBefore<T>(a: T, b: T) {
	return a < b;
}

/**
 * Create an order-before comparison function from a full-order
 * function.
 */
export function makeOrderBeforeFromFullOrderFn<T>(compare: FullOrderCompareFn<T>): OrderBeforeCompareFn<T> {
	return function(a: T, b: T) {
		return compare(a, b) < 0;
	};
}
