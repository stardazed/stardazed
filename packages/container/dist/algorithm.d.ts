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
export declare function hashString(s: string): number;
/**
 * Copy all or a specified set of values from source to dest, including undefined values.
 * Thus, this may unset values in the destination object as well as set or change them.
 * @param dest The object to overwrite values in
 * @param source The source object to read values from
 * @param keys Optional explicit set of keys to copy, defaults to all values in source
 */
export declare function override<T extends object, K extends keyof T>(dest: T, source: Partial<T>, keys?: K[]): T;
export declare type MappingFunc<T, U> = (t: T, k: string) => U;
/**
 * Map each keyed property of obj using the provided function returning a new object.
 * @param obj The source object to convert
 * @param mapper A conversion function that takes each keyed prop of obj and returns a converted value
 */
export declare function mapObject<T, K extends Extract<keyof T, string>, U>(obj: T, mapper: MappingFunc<T[K], U>): Record<keyof T, U>;
export declare type ArrayFields<T> = {
    [P in keyof T]: T[P][];
};
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
export declare function groupFieldsBy<T extends object, K extends Extract<keyof T, string>>(group: K, ts: T[]): GroupedItems<T>;
/**
 * A comparator function for binary searchers.
 * Must return true if a < b (a ordered before b)
 */
export declare type BinaryComparator<T> = (a: T, b: T) => boolean;
/**
 * Make a lowerBound function for a specific data type.
 * @see lowerBound
 * @returns a lowerBound function specialized with the specified comparator
 */
export declare const makeLowerBound: <T>(comp: BinaryComparator<T>) => (array: ArrayLike<T>, value: T) => number;
/**
 * Make an upperBound function for a specific data type.
 * @see upperBound
 * @returns an upperBound function specialized with the specified comparator
 */
export declare const makeUpperBound: <T>(comp: BinaryComparator<T>) => (array: ArrayLike<T>, value: T) => number;
/**
 * Returns an index pointing to the first element in the array that is not less than
 * (i.e. greater or equal to) value, or array.length if no such element is found.
 */
export declare const lowerBound: (array: ArrayLike<{}>, value: {}) => number;
/**
 * Returns an index pointing to the first element in the array that is greater than value,
 * or array.length if no such element is found.
 */
export declare const upperBound: (array: ArrayLike<{}>, value: {}) => number;
/**
 * Remove all duplicates found in the source array leaving only the first
 * instance of each individual element, leaving the order of the remaining
 * elements intact. Elements can optionally be given an explicit comparison proxy
 * by means of a provided helper function.
 * @param arr Source array
 * @param idGen Optional function to provide a unique identifier for each item
 */
export declare function stableUnique<T, U>(arr: T[], idGen?: (t: T) => U): T[];
/**
 * Deep clone an object. Use only for simple struct types.
 * @param object The object to clone
 */
export declare function cloneStructDeep<T extends object>(object: T): T;
/**
 * Returns the count of properties in an object.
 * @param obj Any object
 */
export declare function propertyCount(obj: object): number;
/**
 * Create an immutable object that acts as a lookup table with numerical keys, such as (const) enum values.
 * @param keyVals Alternating key, value pairs
 */
export declare function makeLUT<A extends number, B>(...keyVals: (A | B)[]): {
    readonly [k: number]: Readonly<B>;
};
