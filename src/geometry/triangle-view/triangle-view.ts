/**
 * geometry/triangle-view - geometry triangle array views
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

export function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView {
	return new IndexBufferTriangleView(ib);
}

/**
 * @expects geom.subMeshes.every(sm => sm.type === PrimitiveType.Triangle)
 */
export function triangleViewForGeometry(geom: Geometry) {
	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer);
	}

	const elementCount = geom.subMeshes.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
	return new DirectTriangleView(elementCount);
}

/**
 * @expects geom.subMeshes[subMeshIndex] !== undefined
 * @expects geom.subMeshes[subMeshIndex].type === PrimitiveType.Triangle
 */
export function triangleViewForSubMesh(geom: Geometry, subMeshIndex: number) {
	const subMesh = geom.subMeshes[subMeshIndex];
	const fromTriangle = primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.fromElement);
	const toTriangle = fromTriangle + primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.elementCount);

	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle);
	}
	return new DirectTriangleView(subMesh.elementCount, fromTriangle, toTriangle);
}

} // ns sd
