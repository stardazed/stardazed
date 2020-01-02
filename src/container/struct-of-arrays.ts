/*
container/struct-of-arrays - structured data laid out in contiguous arrays
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { StructField, PositionedStructField } from "./common";
import { alignUp } from "stardazed/core";

/**
 * The individual arrays of each field are padded to end on
 * an 8-byte boundary. This is done to ensure that all field
 * arrays are aligned to the maximum known field type so they
 * can be iterated over correctly and quickly.
 */
function alignUpFieldArray(field: StructField, count: number) {
	const fieldSizeBytes = field.type.byteSize * field.count;
	const arraySizeBytes = fieldSizeBytes * count;
	return alignUp(arraySizeBytes, 8);
}

function positionFields<C>(fields: ReadonlyArray<StructField<C>>, count: number) {
	const posFields: PositionedStructField<C>[] = [];

	let byteOffset = 0;
	for (const f of fields) {
		const sizeBytes = alignUpFieldArray(f, count);
		posFields.push({
			...f,
			byteOffset,
			sizeBytes
		});
		byteOffset += sizeBytes;
	}

	return { posFields, totalSizeBytes: byteOffset };
}

/**
 * Low-level fixed-size container of structured arrays.
 * In this container, the fields for all instances are stored in arrays.
 * For interleaved storage, use ArrayOfStructs
 */
export class StructOfArrays<C = unknown> {
	fields: ReadonlyArray<Readonly<PositionedStructField<C>>>;
	capacity: number;
	private data_: Uint8Array;

	/**
	 * @expects fields.length > 0
	 * @expects isPositiveNonZeroInteger(capacity)
	 */
	constructor(fields: StructField<C>[], capacity: number, bufferView?: Uint8Array) {
		const { posFields, totalSizeBytes } = positionFields(fields, capacity);

		if (bufferView) {
			if (totalSizeBytes > bufferView.byteLength) {
				throw new TypeError(`Provided buffer view is too small: ${bufferView.byteLength} < ${totalSizeBytes}`);
			}
			if ((bufferView.byteOffset & 7) !== 0) {
				throw new TypeError(`Provided buffer view is not aligned on an 8 byte boundary`);
			}
		}
		else {
			bufferView = new Uint8Array(totalSizeBytes);
		}

		this.fields = posFields;
		this.capacity = capacity;
		this.data_ = bufferView;
	}

	/**
	 * Calculate the size in bytes a buffer must be to store
	 * `capacity` items with the fields specified.
	 */
	static sizeBytesRequired<C>(fields: StructField<C>[], capacity: number) {
		let offset = 0;
		for (const f of fields) {
			offset += alignUpFieldArray(f, capacity);
		}
		return offset;
	}

	/**
	 * Get a typed buffer view covering all of the field's values.
	 */
	indexedFieldView(fieldIndex: number) {
		const f = this.fields[fieldIndex];
		return new (f.type.arrayType)(this.data_.buffer, this.data_.byteOffset + f.byteOffset, this.capacity);
	}

	clear() {
		this.data_.fill(0);
	}

	/**
	 * Resize the container to the new capacity.
	 *
	 * @expects isPositiveNonZeroInteger(newCapacity)
	 */
	resize(newCapacity: number, bufferView?: Uint8Array) {
		if (newCapacity === this.capacity) {
			return;
		}

		const { posFields: newFields, totalSizeBytes: newSizeBytes } = positionFields(this.fields, newCapacity);

		if (bufferView) {
			if (newSizeBytes > bufferView.byteLength) {
				throw new TypeError(`Provided buffer view is too small: ${bufferView.byteLength} < ${newSizeBytes}`);
			}
			if ((bufferView.byteOffset & 7) !== 0) {
				throw new TypeError(`Provided buffer view is not aligned on an 8 byte boundary`);
			}
		}
		else {
			bufferView = new Uint8Array(newSizeBytes);
		}

		// A capacity change will change the length of each individual array so we
		// need to re-layout the data in the new buffer.
		// We iterate over the basePointers and copy count_ elements from the old
		// data to each new array. With large arrays >100k elements this can take
		// millisecond-order time, so avoid resizes when possible.
		for (let ix = 0; ix < newFields.length; ++ix) {
			const oldField = this.fields[ix];
			const newField = newFields[ix];

			const oldView = new Uint8Array(this.data_, oldField.byteOffset, oldField.sizeBytes);
			const newView = new Uint8Array(bufferView, newField.byteOffset, newField.sizeBytes);
			newView.set(oldView);
		}

		this.fields = newFields;
		this.capacity = newCapacity;
		this.data_ = bufferView;
	}
}
