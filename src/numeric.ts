// numeric.ts - numeric types, traits and array helpers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd {

	export interface TypedArray {
		BYTES_PER_ELEMENT: number;

		buffer: ArrayBuffer;
		byteLength: number;
		byteOffset: number;

		length: number;
		[index: number]: number;

		set(array: ArrayLike<number>, offset?: number): void;
		subarray(begin: number, end?: number): TypedArray;
	}

	export interface TypedArrayConstructor {
		new (length: number): TypedArray;
		new (array: ArrayLike<number>): TypedArray;
		new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray;
	}

	export interface NumericType {
		min: number;
		max: number;
		signed: boolean;

		byteSize: number;
		arrayType: TypedArrayConstructor;
	}

	export const UInt8: NumericType = Object.freeze({
		min: 0,
		max: 255,
		signed: false,
		byteSize: 1,
		arrayType: Uint8Array
	});

	export const UInt8Clamped: NumericType = Object.freeze({
		min: 0,
		max: 255,
		signed: false,
		byteSize: 1,
		arrayType: Uint8ClampedArray
	});

	export const SInt8: NumericType = Object.freeze({
		min: -128,
		max: 127,
		signed: true,
		byteSize: 1,
		arrayType: Int8Array
	});

	export const UInt16: NumericType = Object.freeze({
		min: 0,
		max: 65535,
		signed: false,
		byteSize: 2,
		arrayType: Uint16Array
	});

	export const SInt16: NumericType = Object.freeze({
		min: -32768,
		max: 32767,
		signed: true,
		byteSize: 2,
		arrayType: Int16Array
	});

	export const UInt32: NumericType = Object.freeze({
		min: 0,
		max: 4294967295,
		signed: false,
		byteSize: 4,
		arrayType: Uint32Array
	});

	export const SInt32: NumericType = Object.freeze({
		min: -2147483648,
		max: 2147483647,
		signed: true,
		byteSize: 4,
		arrayType: Int32Array
	});

	export const Float: NumericType = Object.freeze({
		min: -340282346638528859811704183484516925440.0,
		max: 340282346638528859811704183484516925440.0,
		signed: true,
		byteSize: 4,
		arrayType: Float32Array
	});

	export const Double: NumericType = Object.freeze({
		min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
		max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
		signed: true,
		byteSize: 8,
		arrayType: Float64Array
	});


} // ns sd
