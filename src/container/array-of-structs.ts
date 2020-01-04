/*
container/array-of-structs - structured data laid out in contiguous records
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

/* eslint-disable no-fallthrough */

import { alignUp } from "stardazed/core";
import { StructField, PositionedStructField } from "./common";

function positionFields<C>(fields: ReadonlyArray<StructField<C>>) {
	const posFields: PositionedStructField<C>[] = [];

	let byteOffset = 0;
	let maxElemSize = 1;
	for (const field of fields) {
		// move the offset to align to this field's element size
		byteOffset = alignUp(byteOffset, field.type.byteSize);
		const sizeBytes = field.type.byteSize * field.count;

		posFields.push({
			...field,
			byteOffset,
			sizeBytes
		});

		byteOffset += sizeBytes;
		maxElemSize = Math.max(maxElemSize, field.type.byteSize);
	}

	// inter-record alignment, 1, 2, 4 or 8 bytes depending on largest element
	byteOffset = alignUp(byteOffset, maxElemSize);
	return { posFields, recordSizeBytes: byteOffset };
}

/**
 * Low-level fixed-size storage of structured arrays.
 */
export class ArrayOfStructs<C = unknown> {
	private fields_: ReadonlyArray<Readonly<PositionedStructField<C>>>;
	private nameIndexMap_: Record<string, number>;
	private capacity_: number;
	private stride_: number;
	private data_: Uint8Array;

	/**
	 * @expects isPositiveNonZeroInteger(minCapacity)
	 */
	constructor(fields: StructField<C>[], capacity: number, bufferView?: Uint8Array) {
		const { posFields, recordSizeBytes } = positionFields(fields);
		const totalSizeBytes = recordSizeBytes * capacity;

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
		this.nameIndexMap_ = {};
		for (let ix = 0; ix < posFields.length; ++ix) {
			const name = posFields[ix].name;
			// skip empty string name indexes
			if (name) {
				this.nameIndexMap_[name] = ix;
			}
		}

		this.fields_ = posFields;
		this.capacity_ = capacity;
		this.stride_ = recordSizeBytes;
		this.data_ = bufferView;
	}

	get fields() { return this.fields_; }
	get capacity() { return this.capacity_; }
	get stride() { return this.stride_;	}
	get data() { return this.data_; }

	/**
	 * Get field information using a field's index or name.
	 */
	field(ref: number | string) {
		if (typeof ref === "string") {
			return this.fields_[this.nameIndexMap_[ref]];
		}
		return this.fields_[ref];
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

		const newSizeBytes = newCapacity * this.stride_;

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

		// copy records to the new buffer, omitting extraneous ones if resizing down
		const recordsToCopy = Math.min(newCapacity, this.capacity_);
		const oldView = new Uint8Array(this.data_.buffer, this.data_.byteOffset, recordsToCopy * this.stride_);
		const newView = new Uint8Array(bufferView.buffer, bufferView.byteOffset, recordsToCopy * this.stride_);
		newView.set(oldView);

		this.capacity_ = newCapacity;
		this.data_ = bufferView;
	}

	/**
	 * Calculate the size in bytes a buffer must be to store `capacity` items with the fields specified.
	 * Use this when you are providing buffers as backing store manually.
	 */
	static sizeBytesRequired<C>(fields: StructField<C>[], capacity: number) {
		let stride = 0;
		let maxElemSize = 1;
		for (const field of fields) {
			// move the offset to align to this field's element size
			stride = alignUp(stride, field.type.byteSize);
			stride += field.type.byteSize * field.count;
			maxElemSize = Math.max(maxElemSize, field.type.byteSize);
		}

		// inter-record alignment, 1, 2, 4 or 8 bytes depending on largest element
		stride = alignUp(stride, maxElemSize);
		return stride * capacity;
	}
}

export class AOSIterator implements IterableIterator<TypedArray> {
	private data_: TypedArray;
	private step_: number;
	private width_: number;
	private index_: number;

	constructor(data: TypedArray, step: number, width: number) {
		this.data_ = data;
		this.step_ = step;
		this.width_ = width;
		this.index_ = 0;
	}

	next() {
		const offset = this.index_ * this.step_;
		if (offset >= this.data_.length) {
			return { done: true, value: this.data_ };
		}
		this.index_ += 1;
		return { done: false, value: this.data_.subarray(offset, offset + this.width_) };
	}

	[Symbol.iterator]() {
		return this;
	}
}

export class AOSFieldView<C> implements Iterable<TypedArray> {
	private fieldWidth_: number;
	private strideInElements_: number;
	private rangeView_: TypedArray;

	constructor(aos: ArrayOfStructs<C>, field: Readonly<PositionedStructField<C>>, fromRecord: number, toRecord: number) {
		this.strideInElements_ = (aos.stride / field.type.byteSize) | 0;
		const startOffset = field.byteOffset + (fromRecord * this.strideInElements_);
		const recordCount = toRecord - fromRecord;
		const elementCount = recordCount * this.strideInElements_;
		this.rangeView_ = new (field.type.arrayType)(aos.data.buffer, startOffset, elementCount);
		this.fieldWidth_ = field.count;
	}

	[Symbol.iterator]() {
		return new AOSIterator(this.rangeView_, this.strideInElements_, this.fieldWidth_);
	}

	refItem(index: number) {
		const offset = index * this.strideInElements_;
		return this.rangeView_.subarray(offset, offset + this.fieldWidth_);
	}

	copyItem(index: number) {
		let offset = (this.strideInElements_ * index);
		const result: number[] = [];

		switch (this.fieldWidth_) {
			case 4:
				result.push(this.rangeView_[offset]);
				offset += 1;
			case 3:
				result.push(this.rangeView_[offset]);
				offset += 1;
			case 2:
				result.push(this.rangeView_[offset]);
				offset += 1;
			case 1:
				result.push(this.rangeView_[offset]);
				break;
			default:
				throw new RangeError("copyItem not implemented yet for fields wider than 4 elements");
		}

		return result;
	}

	/**
	 * Copy values from a source array into the attribute for consecutive records
	 *
	 * @param source an array of numeric values
	 * @param valueCount the number of values to copy from source into attributes
	 * @param atOffset (optional) the first index to start writing values into attributes
	 * @expects (toOffset + valueCount) * this.strideInElements_ < this.rangeView_.length
	 * @expects source.length >= valueCount * this.field_.count
	 */
	copyValuesFrom(source: NumArray, valueCount: number, atOffset = 0) {
		const stride = this.strideInElements_;
		const elementCount = this.fieldWidth_;
		const dest = this.rangeView_;
		let destIndex = atOffset;
		let sourceIndex = 0;

		if (elementCount === 4) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				dest[destIndex + 2] = source[sourceIndex + 2];
				dest[destIndex + 3] = source[sourceIndex + 3];
				sourceIndex += 4;
				destIndex += stride;
			}
		}
		else if (elementCount === 3) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				dest[destIndex + 2] = source[sourceIndex + 2];
				sourceIndex += 3;
				destIndex += stride;
			}
		}
		else if (elementCount === 2) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				sourceIndex += 2;
				destIndex += stride;
			}
		}
		else if (elementCount === 1) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				sourceIndex += 1;
				destIndex += stride;
			}
		}
		else {
			for (let n = 0; n < valueCount; ++n) {
				for (let e = 0; e < elementCount; ++e) {
					dest[destIndex + e] = source[sourceIndex + e];
				}
				sourceIndex += elementCount;
				destIndex += stride;
			}
		}
	}
}
