/**
 * geometry/index-primitive - index primitive traits
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export declare const enum PrimitiveType {
    None = 0,
    Point = 1,
    Line = 2,
    LineStrip = 3,
    Triangle = 4,
    TriangleStrip = 5
}
export declare function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
export declare function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
export declare function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number): number;
