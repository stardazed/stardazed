/**
 * geometry/builder - construct Geometry from normalized sources such as assets
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArray, NumArray } from "@stardazed/core";
import { Geometry, VertexAttribute } from "@stardazed/geometry";
export declare const enum VertexAttributeMapping {
    Undefined = 0,
    Vertex = 1,
    PolygonVertex = 2,
    Polygon = 3,
    SingleValue = 4
}
export interface VertexAttributeStream {
    name?: string;
    attr?: VertexAttribute;
    mapping: VertexAttributeMapping;
    includeInMesh: boolean;
    controlsGrouping?: boolean;
    values?: TypedArray;
    indexes?: TypedArray;
    elementCount?: number;
}
export interface VertexIndexMapping {
    add(from: number, to: number): void;
    mappedValues(forIndex: number): number[];
    readonly indexCount: number;
}
export declare class MeshBuilder {
    private vertexData_;
    private sourcePolygonIndex_;
    private streamCount_;
    private vertexCount_;
    private triangleCount_;
    private vertexMapping_;
    private indexMap_;
    private groupIndex_;
    private groupIndexStreams_;
    private groupIndexesRef_;
    private streams_;
    constructor(positions: Float32Array | Float64Array, positionIndexes: Uint32Array | null, streams: VertexAttributeStream[]);
    private streamIndexesForPVI;
    setGroup(newGroupIndex: number): void;
    private getVertexIndex;
    private addTriangle;
    addPolygon(polygonVertexIndexes: NumArray, vertexIndexes: NumArray): void;
    readonly curPolygonIndex: number;
    readonly indexMap: VertexIndexMapping;
    complete(): Geometry;
}
