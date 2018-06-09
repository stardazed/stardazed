/**
 * core/array - types and helpers for array-likes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export declare type TypedArrayConstructor = Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export declare type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
export interface ConstEnumArray8View<T extends number> extends Uint8Array {
    [index: number]: T;
}
export interface ConstEnumArray32View<T extends number> extends Int32Array {
    [index: number]: T;
}
export interface MutableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export declare type NumArray = ArrayLike<number>;
export declare type MutNumArray = MutableArrayLike<number>;
export declare type MutFloat2 = MutNumArray;
export declare type MutFloat3 = MutNumArray;
export declare type MutFloat4 = MutNumArray;
export declare type MutFloat2x2 = MutNumArray;
export declare type MutFloat3x3 = MutNumArray;
export declare type MutFloat4x4 = MutNumArray;
export declare type Float2 = NumArray;
export declare type Float3 = NumArray;
export declare type Float4 = NumArray;
export declare type Float2x2 = NumArray;
export declare type Float3x3 = NumArray;
export declare type Float4x4 = NumArray;
//# sourceMappingURL=array.d.ts.map