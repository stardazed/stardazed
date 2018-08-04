/**
 * structured-array/multi-array-buffer - dynamically sized struct of arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/debug";
import { clearArrayBuffer } from "@stardazed/array";
import { alignUp, roundUpPowerOf2 } from "@stardazed/math";
import { PositionedStructField, StructField, StructAlignmentFn, packStructFields } from "./struct-field";

export const enum InvalidatePointers {
	No,
	Yes
}

export class MultiArrayBuffer<UD = unknown> {
	private fields_: PositionedStructField<UD>[];
	private capacity_ = 0;
	private count_ = 0;
	private elementSumSize_ = 0;
	private data_: ArrayBuffer | null = null;

	/**
	 * @expects isPositiveNonZeroInteger(initialCapacity)
	 * @expects fields.length > 0
	 */
	constructor(initialCapacity: number, fields: StructField<UD>[], alignmentFn: StructAlignmentFn = packStructFields) {
		const { posFields, totalSizeBytes } = alignmentFn(fields);
		this.fields_ = posFields;
		this.elementSumSize_ = totalSizeBytes;

		this.reserve(initialCapacity);
	}

	get fieldCount() { return this.fields_.length; }

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	field(index: number): Readonly<PositionedStructField<UD>> {
		return this.fields_[index];
	}

	get capacity() { return this.capacity_; }
	get count() { return this.count_; }

	/**
	 * @expects this.count_ > 0
	 */
	get backIndex() {
		return this.count_ - 1;
	}

	/**
	 * @expects itemCount > 0
	 */
	private fieldArrayView(f: PositionedStructField<UD>, buffer: ArrayBuffer, itemCount: number) {
		const byteOffset = f.byteOffset * itemCount;
		return new (f.type.arrayType)(buffer, byteOffset, itemCount * f.count);
	}

	/**
	 * @expects newCapacity > 0 
	 */
	reserve(newCapacity: number): InvalidatePointers {
		// By forcing an allocated multiple of 32 elements, we never have
		// to worry about padding between consecutive arrays. 32 is chosen
		// as it is the AVX layout requirement, so e.g. a char field followed
		// by an m256 field will be aligned regardless of array length.
		// We could align to 16 or even 8 and likely be fine, but this container
		// isn't meant for tiny arrays so 32 it is.

		newCapacity = alignUp(newCapacity, 32);
		if (newCapacity <= this.capacity_) {
			// TODO: add way to cut capacity?
			return InvalidatePointers.No;
		}

		const newData = new ArrayBuffer(newCapacity * this.elementSumSize_);
		assert(newData);

		let invalidation = InvalidatePointers.No;
		if (this.data_) {
			// Since a capacity change will change the length of each array individually
			// we need to re-layout the data in the new buffer.
			// We iterate over the basePointers and copy count_ elements from the old
			// data to each new array. With large arrays >100k elements this can take
			// millisecond-order time, so avoid resizes when possible.

			this.fields_.forEach(field => {
				const oldView = this.fieldArrayView(field, this.data_!, this.count_);
				const newView = this.fieldArrayView(field, newData, newCapacity);
				newView.set(oldView);
			});

			invalidation = InvalidatePointers.Yes;
		}

		this.data_ = newData;
		this.capacity_ = newCapacity;

		return invalidation;
	}


	clear() {
		this.count_ = 0;
		clearArrayBuffer(this.data_!);
	}

	/**
	 * @expects isPositiveNonZeroInteger(newCount)
	 */
	resize(newCount: number): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (newCount > this.capacity_) {
			// automatically expand up to next highest power of 2 size
			invalidation = this.reserve(roundUpPowerOf2(newCount));
		}
		else if (newCount < this.count_) {
			// Reducing the count will clear the now freed up elements so that when
			// a new allocation is made the element data is guaranteed to be zeroed.

			const elementsToClear = this.count_ - newCount;

			this.fields_.forEach(field => {
				const array = this.fieldArrayView(field, this.data_!, this.count_);
				const zeroes = new (field.type.arrayType)(elementsToClear * field.count);
				array.set(zeroes, newCount * field.count);
			});
		}

		this.count_ = newCount;
		return invalidation;
	}

	extend(): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (this.count_ === this.capacity_) {
			invalidation = this.reserve(this.capacity_ * 2);
		}

		++this.count_;
		return invalidation;
	}

	/**
	 * @expects index >= 0 && index < this.fields_.length
	 */
	indexedFieldView(index: number) {
		return this.fieldArrayView(this.fields_[index], this.data_!, this.capacity_);
	}
}
