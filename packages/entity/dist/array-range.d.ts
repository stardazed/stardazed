import { Instance, InstanceIterator, InstanceRange } from "./instance";
export declare class InstanceArrayRange<C> implements InstanceRange<C> {
    private readonly data_;
    constructor(array: Instance<C>[]);
    readonly empty: boolean;
    readonly front: Instance<C>;
    readonly back: Instance<C>;
    has(inst: Instance<C>): boolean;
    makeIterator(): InstanceIterator<C>;
    forEach(fn: (inst: Instance<C>) => void, thisObj?: any): void;
}
