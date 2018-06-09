/**
 * container/sortedarray - always-sorted array type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { lowerBound } from "./algorithm";
import { appendArrayInPlace } from "./array";
import { stableSort, genericOrder, CompareFn } from "./sort";

export class SortedArray<T> {
	private data_: T[];
	private compareFn_: CompareFn<T>;

	constructor(source?: T[], compareFn?: CompareFn<T>) {
		this.compareFn_ = compareFn || genericOrder;
		this.data_ = source ? source.slice(0) : [];
		if (source) {
			this.sort();
		}
	}

	private sort() {
		stableSort(this.data_, this.compareFn_);
	}

	insert(value: T) {
		const successor = lowerBound(this.data_, value);
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
