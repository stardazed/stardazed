/**
 * @stardazed/sorted-array - always-sorted array type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import {
	FullOrderCompareFn, OrderBeforeCompareFn,
	genericFullOrder, genericOrderBefore, makeOrderBeforeFromFullOrderFn,
	appendArrayInPlace, lowerBound, stableSort
} from "@stardazed/array";

export class SortedArray<T> {
	private data_: T[];
	private foCompareFn_: FullOrderCompareFn<T>;
	private beCompareFn_: OrderBeforeCompareFn<T>;

	constructor(source?: T[], compareFn?: FullOrderCompareFn<T>) {
		this.foCompareFn_ = compareFn || genericFullOrder;
		this.beCompareFn_ = compareFn ? (makeOrderBeforeFromFullOrderFn(compareFn)) : genericOrderBefore;
		this.data_ = source ? source.slice(0) : [];
		if (source) {
			this.sort();
		}
	}

	private sort() {
		stableSort(this.data_, this.foCompareFn_);
	}

	insert(value: T) {
		const successor = lowerBound(this.data_, value, this.beCompareFn_);
		this.data_.splice(successor, 0, value);
	}

	insertMultiple(values: T[]) {
		const sourceLength = values.length;
		if (sourceLength > Math.min(20, this.data_.length / 2)) {
			appendArrayInPlace(this.data_, values);
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

	// indexOf(value: T) {
	// 	const successor = lowerBound(this.data_, value);
	// 	if (successor < 0) {
	// 		return -1;
	// 	}
	// }
}
