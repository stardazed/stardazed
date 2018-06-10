/**
 * container/sortedarray - always-sorted array type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { CompareFn } from "./sort";
export declare class SortedArray<T> {
    private data_;
    private compareFn_;
    constructor(source?: T[], compareFn?: CompareFn<T>);
    private sort;
    insert(value: T): void;
    insertMultiple(values: T[]): void;
    readonly array: ReadonlyArray<T>;
    readonly length: number;
}
