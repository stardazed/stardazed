// world/instance - instances, ranges, iterators and manager interface
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export interface Instance<Component> extends Number {
		readonly __C?: Component;
	}


	export interface InstanceArrayView<Component> {
		readonly length: number;
		[index: number]: Instance<Component>;
	}


	export interface InstanceIterator<Component> {
		readonly current: Instance<Component>;
		next(): boolean;
	}


	export interface InstanceRange<Component> {
		readonly empty: boolean;
		has(inst: Instance<Component>): boolean;

		makeIterator(): InstanceIterator<Component>;
		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
	}


	export interface ComponentManager<Component> {
		readonly count: number;

		valid(inst: Instance<Component>): boolean;

		destroy(inst: Instance<Component>): void;
		destroyRange(range: InstanceRange<Component>): void;

		all(): InstanceRange<Component>;
	}


	// -------


	class InstanceLinearIterator<Component> implements InstanceIterator<Component> {
		current: Instance<Component>;

		constructor(first: Instance<Component>, private last_: Instance<Component>) {
			this.current = first;
		}

		next() {
			this.current = (this.current as number + 1) as Instance<Component>;
			return this.current > 0 && this.current <= this.last_;
		}
	}


	export class InstanceLinearRange<Component> implements InstanceRange<Component> {
		constructor(private first_: Instance<Component>, private last_: Instance<Component>) {
			// valid ranges require first >= 1 and last >= first
			// invalid ranges are just treated as empty
		}

		get empty() {
			return this.first_ < 1 || this.last_ < this.first_;
		}

		get front() { return this.first_; }
		get back() { return this.last_; }

		has(inst: Instance<Component>): boolean {
			return inst >= this.first_ && inst <= this.last_;
		}

		makeIterator(): InstanceIterator<Component> {
			return new InstanceLinearIterator(this.first_, this.last_);
		}

		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void {
			let index = this.first_ as number;
			const end = this.last_ as number;

			if (index > 0) {
				while (index <= end) {
					fn.call(thisObj, <Instance<Component>>index);
					++index;
				}
			}
		}
	}


	// -------


	class InstanceArrayIterator<Component> implements InstanceIterator<Component> {
		private index_ = -1;

		constructor(private readonly array_: Instance<Component>[]) {}

		get current() {
			return this.array_[this.index_];
		}

		next() {
			this.index_ += 1;
			return this.index_ < this.array_.length;
		}
	}


	export class InstanceArrayRange<Component> implements InstanceRange<Component> {
		private readonly data_: Instance<Component>[];

		constructor(array: Instance<Component>[]) {
			this.data_ = array;
		}

		get empty() {
			return this.data_.length === 0;
		}

		get front() { return this.data_[0]; }
		get back() { return this.data_[this.data_.length - 1]; }

		has(inst: Instance<Component>) {
			return this.data_.indexOf(inst) > -1;
		}

		makeIterator(): InstanceIterator<Component> {
			return new InstanceArrayIterator(this.data_);
		}

		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void {
			let index = 0;
			const end = this.data_.length;

			while (index < end) {
				fn.call(thisObj, this.data_[index]);
				++index;
			}
		}
	}


	// -------


	class InstanceSetIterator<Component> implements InstanceIterator<Component> {
		current: Instance<Component> = 0;

		constructor(private es6Iter: Iterator<Instance<Component>>) {}

		next() {
			const res = this.es6Iter.next();
			this.current = res.value || 0;
			return !res.done;
		}
	}


	export class InstanceSet<Component> implements InstanceRange<Component> {
		private data_ = new Set<Instance<Component>>();

		get count() { return this.data_.size; }
		get empty() { return this.data_.size == 0; }

		add(inst: Instance<Component>) {
			this.data_.add(inst);
		}

		addRange(inst: Instance<Component>, count: number) {
			let index = <number>inst;
			const upto = index + count;
			while (index < upto) {
				this.data_.add(index);
				++index;
			}
		}

		addArray(arr: ArrayLike<Instance<Component>>) {
			for (let ix = 0, end = arr.length; ix < end; ++ix) {
				this.data_.add(arr[ix]);
			}
		}

		remove(inst: Instance<Component>) {
			this.data_.delete(inst);
		}

		removeRange(inst: Instance<Component>, count: number) {
			let index = <number>inst;
			const upto = index + count;
			while (index < upto) {
				this.data_.delete(index);
				++index;
			}
		}

		removeArray(arr: ArrayLike<Instance<Component>>) {
			for (let ix = 0, end = arr.length; ix < end; ++ix) {
				this.data_.delete(arr[ix]);
			}
		}

		clear() {
			this.data_.clear();
		}

		has(inst: Instance<Component>): boolean {
			return this.data_.has(inst);
		}

		makeIterator(): InstanceIterator<Component> {
			return new InstanceSetIterator<Component>(this.data_.values());
		}

		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any) {
			this.data_.forEach(fn, thisObj || this);
		}
	}

} // ns sd.world
