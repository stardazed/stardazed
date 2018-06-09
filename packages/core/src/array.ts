/**
 * core/array - types and helpers for array-likes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export type TypedArrayConstructor =
	Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor |
	Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor |
	Float32ArrayConstructor | Float64ArrayConstructor;

export type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

// helper types for enums stored in int arrays
export interface ConstEnumArray8View<T extends number> extends Uint8Array {
	[index: number]: T;
}

export interface ConstEnumArray32View<T extends number> extends Int32Array {
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
