/**
 * structured-storage/storage - storage of structured data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { alignUp } from "@stardazed/math";
import { assert } from "@stardazed/debug";

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
 * @expects isPositiveNonZeroInteger(itemSizeBytes)
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function allocStorage(itemSizeBytes: number, minCapacity: number): StructStorage {
	const capacity = alignCapacityUp(minCapacity);
	const dataSizeBytes = itemSizeBytes * capacity;
	const pageAlignedSizeBytes = alignSizeBytesUpToWASMPage(dataSizeBytes);

	return {
		itemSizeBytes,
		capacity,
		owned: true,
		data: new Uint8Array(pageAlignedSizeBytes)
	};
}

export function createStorageInBuffer(itemSizeBytes: number, minCapacity: number, buffer: Uint8Array): StructStorage {
	const capacity = alignCapacityUp(minCapacity);
	const dataSizeBytes = itemSizeBytes * capacity;

	assert(dataSizeBytes <= buffer.byteLength, "Provided storage is too small");

	return {
		itemSizeBytes,
		capacity,
		owned: false,
		data: buffer
	};
}
