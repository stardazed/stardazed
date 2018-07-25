/**
 * container/arraybuffer - arrays of structs and structs of arrays (numeric data only)
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/debug";
import { NumericType, TypedArray } from "@stardazed/core";
import { alignUp, roundUpPowerOf2 } from "@stardazed/math";
import { clearArrayBuffer } from "./array";

export interface MABField {
	type: NumericType;
	count: number;
}

interface PositionedMABField extends MABField {
	byteOffset: number;
	sizeBytes: number;
}

interface PositioningResult {
	posFields: PositionedMABField[];
	totalSizeBytes: number;
}

function mabFieldSizeBytes(field: MABField) {
	return field.type.byteSize * field.count;
}

function packMABFields(fields: MABField[]): PositioningResult {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		const sizeBytes = mabFieldSizeBytes(field);
		totalOffset += sizeBytes;

		return {
			type: field.type,
			count: field.count,
			byteOffset: curOffset,
			sizeBytes
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}

function alignMABField(field: MABField, offset: number) {
	const sizeBytes = mabFieldSizeBytes(field);
	const mask = roundUpPowerOf2(sizeBytes) - 1;
	return (offset + mask) & ~mask;
}

function alignMABFields(fields: MABField[]): PositioningResult {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		totalOffset = alignMABField(field, totalOffset);

		return {
			type: field.type,
			count: field.count,
			byteOffset: curOffset,
			sizeBytes: mabFieldSizeBytes(field)
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}


export const enum InvalidatePointers {
	No,
	Yes
}

export class FixedMultiArray {
	private readonly data_: ArrayBuffer;
	private readonly basePointers_: TypedArray[];

	constructor(private capacity_: number, fields: MABField[]) {
		const { posFields, totalSizeBytes } = packMABFields(fields);
		this.data_ = new ArrayBuffer(totalSizeBytes * capacity_);

		this.basePointers_ = posFields.map(posField => {
			const byteOffset = capacity_ * posField.byteOffset;
			return new (posField.type.arrayType)(this.data_, byteOffset, capacity_ * posField.count);
		});
	}

	get capacity() { return this.capacity_; }
	get data() { return this.data_; }

	clear() {
		clearArrayBuffer(this.data_);
	}

	indexedFieldView(index: number) {
		return this.basePointers_[index];
	}
}


export class MultiArrayBuffer {
	private fields_: PositionedMABField[];
	private capacity_ = 0;
	private count_ = 0;
	private elementSumSize_ = 0;
	private data_: ArrayBuffer | null = null;

	/**
	 * @expects isPositiveNonZeroInteger(initialCapacity)
	 */
	constructor(initialCapacity: number, fields: MABField[]) {
		let totalOffset = 0;
		this.fields_ = fields.map(field => {
			const curOffset = totalOffset;
			const sizeBytes = field.type.byteSize * field.count;
			totalOffset += sizeBytes;

			return {
				type: field.type,
				count: field.count,
				byteOffset: curOffset,
				sizeBytes
			};
		});

		this.elementSumSize_ = totalOffset;

		this.reserve(initialCapacity);
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
	private fieldArrayView(f: PositionedMABField, buffer: ArrayBuffer, itemCount: number) {
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


export class FixedStructArray {
	private readonly data_: ArrayBuffer;
	private readonly fields_: PositionedMABField[];
	private readonly structSize_: number;
	private readonly capacity_: number;

	constructor(capacity: number, fields: MABField[]) {
		const result = alignMABFields(fields);
		this.fields_ = result.posFields;
		this.structSize_ = result.totalSizeBytes;
		this.capacity_ = capacity;

		this.data_ = new ArrayBuffer(this.structSize_ * this.capacity_);
	}

	indexedStructBuffer(structIndex: number) {
		const byteOffset = structIndex * this.structSize_;
		return this.data_.slice(byteOffset, byteOffset + this.structSize_);
	}

	indexedStructFieldView(structIndex: number, fieldIndex: number) {
		const f = this.fields_[fieldIndex];
		const byteOffset = (structIndex * this.structSize_) + f.byteOffset;
		return new (f.type.arrayType)(this.data_, byteOffset, f.count);
	}

	get structSizeBytes() { return this.structSize_; }
	get capacity() { return this.capacity_; }
	get data() { return this.data_; }

	clear() {
		clearArrayBuffer(this.data_);
	}
}
