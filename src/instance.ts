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
		reset(): void;
	}


	export interface ComponentManager<Component> {
		count: number;

		valid(inst: Instance<Component>): boolean;
	}


} // ns sd.world
