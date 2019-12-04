/*
geometry/types - type definitions and testers
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { PrimitiveType, IndexBuffer, isIndexBuffer } from "stardazed/index-buffer";
import { VertexBuffer, VertexBufferLayout } from "stardazed/vertex-buffer";

export interface GeometryLayout {
	readonly layouts: ReadonlyArray<VertexBufferLayout>;
}

export const isGeometryLayout = (vl: any): vl is GeometryLayout =>
	(typeof vl === "object") && vl !== null &&
	Array.isArray(vl.layouts);

export interface PrimitiveGroup {
	type: PrimitiveType;
	fromElement: number;
	elementCount: number;
}

export interface SubMesh extends PrimitiveGroup {
	/** arbitrary material index or reference; representation of Materials is external to Geometry */
	materialIx: number;
}

export interface Geometry {
	layout: GeometryLayout;
	vertexBuffers: VertexBuffer[];
	indexBuffer?: IndexBuffer;
	subMeshes: SubMesh[];
}

export const isGeometry = (geom: any): geom is Geometry =>
	(typeof geom === "object") && geom !== null &&
	isGeometryLayout(geom.layout) &&
	Array.isArray(geom.vertexBuffers) &&
	(geom.indexBuffer === undefined || isIndexBuffer(geom.indexBuffer)) &&
	Array.isArray(geom.subMeshes);
