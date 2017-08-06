// container/algorithm - some container-oriented algorithms
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.container {

	export type CompareFn<T> = (a: Readonly<T>, b: Readonly<T>) => number;

	// -- stable insertion sort
	function insertionSortInternal<T>(a: T[], l: number, r: number, pred: CompareFn<T>) {
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

	export function insertionSort<T>(a: T[], pred: CompareFn<T>) {
		insertionSortInternal(a, 0, a.length - 1, pred);
	}

	// standard merging two sorted half arrays into single sorted array
	function merge<T>(
		merged: T[], start: number,
		left: T[], startLeft: number, sizeLeft: number, 
		right: T[], startRight: number, sizeRight: number,
		pred: CompareFn<T>
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
			merged[k] = (pred(left[i], right[j]) <= 0) ?
						left[i++] : right[j++];
		}
	}

	// merge sort data during merging without the additional copying back to array
	// all data movement is done during the course of the merges
	function mergeSortInternal<T>(a: T[], b: T[], l: number, r: number, pred: CompareFn<T>) {
		if (r <= l) {
			return;
		}
		if (r - l <= 10) {
			insertionSortInternal(a, l, r, pred);
			return;
		}
		const m = ((l + r) / 2) >>> 0;
		// switch arrays to msort b thus recursively writing results to b
		mergeSortInternal(b, a, l, m, pred); // merge sort left
		mergeSortInternal(b, a, m + 1, r, pred); // merge sort right
		// merge partitions of b into a
		merge(a, l, b, l, m - l + 1, b, m + 1, r - m, pred); // merge
	}

	// -- stable merge sort
	export function mergeSort<T>(a: T[], pred: CompareFn<T>) {
		const b = a.slice(0);
		mergeSortInternal(a, b, 0, a.length - 1, pred);
	}


} // ns sd.container
