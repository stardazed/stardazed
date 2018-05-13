/**
 * core/struct - structural primitive helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
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
