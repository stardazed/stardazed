/*
container/struct-of-arrays - structured data laid out in contiguous arrays
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { alignUp, isPowerOf2 } from "stardazed/core";
import { createNameIndexMap, StructField, PositionedStructField, FieldView } from "./struct-common";

/**
 * The individual arrays of each field are padded to end on
 * an 8-byte boundary. This is done to ensure that all field
 * arrays are aligned to the maximum known field type so they
 * can be iterated over correctly and quickly.
 */
function alignUpFieldArray(field: StructField, count: number) {
	const fieldSizeBytes = field.type.byteSize * field.width;
	const arraySizeBytes = fieldSizeBytes * count;
	return alignUp(arraySizeBytes, 8);
}

function positionFields<C>(fields: ReadonlyArray<StructField<C>>, count: number) {
	const posFields: PositionedStructField<C>[] = [];

	let byteOffset = 0;
	for (const field of fields) {
		const sizeBytes = alignUpFieldArray(field, count);
		posFields.push({
			...field,
			byteOffset,
			sizeBytes
		});
		byteOffset += sizeBytes;
	}

	return { posFields, totalSizeBytes: byteOffset };
}

function fieldArrayRangeView<C>(view: Uint8Array, f: PositionedStructField<C>, fromIndex: number, toIndex: number) {
	const startOffset = view.byteOffset + f.byteOffset + (fromIndex * (f.type.byteSize * f.width));
	return new (f.type.arrayType)(view.buffer, startOffset, (toIndex - fromIndex) * f.width);
}


/**
 * Low-level structured storage with consecutive field arrays.
 * For interleaved structured storage, use ArrayOfStructs.
 */
export class StructOfArrays<C = unknown> {
	private fields_: ReadonlyArray<Readonly<PositionedStructField<C>>>;
	private nameIndexMap_: Record<string, number>;
	private capacity_: number;
	private data_: Uint8Array;
	private sizeBytes_: number;

	/**
	 * Create a new struct of arrays storage.
	 * @param fields an array of field specifications
	 * @param capacity the size in number of records to accomodate
	 * @param bufferView (optional) a buffer view to use as backing store, MUST be aligned on an 8-byte boundary
	 *
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

		// precalc a mapping of field name to index for fast by-name lookups
		this.nameIndexMap_ = createNameIndexMap(posFields);

		this.fields_ = posFields;
		this.capacity_ = capacity;
		this.data_ = bufferView;
		this.sizeBytes_ = totalSizeBytes;
	}

	get fields() { return this.fields_; }
	get capacity() { return this.capacity_; }
	get data() { return this.data_; }
	get sizeBytes() { return this.sizeBytes_; }

	/**
	 * Get field metadata by index
	 * @expects index >= 0 && index < this.fields_.length
	 */
	fieldByIndex(index: number) {
		return this.fields_[index];
	}

	/**
	 * Get field metadata by name or undefined if name was not found
	 */
	fieldByName(name: string): Readonly<PositionedStructField<C>> | undefined {
		return this.fields_[this.nameIndexMap_[name]];
	}

	/**
	 * Get a typed buffer view covering all of or a range of a field's values.
	 */
	fieldArrayView(field: number | PositionedStructField<C>, fromIndex = 0, toIndex = this.capacity_) {
		if (typeof field === "number") {
			field = this.fields_[field];
		}
		return fieldArrayRangeView(this.data_, field, fromIndex, toIndex);
	}

	/**
	 * Get an iterable, mutable view on all of or a range of field's values.
	 */
	fieldView(field: number | PositionedStructField<C>, fromIndex = 0, toIndex = this.capacity_): FieldView {
		if (typeof field === "number") {
			field = this.fields_[field];
		}
		return new SOAFieldView(fieldArrayRangeView(this.data_, field, fromIndex, toIndex), field);
	}

