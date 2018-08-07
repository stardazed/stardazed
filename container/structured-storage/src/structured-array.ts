/**
 * structured-storage/structured-storage - underlying multi-topology storage type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { StructLayout, structLayoutSizeBytesForCount } from "./layout";
import { StructStorage, allocStorage, alignCapacityUp, alignSizeBytesUpToWASMPage, createStorageInBuffer } from "./storage";
import { transferArrayBuffer, clearArrayBuffer } from "@stardazed/array";

/**
 * Topology of a {@link StructuredArray}.
 * Can be arrays of structs with interleaved fields or
 * structs of arrays with fields laid out contiguously.
 */
export const enum StructTopology {
	StructOfArrays,
	ArrayOfStructs
}

/**
 * Low-level fixed-size storage of structured arrays.
 */
export interface StructuredArray<UD> {
	readonly layout: StructLayout<UD>;
	readonly topology: StructTopology;
	readonly storage: StructStorage;
}

/**
 * Allocate and create a structured array of the requested capacity and topology.
 * 
 * @expects isPositiveNonZeroInteger(minCapacity)
 */
export function createStructuredArray<UD>(layout: StructLayout<UD>, topology: StructTopology, minCapacity: number): StructuredArray<UD> {
	const storage = allocStorage(layout.totalSizeBytes, minCapacity);
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
export function createStructuredArrayInBuffer<UD>(layout: StructLayout<UD>, topology: StructTopology, minCapacity: number, buffer: Uint8Array): StructuredArray<UD> {
	const storage = createStorageInBuffer(layout.totalSizeBytes, minCapacity, buffer);
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
	const capacity = alignCapacityUp(newMinCapacity);
	const dataSizeBytes = sarr.layout.totalSizeBytes * capacity;
	const newSizeBytes = alignSizeBytesUpToWASMPage(dataSizeBytes);
	const currentSizeBytes = sarr.storage.data.byteLength;

	if (newSizeBytes === currentSizeBytes) {
		return;
	}

	let newBuffer: ArrayBufferLike;

	if (sarr.topology === StructTopology.ArrayOfStructs) {
		// for an array of structs, we simply reduce or enlarge the buffer
		newBuffer = transferArrayBuffer(sarr.storage.data.buffer, newSizeBytes);
		if (newSizeBytes < currentSizeBytes) {
			// If the buffer was reduced in size, clear out the array between the final struct
			// and end-of-buffer as that may contain initialized data.
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
		const doublesPerArray = (structLayoutSizeBytesForCount(sarr.layout, oldCapacity) / Float64Array.BYTES_PER_ELEMENT) | 0;

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
