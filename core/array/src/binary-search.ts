/**
 * array/binary-search - binary search sorted arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { OrderBeforeCompareFn, genericOrderBefore } from "./ordering";

/**
 * Perform a binary search in a sorted array
 * @returns An index pointing to the first element in the array that is not less than
 * (i.e. greater or equal to) value, or array.length if no such element is found.
 */
export function lowerBound<T>(array: ArrayLike<T>, value: T, comp?: OrderBeforeCompareFn<T>) {
	let count = array.length;
	let it: number;
	let first = 0;
	if (comp === undefined) {
		comp = genericOrderBefore;
	}

	while (count > 0) {
		const step = count >> 1;
		it = first + step;
		if (comp(array[it], value)) {
			first = ++it;
			count -= step + 1;
		}
		else {
			count = step;
		}
	}
	return first;
}

/**
 * Perform a binary search in a sorted array
 * @returns An index pointing to the first element in the array that is greater than
 * value, or array.length if no such element is found.
 */
export function upperBound<T>(array: ArrayLike<T>, value: T, comp?: OrderBeforeCompareFn<T>) {
	let count = array.length;
	let it: number;
	let first = 0;
	if (comp === undefined) {
		comp = genericOrderBefore;
	}

	while (count > 0) {
		const step = count >> 1;
		it = first + step;
		if (!comp(value, array[it])) {
			first = ++it;
			count -= step + 1;
		}
		else {
			count = step;
		}
	}
	return first;
}
