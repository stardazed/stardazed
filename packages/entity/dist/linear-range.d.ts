/**
 * entity/linear-range - simplest instance range
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Instance, InstanceIterator, InstanceRange } from "./instance";
export declare class InstanceLinearRange<C> implements InstanceRange<C> {
    private first_;
    private last_;
    constructor(first_: Instance<C>, last_: Instance<C>);
    readonly empty: boolean;
    readonly front: Instance<C>;
    readonly back: Instance<C>;
    has(inst: Instance<C>): boolean;
    makeIterator(): InstanceIterator<C>;
    forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void;
}
