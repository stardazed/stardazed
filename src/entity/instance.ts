// entity/instance - instances, ranges, iterators and component interface
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export interface Instance<C> extends Number {
		readonly __C?: C;
	}


	export interface InstanceArrayView<C> {
		readonly length: number;
		[index: number]: Instance<C>;
	}


	export interface InstanceIterator<C> {
		readonly current: Instance<C>;
		next(): boolean;
	}


	export interface InstanceRange<C> {
		readonly empty: boolean;
		has(inst: Instance<C>): boolean;

		makeIterator(): InstanceIterator<C>;
		forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void;
	}


	export interface Component<C> {
		readonly count: number;

		valid(inst: Instance<C>): boolean;

		destroy(inst: Instance<C>): void;
		destroyRange(range: InstanceRange<C>): void;

		all(): InstanceRange<C>;
	}


	// -------


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


	// -------


	class InstanceArrayIterator<C> implements InstanceIterator<C> {
		private index_ = -1;

		constructor(private readonly array_: ReadonlyArray<Instance<C>>) {}

		get current() {
			return this.array_[this.index_];
		}

		next() {
			this.index_ += 1;
			return this.index_ < this.array_.length;
		}
	}


	export class InstanceArrayRange<C> implements InstanceRange<C> {
		private readonly data_: container.SortedArray<Instance<C>>;

		constructor(array: Instance<C>[]) {
			this.data_ = new container.SortedArray<Instance<C>>(array);
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


	// -------


	class InstanceSetIterator<C> implements InstanceIterator<C> {
		current: Instance<C> = 0;

		constructor(private es6Iter: Iterator<Instance<C>>) {}

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

} // ns sd.world
