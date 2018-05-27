/**
 * entity/instance - instances, ranges, iterators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

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