	/**
	 * Resize the container to the new capacity.
	 * @param newCapacity the size in number of records to adjust the container to
	 * @param bufferView (optional) a buffer view to use as backing store, MUST be aligned on an 8-byte boundary
	 *
	 * @expects isPositiveNonZeroInteger(newCapacity)
	 */
	resize(newCapacity: number, bufferView?: Uint8Array) {
		if (newCapacity === this.capacity_) {
			return;
		}

		const { posFields: newFields, totalSizeBytes: newSizeBytes } = positionFields(this.fields_, newCapacity);

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
		// We iterate over the basePointers and copy elements from the old
		// data to each new array. With large arrays >100k elements this can take
		// millisecond-order time, so avoid resizes when possible.
		for (let ix = 0; ix < newFields.length; ++ix) {
			const oldField = this.fields_[ix];
			const newField = newFields[ix];
			const elementsToCopy = Math.min(newCapacity, this.capacity_) * newField.width;

			const oldView = fieldArrayRangeView(this.data_, oldField, 0, elementsToCopy);
			const newView = fieldArrayRangeView(bufferView, newField, 0, elementsToCopy);
			newView.set(oldView);
		}

		this.fields_ = newFields;
		this.capacity_ = newCapacity;
		this.data_ = bufferView;
		this.sizeBytes_ = newSizeBytes;
	}

	/**
	 * Calculate the size in bytes a buffer must be to store `capacity` items with the fields specified.
	 * Use this when you are providing buffers as backing store manually.
	 */
	static sizeBytesRequired<C>(fields: StructField<C>[], capacity: number) {
		let offset = 0;
		for (const f of fields) {
			offset += alignUpFieldArray(f, capacity);
		}
		return offset;
	}
}

class SOAFieldView implements FieldView {
	private readonly field_: PositionedStructField<unknown>;
	private readonly rangeView_: TypedArray;

	constructor(data: TypedArray, field: PositionedStructField<unknown>) {
		this.rangeView_ = data;
		this.field_ = field;
	}

	get length() {
		return this.rangeView_.length / this.field_.width;
	}

	*[Symbol.iterator]() {
		let offset = 0;
		while (offset < this.rangeView_.length) {
			yield this.rangeView_.subarray(offset, offset + this.field_.width);
			offset += this.field_.width;
		}
	}

	refItem(index: number) {
		const offset = index * this.field_.width;
		return this.rangeView_.subarray(offset, offset + this.field_.width);
	}

	copyItem(index: number) {
		let offset = (this.field_.width * index);
		const result: number[] = [];

		switch (this.field_.width) {
			case 16:
				result.push(this.rangeView_[offset]);
				result.push(this.rangeView_[offset + 1]);
				result.push(this.rangeView_[offset + 2]);
				result.push(this.rangeView_[offset + 3]);
				offset += 4;
				/* fallthrough */
			case 12:
				result.push(this.rangeView_[offset]);
				result.push(this.rangeView_[offset + 1]);
				result.push(this.rangeView_[offset + 2]);
				offset += 3;
				/* fallthrough */
			case 9:
				result.push(this.rangeView_[offset]);
				offset += 1;
				/* fallthrough */
			case 8:
				result.push(this.rangeView_[offset]);
				result.push(this.rangeView_[offset + 1]);
				offset += 2;
				/* fallthrough */
			case 6:
				result.push(this.rangeView_[offset]);
				result.push(this.rangeView_[offset + 1]);
				offset += 2;
				/* fallthrough */
			case 4:
				result.push(this.rangeView_[offset]);
				offset += 1;
				/* fallthrough */
			case 3:
				result.push(this.rangeView_[offset]);
				offset += 1;
				/* fallthrough */
			case 2:
				result.push(this.rangeView_[offset]);
				offset += 1;
				/* fallthrough */
			case 1:
				result.push(this.rangeView_[offset]);
				break;
			default:
				throw new RangeError(`copyItem not implemented yet for fields with ${this.field_.width} elements`);
		}

		return result;
	}

