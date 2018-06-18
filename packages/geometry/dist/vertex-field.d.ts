/**
 * geometry/vertexfield - vertex field types and properties
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 *
 * A single field in a vertex buffer
 * 3 properties: element type, count and normalization
 */
import { NumericType } from "@stardazed/core";
export declare const enum VertexField {
    Undefined = 0,
    UInt8 = 1,
    UInt8x2 = 2,
    UInt8x3 = 3,
    UInt8x4 = 4,
    SInt8 = 5,
    SInt8x2 = 6,
    SInt8x3 = 7,
    SInt8x4 = 8,
    UInt16 = 9,
    UInt16x2 = 10,
    UInt16x3 = 11,
    UInt16x4 = 12,
    SInt16 = 13,
    SInt16x2 = 14,
    SInt16x3 = 15,
    SInt16x4 = 16,
    UInt32 = 17,
    UInt32x2 = 18,
    UInt32x3 = 19,
    UInt32x4 = 20,
    SInt32 = 21,
    SInt32x2 = 22,
    SInt32x3 = 23,
    SInt32x4 = 24,
    Float = 25,
    Floatx2 = 26,
    Floatx3 = 27,
    Floatx4 = 28,
    Norm_UInt8 = 129,
    Norm_UInt8x2 = 130,
    Norm_UInt8x3 = 131,
    Norm_UInt8x4 = 132,
    Norm_SInt8 = 133,
    Norm_SInt8x2 = 134,
    Norm_SInt8x3 = 135,
    Norm_SInt8x4 = 136,
    Norm_UInt16 = 137,
    Norm_UInt16x2 = 138,
    Norm_UInt16x3 = 139,
    Norm_UInt16x4 = 140,
    Norm_SInt16 = 141,
    Norm_SInt16x2 = 142,
    Norm_SInt16x3 = 143,
    Norm_SInt16x4 = 144
}
export declare function vertexFieldElementCount(vf: VertexField): 1 | 2 | 3 | 4 | 0;
export declare function vertexFieldNumericType(vf: VertexField): NumericType | undefined;
export declare function vertexFieldElementSizeBytes(vf: VertexField): number;
export declare function vertexFieldSizeBytes(vf: VertexField): number;
export declare function vertexFieldIsNormalized(vf: VertexField): boolean;
