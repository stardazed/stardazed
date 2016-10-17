// numeric.ts - numeric types, traits and array helpers
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx
// this file is placed first in the compiled output so the retained license block follows:
/*! Copyright (c) 2015-2016 Arthur Langereis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

namespace sd {

	export interface TypedArray {
		readonly BYTES_PER_ELEMENT: number;

		readonly buffer: ArrayBuffer;
		readonly byteLength: number;
		readonly byteOffset: number;
		readonly length: number;

		[index: number]: number;

		set(index: number, value: number): void;
		set(array: ArrayLike<number>, offset?: number): void;
		subarray(begin: number, end?: number): TypedArray;
		slice(start?: number, end?: number): TypedArray;

		copyWithin(target: number, start: number, end?: number): this;
		every(callbackfn: (value: number, index: number, array: TypedArray) => boolean, thisArg?: any): boolean;
		fill(value: number, start?: number, end?: number): this;
		filter(callbackfn: (value: number, index: number, array: TypedArray) => any, thisArg?: any): TypedArray;
		find(predicate: (value: number, index: number, obj: Array<number>) => boolean, thisArg?: any): number | undefined;
		findIndex(predicate: (value: number) => boolean, thisArg?: any): number;
		forEach(callbackfn: (value: number, index: number, array: TypedArray) => void, thisArg?: any): void;
		indexOf(searchElement: number, fromIndex?: number): number;
		join(separator?: string): string;
		lastIndexOf(searchElement: number, fromIndex?: number): number;

		map(callbackfn: (value: number, index: number, array: TypedArray) => number, thisArg?: any): TypedArray;
		reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: TypedArray) => number, initialValue?: number): number;
		reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: TypedArray) => U, initialValue: U): U;
		reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: TypedArray) => number, initialValue?: number): number;
		reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: TypedArray) => U, initialValue: U): U;
		reverse(): TypedArray;
		some(callbackfn: (value: number, index: number, array: TypedArray) => boolean, thisArg?: any): boolean;
		sort(compareFn?: (a: number, b: number) => number): this;

		toLocaleString(): string;
		toString(): string;

		// es2015.iterable extensions
		[Symbol.iterator](): IterableIterator<number>;
		entries(): IterableIterator<[number, number]>;
		keys(): IterableIterator<number>;
		values(): IterableIterator<number>;
	}

	export interface TypedArrayConstructor {
		new (length: number): TypedArray;
		new (array: ArrayLike<number>): TypedArray;
		new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray; // tslint:disable-line
	}


	/* tslint:disable:variable-name */

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

	/* tslint:enable:variable-name */

	// helper type for enums stored in Int32Arrays
	export interface ConstEnumArrayView<T extends number> extends TypedArray {
		[index: number]: T;
	}


} // ns sd
