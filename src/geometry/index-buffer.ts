/*
geometry/index-buffer - geometry index data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumType, NumericType } from "stardazed/core";

/**
 * @expects isPositiveInteger(vertexCount)
 */
export function minimumIndexElementTypeForVertexCount(vertexCount: number) {
	if (vertexCount <= NumType.UInt8.max) {
		return NumType.UInt8;
	}
	if (vertexCount <= NumType.UInt16.max) {
		return NumType.UInt16;
	}

	return NumType.UInt32;
}

/**
 * An IndexBuffer is a simple structure that holds storage and metatdata
 * for a specified count of index elements.
 */
export class IndexBuffer {
	readonly elementType: NumericType;
	readonly count: number;
	readonly data: Uint8Array;

	constructor(elementType: NumericType, indexCount: number, storage?: Uint8Array) {
		if (!elementType.integer || elementType.signed) {
			throw new TypeError("An element type for an IndexBuffer must be an unsigned integer");
		}
		this.elementType = elementType;
		this.count = indexCount;

		const totalSizeBytes = elementType.byteSize * indexCount;
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

	get sizeBytes() { return this.elementType.byteSize * this.count; }

	/**
	 * Access (a section of) the underlying array data of an IndexBuffer.
	 *
	 * @expects isPositiveInteger(fromIndex)
	 * @expects isPositiveInteger(toIndex)
	 * @expects toIndex > fromIndex
	 * @expects fromIndex < this.count
	 * @expects fromIndex + toIndex <= this.count
	 */
	arrayView(fromIndex = 0, toIndex = this.count) {
		const offsetBytes = this.data.byteOffset + this.elementType.byteSize * fromIndex;
		return new this.elementType.arrayType(this.data.buffer, offsetBytes, toIndex - fromIndex);
	}

	static sizeBytesRequired(elementType: NumericType, indexCount: number) {
		return elementType.byteSize * indexCount;
	}
}
