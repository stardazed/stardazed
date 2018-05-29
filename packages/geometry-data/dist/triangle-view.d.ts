/**
 * geometry-data/triangle-view - (mutable) triangle index views
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export interface Triangle {
    readonly [index: number]: number;
}
export interface MutableTriangle {
    [index: number]: number;
}
export interface TriangleProxy {
    index(index: number): number;
    readonly a: number;
    readonly b: number;
    readonly c: number;
}
export interface MutableTriangleProxy extends TriangleProxy {
    setIndex(index: number, newValue: number): void;
    a: number;
    b: number;
    c: number;
}
export interface TriangleView {
    readonly primitiveCount: number;
    forEach(callback: (proxy: TriangleProxy) => void): void;
    refItem(triangleIndex: number): Triangle;
    subView(fromTriangle: number, triangleCount: number): TriangleView;
    mutableView(): Promise<MutableTriangleView>;
}
export interface MutableTriangleView extends TriangleView {
    forEachMutable(callback: (proxy: MutableTriangleProxy) => void): void;
    refItemMutable(triangleIndex: number): MutableTriangle;
    subView(fromTriangle: number, triangleCount: number): MutableTriangleView;
}
