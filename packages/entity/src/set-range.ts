/**
 * entity/set-range - instance range as a set, most flexible but also slowest
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Instance, InstanceIterator, InstanceRange } from "./instance";

class InstanceSetIterator<C> implements InstanceIterator<C> {
	current: Instance<C> = 0;

	constructor(private es6Iter: Iterator<Instance<C>>) { }

	next() {
		const res = this.es6Iter.next();
		this.current = res.value || 0;
		return !res.done;
	}
}

export class InstanceSet<C> implements InstanceRange<C> {
	private data_ = new Set<Instance<C>>();

	get count() { return this.data_.size; }
	get empty() { return this.data_.size === 0; }

	add(inst: Instance<C>) {
		this.data_.add(inst);
	}

	addRange(inst: Instance<C>, count: number) {
		let index = inst as number;
		const upto = index + count;
		while (index < upto) {
			this.data_.add(index);
			++index;
		}
	}

	addArray(arr: ArrayLike<Instance<C>>) {
		for (let ix = 0, end = arr.length; ix < end; ++ix) {
			this.data_.add(arr[ix]);
		}
	}

	remove(inst: Instance<C>) {
		this.data_.delete(inst);
	}

	removeRange(inst: Instance<C>, count: number) {
		let index = inst as number;
		const upto = index + count;
		while (index < upto) {
			this.data_.delete(index);
			++index;
		}
	}

	removeArray(arr: ArrayLike<Instance<C>>) {
		for (let ix = 0, end = arr.length; ix < end; ++ix) {
			this.data_.delete(arr[ix]);
		}
	}

	clear() {
		this.data_.clear();
	}

	has(inst: Instance<C>): boolean {
		return this.data_.has(inst);
	}

	makeIterator(): InstanceIterator<C> {
		return new InstanceSetIterator<C>(this.data_.values());
	}

	forEach(fn: (inst: Instance<C>) => void, thisObj?: any) {
		this.data_.forEach(fn, thisObj || this);
	}
}
