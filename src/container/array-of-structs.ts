/*
container/array-of-structs - structured data laid out in contiguous records
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

/* eslint-disable no-fallthrough */

import { alignUp, numericTraits } from "stardazed/core";
import { createNameIndexMap, StructField, PositionedStructField, FieldView } from "./struct-common";

function positionFields<C>(fields: ReadonlyArray<StructField<C>>) {
	const posFields: PositionedStructField<C>[] = [];

	let byteOffset = 0;
	let maxElemSize = 1;
	for (const field of fields) {
		// move the offset to align to this field's element size
		const traits = numericTraits(field.type);
		byteOffset = alignUp(byteOffset, traits.byteLength);
		const byteLength = traits.byteLength * field.width;

		posFields.push({
			...field,
			byteOffset,
			byteLength
		});

		byteOffset += byteLength;
		maxElemSize = Math.max(maxElemSize, traits.byteLength);
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
	private length_: number;
	private stride_: number;
	private data_: Uint8Array;

	/**
	 * @expects isPositiveNonZeroInteger(length)
	 */
	constructor(fields: StructField<C>[], length: number, bufferView?: Uint8Array) {
		const { posFields, recordSizeBytes } = positionFields(fields);
		const totalSizeBytes = recordSizeBytes * length;

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
		this.length_ = length;
		this.stride_ = recordSizeBytes;
		this.data_ = bufferView;
	}

	get fields() { return this.fields_; }
	get length() { return this.length_; }
	get stride() { return this.stride_;	}
	get data() { return this.data_; }
	get byteLength() { return this.length_ * this.stride_; }

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
	 * Get an iterable, mutable view on all of or a range of field's values.
	 */
	fieldView(field: number | PositionedStructField<C>, fromIndex = 0, toIndex = this.length_): FieldView {
		if (typeof field === "number") {
			field = this.fields_[field];
		}
		const traits = numericTraits(field.type);
		const byteOffset = this.data_.byteOffset + field.byteOffset + fromIndex * this.stride_;
		const strideInElements = this.stride_ / traits.byteLength;
		const elementsToCover = strideInElements * (toIndex - fromIndex - 1) + field.width;
		const rangeView = new traits.arrayType(this.data_.buffer, byteOffset, elementsToCover);
		return new AOSFieldView(rangeView, fromIndex, this.stride_ / traits.byteLength, field);
	}

	/**
	 * Resize the container to the new length.
	 * @param newLength the size in number of records to adjust the container to
	 * @param bufferView (optional) a buffer view to use as backing store, MUST be aligned on an 8-byte boundary
	 *
	 * @expects isPositiveNonZeroInteger(newLength)
	 */
	resize(newLength: number, bufferView?: Uint8Array) {
		if (newLength === this.length_) {
			return;
		}

		const newSizeBytes = newLength * this.stride_;

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
		const recordsToCopy = Math.min(newLength, this.length_);
		const oldView = new Uint8Array(this.data_.buffer, this.data_.byteOffset, recordsToCopy * this.stride_);
		const newView = new Uint8Array(bufferView.buffer, bufferView.byteOffset, recordsToCopy * this.stride_);
		newView.set(oldView);

		this.length_ = newLength;
		this.data_ = bufferView;
	}

	/**
	 * Calculate the size in bytes a buffer must be to store `count` items with the fields specified.
	 * Use this when you are providing buffers as backing store manually.
	 */
	static sizeBytesRequired<C>(fields: StructField<C>[], count: number) {
		let stride = 0;
		let maxElemSize = 1;
		for (const field of fields) {
			// move the offset to align to this field's element size
			const traits = numericTraits(field.type);
			stride = alignUp(stride, traits.byteLength);
			stride += traits.byteLength * field.width;
			maxElemSize = Math.max(maxElemSize, traits.byteLength);
		}

		// inter-record alignment, 1, 2, 4 or 8 bytes depending on largest element
		stride = alignUp(stride, maxElemSize);
		return stride * count;
	}
}

/**
 * An iterable view of a single field inside an ArrayOfStructs container.
 * Use this to easily fill, extract and iterate over a single field's data.
 */
class AOSFieldView implements FieldView {
	private readonly field_: Readonly<PositionedStructField<unknown>>;
	private readonly strideInElements_: number;
	private readonly rangeView_: TypedArray;
	readonly baseIndex: number;

	constructor(data: TypedArray, baseIndex: number, strideInElements: number, field: Readonly<PositionedStructField<unknown>>) {
		this.rangeView_ = data;
		this.strideInElements_ = strideInElements;
		this.field_ = field;
		this.baseIndex = baseIndex;
	}

	get width() {
		return this.field_.width;
	}

	get length() {
		// the rangeView encapsulates potentially only part of the last record
		return Math.ceil(this.rangeView_.length / this.strideInElements_);
	}

	get base() {
		return this.rangeView_;
	}

	*[Symbol.iterator]() {
		let offset = 0;
		while (offset < this.rangeView_.length) {
			yield this.rangeView_.subarray(offset, offset + this.field_.width);
			offset += this.strideInElements_;
		}
	}

	offsetOfItem(index: number) {
		return index * this.strideInElements_;
	}

	refItem(index: number) {
		const offset = index * this.strideInElements_;
		return this.rangeView_.subarray(offset, offset + this.field_.width);
	}

	copyItem(index: number) {
		let offset = (this.strideInElements_ * index);
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
		let offset = (this.strideInElements_ * index);
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

	/**
	 * @expects value.length === this.fieldWidth_
	 * @expects fromIndex === undefined || (fromIndex >= 0 && fromIndex < toIndex)
	 * @expects toIndex === undefined || (toIndex * this.fieldWidth_ <= )
	 */
	fill(value: NumArray, fromIndex?: number, toIndex?: number) {
		fromIndex = fromIndex ?? 0;
		toIndex = toIndex ?? (this.rangeView_.length / this.strideInElements_) | 0;
		this.copyValuesFrom(value, toIndex - fromIndex, fromIndex);
	}

	/**
	 * Copy values from a source array into the field for consecutive records
	 *
	 * @param source an array of numeric values
	 * @param valueCount the number of values to copy from source into fields
	 * @param atOffset (optional) the first index to start writing values into fields
	 * @expects (toOffset + valueCount) * this.strideInElements_ < this.rangeView_.length
	 * @expects source.length === this.fieldWidth_ || source.length >= valueCount * this.fieldWidth_
	 */
	copyValuesFrom(source: NumArray, valueCount: number, atOffset = 0) {
		const stride = this.strideInElements_;
		const elementWidth = this.field_.width;
		const dest = this.rangeView_;
		let destIndex = atOffset;
		let sourceIndex = 0;
		const sourceIncrement = source.length === elementWidth ? 0 : elementWidth;

		if (elementWidth === 4) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				dest[destIndex + 2] = source[sourceIndex + 2];
				dest[destIndex + 3] = source[sourceIndex + 3];
				sourceIndex += sourceIncrement;
				destIndex += stride;
			}
		}
		else if (elementWidth === 3) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				dest[destIndex + 2] = source[sourceIndex + 2];
				sourceIndex += sourceIncrement;
				destIndex += stride;
			}
		}
		else if (elementWidth === 2) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				dest[destIndex + 1] = source[sourceIndex + 1];
				sourceIndex += sourceIncrement;
				destIndex += stride;
			}
		}
		else if (elementWidth === 1) {
			for (let n = 0; n < valueCount; ++n) {
				dest[destIndex] = source[sourceIndex];
				sourceIndex += sourceIncrement;
				destIndex += stride;
			}
		}
		else {
			for (let n = 0; n < valueCount; ++n) {
				for (let e = 0; e < elementWidth; ++e) {
					dest[destIndex + e] = source[sourceIndex + e];
				}
				sourceIndex += sourceIncrement;
				destIndex += stride;
			}
		}
	}

	subView(fromIndex: number, toIndex: number) {
		const fromElement = fromIndex * this.strideInElements_;
		const elementsToCover = this.strideInElements_ * (toIndex - fromIndex - 1) + this.field_.width;
		const toElement = fromElement + elementsToCover;

		return new AOSFieldView(this.rangeView_.subarray(fromElement, toElement), this.baseIndex + fromIndex, this.strideInElements_, this.field_);
	}
}
