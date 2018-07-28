/**
 * array/algorithm - various algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { OrderBeforeCompareFn, genericOrderBefore } from "./ordering";

/**
 * Remove all duplicates found in the source array leaving only the first
 * instance of each individual element, retaining the order of the remaining
 * elements. Elements can optionally be given an explicit comparison proxy
 * by means of a provided helper function.
 * @param arr The array to deduplicate, does not need to be sorted
 * @param idGen Optional function to provide a unique identifier for each item
 */
export function stableUniqueUnsorted<T, U>(arr: T[], idGen?: (t: T) => U) {
	const seen = new Set<T | U>();
	return arr.filter(val => {
		const key = idGen ? idGen(val) : val;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * Remove all duplicates found in the sorted source array leaving only the first
 * instance of each individual element, retaining the order of the remaining
 * elements. Elements can optionally be given an explicit comparison proxy by means
 * of a provided helper function.
 * @param arr The array to deduplicate, **must** be pre-sorted
 * @param idGen Optional function to provide a unique identifier for each item
 * @expects {audit} isSorted(arr)
 */
export function stableUniqueSorted<T, U>(arr: T[], idGen?: (t: T) => U): T[] {
	let last: T | U | undefined;
	return arr.filter(val => {
		const key = idGen ? idGen(val) : val;
		if (key !== last) {
			last = key;
			return true;
		}
		return false;
	});
}

/**
 * Calculates the difference of two sorted arrays.
 * @param a The after array, must be sorted
 * @param b The before array, must be sorted
 * @param comp (optional) custom comparison function for values
 * @returns The elements that appear only in the after array (a)
 * @expects {audit} isSorted(a)
 * @expects {audit} isSorted(b)
 */
export function arrayDiffSorted<T>(a: T[], b: T[], comp?: OrderBeforeCompareFn<T>): T[] {
	comp = comp || genericOrderBefore;
	const result = [];
	let curA = 0, curB = 0;
	const endA = a.length, endB = b.length;

	while (curA !== endA && curB !== endB) {
		if (comp(a[curA], b[curB])) {
			result.push(a[curA]);
			++curA;
		}
		else if (comp(b[curB], a[curA])) {
			++curB;
		}
		else {
			++curA;
			++curB;
		}
	}
	result.push.apply(result, a.slice(curA));
	return result;
}

/**
 * Merges the values of two arrays, creating a new array of value pairs.
 * @param left Left values
 * @param right Right values
 * @returns Array of value pairs
 */
export function zip<T, U>(left: T[], right: U[]): [T, U][] {
	const result: [T, U][] = [];
	const maxLen = Math.max(left.length, right.length);
	for (let i = 0; i < maxLen; ++i) {
		result.push([left[i], right[i]]);
	}
	return result;
}

/**
 * Merges the values of two arrays, creating a new flattened array of value pairs.
 * @param left Left values
 * @param right Right values
 * @returns Array of interleaved value pairs
 */
export function zipFlat<T, U>(left: T[], right: U[]): (T | U)[] {
	const result: (T | U)[] = [];
	const maxLen = Math.max(left.length, right.length);
	for (let i = 0; i < maxLen; ++i) {
		result.push(left[i], right[i]);
	}
	return result;
}

/**
 * Combines the values of two arrays, creating a keyed object.
 * @param keys Key values, must be strings
 * @param values The values to be mapped to the keys
 * @returns A plain object with the key-value pairs inserted
 */
export function zipKeyVals<T>(keys: string[], values: T[]): { [k: string]: T; } {
	const result: { [k: string]: T; } = {};
	const maxLen = Math.max(keys.length, values.length);
	for (let i = 0; i < maxLen; ++i) {
		result[keys[i]] = values[i];
	}
	return result;
}
