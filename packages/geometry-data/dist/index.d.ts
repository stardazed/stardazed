/**
 * @stardazed/geometry-data - vertex and index buffer element access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Geometry, IndexBuffer } from "@stardazed/geometry";
import { TriangleView } from "./triangle-view";
export * from "./vertex-buffer-attribute-view";
export * from "./triangle-view";
export declare function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView;
export declare function triangleViewForGeometry(geom: Geometry): Promise<TriangleView>;
export declare function triangleViewForSubMesh(geom: Geometry, subMeshIndex: number): Promise<TriangleView>;
