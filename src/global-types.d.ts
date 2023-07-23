/**
 * global-types - types used very frequently across all modules
 * Part of Stardazed
 * (c) 2015-Present by @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
* A type that indicates that all fields inside a type, including arrays, are readonly.
*/
type DeepReadonly<T> =
	T extends any[] ? DeepReadonlyArray<T[number]> :
	T extends Function ? T :
	T extends object ? DeepReadonlyObject<T> :
	T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

type DeepReadonlyObject<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// --------

type TypedArrayConstructor =
	Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor |
	Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor |
	Float32ArrayConstructor | Float64ArrayConstructor;

type TypedArray =
	Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array |
	Int8Array | Int16Array | Int32Array |
	Float32Array | Float64Array;

// --------
// special purpose or generic array interfaces used very frequently

interface MutableArrayLike<T> {
	readonly length: number;
	[n: number]: T;
}

type NumArray = ArrayLike<number>;
type MutNumArray = MutableArrayLike<number>;

// types to use in function signatures to not have (Mut)NumArray everywhere
type MutFloat2 = MutNumArray;
type MutFloat3 = MutNumArray;
type MutFloat4 = MutNumArray;

type MutFloat2x2 = MutNumArray;
type MutFloat3x3 = MutNumArray;
type MutFloat4x4 = MutNumArray;

type Float2 = NumArray;
type Float3 = NumArray;
type Float4 = NumArray;

type Float2x2 = NumArray;
type Float3x3 = NumArray;
type Float4x4 = NumArray;

// --------
// helper types for enums stored in int arrays

interface ConstEnumArray8View<E extends number> extends Uint8Array {
	[index: number]: E;
}

interface ConstEnumArray16View<E extends number> extends Uint16Array {
	[index: number]: E;
}

interface ConstEnumArray32View<E extends number> extends Int32Array {
	[index: number]: E;
}
