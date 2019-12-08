/*
geometry/index-buffer - geometry index data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { UInt8, UInt16, UInt32, makeLookupTable } from "stardazed/core";

export const enum PrimitiveType {
	None,

	Point,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}

export function isPrimitiveType(val: any): val is PrimitiveType {
	if (typeof val !== "number") {
		return false;
	}
	return val >= PrimitiveType.None && val <= PrimitiveType.TriangleStrip;
}

/**
 * Calculate the element offset of the Nth typed primitive in an element array.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(primitiveCount)
 */
export function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
	switch (primitiveType) {
		case PrimitiveType.Point:
			return primitiveCount;
		case PrimitiveType.Line:
			return primitiveCount * 2;
		case PrimitiveType.LineStrip:
			return primitiveCount;
		case PrimitiveType.Triangle:
			return primitiveCount * 3;
		case PrimitiveType.TriangleStrip:
			return primitiveCount;
		default:
			return NaN;
	}
}

/**
 * Calculate the number of elements required for N typed primitives.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(primitiveCount)
 */
export function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
	switch (primitiveType) {
		case PrimitiveType.Point:
			return primitiveCount;
		case PrimitiveType.Line:
			return primitiveCount * 2;
		case PrimitiveType.LineStrip:
			return primitiveCount > 0 ? primitiveCount + 1 : 0;
		case PrimitiveType.Triangle:
			return primitiveCount * 3;
		case PrimitiveType.TriangleStrip:
			return primitiveCount > 0 ? primitiveCount + 2 : 0;
		default:
			return NaN;
	}
}

/**
 * Calculate the number of typed primitives that can be stored using N elements.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(elementCount)
 */
export function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number) {
	switch (primitiveType) {
		case PrimitiveType.Point:
			return elementCount;
		case PrimitiveType.Line:
			return (elementCount / 2) | 0;
		case PrimitiveType.LineStrip:
			return elementCount > 0 ? elementCount - 1 : 0;
		case PrimitiveType.Triangle:
			return (elementCount / 3) | 0;
		case PrimitiveType.TriangleStrip:
			return elementCount > 0 ? elementCount - 2 : 0;
		default:
			return NaN;
	}
}

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
	[IndexElementType.UInt8, UInt8.byteSize],
	[IndexElementType.UInt16, UInt16.byteSize],
	[IndexElementType.UInt32, UInt32.byteSize]
);

/**
 * @expects isPositiveInteger(vertexCount)
 */
export function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType {
	if (vertexCount <= UInt8.max) {
		return IndexElementType.UInt8;
	}
	if (vertexCount <= UInt16.max) {
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
