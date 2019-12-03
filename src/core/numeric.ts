/*
core/numeric - numeric types and traits
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

/**
 * Interface describing a binary representation of a number including its
 * limits, storage requirements and associated TypedArray constructor.
 */
export interface NumericType {
	/** The lowest value this type is capable of representing */
	readonly min: number;
	/** The highest value this type is capable of representing */
	readonly max: number;
	/** The lowest integer value this type is capable of representing without precision loss */
	readonly minSafeInt: number;
	/** The highest integer value this type is capable of representing without precision loss */
	readonly maxSafeInt: number;
	/** Is this type signed, i.e. capable of represnting negative numbers */
	readonly signed: boolean;
	/** Is this an integer type, i.e. only capable of representing non-fractional numbers */
	readonly integer: boolean;

	/** The number of bytes it takes to store a single instance of this type */
	readonly byteSize: number;
	/** The typed array that is the exact or best fit to store numbers of this type */
	readonly arrayType: TypedArrayConstructor;
}

/**
 * Traits of unsigned 8-bit integer numbers.
 */
export const UInt8: NumericType = Object.freeze({
	min: 0,
	max: 255,
	minSafeInt: 0,
	maxSafeInt: 255,
	signed: false,
	integer: true,
	byteSize: 1,
	arrayType: Uint8Array
});

/**
 * Traits of signed 8-bit integer numbers.
 */
export const SInt8: NumericType = Object.freeze({
	min: -128,
	max: 127,
	minSafeInt: -128,
	maxSafeInt: 127,
	signed: true,
	integer: true,
	byteSize: 1,
	arrayType: Int8Array
});

/**
 * Traits of unsigned 16-bit integer numbers.
 */
export const UInt16: NumericType = Object.freeze({
	min: 0,
	max: 65535,
	minSafeInt: 0,
	maxSafeInt: 65535,
	signed: false,
	integer: true,
	byteSize: 2,
	arrayType: Uint16Array
});

/**
 * Traits of signed 16-bit integer numbers.
 */
export const SInt16: NumericType = Object.freeze({
	min: -32768,
	max: 32767,
	minSafeInt: -32768,
	maxSafeInt: 32767,
	signed: true,
	integer: true,
	byteSize: 2,
	arrayType: Int16Array
});

/**
 * Traits of unsigned 32-bit integer numbers.
 */
export const UInt32: NumericType = Object.freeze({
	min: 0,
	max: 4294967295,
	minSafeInt: 0,
	maxSafeInt: 4294967295,
	signed: false,
	integer: true,
	byteSize: 4,
	arrayType: Uint32Array
});

/**
 * Traits of signed 32-bit integer numbers.
 */
export const SInt32: NumericType = Object.freeze({
	min: -2147483648,
	max: 2147483647,
	minSafeInt: -2147483648,
	maxSafeInt: 2147483647,
	signed: true,
	integer: true,
	byteSize: 4,
	arrayType: Int32Array
});

/**
 * Traits of 32-bit floating point numbers.
 */
export const Float: NumericType = Object.freeze({
	min: -340282346638528859811704183484516925440.0,
	max: 340282346638528859811704183484516925440.0,
	minSafeInt: -16777216, // -2^24
	maxSafeInt: 16777216, // 2^24
	signed: true,
	integer: false,
	byteSize: 4,
	arrayType: Float32Array
});

/**
 * Traits of 64-bit floating point numbers.
 */
export const Double: NumericType = Object.freeze({
	min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	minSafeInt: -9007199254740991, // -2^53 + 1
	maxSafeInt: 9007199254740991, // 2^53 - 1
	signed: true,
	integer: false,
	byteSize: 8,
	arrayType: Float64Array
});
