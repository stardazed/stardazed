// container/sortedarray - always-sorted array type
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.container {

	export function lowerBound<T>(array: ArrayLike<T>, value: T) {
		let count = array.length;
		let it: number;
		let first = 0;

		while (count > 0) {
			const step = count >> 1;
			it = first + step;
			if (array[it] < value) {
				first = ++it;
				count -= step + 1;
			}
			else {
				count = step;
			}
		}
		return first;
	}


	export function upperBound<T>(array: ArrayLike<T>, value: T) {
		let count = array.length;
		let it: number;
		let first = 0;

		while (count > 0) {
			const step = count >> 1;
			it = first + step;
			if (array[it] <= value) {
				first = ++it;
				count -= step + 1;
			}
			else {
				count = step;
			}
		}
		return first;
	}


	export class SortedArray<T> {
		private data_: T[];

		constructor(source?: T[], private compareFn_?: (a: T, b: T) => number) {
			this.data_ = source ? source.slice(0) : [];
			if (source) {
				this.sort();
			}
		}

		private sort() {
			if (this.data_.length < 2) {
				return;
			}
			const t0 = this.data_[0];
			let cmp = this.compareFn_;
			if (cmp === undefined && typeof t0 !== "string") {
				cmp = (a: T, b: T) => {
					return (a < b) ? -1 : ((a > b) ? 1 : 0);
				};
			}
			this.data_.sort(cmp);
		}

		insert(value: T) {
			let successor = lowerBound(this.data_, value);
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

} // sd.container
