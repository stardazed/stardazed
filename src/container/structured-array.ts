/*
container/structured-array - multi-topology structured array
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumericType, alignUp, clearArrayBuffer, roundUpPowerOf2, transferArrayBuffer } from "../core";

export interface Field<UD = unknown> {
	type: NumericType;
	count: number;
	userData: UD;
}

export interface PositionedField<UD> extends DeepReadonly<Field<UD>> {
	readonly byteOffset: number;
	readonly sizeBytes: number;
}

export type PositionedFieldArray<UD> = ReadonlyArray<PositionedField<UD>>;

export interface Layout<UD> {
	readonly posFields: PositionedFieldArray<UD>;
	readonly totalSizeBytes: number;
}

export type AlignmentFn = <UD>(fields: Field<UD>[]) => Layout<UD>;

export function fieldSizeBytes(field: Field) {
	return field.type.byteSize * field.count;
}

export function layoutSizeBytesForCount(layout: Layout<any>, structCount: number) {
	return layout.totalSizeBytes * structCount;
}

export function packFields<UD>(fields: Field<UD>[]): Layout<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		const sizeBytes = fieldSizeBytes(field);
		totalOffset += sizeBytes;

		return {
			type: field.type,
			count: field.count,
			userData: field.userData as DeepReadonly<UD>,
			byteOffset: curOffset,
			sizeBytes
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}

function alignField(field: Field, offset: number) {
	const sizeBytes = fieldSizeBytes(field);
	const mask = roundUpPowerOf2(sizeBytes) - 1;
	return (offset + mask) & ~mask;
}

export function alignFields<UD>(fields: Field<UD>[]): Layout<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		totalOffset = alignField(field, totalOffset);

		return {
			type: field.type,
			count: field.count,
			userData: field.userData as DeepReadonly<UD>,
			byteOffset: curOffset,
			sizeBytes: fieldSizeBytes(field)
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}

const CAPACITY_UNIT = 32;
const WEBASSEMBLY_PAGE_SIZE = 64 * 1024;

export const enum StorageAlignment {
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

function calcAlignedStorageSize(itemSizeBytes: number, minCapacity: number, flags: StorageAlignment): StorageDimensions {
	const capacity = flags & StorageAlignment.ItemMultipleOf32 ? alignCapacityUp(minCapacity) : minCapacity;
	const dataSizeBytes = itemSizeBytes * capacity;
	const sizeBytes = flags & StorageAlignment.BlockMultipleOfWASMPage ? alignSizeBytesUpToWASMPage(dataSizeBytes) : dataSizeBytes;

	return {
		capacity,
		sizeBytes
	};
}

export interface Storage {
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
function allocStorage(itemSizeBytes: number, minCapacity: number, storageAlignment: StorageAlignment): Storage {
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
function createStorageInBuffer(itemSizeBytes: number, minCapacity: number, storageAlignment: StorageAlignment, buffer: Uint8Array): Storage {
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

/**
 * Topology of a {@link StructuredArray}.
 * Can be arrays of structs with interleaved fields or
 * structs of arrays with fields laid out contiguously.
 */
export const enum Topology {
	StructOfArrays,
	ArrayOfStructs
}

/**
 * Low-level fixed-size storage of structured arrays.
 */
export interface StructuredArray<UD> {
	readonly layout: Layout<UD>;
	readonly topology: Topology;
	readonly storage: Storage;
}

/**
 * Allocate and create a structured array of the requested capacity and topology.
 *
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function createStructuredArray<UD>(layout: Layout<UD>, topology: Topology, minCapacity: number, storageAlignment: StorageAlignment): StructuredArray<UD> {
	const storage = allocStorage(layout.totalSizeBytes, minCapacity, storageAlignment);
	return {
		layout,
		topology,
		storage
	};
}

/**
 * Create a structured array of the requested capacity and topology inside a provided buffer.
 *
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function createStructuredArrayInBuffer<UD>(layout: Layout<UD>, topology: Topology, minCapacity: number, storageAlignment: StorageAlignment, buffer: Uint8Array): StructuredArray<UD> {
	const storage = createStorageInBuffer(layout.totalSizeBytes, minCapacity, storageAlignment, buffer);
	return {
		layout,
		topology,
		storage
	};
}

/**
 * Resize a structured array to accomodate a new minumum capacity.
 * Handles any data layout changes necessary for the active topology.
 *
 * @expects sarr.storage.owned === true
 * @expects isPositiveNonZeroInteger(newMinCapacity)
 */
export function resizeStructuredArray<UD>(sarr: StructuredArray<UD>, newMinCapacity: number) {
	const currentSizeBytes = sarr.storage.data.byteLength;
	const { capacity, sizeBytes: newSizeBytes } = calcAlignedStorageSize(sarr.layout.totalSizeBytes, newMinCapacity, sarr.storage.storageAlignment);

	if (newSizeBytes === currentSizeBytes) {
		return;
	}

	let newBuffer: ArrayBufferLike;

	if (sarr.topology === Topology.ArrayOfStructs) {
		// for an array of structs, we simply reduce or enlarge the buffer
		newBuffer = transferArrayBuffer(sarr.storage.data.buffer, newSizeBytes);
		if (newSizeBytes < currentSizeBytes) {
			// If the buffer was reduced in size, clear out the array between the final
			// requested struct and end-of-buffer as that may contain initialized data.
			const { sizeBytes: dataSizeBytes } = calcAlignedStorageSize(sarr.layout.totalSizeBytes, newMinCapacity, StorageAlignment.None);
			clearArrayBuffer(newBuffer, dataSizeBytes, newSizeBytes);
		}
	}
	else {
		// For struct of arrays data, a capacity change will change the length of
		// each array individually so we need to re-layout the data in the new buffer.
		// We iterate over the basePointers and copy count_ elements from the old
		// data to each new array. With large arrays >100k elements this can take
		// millisecond-order time, so avoid resizes when possible.
		newBuffer = new ArrayBuffer(newSizeBytes);

		// because all arrays are a multiple of 32 elements long, we can use double views
		// to copy over data reasonable quickly.
		const oldCapacity = sarr.storage.capacity;
		const doublesPerArray = (layoutSizeBytesForCount(sarr.layout, oldCapacity) / Float64Array.BYTES_PER_ELEMENT) | 0;

		for (const field of sarr.layout.posFields) {
			const oldView = new Float64Array(sarr.storage.data.buffer, field.byteOffset * oldCapacity, doublesPerArray);
			const newView = new Float64Array(newBuffer, field.byteOffset * capacity, doublesPerArray);
			// FIXME(perf): implement and use copyArrayBuffer as .set is (still) slow
			newView.set(oldView);
		}
	}

	sarr.storage.capacity = capacity;
	sarr.storage.data = new Uint8Array(newBuffer);
}
