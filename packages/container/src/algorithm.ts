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
export function mapObject<T, K extends Extract<keyof T, string>, U>(obj: T, mapper: MappingFunc<T[K], U>) {
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

export function lowerBound<T>(array: ArrayLike<T>, value: T) {
	let count = array.length;
	let it: number;
	let first = 0;

	while (count > 0) {
		const step = count >> 1;
		it = first + step;
		if (array[it] < value) {
			first = ++it;
			count -= step + 1;
		}
		else {
			count = step;
		}
	}
	return first;
}

export function upperBound<T>(array: ArrayLike<T>, value: T) {
	let count = array.length;
	let it: number;
	let first = 0;

	while (count > 0) {
		const step = count >> 1;
		it = first + step;
		if (array[it] <= value) {
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

/**
 * Deep clone an object. Use only for simple struct types.
 * @param object The object to clone
 */
export function cloneStructDeep<T extends object>(object: T): T {
	const copy: any = {};
	Object.getOwnPropertyNames(object).forEach(name => {
		if (typeof (object as any)[name] === "object" && (object as any)[name] !== null) {
			copy[name] = cloneStructDeep((object as any)[name]);
		}
		else {
			copy[name] = (object as any)[name];
		}
	});
	return copy as T;
}

/**
 * Returns the count of properties in an object.
 * @param obj Any object
 */
export function propertyCount(obj: object) {
	return Object.getOwnPropertyNames(obj).length;
}

/**
 * Create an immutable object that acts as a lookup table with numerical keys, such as (const) enum values.
 * @param keyVals Alternating key, value pairs
 */
export function makeLUT<A extends number, B>(...keyVals: (A | B)[]): { readonly [k: number]: Readonly<B>; } {
	const lut: { [k: number]: B; } = {};
	const count = keyVals.length;
	for (let i = 0; i < count; i += 2) {
		lut[keyVals[i] as number] = keyVals[i + 1] as B;
	}
	return Object.freeze(lut);
}
