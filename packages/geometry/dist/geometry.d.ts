/**
 * geometry/geometry - geometry compound type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { PrimitiveType } from "./index-primitive";
import { IndexBuffer } from "./index-buffer";
import { VertexAttributeRole, VertexAttribute } from "./vertex-attribute";
import { VertexBufferLayout, PositionedAttribute } from "./vertex-buffer-layout";
import { VertexBuffer } from "./vertex-buffer";
export interface VertexLayout {
    readonly layouts: ReadonlyArray<VertexBufferLayout>;
}
export declare const isVertexLayout: (vl: any) => vl is VertexLayout;
export declare function findAttributeOfRoleInLayout(vl: VertexLayout, role: VertexAttributeRole): PositionedAttribute | undefined;
export declare function makeStandardVertexLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): VertexLayout;
export interface PrimitiveGroup {
    type: PrimitiveType;
    fromElement: number;
    elementCount: number;
}
export interface SubMesh extends PrimitiveGroup {
    materialIx: number;
}
export interface GeometryAllocOptions {
    layout: VertexLayout;
    vertexCount: number;
    indexCount: number;
}
export interface Geometry {
    layout: VertexLayout;
    vertexBuffers: VertexBuffer[];
    indexBuffer?: IndexBuffer;
    subMeshes: SubMesh[];
}
export declare const isGeometry: (geom: any) => geom is Geometry;
export declare function allocateGeometry(options: GeometryAllocOptions): Geometry;
export declare function findAttributeOfRoleInGeometry(geom: Geometry, role: VertexAttributeRole): {
    vertexBuffer: VertexBuffer;
    attr: PositionedAttribute;
} | undefined;
