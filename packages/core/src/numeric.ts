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
	readonly integer: boolean;

	readonly byteSize: number;
	readonly arrayType: TypedArrayConstructor;
}

/**
 * Traits of unsigned 8-bit integer numbers.
 */
export const UInt8: NumericType = {
	min: 0,
	max: 255,
	signed: false,
	integer: true,
	byteSize: 1,
	arrayType: Uint8Array
};

/**
 * Traits of unsigned 8-bit clamped integer numbers.
 */
export const UInt8Clamped: NumericType = {
	min: 0,
	max: 255,
	signed: false,
	integer: true,
	byteSize: 1,
	arrayType: Uint8ClampedArray
};

/**
 * Traits of signed 8-bit integer numbers.
 */
export const SInt8: NumericType = {
	min: -128,
	max: 127,
	signed: true,
	integer: true,
	byteSize: 1,
	arrayType: Int8Array
};

/**
 * Traits of unsigned 16-bit integer numbers.
 */
export const UInt16: NumericType = {
	min: 0,
	max: 65535,
	signed: false,
	integer: true,
	byteSize: 2,
	arrayType: Uint16Array
};

/**
 * Traits of signed 16-bit integer numbers.
 */
export const SInt16: NumericType = {
	min: -32768,
	max: 32767,
	signed: true,
	integer: true,
	byteSize: 2,
	arrayType: Int16Array
};

/**
 * Traits of unsigned 32-bit integer numbers.
 */
export const UInt32: NumericType = {
	min: 0,
	max: 4294967295,
	signed: false,
	integer: true,
	byteSize: 4,
	arrayType: Uint32Array
};

/**
 * Traits of signed 32-bit integer numbers.
 */
export const SInt32: NumericType = {
	min: -2147483648,
	max: 2147483647,
	signed: true,
	integer: true,
	byteSize: 4,
	arrayType: Int32Array
};

/**
 * Traits of 32-bit floating point numbers.
 */
export const Float: NumericType = {
	min: -340282346638528859811704183484516925440.0,
	max: 340282346638528859811704183484516925440.0,
	signed: true,
	integer: false,
	byteSize: 4,
	arrayType: Float32Array
};

/**
 * Traits of 64-bit floating point numbers.
 */
export const Double: NumericType = {
	min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	signed: true,
	integer: false,
	byteSize: 8,
	arrayType: Float64Array
};
