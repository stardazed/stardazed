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


/**
 * TriangleView for non-indexed meshes
 */
class DirectTriangleProxy implements TriangleProxy {
	index(index: number) {
		return this.baseIndex_ + index;
	}
	a() { return this.baseIndex_; }
	b() { return this.baseIndex_ + 1; }
	c() { return this.baseIndex_ + 2; }

	baseIndex_ = 0;
	setTriangleIndex(tri: number) { this.baseIndex_ = tri * 3; }
}

class DirectTriangleView implements TriangleView {
	readonly mutable = false;
	readonly count: number;

	constructor(elementCount: number, private fromTriangle_ = -1, private toTriangle_ = -1) {
		this.count = primitiveCountForElementCount(PrimitiveType.Triangle, elementCount);

		if (this.fromTriangle_ < 0) {
			this.fromTriangle_ = 0;
		}
		if (this.fromTriangle_ >= this.count) {
			this.fromTriangle_ = this.count - 1;
		}
		if ((this.toTriangle_ < 0) || (this.toTriangle_ > this.count)) {
			this.toTriangle_ = this.count;
		}
	}

	forEach(callback: (proxy: TriangleProxy) => void) {
		const primCount = this.toTriangle_ - this.fromTriangle_;
		const dtp = new DirectTriangleProxy();

		for (let tri = 0; tri < primCount; ++tri) {
			dtp.setTriangleIndex(tri + this.fromTriangle_);
			callback(dtp);
		}
	}

	refItem(triangleIndex: number): Triangle {
		const baseIndex = triangleIndex * 3;
		return [baseIndex, baseIndex + 1, baseIndex + 2];
	}

	subView(fromTriangle: number, triangleCount: number): TriangleView {
		return new DirectTriangleView(this.count * 3, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
	}
}
