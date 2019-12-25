/*
container/structured-array - multi-topology structured array
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumericType, alignUp, clearArrayBuffer, transferArrayBuffer, alignUpMinumumAlignment } from "stardazed/core";

// ----- Fields and Layout

export type StructField<C = unknown> = {
	type: NumericType;
	count: number;
} & C;

function fieldSizeBytes(field: StructField) {
	return field.type.byteSize * field.count;
}

export type PositionedStructField<C> = {
	readonly byteOffset: number;
	readonly sizeBytes: number;
} & {
	readonly [P in keyof StructField<C>]: StructField<C>[P];
};

export const enum FieldAlignment {
	Aligned,
	Packed
}

function alignStructField(field: StructField, offset: number) {
	const sizeBytes = fieldSizeBytes(field);
	return alignUpMinumumAlignment(offset, sizeBytes);
}

class Layout<C> {
	readonly posFields: ReadonlyArray<PositionedStructField<C>>;
	readonly totalSizeBytes: number;

	constructor(fields: StructField<C>[], align: FieldAlignment) {
		let offset = 0;
		this.posFields = fields.map(field => {
			const curOffset = offset;
			const sizeBytes = fieldSizeBytes(field);
			if (align === FieldAlignment.Packed) {
				offset += sizeBytes;
			}
			else {
				offset = alignStructField(field, offset);
			}

			return {
				...field,
				byteOffset: curOffset,
				sizeBytes
			};
		});

		this.totalSizeBytes = offset;
	}

	sizeBytesForCount(structCount: number) {
		return this.totalSizeBytes * structCount;
	}
}

// ----- Storage

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

class Storage {
	readonly itemSizeBytes: number;
	readonly storageAlignment: StorageAlignment;
	capacity: number;
	owned: boolean;
	data: Uint8Array;

	/**
	 * @param itemSizeBytes Size in bytes of each individual element in the storge
	 * @param minCapacity The number of elements that _at least_ need to fit in the storage.
	 * @param bufferView (optional) The buffer view to use for the storage
	 * @expects isPositiveNonZeroInteger(itemSizeBytes)
	 * @expects isPositiveNonZeroInteger(minCapacity)
	 */
	constructor(itemSizeBytes: number, minCapacity: number, storageAlignment: StorageAlignment, bufferView?: Uint8Array) {
		const { capacity, sizeBytes } = calcAlignedStorageSize(itemSizeBytes, minCapacity, storageAlignment);

		this.owned = bufferView === undefined;
		if (bufferView) {
			if (sizeBytes > bufferView.byteLength) {
				throw new RangeError(`Provided buffer view is too small: ${bufferView.byteLength} < ${sizeBytes}`);
			}
		}
		else {
			bufferView = new Uint8Array(sizeBytes);
		}

		this.capacity = capacity;
		this.itemSizeBytes = itemSizeBytes;
		this.storageAlignment = storageAlignment;
		this.data = bufferView;
	}
}

// ----- StructuredArray

/**
 * Topology of a {@link StructuredArray}.
 * Can be arrays of structs with interleaved fields or
 * structs of arrays with fields laid out contiguously.
 */
export const enum StorageTopology {
	StructOfArrays,
	ArrayOfStructs
}

export interface StructuredArrayDesc<C> {
	fields: StructField<C>[];
	fieldAlignment: FieldAlignment;
	topology: StorageTopology;
	storageAlignment: StorageAlignment;
	minCapacity: number;
	bufferView?: Uint8Array;
}

/**
 * Low-level fixed-size storage of structured arrays.
 */
export class StructuredArray<C> {
	readonly layout: Layout<C>;
	readonly topology: StorageTopology;
	readonly storage: Storage;

	/**
	 * @expects isPositiveNonZeroInteger(minCapacity)
	 */
	constructor(desc: StructuredArrayDesc<C>) {
		this.layout = new Layout(desc.fields, desc.fieldAlignment);
		this.topology = desc.topology;
		this.storage = new Storage(this.layout.totalSizeBytes, desc.minCapacity, desc.storageAlignment, desc.bufferView);
	}

	/**
	 * Resize a structured array to accomodate a new minumum capacity.
	 * Handles any data layout changes necessary for the active topology.
	 *
	 * @expects this.storage.owned === true
	 * @expects isPositiveNonZeroInteger(newMinCapacity)
	 */
	resize(newMinCapacity: number) {
		const currentSizeBytes = this.storage.data.byteLength;
		const { capacity, sizeBytes: newSizeBytes } = calcAlignedStorageSize(this.layout.totalSizeBytes, newMinCapacity, this.storage.storageAlignment);

		if (newSizeBytes === currentSizeBytes) {
			return;
		}

		let newBuffer: ArrayBufferLike;

		if (this.topology === StorageTopology.ArrayOfStructs) {
			// for an array of structs, we simply reduce or enlarge the buffer
			newBuffer = transferArrayBuffer(this.storage.data.buffer, newSizeBytes);
			if (newSizeBytes < currentSizeBytes) {
				// If the buffer was reduced in size, clear out the array between the final
				// requested struct and end-of-buffer as that may contain initialized data.
				const { sizeBytes: dataSizeBytes } = calcAlignedStorageSize(this.layout.totalSizeBytes, newMinCapacity, StorageAlignment.None);
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
			const oldCapacity = this.storage.capacity;
			const doublesPerArray = (this.layout.sizeBytesForCount(oldCapacity) / Float64Array.BYTES_PER_ELEMENT) | 0;

			for (const field of this.layout.posFields) {
				const oldView = new Float64Array(this.storage.data.buffer, field.byteOffset * oldCapacity, doublesPerArray);
				const newView = new Float64Array(newBuffer, field.byteOffset * capacity, doublesPerArray);
				// FIXME(perf): implement and use copyArrayBuffer as .set is (still) slow
				newView.set(oldView);
			}
		}

		this.storage.capacity = capacity;
		this.storage.data = new Uint8Array(newBuffer);
	}
}
