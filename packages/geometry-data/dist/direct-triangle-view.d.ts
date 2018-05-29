import { TriangleProxy, TriangleView, Triangle } from "./triangle-view";
export declare class DirectTriangleView implements TriangleView {
    readonly primitiveCount: number;
    private readonly fromTriangle_;
    private readonly toTriangle_;
    constructor(elementCount: number, fromTriangle?: number, toTriangle?: number);
    forEach(callback: (proxy: TriangleProxy) => void): void;
    refItem(triangleIndex: number): Triangle;
    subView(fromTriangle: number, triangleCount: number): DirectTriangleView;
    mutableView(): Promise<never>;
}
