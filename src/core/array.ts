// core/array - types and helpers for array-likes
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

// global type augmentations
interface ArrayBufferConstructor {
	// proposed for ES7
	transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}

if (! ArrayBuffer.transfer) {
	ArrayBuffer.transfer = function arrayTransferShim(oldBuffer: ArrayBuffer, newByteLength?: number) {
		// This placeholder implementation cannot detach `oldBuffer`'s storage
		// but `oldBuffer` is to be treated as a moved-from value in C++ terms
		// after calling transfer.

		const oldByteLength = oldBuffer.byteLength;
		newByteLength = newByteLength! | 0;
		sd.assert(newByteLength > 0);

		if (newByteLength < oldByteLength) {
			return oldBuffer.slice(0, newByteLength);
		}

		const oldBufferView = new Uint8Array(oldBuffer);
		const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
		newBufferView.set(oldBufferView);

		return newBufferView.buffer as ArrayBuffer;
	};
}

namespace sd {

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

} // ns sd
