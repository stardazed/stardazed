/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export declare class VertexBuffer {
    readonly storage: Uint8ClampedArray;
    readonly vertexCount: number;
    readonly stride: number;
    readonly sizeBytes: number;
    constructor(vertexCount: number, stride: number, usingStorage?: Uint8ClampedArray);
}
