/**
 * container/arraybuffer - arrays of structs and structs of arrays (numeric data only)
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { NumericType, TypedArray } from "@stardazed/core";
export interface MABField {
    type: NumericType;
    count: number;
}
export declare const enum InvalidatePointers {
    No = 0,
    Yes = 1
}
export declare class FixedMultiArray {
    private capacity_;
    private readonly data_;
    private readonly basePointers_;
    constructor(capacity_: number, fields: MABField[]);
    readonly capacity: number;
    readonly data: ArrayBuffer;
    clear(): void;
    indexedFieldView(index: number): TypedArray;
}
export declare class MultiArrayBuffer {
    private fields_;
    private capacity_;
    private count_;
    private elementSumSize_;
    private data_;
    constructor(initialCapacity: number, fields: MABField[]);
    readonly capacity: number;
    readonly count: number;
    readonly backIndex: number;
    private fieldArrayView;
    reserve(newCapacity: number): InvalidatePointers;
    clear(): void;
    resize(newCount: number): InvalidatePointers;
    extend(): InvalidatePointers;
    indexedFieldView(index: number): TypedArray;
}
export declare class FixedStructArray {
    private readonly data_;
    private readonly fields_;
    private readonly structSize_;
    private readonly capacity_;
    constructor(capacity: number, fields: MABField[]);
    indexedStructBuffer(structIndex: number): ArrayBuffer;
    indexedStructFieldView(structIndex: number, fieldIndex: number): TypedArray;
    readonly structSizeBytes: number;
    readonly capacity: number;
    readonly data: ArrayBuffer;
    clear(): void;
}
