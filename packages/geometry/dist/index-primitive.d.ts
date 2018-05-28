export declare const enum PrimitiveType {
    None = 0,
    Point = 1,
    Line = 2,
    LineStrip = 3,
    Triangle = 4,
    TriangleStrip = 5,
}
export declare function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
export declare function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
export declare function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number): number;
