/*
core/buffer - working with large arrays and arraybuffers
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

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

/**
 * Clear (a range of bytes within) an ArrayBuffer to zero.
 *
 * @expects isPositiveInteger(fromOffset)
 * @expects isPositiveInteger(toOffset)
 * @expects toOffset >= fromOffset
 */
export function clearArrayBuffer(data: ArrayBufferLike, fromOffset = 0, toOffset = data.byteLength) {
	let byteLength = toOffset - fromOffset;

	const prefixBytes = Math.min(byteLength, 7 - ((fromOffset & 7) - 1));
	if (prefixBytes > 0) {
		const prefixView = new Uint8Array(data, fromOffset, prefixBytes);
		for (let p = 0; p < prefixBytes; ++p) {
			prefixView[p] = 0;
		}

		fromOffset += prefixBytes;
		byteLength -= prefixBytes;
	}

	const numDoubles = (byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
	const doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
	if (numDoubles > 0) {
		const doubleView = new Float64Array(data, fromOffset, numDoubles);
		doubleView.fill(0);
	}

	const remainingBytes = byteLength - doublesByteSize;
	const remainderView = new Uint8Array(data, fromOffset + doublesByteSize);
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
		const str: string = String.fromCharCode.apply(undefined, bytes.subarray(offset, offset + blockSize) as unknown as number[]);
		strings.push(str);
		offset += blockSize;
		bytesLeft -= blockSize;
	}

	return strings.length === 1 ? strings[0] : strings.join("");
}
