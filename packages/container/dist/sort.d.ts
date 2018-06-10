/**
 * container/sort - sorting algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * Standard (string) sort comparison function, used when comparing
 * multiple string fields together or when using non-standard sort.
 * @param a left string to compare
 * @param b right string to compare
 */
export declare function genericOrder<T>(a: T, b: T): 1 | -1 | 0;
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
 * @alias mergeSort The common stable sort algorithm.
 */
export declare const stableSort: typeof mergeSort;
