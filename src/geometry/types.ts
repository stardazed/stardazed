/**
 * geometry/types - building blocks of geometry objects
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

export interface PrimitiveGroup {
	type: PrimitiveType;
	fromElement: number;
	elementCount: number;
}

export interface SubMesh extends PrimitiveGroup {
	materialIx: number; // arbitrary material index or reference; representation of Materials is external to Geometry
}

export const enum BufferAlignment {
	SubBuffer = 8
}

export interface GeometryAllocOptions {
	layout: GeometryLayout;
	vertexCount: number;
	indexCount: number;
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
	isIndexBuffer(geom.indexBuffer) &&
	Array.isArray(geom.subMeshes);

export function findAttributeOfRoleInGeometry(geom: Geometry, role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | undefined {
	const pa = findAttributeOfRoleInLayout(geom.layout, role);
	const avb = pa ? geom.vertexBuffers[pa.bufferIndex] : undefined;

	if (pa && avb) {
		return { vertexBuffer: avb, attr: pa.attr };
	}
	return undefined;
}

} // ns sd
