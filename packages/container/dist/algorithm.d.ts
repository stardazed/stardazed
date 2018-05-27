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
 * Map each keyed propertiy of obj using the provided function returning a new object.
 * @param obj The source object to convert
 * @param mapper A conversion function that takes each keyed prop of obj and returns a converted value
 */
export declare function mapObject<T, K extends keyof T, U>(obj: T, mapper: MappingFunc<T[K], U>): Record<keyof T, U>;
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
export declare function groupFieldsBy<T extends object, K extends keyof T>(group: K, ts: T[]): GroupedItems<T>;
/**
 * Standard string sort comparison function, used when comparing
 * multiple string fields together or when using non-standars sort.
 * @param a left string to compare
 * @param b right string to compare
 */
export declare function stringOrder(a: string, b: string): 0 | 1 | -1;
/**
 * A function that returns the relative order of 2 items.
 * If a < b, it returns a number < 0
 * If a = b, it returns 0
 * If a > b, it returns a number > 0
 */
export declare type CompareFn<T> = (a: Readonly<T>, b: Readonly<T>) => number;
/**
 * In-place stable insertion sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export declare function insertionSort<T>(a: T[], pred: CompareFn<T>): T[];
/**
 * In-place stable merge sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
export declare function mergeSort<T>(a: T[], pred: CompareFn<T>): T[];
/**
 * @alias The common stable sort algorithm.
 */
export declare const stableSort: typeof mergeSort;
/**
 * Remove all duplicates found in the source array leaving only the first
 * instance of each individual element, leaving the order of the remaining
 * elements intact. Elements can optionally be given an explicit comparison proxy
 * by means of a provided helper function.
 * @param arr Source array
 * @param idGen Optional function to provide a unique identifier for each item
 */
export declare function stableUnique<T, U>(arr: T[], idGen?: (t: T) => U): T[];
