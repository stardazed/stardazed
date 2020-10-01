/*
core/algorithm - various algorithms
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
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

/**
 * Create an array-based lookup table for numeric keys mapped to arbitrary values.
 */
export function makeLookupTable<K extends number, V>(...pairs: [K, V][]): ReadonlyArray<V> {
	const result: V[] = [];
	for (const pair of pairs) {
		result[pair[0] as number] = pair[1];
	}
	return Object.freeze(result);
}

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

/**
 * Copies a subset of named fields from an object.
 * @param source The source object to select from
 * @param keys One or more names of fields in source
 * @returns A new object with the specified fields copied from source
 */
export function pick<T extends object, K extends keyof T>(source: T, ...keys: K[]): Pick<T, K> {
	const out = {} as any;
	for (const k of keys) {
		out[k] = source[k];
	}
	return out;
}

/**
 * A function that takes a value and a key and returns a transformed value.
 * @param val A value in an object
 * @param key The key val is stored at in an object
 */
export type ObjectFieldMappingFn<T, U> = (val: T, key: string) => U;

/**
 * Map each keyed property of obj using the provided function returning a new object.
 * @param obj The source object to convert
 * @param mapper A conversion function that takes each keyed prop of obj and returns a converted value
 */
export function mapObject<T extends object, K extends Extract<keyof T, string>, U>(obj: T, mapper: ObjectFieldMappingFn<T[K], U>) {
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
export function groupFieldsBy<T extends object, K extends Extract<keyof T, string>>(group: K, ts: T[]) {
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
 * Returns the number of properties directly set on the object.
 * @param obj Any object
 */
export function propertyCount(obj: object) {
	return Object.getOwnPropertyNames(obj).length;
}
