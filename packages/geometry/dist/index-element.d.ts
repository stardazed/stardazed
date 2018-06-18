/**
 * geometry/index-element vertex index element
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArrayConstructor } from "@stardazed/core";
export declare const enum IndexElementType {
    None = 0,
    UInt8 = 1,
    UInt16 = 2,
    UInt32 = 3
}
export declare const indexElementTypeSizeBytes: {
    readonly [k: number]: number;
};
export declare function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType;
export declare function bytesRequiredForIndexCount(elementType: IndexElementType, indexCount: number): number;
export declare type TypedIndexArray = Uint32Array | Uint16Array | Uint8ClampedArray;
export declare function typedIndexArrayClassForIndexElement(elementType: IndexElementType): TypedArrayConstructor;
