/**
 * core/numeric - numeric types, traits and array helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArrayConstructor } from "./array";
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
export declare const UInt8: NumericType;
/**
 * Traits of unsigned 8-bit clamped integer numbers.
 */
export declare const UInt8Clamped: NumericType;
/**
 * Traits of signed 8-bit integer numbers.
 */
export declare const SInt8: NumericType;
/**
 * Traits of unsigned 16-bit integer numbers.
 */
export declare const UInt16: NumericType;
/**
 * Traits of signed 16-bit integer numbers.
 */
export declare const SInt16: NumericType;
/**
 * Traits of unsigned 32-bit integer numbers.
 */
export declare const UInt32: NumericType;
/**
 * Traits of signed 32-bit integer numbers.
 */
export declare const SInt32: NumericType;
/**
 * Traits of 32-bit floating point numbers.
 */
export declare const Float: NumericType;
/**
 * Traits of 64-bit floating point numbers.
 */
export declare const Double: NumericType;
//# sourceMappingURL=numeric.d.ts.map