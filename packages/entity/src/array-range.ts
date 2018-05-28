/**
 * entity/array-range - instance range as a sorted array
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { SortedArray } from "@stardazed/container";
import { Instance, InstanceIterator, InstanceRange } from "./instance";

class InstanceArrayIterator<C> implements InstanceIterator<C> {
	private index_ = -1;

	constructor(private readonly array_: ReadonlyArray<Instance<C>>) { }

	get current() {
		return this.array_[this.index_];
	}

	next() {
		this.index_ += 1;
		return this.index_ < this.array_.length;
	}
}


export class InstanceArrayRange<C> implements InstanceRange<C> {
	private readonly data_: SortedArray<Instance<C>>;

	constructor(array: Instance<C>[]) {
		this.data_ = new SortedArray<Instance<C>>(array);
	}

	get empty() {
		return this.data_.length === 0;
	}

	get front() { return this.data_.array[0]; }
	get back() { return this.data_.array[this.data_.length - 1]; }

	has(inst: Instance<C>) {
		return this.data_.array.indexOf(inst) > -1;
	}

	makeIterator(): InstanceIterator<C> {
		return new InstanceArrayIterator(this.data_.array);
	}

	forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void {
		let index = 0;
		const end = this.data_.length;

		while (index < end) {
			fn.call(thisObj, this.data_.array[index]);
			++index;
		}
	}
}
