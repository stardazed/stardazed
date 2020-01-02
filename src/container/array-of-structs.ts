/*
container/array-of-structs - multi-topology structured array
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumericType, clearArrayBuffer, transferArrayBuffer, alignUpMinumumAlignment } from "stardazed/core";

// ----- Fields with optional extra metadata

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


// ----- Layout of fields and records

/**
 * Topology of a {@link StructuredArray}.
 * Can be arrays of structs with interleaved fields or structs
 * of arrays with fields laid out contiguously. Structs can be
 * laid out memory-aligned or packed without padding.
 */
export const enum FieldTopology {
	AlignedStructs,
	PackedStructs,
	Arrays
}

function alignStructField(field: StructField, offset: number) {
	const sizeBytes = fieldSizeBytes(field);
	return alignUpMinumumAlignment(offset, sizeBytes);
}

export class StructLayout<C> {
	readonly posFields: ReadonlyArray<PositionedStructField<C>>;
	readonly totalSizeBytes: number;
	readonly topology: FieldTopology;

	constructor(fields: StructField<C>[], topology: FieldTopology) {
		let offset = 0;
		let maxElemSize = Float32Array.BYTES_PER_ELEMENT;
		this.posFields = fields.map(field => {
			const curOffset = offset;
			const sizeBytes = fieldSizeBytes(field);
			if (topology !== FieldTopology.AlignedStructs) {
				// packed structs or field arrays
				offset += sizeBytes;
			}
			else {
				// inter-field alignment
				offset = alignStructField(field, offset);
				maxElemSize = Math.max(maxElemSize, field.type.byteSize);
			}

			return {
				...field,
				byteOffset: curOffset,
				sizeBytes
			};
		});

		if (topology === FieldTopology.AlignedStructs) {
			// align full item size on boundary of biggest element in field list, with min of float boundary
			this.totalSizeBytes = alignUpMinumumAlignment(offset, maxElemSize);
		}
		else {
			// no inter-field/struct alignment
			this.totalSizeBytes = offset;
		}
		this.topology = topology;
	}

	sizeBytesForCount(structCount: number) {
		return this.totalSizeBytes * structCount;
	}
}

// ----- Storage

interface StorageDimensions {
	capacity: number;
	sizeBytes: number;
}

function calcStorageSize(itemSizeBytes: number, capacity: number): StorageDimensions {
	return {
		capacity,
		sizeBytes: itemSizeBytes * capacity
	};
}

class Storage {
	readonly itemSizeBytes: number;
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
	constructor(itemSizeBytes: number, minCapacity: number, bufferView?: Uint8Array) {
		const { capacity, sizeBytes } = calcStorageSize(itemSizeBytes, minCapacity);

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
		this.data = bufferView;
	}
}

// ----- StructuredArray

export interface StructuredArrayDesc<C> {
	layout: StructLayout<C>;
	capacity: number;
	bufferView?: Uint8Array;
}

/**
 * Low-level fixed-size storage of structured arrays.
 */
export class StructuredArray<C = unknown> {
	readonly layout: StructLayout<C>;
	readonly storage: Storage;

	/**
	 * @expects isPositiveNonZeroInteger(minCapacity)
	 */
	constructor(desc: StructuredArrayDesc<C>) {
		this.layout = desc.layout;
		this.storage = new Storage(this.layout.totalSizeBytes, desc.capacity, desc.bufferView);
	}

	get stride() {
		// there is no meaningful answer when using StructOfArrays topology
		if (this.layout.topology === FieldTopology.Arrays) {
			return 0;
		}
		return this.layout.totalSizeBytes;
	}

	/**
	 * Resize a structured array to accomodate a new capacity.
	 * Handles any data layout changes necessary for the active topology.
	 *
	 * @expects this.storage.owned === true
	 * @expects isPositiveNonZeroInteger(newCapacity)
	 */
	resize(newCapacity: number) {
		const currentSizeBytes = this.storage.data.byteLength;
		const { capacity, sizeBytes: newSizeBytes } = calcStorageSize(this.layout.totalSizeBytes, newCapacity);

		if (newSizeBytes === currentSizeBytes) {
			return;
		}

		let newBuffer: ArrayBufferLike;

		if (this.layout.topology !== FieldTopology.Arrays) {
			// for an array of structs, we simply reduce or enlarge the buffer
			newBuffer = transferArrayBuffer(this.storage.data.buffer, newSizeBytes);
			if (newSizeBytes < currentSizeBytes) {
				// If the buffer was reduced in size, clear out the array between the final
				// requested struct and end-of-buffer as that may contain initialized data.
				const { sizeBytes: dataSizeBytes } = calcStorageSize(this.layout.totalSizeBytes, newCapacity);
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
			// FIXME: no longer the case, use tiered copy
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
