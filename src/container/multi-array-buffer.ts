/*
container/multi-array-buffer - dynamically sized struct of arrays
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clearArrayBuffer, roundUpPowerOf2, alignUp } from "stardazed/core";
import { StructField } from "./common";
import { StructOfArrays } from "./struct-of-arrays";

export const enum InvalidatePointers {
	No,
	Yes
}

export class MultiArrayBuffer<C = unknown> {
	/** @internal */
	private readonly backing_: StructOfArrays<C>;
	/** @internal */
	private count_ = 0;

	/**
	 * @expects isPositiveNonZeroInteger(initialCapacity)
	 * @expects fields.length > 0
	 */
	constructor(initialCapacity: number, fields: StructField<C>[]) {
		this.backing_ = new StructOfArrays(fields, initialCapacity);
	}

	get fieldCount() { return this.backing_.fields.length; }

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	field(index: number) {
		return this.backing_.fields[index];
	}

	get capacity() { return this.backing_.capacity; }
	get count() { return this.count_; }

	clear() {
		this.count_ = 0;
		// this.backing_.clear(); necessary?
	}

	/**
	 * @expects isPositiveNonZeroInteger(newCount)
	 */
	resize(newCount: number): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (newCount > this.capacity) {
			// automatically expand up to next highest power of 2 size
			// FIXME: why is this again?
			invalidation = this.reserve(newCount);
		}
		else if (newCount < this.count_) {
			// Reducing the count will clear the now freed up elements so that when
			// a new allocation is made the element data is guaranteed to be zeroed.
			const elementsToClear = this.count_ - newCount;

			for (const field of this.backing_.layout.posFields) {
				const array = this.fieldArrayView(field, this.backing_.storage.data.buffer, this.count_);
				const zeroes = new (field.type.arrayType)(elementsToClear * field.count);
				array.set(zeroes, newCount * field.count);
			}
		}

		this.count_ = newCount;
		return invalidation;
	}

	extend(): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (this.count_ === this.capacity) {
			invalidation = this.reserve(Math.ceil(this.capacity * 1.5));
		}

		++this.count_;
		return invalidation;
	}

	/**
	 * @expects index >= 0 && index < this.fields_.length
	 */
	indexedFieldView(index: number) {
		return this.fieldArrayView(this.backing_.layout.posFields[index], this.backing_.storage.data.buffer, this.capacity);
	}
}