	setItem(index: number, value: NumArray) {
		let offset = (this.field_.width * index);
		let srcOffset = 0;

		switch (this.field_.width) {
			case 16:
				this.rangeView_[offset] = value[srcOffset];
				this.rangeView_[offset + 1] = value[srcOffset + 1];
				this.rangeView_[offset + 2] = value[srcOffset + 2];
				this.rangeView_[offset + 3] = value[srcOffset + 3];
				offset += 4; srcOffset += 4;
				/* fallthrough */
			case 12:
				this.rangeView_[offset] = value[srcOffset];
				this.rangeView_[offset + 1] = value[srcOffset + 1];
				this.rangeView_[offset + 2] = value[srcOffset + 2];
				offset += 3; srcOffset += 3;
				/* fallthrough */
			case 9:
				this.rangeView_[offset] = value[srcOffset];
				offset += 1; srcOffset += 1;
				/* fallthrough */
			case 8:
				this.rangeView_[offset] = value[srcOffset];
				this.rangeView_[offset + 1] = value[srcOffset + 1];
				offset += 2; srcOffset += 2;
				/* fallthrough */
			case 6:
				this.rangeView_[offset] = value[srcOffset];
				this.rangeView_[offset + 1] = value[srcOffset + 1];
				offset += 2; srcOffset += 2;
				/* fallthrough */
			case 4:
				this.rangeView_[offset] = value[srcOffset];
				offset += 1; srcOffset += 1;
				/* fallthrough */
			case 3:
				this.rangeView_[offset] = value[srcOffset];
				offset += 1; srcOffset += 1;
				/* fallthrough */
			case 2:
				this.rangeView_[offset] = value[srcOffset];
				offset += 1; srcOffset += 1;
				/* fallthrough */
			case 1:
				this.rangeView_[offset] = value[srcOffset];
				break;
			default:
				throw new RangeError(`setItem not implemented yet for fields with ${this.field_.width} elements`);
		}
	}

	fill(value: NumArray, fromIndex?: number, toIndex?: number) {
		if (this.field_.width === 1) {
			this.rangeView_.fill(value[0], fromIndex, toIndex);
		}
		else {
			const width = this.field_.width;
			fromIndex = fromIndex ?? 0;
			toIndex = toIndex ?? this.rangeView_.length / width;
			const fromElement = fromIndex * width;
			const toElement = toIndex * width;
			let srcOffset = 0;

			if (isPowerOf2(width)) {
				const mask = width - 1;
				for (let e = fromElement; e < toElement; ++e) {
					this.rangeView_[e] = value[srcOffset];
					srcOffset = (srcOffset += 1) & mask;
				}
			}
			else {
				for (let e = fromElement; e < toElement; ++e) {
					this.rangeView_[e] = value[srcOffset];
					srcOffset = (srcOffset + 1) % width;
				}
			}
		}
	}

	/**
	 * Copy values from a source array into the attribute for consecutive records
	 *
	 * @param source an array of numeric values
	 * @param valueCount the number of values to copy from source into attributes
	 * @param atOffset (optional) the first index to start writing values into attributes
	 * @expects (toOffset + valueCount) * this.fieldWidth_ < this.rangeView_.length
	 * @expects source.length >= valueCount * this.fieldWidth_
	 */
	copyValuesFrom(source: NumArray, valueCount: number, atOffset = 0) {
		const valueOffset = atOffset * this.field_.width;
		const elementsToCopy = valueCount * this.field_.width;

		if (elementsToCopy === source.length) {
			this.rangeView_.set(source, valueOffset);
		}
		else {
			if (ArrayBuffer.isView(source)) {
				const sourceSub = (source as TypedArray).subarray(0, elementsToCopy);
				this.rangeView_.set(sourceSub, valueOffset);
			}
			else {
				for (let k = 0; k < elementsToCopy; ++k) {
					this.rangeView_[k + valueOffset] = source[k];
				}
			}
		}
	}

	subView(fromIndex: number, toIndex: number) {
		const width = this.field_.width;
		return new SOAFieldView(this.rangeView_.subarray(fromIndex * width, toIndex * width), this.field_);
	}
}
