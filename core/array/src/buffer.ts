/**
 * array/buffer - working with large arrays and arraybuffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { MutableArrayLike } from "./types";

/**
 * Resize the backing store of an ArrayBuffer, retaining the data.
 * Will avoid copying where possible.
 * 
 * @expects isPositiveNonZeroInteger(newByteLength)
 */
export function transferArrayBuffer(oldBuffer: ArrayBufferLike, newByteLength: number) {
	const oldByteLength = oldBuffer.byteLength;
	newByteLength = newByteLength | 0;

	if (newByteLength < oldByteLength) {
		return oldBuffer.slice(0, newByteLength);
	}

	const oldBufferView = new Uint8Array(oldBuffer);
	const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
	newBufferView.set(oldBufferView);

	return newBufferView.buffer;
}

export function clearArrayBuffer(data: ArrayBuffer) {
	const numDoubles = (data.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
	const doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
	const remainingBytes = data.byteLength - doublesByteSize;

	const doubleView = new Float64Array(data);
	const remainderView = new Uint8Array(data, doublesByteSize);

	if (doubleView.fill) {
		doubleView.fill(0);
	}
	else {
		// As of 2015-11, a loop-zero construct is faster than TypedArray create+set for large arrays in most browsers
		for (let d = 0; d < numDoubles; ++d) {
			doubleView[d] = 0;
		}
	}
	for (let b = 0; b < remainingBytes; ++b) {
		remainderView[b] = 0;
	}
}


export function copyElementRange<T, A extends MutableArrayLike<T>>(dest: A, destOffset: number, src: ArrayLike<T>, srcOffset: number, srcCount: number) {
	for (let ix = 0; ix < srcCount; ++ix) {
		dest[destOffset++] = src[srcOffset++];
	}
	return dest;
}


const MAX_BLOCK_SIZE = 65535; // max parameter array size for use in Webkit

export function appendArrayInPlace<T>(dest: T[], source: T[]) {
	let offset = 0;
	let itemsLeft = source.length;

	if (itemsLeft <= MAX_BLOCK_SIZE) {
		dest.push.apply(dest, source);
	}
	else {
		while (itemsLeft > 0) {
			const pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
			const subSource = source.slice(offset, offset + pushCount);
			dest.push.apply(dest, subSource);
			itemsLeft -= pushCount;
			offset += pushCount;
		}
	}
	return dest;
}

export function convertBytesToString(bytes: Uint8Array) {
	const strings: string[] = [];
	let bytesLeft = bytes.length;
	let offset = 0;

	while (bytesLeft > 0) {
		const blockSize = Math.min(bytesLeft, MAX_BLOCK_SIZE);
		const str: string = String.fromCharCode.apply(null, bytes.subarray(offset, offset + blockSize));
		strings.push(str);
		offset += blockSize;
		bytesLeft -= blockSize;
	}

	return strings.length === 1 ? strings[0] : strings.join("");
}
