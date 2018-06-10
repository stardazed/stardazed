/**
 * container/array - helpers to manage mostly dynamic typed arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { MutableArrayLike, TypedArray, Float2, Float3, Float4, Float3x3, Float4x4 } from "@stardazed/core";
export declare function transferArrayBuffer(oldBuffer: ArrayBuffer, newByteLength: number): ArrayBuffer;
export declare function clearArrayBuffer(data: ArrayBuffer): void;
export declare function copyElementRange<T, A extends MutableArrayLike<T>>(dest: A, destOffset: number, src: ArrayLike<T>, srcOffset: number, srcCount: number): A;
export declare function fill<T, A extends MutableArrayLike<T>>(dest: A, value: T, count: number, offset?: number): A;
export declare function appendArrayInPlace<T>(dest: T[], source: T[]): T[];
export declare function refIndexedVec2(data: TypedArray, index: number): TypedArray;
export declare function copyIndexedVec2(data: TypedArray, index: number): number[];
export declare function setIndexedVec2(data: TypedArray, index: number, v2: Float2): void;
export declare function copyVec2FromOffset(data: TypedArray, offset: number): number[];
export declare function setVec2AtOffset(data: TypedArray, offset: number, v2: Float2): void;
export declare function offsetOfIndexedVec2(index: number): number;
export declare function refIndexedVec3(data: TypedArray, index: number): TypedArray;
export declare function copyIndexedVec3(data: TypedArray, index: number): number[];
export declare function setIndexedVec3(data: TypedArray, index: number, v3: Float3): void;
export declare function copyVec3FromOffset(data: TypedArray, offset: number): number[];
export declare function setVec3AtOffset(data: TypedArray, offset: number, v3: Float3): void;
export declare function offsetOfIndexedVec3(index: number): number;
export declare function refIndexedVec4(data: TypedArray, index: number): TypedArray;
export declare function copyIndexedVec4(data: TypedArray, index: number): number[];
export declare function setIndexedVec4(data: TypedArray, index: number, v4: Float4): void;
export declare function copyVec4FromOffset(data: TypedArray, offset: number): number[];
export declare function setVec4AtOffset(data: TypedArray, offset: number, v4: Float4): void;
export declare function offsetOfIndexedVec4(index: number): number;
export declare function refIndexedMat3(data: TypedArray, index: number): TypedArray;
export declare function copyIndexedMat3(data: TypedArray, index: number): number[];
export declare function setIndexedMat3(data: TypedArray, index: number, m3: Float3x3): void;
export declare function offsetOfIndexedMat3(index: number): number;
export declare function refIndexedMat4(data: TypedArray, index: number): TypedArray;
export declare function copyIndexedMat4(data: TypedArray, index: number): number[];
export declare function setIndexedMat4(data: TypedArray, index: number, m4: Float4x4): void;
export declare function offsetOfIndexedMat4(index: number): number;
