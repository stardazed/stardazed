/**
 * sd-core - low level, common types and helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export as namespace sdCore;

export function arrayTransfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
export type TypedArrayConstructor = Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
export interface ConstEnumArray8View<T extends number> extends Uint8Array {
    [index: number]: T;
}
export interface ConstEnumArray32View<T extends number> extends Int32Array {
    [index: number]: T;
}
export interface MutableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export type ArrayOfConstNumber = ArrayLike<number>;
export type ArrayOfNumber = MutableArrayLike<number>;
export type Float2 = ArrayOfNumber;
export type Float3 = ArrayOfNumber;
export type Float4 = ArrayOfNumber;
export type Float2x2 = ArrayOfNumber;
export type Float3x3 = ArrayOfNumber;
export type Float4x4 = ArrayOfNumber;
export type ConstFloat2 = ArrayOfConstNumber;
export type ConstFloat3 = ArrayOfConstNumber;
export type ConstFloat4 = ArrayOfConstNumber;
export type ConstFloat2x2 = ArrayOfConstNumber;
export type ConstFloat3x3 = ArrayOfConstNumber;
export type ConstFloat4x4 = ArrayOfConstNumber;

/**
 * asserts a condition to be true or throw an error otherwise
 * @param cond A condition that can be evaluated to true or false
 * @param msg Error message that will be thrown if cond is false
 */
export function assert(cond: any, msg?: string): void;

/**
 * core/numeric - numeric types, traits and array helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * Interface describing a binary representation of a number including its
 * limits, storage requirements and associated TypedArray constructor.
 */
export interface NumericType {
    readonly min: number;
    readonly max: number;
    readonly signed: boolean;
    readonly byteSize: number;
    readonly arrayType: TypedArrayConstructor;
}
/**
 * Traits of unsigned 8-bit integer numbers.
 */
export const UInt8: NumericType;
/**
 * Traits of unsigned 8-bit clamped integer numbers.
 */
export const UInt8Clamped: NumericType;
/**
 * Traits of signed 8-bit integer numbers.
 */
export const SInt8: NumericType;
/**
 * Traits of unsigned 16-bit integer numbers.
 */
export const UInt16: NumericType;
/**
 * Traits of signed 16-bit integer numbers.
 */
export const SInt16: NumericType;
/**
 * Traits of unsigned 32-bit integer numbers.
 */
export const UInt32: NumericType;
/**
 * Traits of signed 32-bit integer numbers.
 */
export const SInt32: NumericType;
/**
 * Traits of 32-bit floating point numbers.
 */
export const Float: NumericType;
/**
 * Traits of 64-bit floating point numbers.
 */
export const Double: NumericType;

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
export function cloneStructDeep<T extends object>(object: T): T;
/**
 * Returns the count of properties in an object.
 * @param obj Any object
 */
export function propertyCount(obj: object): number;
/**
 * Create an immutable object that acts as a lookup table with numerical keys, such as (const) enum values.
 * @param keyVals Alternating key, value pairs
 */
export function makeLUT<A extends number, B>(...keyVals: (A | B)[]): {
    readonly [k: number]: Readonly<B>;
};
