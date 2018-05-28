/**
 * geometry/index-element vertex index element
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { makeLUT, TypedArrayConstructor, UInt8, UInt16 } from "@stardazed/core";

export const enum IndexElementType {
	None,

	UInt8,
	UInt16,
	UInt32
}

export const indexElementTypeSizeBytes = makeLUT<IndexElementType, number>(
	IndexElementType.UInt8, Uint8Array.BYTES_PER_ELEMENT,
	IndexElementType.UInt16, Uint16Array.BYTES_PER_ELEMENT,
	IndexElementType.UInt32, Uint32Array.BYTES_PER_ELEMENT
);

export function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType {
	if (vertexCount <= UInt8.max) {
		return IndexElementType.UInt8;
	}
	if (vertexCount <= UInt16.max) {
		return IndexElementType.UInt16;
	}

	return IndexElementType.UInt32;
}

export function bytesRequiredForIndexCount(elementType: IndexElementType, indexCount: number) {
	return indexElementTypeSizeBytes[elementType] * indexCount;
}


export type TypedIndexArray = Uint32Array | Uint16Array | Uint8ClampedArray;

export function typedIndexArrayClassForIndexElement(elementType: IndexElementType): TypedArrayConstructor {
	switch (elementType) {
		case IndexElementType.UInt8: return Uint8ClampedArray;
		case IndexElementType.UInt16: return Uint16Array;
		case IndexElementType.UInt32: return Uint32Array;
		default:
			throw new Error("Invalid IndexElementType");
	}
}
