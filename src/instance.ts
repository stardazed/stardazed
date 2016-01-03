// instance - instances, ranges, iterators and manager interface
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export interface Instance<Component> extends Number {
		__C?: Component;
	}


	export interface InstanceRange<Component> {
		empty: boolean;
		has(inst: Instance<Component>): boolean;

		makeIterator(): InstanceIterator<Component>;
		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
	}


	export interface InstanceIterator<Component> {
		current: Instance<Component>;
		next(): boolean;
	}


	class InstanceSetIterator<Component> implements InstanceIterator<Component> {
		current: Instance<Component> = 0;

		constructor(private es6Iter: Iterator<Instance<Component>>) {}

		next() {
			var res = this.es6Iter.next();
			this.current = res.value;
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
			var index = <number>inst;
			var upto = index + count;
			while (index < upto) {
				this.data_.add(index);
				++index;
			}
		}

		addArray(seq: ArrayLike<Instance<Component>>) {
			for (var ix = 0, end = seq.length; ix < end; ++ix) {
				this.data_.add(seq[ix]);
			}
		}

		remove(inst: Instance<Component>) {
			this.data_.delete(inst);
		}

		removeRange(inst: Instance<Component>, count: number) {
			var index = <number>inst;
			var upto = index + count;
			while (index < upto) {
				this.data_.delete(index);
				++index;
			}
		}

		removeArray(seq: ArrayLike<Instance<Component>>) {
			for (var ix = 0, end = seq.length; ix < end; ++ix) {
				this.data_.delete(seq[ix]);
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


	export class InstanceLinearRange<Component> implements InstanceRange<Component> {
		constructor(private first: Instance<Component>, private last: Instance<Component>) {
			// invalid ranges are just treated as empty
			// valid ranges require first >= 1 and last >= first
		}

		get empty() {
			return this.first == 0 || this.last < this.first;
		}

		has(inst: Instance<Component>): boolean {
			var index = <number>inst;
			return index >= <number>this.first && index <= <number>this.last;
		}

		makeIterator(): InstanceIterator<Component> {
			var end = this.last;

			return {
				current: <Instance<Component>>(<number>this.first - 1),
				next: function() {
					this.current = <Instance<Component>>(<number>this.current + 1);
					return this.current > 0 && this.current <= end;
				}
			};
		}

		forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void {
			var index = <number>this.first;
			var end = <number>this.last;

			if (index > 0) {
				while (index <= end) {
					fn(<Instance<Component>>index);
					++index;
				}
			}
		}
	}


	export interface ComponentManager<Component> {
		count: number;

		valid(inst: Instance<Component>): boolean;

		all(): InstanceRange<Component>;
	}

} // ns sd.world
