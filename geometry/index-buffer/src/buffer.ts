/**
 * index-buffer/buffer - index primitive storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedArray } from "@stardazed/array";
import { IndexElementType, arrayTypeForIndexElement, bytesRequiredForIndexCount } from "./element";

export interface IndexBuffer {
	readonly indexElementType: IndexElementType;
	readonly indexCount: number;
	readonly storage: Uint8Array;
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

export function indexBufferSizeBytes(ib: IndexBuffer) {
	return ib.storage.byteLength;
}

/**
 * Direct (sub-)array access
 * @expects isPositiveInteger(baseIndexNr)
 * @expects isPositiveInteger(indexCount)
 * @expects baseIndexNr < this.indexCount
 * @expects baseIndexNr + indexCount <= this.indexCount
 */
export function indexBufferRangeView(ib: IndexBuffer, baseIndexNr: number, indexCount: number): TypedArray {
	const offsetBytes = ib.storage.byteOffset + bytesRequiredForIndexCount(ib.indexElementType, baseIndexNr);
	const arrayClass = arrayTypeForIndexElement(ib.indexElementType);
	return new arrayClass(ib.storage.buffer, offsetBytes, indexCount);
}
