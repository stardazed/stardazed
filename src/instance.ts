// instance - instances, manager interface and instance iterators
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export interface Instance<Component> extends Number {
		__C?: Component;
	}


	export interface InstanceIterator<Component> {
		current: Instance<Component>;

		next(): boolean;
		clone(): InstanceIterator<Component>;
	}


	export class InstanceRange<Component> {
		private data_ = new Set<Instance<Component>>();

		get count() { return this.data_.size; }

		add(inst: Instance<Component>) {
			this.data_.add(inst);
		}

		addRange(inst: Instance<Component>, count: number) {
			var q: Iterator<number>;
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

		has(inst: Instance<Component>): boolean {
			return this.data_.has(inst);
		}

		iterator(): InstanceIterator<Component> {
			var range = this;
			var iter = this.data_.values();

			return {
				current: 0,
				next() {
					var res = iter.next();
					this.current = res.value;
					return !res.done;
				},
				clone() {
					return range.iterator();
				}
			};
		}
	}


	export interface ComponentManager<Component> {
		count: number;

		valid(inst: Instance<Component>): boolean;
	}


} // ns sd.world
