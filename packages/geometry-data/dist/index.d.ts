import { Geometry, IndexBuffer } from "@stardazed/geometry";
import { TriangleView } from "./triangle-view";
export * from "./vertex-buffer-attribute-view";
export * from "./triangle-view";
export declare function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView;
export declare function triangleViewForGeometry(geom: Geometry): Promise<TriangleView>;
export declare function triangleViewForSubMesh(geom: Geometry, subMeshIndex: number): Promise<TriangleView>;
