/*
container/multi-array-buffer - dynamically sized struct of arrays
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { StructField } from "./struct-common";
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
	constructor(fields: StructField<C>[], initialCapacity: number) {
		this.backing_ = new StructOfArrays(fields, initialCapacity);
	}

	get count() { return this.count_; }

	clear() {
		this.count_ = 0;
		this.backing_.data.fill(0);
	}

	/**
	 * @expects isPositiveNonZeroInteger(newCount)
	 */
	resize(newCount: number): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (newCount > this.backing_.length) {
			this.backing_.resize(newCount);
			invalidation = InvalidatePointers.Yes;
		}
		else if (newCount < this.count_) {
			// Reducing the count will clear the now freed up elements so that when
			// a new allocation is made the element data is guaranteed to be zeroed.
			for (const field of this.backing_.fields) {
				const fav = this.backing_.fieldArrayView(field, newCount);
				fav.fill(0);
			}
		}

		this.count_ = newCount;
		return invalidation;
	}

	extend(): InvalidatePointers {
		let invalidation = InvalidatePointers.No;

		if (this.count_ === this.backing_.length) {
			// grow factor of 1.5
			this.backing_.resize(Math.ceil(this.count_ * 1.5));
			invalidation = InvalidatePointers.Yes;
		}

		++this.count_;
		return invalidation;
	}

	fieldView(ref: number | string) {
		const field = typeof ref === "number" ? this.backing_.fieldByIndex(ref) : this.backing_.fieldByName(ref);
		return this.backing_.fieldView(field!);
	}

	arrayFieldView(ref: number | string) {
		const field = typeof ref === "number" ? this.backing_.fieldByIndex(ref) : this.backing_.fieldByName(ref);
		return this.backing_.fieldArrayView(field!);
	}
}
