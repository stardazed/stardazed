// array - types and helpers for array-likes
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";

declare global {
	interface ArrayBufferConstructor {
		// proposed for ES7
		transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
	}
}

if (! ArrayBuffer.transfer) {
	ArrayBuffer.transfer = function(oldBuffer: ArrayBuffer, newByteLength?: number) {
		// This placeholder implementation cannot detach `oldBuffer`'s storage
		// but `oldBuffer` is to be treated as a moved-from value in C++ terms
		// after calling transfer.

		const oldByteLength = oldBuffer.byteLength;
		newByteLength = newByteLength | 0;
		assert(newByteLength > 0);

		if (newByteLength < oldByteLength) {
			return oldBuffer.slice(0, newByteLength);
		}

		const oldBufferView = new Uint8Array(oldBuffer);
		const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
		newBufferView.set(oldBufferView);

		return newBufferView.buffer;
	};
}


export interface MutableArrayLike<T> {
	readonly length: number;
	[n: number]: T;
}


export function copyElementRange<T>(src: ArrayLike<T>, srcOffset: number, srcCount: number, dest: MutableArrayLike<T>, destOffset: number) {
	for (let ix = 0; ix < srcCount; ++ix) {
		dest[destOffset++] = src[srcOffset++];
	}
}


export function fill<T>(dest: MutableArrayLike<T>, value: T, count: number, offset = 0) {
	for (let ix = 0; ix < count; ++ix) {
		dest[ix + offset] = value;
	}
}


export function appendArrayInPlace<T>(dest: Array<T>, source: Array<T>) {
	const MAX_BLOCK_SIZE = 65535;

	let offset = 0;
	let itemsLeft = source.length;

	if (itemsLeft <= MAX_BLOCK_SIZE) {
		dest.push.apply(dest, source);
	}
	else {
		while (itemsLeft > 0) {
			const pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
			const subSource = source.slice(offset, pushCount);
			dest.push.apply(dest, subSource);
			itemsLeft -= pushCount;
			offset += pushCount;
		}
	}
}
