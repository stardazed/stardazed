/**
 * geometry/index-buffer - index primitive storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { IndexElementType, TypedIndexArray } from "./index-element";
export declare class IndexBuffer {
    readonly indexElementType: IndexElementType;
    readonly indexCount: number;
    readonly storage: Uint8ClampedArray;
    private indexElementSizeBytes_;
    constructor(elementType: IndexElementType, indexCount: number, usingStorage?: Uint8ClampedArray);
    readonly sizeBytes: number;
    /**
     *  Direct (sub-)array access
     */
    typedBasePtr(baseIndexNr: number, indexCount: number): TypedIndexArray;
}
