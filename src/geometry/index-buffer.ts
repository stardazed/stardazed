/*
geometry/index-buffer - geometry index data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumType, makeLookupTable } from "stardazed/core";

export const enum IndexElementType {
	None,

	UInt8,
	UInt16,
	UInt32
}

export function isValidIndexElementType(val: any): val is IndexElementType {
	if (typeof val !== "number") {
		return false;
	}
	return val >= IndexElementType.UInt8 && val <= IndexElementType.UInt32;
}

const indexElementTypeSizeBytes = makeLookupTable(
	[IndexElementType.None, NaN],
	[IndexElementType.UInt8, NumType.UInt8.byteSize],
	[IndexElementType.UInt16, NumType.UInt16.byteSize],
	[IndexElementType.UInt32, NumType.UInt32.byteSize]
);

/**
 * @expects isPositiveInteger(vertexCount)
 */
export function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType {
	if (vertexCount <= NumType.UInt8.max) {
		return IndexElementType.UInt8;
	}
	if (vertexCount <= NumType.UInt16.max) {
		return IndexElementType.UInt16;
	}

	return IndexElementType.UInt32;
}

/**
 * @expects isValidIndexElementType(elementType)
 * @expects isPositiveInteger(vertexCount)
 */
export function bytesRequiredForIndexCount(elementType: IndexElementType, indexCount: number) {
	return indexElementTypeSizeBytes[elementType] * indexCount;
}

/**
 * @expects isValidIndexElementType(elementType)
 */
export function arrayTypeForIndexElement(elementType: IndexElementType): TypedArrayConstructor {
	switch (elementType) {
		case IndexElementType.UInt8: return Uint8Array;
		case IndexElementType.UInt16: return Uint16Array;
		case IndexElementType.UInt32: return Uint32Array;
		default:
			throw new Error("Invalid IndexElementType");
	}
}

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
