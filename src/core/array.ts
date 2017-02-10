// core/array - types and helpers for array-likes
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

// global type augmentations
interface ArrayBufferConstructor {
	// proposed for ES7
	transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}

if (! ArrayBuffer.transfer) {
	ArrayBuffer.transfer = function(oldBuffer: ArrayBuffer, newByteLength?: number) {
		// This placeholder implementation cannot detach `oldBuffer`'s storage
		// but `oldBuffer` is to be treated as a moved-from value in C++ terms
		// after calling transfer.

		const oldByteLength = oldBuffer.byteLength;
		newByteLength = newByteLength | 0;
		sd.assert(newByteLength > 0);

		if (newByteLength < oldByteLength) {
			return oldBuffer.slice(0, newByteLength);
		}

		const oldBufferView = new Uint8Array(oldBuffer);
		const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
		newBufferView.set(oldBufferView);

		return newBufferView.buffer;
	};
}

namespace sd {

	export interface TypedArrayBase {
		readonly BYTES_PER_ELEMENT: number;

		readonly buffer: ArrayBuffer;
		readonly byteLength: number;
		readonly byteOffset: number;
		readonly length: number;

		subarray(begin: number, end?: number): this;
		slice(start?: number, end?: number): this;

		every(callbackfn: (value: number, index: number, array: this) => boolean, thisArg?: any): boolean;
		filter(callbackfn: (value: number, index: number, array: this) => any, thisArg?: any): this;
		find(predicate: (value: number, index: number, obj: Array<number>) => boolean, thisArg?: any): number | undefined;
		findIndex(predicate: (value: number) => boolean, thisArg?: any): number;
		forEach(callbackfn: (value: number, index: number, array: this) => void, thisArg?: any): void;
		indexOf(searchElement: number, fromIndex?: number): number;
		join(separator?: string): string;
		lastIndexOf(searchElement: number, fromIndex?: number): number;

		map(callbackfn: (value: number, index: number, array: this) => number, thisArg?: any): this;
		reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue?: number): number;
		reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
		reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue?: number): number;
		reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
		some(callbackfn: (value: number, index: number, array: this) => boolean, thisArg?: any): boolean;

		toLocaleString(): string;
		toString(): string;

		// es2015.iterable extensions
		[Symbol.iterator](): IterableIterator<number>;
		entries(): IterableIterator<[number, number]>;
		keys(): IterableIterator<number>;
		values(): IterableIterator<number>;
	}

	export interface TypedArray extends TypedArrayBase {
		[index: number]: number;

		set(index: number, value: number): void;
		set(array: ArrayLike<number>, offset?: number): void;

		copyWithin(target: number, start: number, end?: number): this;
		fill(value: number, start?: number, end?: number): this;

		reverse(): this;
		sort(compareFn?: (a: number, b: number) => number): this;
	}

	export interface ReadonlyTypedArray extends TypedArrayBase {
		readonly [index: number]: number;
	}

	export interface TypedArrayConstructor {
		new (lengthOrArray: number | ArrayLike<number>): TypedArray;
		new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray; // tslint:disable-line
	}

	// helper type for enums stored in Int32Arrays
	export interface ConstEnumArrayView<T extends number> extends TypedArray {
		[index: number]: T;
	}


	// special purpose or generic array interfaces used very frequently
	export interface MutableArrayLike<T> {
		readonly length: number;
		[n: number]: T;
	}

	export type ArrayOfConstNumber = ArrayLike<number>;
	export type ArrayOfNumber = MutableArrayLike<number>;


	// types to use in function signatures to not have ArrayOfNumber everywhere
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

} // ns sd
