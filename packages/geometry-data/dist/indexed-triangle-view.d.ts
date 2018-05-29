/**
 * geometry-data/indexed-triangle-view - mutable triangle view for indexed data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { IndexBuffer } from "@stardazed/geometry";
import { MutableTriangleProxy, MutableTriangle, TriangleView } from "./triangle-view";
export declare class IndexBufferTriangleView implements TriangleView {
    private indexBuffer_;
    readonly primitiveCount: number;
    private readonly fromTriangle_;
    private readonly toTriangle_;
    constructor(indexBuffer_: IndexBuffer, fromTriangle?: number, toTriangle?: number);
    forEach(callback: (proxy: MutableTriangleProxy) => void): void;
    forEachMutable: (callback: (proxy: MutableTriangleProxy) => void) => void;
    refItem(triangleIndex: number): MutableTriangle;
    refItemMutable: (triangleIndex: number) => MutableTriangle;
    subView(fromTriangle: number, toTriangle: number): IndexBufferTriangleView;
    mutableView(): this;
}
