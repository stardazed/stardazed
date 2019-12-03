/*
index-buffer/element - vertex index element
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { UInt8, UInt16, UInt32, makeLookupTable } from "stardazed/core";

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
