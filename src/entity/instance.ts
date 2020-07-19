/*
entity/instance - instances, ranges, iterators and component interface
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

export interface Instance<C> extends Number {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	readonly __C?: C;
}

export interface InstanceArrayView<C> {
	readonly length: number;
	[index: number]: Instance<C>;
}

export type InstanceIterator<C> = IterableIterator<Instance<C>>;

export interface InstanceRange<C> {
	includes(inst: Instance<C>): boolean;
	[Symbol.iterator](): InstanceIterator<C>;
}

export interface Component<C> {
	readonly count: number;
	destroyRange(range: InstanceRange<C>): void;
}


// -------


export class SingleInstanceRange<C> implements InstanceRange<C> {
	private readonly inst_: Instance<C>;

	constructor(inst: Instance<C>) {
		this.inst_ = inst;
	}

	includes(inst: Instance<C>) {
		return inst === this.inst_;
	}

	*[Symbol.iterator](): InstanceIterator<C> {
		yield this.inst_;
	}
}


export class InstanceLinearRange<C> implements InstanceRange<C> {
	private readonly first_: Instance<C>;
	private readonly last_: Instance<C>;

	constructor(first: Instance<C>, last: Instance<C>) {
		this.first_ = first;
		this.last_ = last;
	}

	includes(inst: Instance<C>): boolean {
		return inst >= this.first_ && inst <= this.last_;
	}

	*[Symbol.iterator](): InstanceIterator<C> {
		const first = this.first_;
		const last = this.last_;
		while (first < last) {
			yield first;
			(first as number) += 1;
		}

	}
}

export class InstanceArrayRange<C> implements InstanceRange<C> {
	private readonly data_: Instance<C>[];

	constructor(array: Instance<C>[]) {
		this.data_ = array.slice(0);
	}

	includes(inst: Instance<C>) {
		return this.data_.indexOf(inst) > -1;
	}

	*[Symbol.iterator](): InstanceIterator<C> {
		let index = 0;
		while (index < this.data_.length) {
			yield this.data_[index];
			index += 1;
		}
	}
}
