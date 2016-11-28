// numeric.ts - numeric type traits
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { TypedArrayConstructor } from "core/array";

/* tslint:disable:variable-name */

export interface NumericType {
	readonly min: number;
	readonly max: number;
	readonly signed: boolean;

	readonly byteSize: number;
	readonly arrayType: TypedArrayConstructor;
}

export const UInt8: NumericType = {
	min: 0,
	max: 255,
	signed: false,
	byteSize: 1,
	arrayType: Uint8Array
};

export const UInt8Clamped: NumericType = {
	min: 0,
	max: 255,
	signed: false,
	byteSize: 1,
	arrayType: Uint8ClampedArray
};

export const SInt8: NumericType = {
	min: -128,
	max: 127,
	signed: true,
	byteSize: 1,
	arrayType: Int8Array
};

export const UInt16: NumericType = {
	min: 0,
	max: 65535,
	signed: false,
	byteSize: 2,
	arrayType: Uint16Array
};

export const SInt16: NumericType = {
	min: -32768,
	max: 32767,
	signed: true,
	byteSize: 2,
	arrayType: Int16Array
};

export const UInt32: NumericType = {
	min: 0,
	max: 4294967295,
	signed: false,
	byteSize: 4,
	arrayType: Uint32Array
};

export const SInt32: NumericType = {
	min: -2147483648,
	max: 2147483647,
	signed: true,
	byteSize: 4,
	arrayType: Int32Array
};

export const Float: NumericType = {
	min: -340282346638528859811704183484516925440.0,
	max: 340282346638528859811704183484516925440.0,
	signed: true,
	byteSize: 4,
	arrayType: Float32Array
};

export const Double: NumericType = {
	min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
	signed: true,
	byteSize: 8,
	arrayType: Float64Array
};

/* tslint:enable:variable-name */
