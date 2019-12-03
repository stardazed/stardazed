/*
core/sort - sorting algorithms
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { FullOrderCompareFn } from "./algorithm";

/**
 * In-place stable insertion sort a range of elements inside an array
 * @internal
 * @param a The array to sort
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param pred Function that returns the relative order of 2 items
 */
function insertionSortInternal<T>(a: T[], l: number, r: number, pred: FullOrderCompareFn<T>) {
	const len = r - l;
	for (let i = 1; i < len + 1; i++) {
		const temp = a[i + l];
		let j = i;
		while ((j > 0) && (pred(a[j + l - 1], temp) > 0)) {
			a[j + l] = a[j + l - 1];
			j -= 1;
		}
		a[j + l] = temp;
	}
}

/**
 * In-place stable insertion sort for homogeneous standard arrays.
 * @param arr The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export function insertionSort<T>(arr: T[], pred: FullOrderCompareFn<T>) {
	insertionSortInternal(arr, 0, arr.length - 1, pred);
	return arr;
}

/**
 * Standard merge of two sorted half arrays into a single sorted array.
 * @internal
 * @param merged Destination array
 * @param start Index into {merged} to start inserting
 * @param left Left range of items
 * @param startLeft Index into {left} to start from
 * @param sizeLeft Count of items in {left} to process
 * @param right Right range of items
 * @param startRight Index into {right} to start from
 * @param sizeRight Count of items in {right} to process
 * @param pred Function that returns the relative order of 2 items
 */
function merge<T>(
	merged: T[], start: number,
	left: T[], startLeft: number, sizeLeft: number,
	right: T[], startRight: number, sizeRight: number,
	pred: FullOrderCompareFn<T>
) {
	const totalSize = sizeLeft + sizeRight;
	const endMerged = start + totalSize;
	const endLeft = startLeft + sizeLeft;
	const endRight = startRight + sizeRight;
	for (let i = startLeft, j = startRight, k = start; k < endMerged; k++) {
		// if reached end of first half array, run through the loop
		// filling in only from the second half array
		if (i === endLeft) {
			merged[k] = right[j++];
			continue;
		}
		// if reached end of second half array, run through the loop
		// filling in only from the first half array
		if (j === endRight) {
			merged[k] = left[i++];
			continue;
		}
		// merged array is filled with the smaller or equal element of the two
		// arrays, in order, ensuring a stable sort
		merged[k] = (pred(left[i], right[j]) <= 0) ? left[i++] : right[j++];
	}
}

/**
 * Merge sort data during merging without the additional copying back to array.
 * All data movement is done during the course of the merges.
 * @internal
 * @param a Source array
 * @param b Duplicate of source array
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param orderFn Function that returns the relative order of two items
 */
function mergeSortInternal<T>(a: T[], b: T[], l: number, r: number, orderFn: FullOrderCompareFn<T>) {
	if (r <= l) {
		return;
	}
	if (r - l <= 10) {
		insertionSortInternal(a, l, r, orderFn);
		return;
	}
	const m = ((l + r) / 2) >>> 0;
	// switch arrays to sort b thus recursively writing results to b
	mergeSortInternal(b, a, l, m, orderFn); // merge sort left
	mergeSortInternal(b, a, m + 1, r, orderFn); // merge sort right
	// merge partitions of b into a
	merge(a, l, b, l, m - l + 1, b, m + 1, r - m, orderFn); // merge
}

/**
 * In-place stable merge sort for homogeneous standard arrays.
 * @param arr The array to be sorted (in-place)
 * @param orderFn Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export function mergeSort<T>(arr: T[], orderFn: FullOrderCompareFn<T>) {
	const b = arr.slice(0);
	mergeSortInternal(arr, b, 0, arr.length - 1, orderFn);
	return arr;
}

/**
 * @alias mergeSort The common stable sort algorithm.
 */
export const stableSort = mergeSort;
