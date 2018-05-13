export declare function lowerBound<T>(array: ArrayLike<T>, value: T): number;
export declare function upperBound<T>(array: ArrayLike<T>, value: T): number;
export declare class SortedArray<T> {
    private compareFn_;
    private data_;
    constructor(source?: T[], compareFn_?: ((a: T, b: T) => number) | undefined);
    private sort();
    insert(value: T): void;
    insertMultiple(values: T[]): void;
    readonly array: ReadonlyArray<T>;
    readonly length: number;
}
