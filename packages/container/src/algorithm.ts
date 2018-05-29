/**
 * container/algorithm - some container-oriented algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * Generate a hash value (a number containing a 32-bit signed int) for a string.
 * Based on Java's string hashing algorithm adapted for how JS stores strings.
 * @param s The string to hash
 */
export function hashString(s: string) {
	if (s.length === 0) {
		return 0;
	}
	let hash = 0;
	for (let i = 0; i < s.length; ++i) {
		const chr = s.charCodeAt(i);
		// JS charcodes are 16-bit, hash higher-order byte first (often 0)
		hash = (((hash << 5) - hash) + ((chr >> 8) & 0xFF)) | 0;
		// hash lower-order byte
		hash = (((hash << 5) - hash) + (chr & 0xFF)) | 0;
	}
	return hash;
}

/**
 * Copy all or a specified set of values from source to dest, including undefined values.
 * Thus, this may unset values in the destination object as well as set or change them.
 * @param dest The object to overwrite values in
 * @param source The source object to read values from
 * @param keys Optional explicit set of keys to copy, defaults to all values in source
 */
export function override<T extends object, K extends keyof T>(dest: T, source: Partial<T>, keys?: K[]) {
	if (keys === undefined) {
		keys = Object.keys(source) as K[];
	}
	for (const k of keys) {
		dest[k] = source[k] as T[K];
	}
	return dest;
}

export type MappingFunc<T, U> = (t: T, k: string) => U;

/**
 * Map each keyed propertiy of obj using the provided function returning a new object.
 * @param obj The source object to convert
 * @param mapper A conversion function that takes each keyed prop of obj and returns a converted value
 */
export function mapObject<T, K extends keyof T, U>(obj: T, mapper: MappingFunc<T[K], U>) {
	const result = {} as Record<keyof T, U>;
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			result[key] = mapper(obj[key] as T[K], key);
		}
	}
	return result;
}

export type ArrayFields<T> = { [P in keyof T]: T[P][]; };

export interface GroupedItems<T extends object> {
	[name: string]: ArrayFields<T>;
}

/**
 * Takes an array of isomorphic objects and groups the values of the fields together keyed
 * by a field name provided as group. The grouped values are deduplicated as well.
 * @example Given ts = [{n:"a", v:1}, {n:"a", v:2}, {n:"b", v:50}] and group = "n"
 * the output will be: { a:{v:[1,2]}, b:{v:[50]} }
 * @param group Name of the field in the items that will be used to group the other fields by
 * @param ts List of objects that have will be grouped by {{group}}
 */
export function groupFieldsBy<T extends object, K extends keyof T>(group: K, ts: T[]) {
	return ts.reduce((res, val) => {
		const key = val[group] as any as string; // FIXME: check with TS group why K is not essentially a string
		let coll: ArrayFields<T>;
		if (!(key in res)) {
			coll = {} as ArrayFields<T>;
			res[key] = coll;
		}
		else {
			coll = res[key];
		}
		for (const k in val) {
			if (k !== group && val.hasOwnProperty(k)) {
				if (!(k in coll)) {
					coll[k] = [];
				}
				if (coll[k]!.indexOf(val[k]) === -1) {
					coll[k]!.push(val[k]);
				}
			}
		}
		return res;
	}, {} as GroupedItems<T>);
}

/**
 * Standard string sort comparison function, used when comparing
 * multiple string fields together or when using non-standars sort.
 * @param a left string to compare
 * @param b right string to compare
 */
export function stringOrder(a: string, b: string) {
	return a < b ? -1 : ((a === b) ? 0 : 1);
}

/**
 * A function that returns the relative order of 2 items.
 * If a < b, it returns a number < 0
 * If a = b, it returns 0
 * If a > b, it returns a number > 0
 */
export type CompareFn<T> = (a: Readonly<T>, b: Readonly<T>) => number;

/**
 * In-place stable insertion sort a range of elements inside an array
 * @internal
 * @param a The array to sort
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param pred Function that returns the relative order of 2 items
 */
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

/**
 * In-place stable insertion sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export function insertionSort<T>(a: T[], pred: CompareFn<T>) {
	insertionSortInternal(a, 0, a.length - 1, pred);
	return a;
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

/**
 * Merge sort data during merging without the additional copying back to array.
 * All data movement is done during the course of the merges.
 * @internal
 * @param a Source array
 * @param b Duplicate of source array
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param pred Function that returns the relative order of 2 items
 */
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

/**
 * In-place stable merge sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export function mergeSort<T>(a: T[], pred: CompareFn<T>) {
	const b = a.slice(0);
	mergeSortInternal(a, b, 0, a.length - 1, pred);
	return a;
}

/**
 * @alias The common stable sort algorithm.
 */
export const stableSort = mergeSort;

/**
 * Remove all duplicates found in the source array leaving only the first
 * instance of each individual element, leaving the order of the remaining
 * elements intact. Elements can optionally be given an explicit comparison proxy
 * by means of a provided helper function.
 * @param arr Source array
 * @param idGen Optional function to provide a unique identifier for each item
 */
export function stableUnique<T, U>(arr: T[], idGen?: (t: T) => U) {
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