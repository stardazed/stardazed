/*
index-buffer/buffer - index primitive storage
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { IndexElementType, isValidIndexElementType, bytesRequiredForIndexCount, arrayTypeForIndexElement } from "./element";

/**
 * An IndexBuffer is a simple structure that holds storage and metatdata
 * for a specified count of index elements.
 */
export interface IndexBuffer {
	readonly indexElementType: IndexElementType;
	readonly indexCount: number;
	readonly storage: Uint8Array;
}

/**
 * Determine if an object is an IndexBuffer
 */
export function isIndexBuffer(ib: any): ib is IndexBuffer {
	return typeof ib === "object" && ib !== null
		&& isValidIndexElementType(ib.indexElementType)
		&& typeof ib.indexCount === "number"
		&& ArrayBuffer.isView(ib.storage);
}

/**
 * @expects isValidIndexElementType(elementType)
 * @expects isPositiveNonZeroInteger(indexCount)
 */
export function createIndexBuffer(elementType: IndexElementType, indexCount: number): IndexBuffer {
	return {
		indexElementType: elementType,
		indexCount,
		storage: new Uint8Array(bytesRequiredForIndexCount(elementType, indexCount))
	};
}

/**
 * @expects isValidIndexElementType(elementType)
 * @expects isPositiveNonZeroInteger(indexCount)
 * @expects storage.byteLength >= bytesRequiredForIndexCount(elementType, indexCount)
 */
export function createIndexBufferWithStorage(elementType: IndexElementType, indexCount: number, storage: Uint8Array): IndexBuffer {
	return {
		indexElementType: elementType,
		indexCount,
		storage
	};
}

export function indexBufferSizeBytes(ib: IndexBuffer): number {
	return bytesRequiredForIndexCount(ib.indexElementType, ib.indexCount);
}

/**
 * Access a section of the underlying array data of an IndexBuffer.
 *
 * @expects isPositiveInteger(baseIndexNr)
 * @expects isPositiveInteger(indexCount)
 * @expects baseIndexNr < ib.indexCount
 * @expects baseIndexNr + indexCount <= ib.indexCount
 */
export function indexBufferRangeView(ib: IndexBuffer, baseIndexNr: number, indexCount: number): TypedArray {
	const offsetBytes = ib.storage.byteOffset + bytesRequiredForIndexCount(ib.indexElementType, baseIndexNr);
	const arrayClass = arrayTypeForIndexElement(ib.indexElementType);
	return new arrayClass(ib.storage.buffer, offsetBytes, indexCount);
}

/**
 * Access the full underlying array data of an IndexBuffer
 */
export function indexBufferView(ib: IndexBuffer) {
	return indexBufferRangeView(ib, 0, ib.indexCount);
}
