/**
 * structured-storage/storage - storage of structured data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { alignUp } from "@stardazed/math";

export interface StructStorage {
	readonly itemSizeBytes: number;
	capacity: number;
	owned: boolean;
	data: Uint8Array;
}

const CAPACITY_UNIT = 32;
const WEBASSEMBLY_PAGE_SIZE = 64 * 1024;

export function alignCapacityUp(capacity: number) {
	return alignUp(capacity, CAPACITY_UNIT);
}

export function alignSizeBytesUpToWASMPage(sizeBytes: number) {
	return alignUp(sizeBytes, WEBASSEMBLY_PAGE_SIZE);
}

/**
 * @param itemSizeBytes Size in bytes of each individual element in the storge
 * @param minCapacity The number of elements that _at least_ need to fit in the storage.
 * @param wasmCompatible Should the buffer be sized to be a multiple of a WASM page size
 * @expects isPositiveNonZeroInteger(itemSizeBytes)
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function allocStorage(itemSizeBytes: number, minCapacity: number, wasmCompatible = false): StructStorage {
	const capacity = alignCapacityUp(minCapacity);
	const dataSizeBytes = itemSizeBytes * capacity;
	const pageAlignedSizeBytes = wasmCompatible ? alignSizeBytesUpToWASMPage(dataSizeBytes) : dataSizeBytes;

	return {
		itemSizeBytes,
		capacity,
		owned: true,
		data: new Uint8Array(pageAlignedSizeBytes)
	};
}

/**
 * @param itemSizeBytes Size in bytes of each individual element in the storge
 * @param minCapacity The number of elements that _at least_ need to fit in the storage.
 * @param buffer The buffer to use for the 
 * @expects isPositiveNonZeroInteger(itemSizeBytes)
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function createStorageInBuffer(itemSizeBytes: number, minCapacity: number, buffer: Uint8Array): StructStorage {
	const capacity = alignCapacityUp(minCapacity);
	const dataSizeBytes = itemSizeBytes * capacity;

	if (dataSizeBytes > buffer.byteLength) {
		throw new RangeError("Provided storage is too small");
	}

	return {
		itemSizeBytes,
		capacity,
		owned: false,
		data: buffer
	};
}
