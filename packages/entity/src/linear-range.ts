/**
 * entity/linear-range - simplest instance range
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Instance, InstanceIterator, InstanceRange } from "./instance";

class InstanceLinearIterator<C> implements InstanceIterator<C> {
	current: Instance<C>;

	constructor(first: Instance<C>, private last_: Instance<C>) {
		this.current = first as number - 1;
	}

	next() {
		this.current = (this.current as number + 1) as Instance<C>;
		return this.current > 0 && this.current <= this.last_;
	}
}

export class InstanceLinearRange<C> implements InstanceRange<C> {
	constructor(private first_: Instance<C>, private last_: Instance<C>) {
		// valid ranges require first >= 1 and last >= first
		// invalid ranges are just treated as empty
	}

	get empty() {
		return this.first_ < 1 || this.last_ < this.first_;
	}

	get front() { return this.first_; }
	get back() { return this.last_; }

	has(inst: Instance<C>): boolean {
		return inst >= this.first_ && inst <= this.last_;
	}

	makeIterator(): InstanceIterator<C> {
		return new InstanceLinearIterator(this.first_, this.last_);
	}

	forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void {
		let index = this.first_ as number;
		const end = this.last_ as number;

		if (index > 0) {
			while (index <= end) {
				fn.call(thisObj, index as Instance<C>);
				++index;
			}
		}
	}
}
