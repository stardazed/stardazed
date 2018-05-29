/**
 * @stardazed/geometry-data - vertex and index buffer element access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Geometry, PrimitiveType, IndexBuffer, primitiveCountForElementCount } from "@stardazed/geometry";
import { TriangleView } from "./triangle-view";
import { IndexBufferTriangleView } from "./indexed-triangle-view";
import { DirectTriangleView } from "./direct-triangle-view";

export * from "./vertex-buffer-attribute-view";
export * from "./triangle-view";

export function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView {
	return new IndexBufferTriangleView(ib);
}

export function triangleViewForGeometry(geom: Geometry) {
	return new Promise<TriangleView>((resolve, reject) => {
		const allTrianglePrimitives = geom.subMeshes.every(sm => sm.type === PrimitiveType.Triangle);
		if (! allTrianglePrimitives) {
			return reject("Cannot create TriangleView as not all submeshes are of Triangle type");
		}

		if (geom.indexBuffer) {
			resolve(new IndexBufferTriangleView(geom.indexBuffer));
		}
		else {
			const elementCount = geom.subMeshes.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
			resolve(new DirectTriangleView(elementCount));
		}
	});
}

export function triangleViewForSubMesh(geom: Geometry, subMeshIndex: number) {
	return new Promise<TriangleView>((resolve, reject) => {
		const subMesh = geom.subMeshes[subMeshIndex];
		if (! subMesh) {
			return reject(`SubMesh index ${subMeshIndex} is out of range`);
		}
		if (subMesh.type !== PrimitiveType.Triangle) {
			return reject(`SubMesh at index ${subMeshIndex} does not use Triangle primitives`);
		}
		const fromTriangle = primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.fromElement);
		const toTriangle = fromTriangle + primitiveCountForElementCount(PrimitiveType.Triangle, subMesh.elementCount);

		if (geom.indexBuffer) {
			resolve(new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle));
		}
		else {
			resolve(new DirectTriangleView(subMesh.elementCount, fromTriangle, toTriangle));
		}
	});
}
