/**
 * geometry-gen/calc-derived - calculate normals and tangents
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Geometry, VertexAttributeRole, VertexBufferLayout, VertexBuffer } from "@stardazed/geometry";
import { VertexBufferAttributeView, TriangleView } from "@stardazed/geometry-data";
export declare function genVertexNormals(geom: Geometry): Promise<void>;
export declare function genVertexTangents(geom: Geometry): Promise<void>;
export declare function calcVertexNormals(layout: VertexBufferLayout, vertexBuffer: VertexBuffer, triView: TriangleView): void;
export declare function calcVertexNormalsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, triView: TriangleView): void;
export declare function calcVertexTangents(layout: VertexBufferLayout, vertexBuffer: VertexBuffer, triView: TriangleView, uvSet?: VertexAttributeRole): void;
export declare function calcVertexTangentsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, uvView: VertexBufferAttributeView, tanView: VertexBufferAttributeView, triView: TriangleView): void;
