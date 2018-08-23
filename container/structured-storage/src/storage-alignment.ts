/**
 * structured-storage/storage-alignment - storage of structured data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { alignUp } from "@stardazed/math";

const CAPACITY_UNIT = 32;
const WEBASSEMBLY_PAGE_SIZE = 64 * 1024;

export const enum SizingAlignmentFlags {
	None = 0,
	ItemMultipleOf32 = 1,
	BlockMultipleOfWASMPage = 2,
}

export interface StorageDimensions {
	capacity: number;
	sizeBytes: number;
}

function alignCapacityUp(capacity: number) {
	return alignUp(capacity, CAPACITY_UNIT);
}

function alignSizeBytesUpToWASMPage(sizeBytes: number) {
	return alignUp(sizeBytes, WEBASSEMBLY_PAGE_SIZE);
}

export function calcStorageSizeWithAlignmentFlags(itemSizeBytes: number, minCapacity: number, flags: SizingAlignmentFlags): StorageDimensions {
	const capacity = flags & SizingAlignmentFlags.ItemMultipleOf32 ? alignCapacityUp(minCapacity) : minCapacity;
	const dataSizeBytes = itemSizeBytes * capacity;
	const sizeBytes = flags & SizingAlignmentFlags.BlockMultipleOfWASMPage ? alignSizeBytesUpToWASMPage(dataSizeBytes) : dataSizeBytes;

	return {
		capacity,
		sizeBytes
	};
}
