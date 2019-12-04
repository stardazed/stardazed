/*
triangle-view - geometry triangle primitive array views
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { IndexBuffer, PrimitiveType, primitiveCountForElementCount } from "stardazed/index-buffer";
import { Geometry } from "stardazed/geometry";
import { TriangleView } from "./types";
import { IndexBufferTriangleView } from "./indexed-triangle-view";
import { DirectTriangleView } from "./direct-triangle-view";

export * from "./types";

export function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView {
	return new IndexBufferTriangleView(ib);
}

export function triangleViewSupportedOnGeometry(geom: Geometry) {
	return geom.subMeshes.every(sm => sm.type === PrimitiveType.Triangle);
}

/**
 * @expects triangleViewSupportedOnGeometry(geom)
 */
export function triangleViewForGeometry(geom: Geometry): TriangleView {
	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer);
	}

	const elementCount = geom.subMeshes.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
	return new DirectTriangleView(elementCount);
}

export function triangleViewSupportedOnSubMesh(geom: Geometry, subMeshIndex: number) {
	return geom.subMeshes[subMeshIndex] !== undefined &&
		geom.subMeshes[subMeshIndex].type === PrimitiveType.Triangle;
}

/**
 * @expects triangleViewSupportedOnSubMesh(geom, subMeshIndex)
 */
export function triangleViewForSubMesh(geom: Geometry, subMeshIndex: number): TriangleView {
	const subMesh = geom.subMeshes[subMeshIndex];
	const fromTriangle = primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.fromElement);
	const toTriangle = fromTriangle + primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.elementCount);

	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle);
	}
	return new DirectTriangleView(subMesh.elementCount, fromTriangle, toTriangle);
}