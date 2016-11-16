// typed_array.ts - generic typed array interfaces
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

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
	new (length: number): TypedArray;
	new (array: ArrayLike<number>): TypedArray;
	new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray; // tslint:disable-line
}


// helper type for enums stored in Int32Arrays
export interface ConstEnumArrayView<T extends number> extends TypedArray {
	[index: number]: T;
}
