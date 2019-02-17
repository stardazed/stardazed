/**
 * core/object - core object types and algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

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
export function mapObject<T, K extends Extract<keyof T, string>, U>(obj: T, mapper: ObjectFieldMappingFn<T[K], U>) {
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

} // ns sd
