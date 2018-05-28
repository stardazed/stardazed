export declare class VertexBuffer {
    readonly storage: Uint8ClampedArray;
    readonly vertexCount: number;
    readonly stride: number;
    readonly sizeBytes: number;
    constructor(vertexCount: number, stride: number, usingStorage?: Uint8ClampedArray);
}
