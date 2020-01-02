/*
container/sorted-array - always-sorted array type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import * as core from "stardazed/core";

export class SortedArray<T> {
	/** @internal */
	private data_: T[];
	/** @internal */
	private foCompareFn_: core.FullOrderCompareFn<T>;
	/** @internal */
	private beCompareFn_: core.OrderBeforeCompareFn<T>;

	constructor(source?: T[], compareFn?: core.FullOrderCompareFn<T>) {
		this.foCompareFn_ = compareFn || core.genericFullOrder;
		this.beCompareFn_ = compareFn ? (core.makeOrderBeforeFromFullOrderFn(compareFn)) : core.genericOrderBefore;
		this.data_ = source ? source.slice(0) : [];
		if (source) {
			this.sort();
		}
	}

	/** @internal */
	private sort() {
		core.stableSort(this.data_, this.foCompareFn_);
	}

	insert(value: T) {
		const successor = core.lowerBound(this.data_, value, this.beCompareFn_);
		this.data_.splice(successor, 0, value);
	}

	insertMultiple(values: T[]) {
		const sourceLength = values.length;
		if (sourceLength > Math.min(20, this.data_.length / 2)) {
			core.appendArrayInPlace(this.data_, values);
			this.sort();
		}
		else {
			for (let ix = 0; ix < sourceLength; ++ix) {
				this.insert(values[ix]);
			}
		}
	}

	get array(): ReadonlyArray<T> {
		return this.data_;
	}

	get length() {
		return this.data_.length;
	}

	indexOf(value: T) {
		const index = core.lowerBound(this.data_, value);
		if (index === this.data_.length) {
			return -1;
		}
		if (this.data_[index] === value) {
			return index;
		}
		return -1;
	}
}
