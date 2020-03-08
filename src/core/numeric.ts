/*
core/numeric - numeric type traits
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

/**
 * Interface describing a binary representation of a number including its
 * limits, storage requirements and associated TypedArray constructor.
 */
export interface NumericTypeTraits {
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
	readonly byteLength: number;
	/** The typed array that is the exact or best fit to store numbers of this type */
	readonly arrayType: TypedArrayConstructor;
}

/** Traits of unsigned 8-bit integer numbers. */
export const UInt8: NumericTypeTraits = {
	min: 0,
	max: 255,
	minSafeInt: 0,
	maxSafeInt: 255,
	signed: false,
	integer: true,
	byteLength: 1,
	arrayType: Uint8Array
};

/** Traits of signed 8-bit integer numbers. */
export const SInt8: NumericTypeTraits = {
	min: -128,
	max: 127,
	minSafeInt: -128,
	maxSafeInt: 127,
	signed: true,
	integer: true,
	byteLength: 1,
	arrayType: Int8Array
};

/** Traits of unsigned 16-bit integer numbers. */
export const UInt16: NumericTypeTraits = {
	min: 0,
	max: 65535,
	minSafeInt: 0,
	maxSafeInt: 65535,
	signed: false,
	integer: true,
	byteLength: 2,
	arrayType: Uint16Array
};

/** Traits of signed 16-bit integer numbers. */
export const SInt16: NumericTypeTraits = {
	min: -32768,
	max: 32767,
	minSafeInt: -32768,
	maxSafeInt: 32767,
	signed: true,
	integer: true,
	byteLength: 2,
	arrayType: Int16Array
};

/** Traits of unsigned 32-bit integer numbers. */
export const UInt32: NumericTypeTraits = {
	min: 0,
	max: 4294967295,
	minSafeInt: 0,
	maxSafeInt: 4294967295,
	signed: false,
	integer: true,
	byteLength: 4,
	arrayType: Uint32Array
};

/** Traits of signed 32-bit integer numbers. */
export const SInt32: NumericTypeTraits = {
	min: -2147483648,
	max: 2147483647,
	minSafeInt: -2147483648,
	maxSafeInt: 2147483647,
	signed: true,
	integer: true,
	byteLength: 4,
	arrayType: Int32Array
};

/** Traits of 16-bit floating point numbers. */
export const Half: NumericTypeTraits = {
	min: -65504.0,
	max: 65504.0,
	minSafeInt: -2048, // -2^11
	maxSafeInt: 2048, // 2^11
	signed: true,
	integer: false,
	byteLength: 2,
	arrayType: Uint16Array // size match only
};

/** Traits of 32-bit floating point numbers. */
export const Float: NumericTypeTraits = {
	min: -340282346638528859811704183484516925440.0,
	max: 340282346638528859811704183484516925440.0,
	minSafeInt: -16777216, // -2^24
	maxSafeInt: 16777216, // 2^24
	signed: true,
	integer: false,
	byteLength: 4,
	arrayType: Float32Array
};

/** Traits of 64-bit floating point numbers. */
export const Double: NumericTypeTraits = {
	min: Number.MIN_VALUE,
	max: Number.MAX_VALUE,
	minSafeInt: Number.MIN_SAFE_INTEGER, // -2^53 + 1
	maxSafeInt: Number.MAX_SAFE_INTEGER, // 2^53 - 1
	signed: true,
	integer: false,
	byteLength: 8,
	arrayType: Float64Array
};

/** Standard names of numeric types */
export type NumericTypeName = "uint8" | "sint8" | "uint16" | "sint16" | "uint32" | "sint32" | "half" | "float" | "double";

/** Access numeric type traits by type name */
const TypeNameTraitsMap: Readonly<Record<NumericTypeName, NumericTypeTraits>> = {
	uint8: UInt8,
	sint8: SInt8,
	uint16: UInt16,
	sint16: SInt16,
	uint32: UInt32,
	sint32: SInt32,
	half: Half,
	float: Float,
	double: Double
};

/** Either a numeric type name type or a traits object */
export type NumericTypeRef = NumericTypeName | NumericTypeTraits;

/** Get numeric type traits from traits object or name reference */
export function numericTraits(tn: NumericTypeName | NumericTypeTraits): NumericTypeTraits {
	if (typeof tn === "string") {
		return TypeNameTraitsMap[tn];
	}
	return tn;
}
