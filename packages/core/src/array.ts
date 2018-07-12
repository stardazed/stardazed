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

// special purpose or generic array interfaces used very frequently
export interface MutableArrayLike<T> {
	readonly length: number;
	[n: number]: T;
}

// helper types for enums stored in int arrays
export interface ConstEnumArray8View<T extends number> extends Uint8Array {
	[index: number]: T;
}

export interface ConstEnumArray16View<T extends number> extends Uint16Array {
	[index: number]: T;
}

export interface ConstEnumArray32View<T extends number> extends Int32Array {
	[index: number]: T;
}

// --------

export type NumArray = ArrayLike<number>;
export type MutNumArray = MutableArrayLike<number>;


// types to use in function signatures to not have (Mut)NumArray everywhere
export type MutFloat2 = MutNumArray;
export type MutFloat3 = MutNumArray;
export type MutFloat4 = MutNumArray;

export type MutFloat2x2 = MutNumArray;
export type MutFloat3x3 = MutNumArray;
export type MutFloat4x4 = MutNumArray;

export type Float2 = NumArray;
export type Float3 = NumArray;
export type Float4 = NumArray;

export type Float2x2 = NumArray;
export type Float3x3 = NumArray;
export type Float4x4 = NumArray;
