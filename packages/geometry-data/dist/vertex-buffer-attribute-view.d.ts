/**
 * geometry-data/vertex-buffer-attribute-view - vertex attribute data access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArray, ArrayOfConstNumber } from "@stardazed/core";
import { PositionedAttribute, VertexBuffer } from "@stardazed/geometry";
export declare class VertexBufferAttributeView {
    private readonly vertexBuffer_;
    private readonly attr_;
    private readonly stride_;
    private readonly fieldNumType_;
    private readonly typedViewCtor_;
    private readonly buffer_;
    private readonly dataView_;
    readonly fromVertex: number;
    readonly toVertex: number;
    readonly vertexCount: number;
    readonly elementCount: number;
    constructor(vertexBuffer: VertexBuffer, attr: PositionedAttribute, fromVertex?: number, toVertex?: number);
    forEach(callback: (item: TypedArray) => void): void;
    copyValuesFrom(source: ArrayOfConstNumber, valueCount: number, offset?: number): void;
    refItem(index: number): TypedArray;
    copyItem(index: number): number[];
    subView(fromVertex: number, toVertex: number): VertexBufferAttributeView;
}
