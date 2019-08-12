/**
 * structured-storage/storage - storage of structured data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

export interface StructStorage {
	readonly itemSizeBytes: number;
	readonly storageAlignment: StorageAlignment;
	capacity: number;
	owned: boolean;
	data: Uint8Array;
}

/**
 * @param itemSizeBytes Size in bytes of each individual element in the storge
 * @param minCapacity The number of elements that _at least_ need to fit in the storage.
 * @param storageAlignment Flags indicating how the storage should be aligned
 * @expects isPositiveNonZeroInteger(itemSizeBytes)
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function allocStorage(itemSizeBytes: number, minCapacity: number, storageAlignment: StorageAlignment): StructStorage {
	const { capacity, sizeBytes } = calcAlignedStorageSize(itemSizeBytes, minCapacity, storageAlignment);

	return {
		itemSizeBytes,
		storageAlignment,
		capacity,
		owned: true,
		data: new Uint8Array(sizeBytes)
	};
}

/**
 * @param itemSizeBytes Size in bytes of each individual element in the storge
 * @param minCapacity The number of elements that _at least_ need to fit in the storage.
 * @param buffer The buffer to use for the 
 * @expects isPositiveNonZeroInteger(itemSizeBytes)
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function createStorageInBuffer(itemSizeBytes: number, minCapacity: number, storageAlignment: StorageAlignment, buffer: Uint8Array): StructStorage {
	const { capacity, sizeBytes } = calcAlignedStorageSize(itemSizeBytes, minCapacity, storageAlignment);

	if (sizeBytes > buffer.byteLength) {
		throw new RangeError("Provided storage is too small");
	}

	return {
		itemSizeBytes,
		storageAlignment,
		capacity,
		owned: false,
		data: buffer
	};
}

} // ns sd
