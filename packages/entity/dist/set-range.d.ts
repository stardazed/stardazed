/**
 * entity/set-range - instance range as a set, most flexible but also slowest
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Instance, InstanceIterator, InstanceRange } from "./instance";
export declare class InstanceSet<C> implements InstanceRange<C> {
    private data_;
    readonly count: number;
    readonly empty: boolean;
    add(inst: Instance<C>): void;
    addRange(inst: Instance<C>, count: number): void;
    addArray(arr: ArrayLike<Instance<C>>): void;
    remove(inst: Instance<C>): void;
    removeRange(inst: Instance<C>, count: number): void;
    removeArray(arr: ArrayLike<Instance<C>>): void;
    clear(): void;
    has(inst: Instance<C>): boolean;
    makeIterator(): InstanceIterator<C>;
    forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void;
}
