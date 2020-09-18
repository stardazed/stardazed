/*
geometry/index-buffer - geometry index data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { UInt16, UInt32, NumericTypeRef, numericTraits } from "stardazed/core";

/** Numerical constants for the allowed size of index elements */
export const enum IndexElementSize {
	UInt16 = 2,
	UInt32 = 4
}

/**
 * @expects isPositiveInteger(vertexCount)
 */
export function minimumIndexElementSizeForVertexCount(vertexCount: number) {
	// note the equal comparison here, as in WebGL2 the maximum vertex
	// index is _always_ considered to be a vertex restart index and
	// cannot be used as a valid vertex index
	if (vertexCount <= UInt16.max) {
		return IndexElementSize.UInt16;
	}
	return IndexElementSize.UInt32;
}

/**
 * An IndexBuffer is a simple structure that holds storage and metatdata
 * for a specified count of index elements.
 */
export class IndexBuffer {
	readonly elementType: NumericTypeRef;
	readonly length: number;
	readonly data: Uint8Array;

	constructor(elementSize: IndexElementSize, indexCount: number, storage?: Uint8Array) {
		if (elementSize !== IndexElementSize.UInt16 && elementSize !== IndexElementSize.UInt32) {
			throw new TypeError("Invalid index element type");
		}
		this.elementType = elementSize === IndexElementSize.UInt16 ? UInt16 : UInt32;
		this.length = indexCount;

		const totalSizeBytes = this.elementType.byteLength * indexCount;
		if (storage) {
			if (totalSizeBytes > storage.byteLength) {
				throw new TypeError(`Provided storage is too small: ${storage.byteLength} < ${totalSizeBytes}`);
			}
			if ((storage.byteOffset & 3) !== 0) {
				throw new TypeError(`Provided storage is not aligned on an 4 byte boundary`);
			}
		}
		else {
			storage = new Uint8Array(totalSizeBytes);
		}
		this.data = storage;
	}

	get byteLength() {
		return numericTraits(this.elementType).byteLength * this.length;
	}

	/**
	 * Access (a section of) the underlying array data of an IndexBuffer.
	 *
	 * @expects isPositiveInteger(fromIndex)
	 * @expects isPositiveInteger(toIndex)
	 * @expects toIndex > fromIndex
	 * @expects fromIndex < this.count
	 * @expects fromIndex + toIndex <= this.count
	 */
	arrayView(fromIndex = 0, toIndex = this.length) {
		const numTraits = numericTraits(this.elementType);
		const offsetBytes = this.data.byteOffset + numTraits.byteLength * fromIndex;
		return new numTraits.arrayType(this.data.buffer, offsetBytes, toIndex - fromIndex);
	}

	static sizeBytesRequired(elementSize: IndexElementSize, indexCount: number) {
		return elementSize * indexCount;
	}
}
