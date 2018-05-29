/**
 * geometry-data/triangle-view - (mutable) triangle index views
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Geometry, IndexBuffer, PrimitiveType, primitiveCountForElementCount, TypedIndexArray } from "@stardazed/geometry";

export interface Triangle {
	readonly [index: number]: number;
}

export interface MutableTriangle {
	[index: number]: number;
}

export interface TriangleProxy {
	index(index: number): number;
	a(): number;
	b(): number;
	c(): number;
}

export interface MutableTriangleProxy extends TriangleProxy {
	setIndex(index: number, newValue: number): void;
	setA(newValue: number): void;
	setB(newValue: number): void;
	setC(newValue: number): void;
}

export interface TriangleView {
	readonly count: number;
	readonly mutable: boolean;

	forEach(callback: (proxy: TriangleProxy) => void): void;
	forEachMutable?(callback: (proxy: MutableTriangleProxy) => void): void;

	refItem(triangleIndex: number): Triangle;
	refItemMutable?(triangleIndex: number): MutableTriangle;

	subView(fromTriangle: number, triangleCount: number): TriangleView;
}


export function makeTriangleViewForIndexBuffer(ib: IndexBuffer): TriangleView {
	return new IndexBufferTriangleView(ib);
}

export function makeTriangleViewForGeometry(geom: Geometry): TriangleView | undefined {
	const allTrianglePrimitives = geom.subMeshes.every(sm => sm.type === PrimitiveType.Triangle);
	if (! allTrianglePrimitives) {
		console.warn("triangleViewForMesh, cannot create TriangleView as not all submeshes are of Triangle type", geom);
		return undefined;
	}

	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer);
	}

	const elementCount = geom.subMeshes.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
	return new DirectTriangleView(elementCount);
}


export function makeTriangleViewForSubMesh(geom: Geometry, subMeshIndex: number): TriangleView | undefined {
	const subMesh = geom.subMeshes[subMeshIndex];
	if (! subMesh) {
		console.warn("triangleViewForSubMesh, invalid submesh index", geom, subMeshIndex);
		return undefined;
	}
	if (subMesh.type !== PrimitiveType.Triangle) {
		console.warn("triangleViewForSubMesh, incompatible submesh type", geom, subMeshIndex);
		return undefined;
	}
	const fromTriangle = (subMesh.fromElement / 3) | 0;
	const toTriangle = ((subMesh.elementCount / 3) | 0) + fromTriangle;

	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle);
	}
	return new DirectTriangleView(subMesh.elementCount, fromTriangle, toTriangle);
}
