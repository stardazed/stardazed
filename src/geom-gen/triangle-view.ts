/*
triangle-view - geometry triangle primitive array views
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { IndexBuffer, PrimitiveType, Geometry, primitiveCountForElementCount, elementCountForPrimitiveCount, indexBufferRangeView } from "stardazed/geometry";

export interface Triangle {
	readonly [index: number]: number;
}

export interface MutableTriangle {
	[index: number]: number;
}

export interface TriangleProxy {
	index(index: number): number;
	readonly a: number;
	readonly b: number;
	readonly c: number;
}

export interface MutableTriangleProxy extends TriangleProxy {
	setIndex(index: number, newValue: number): void;
	a: number;
	b: number;
	c: number;
}

export interface TriangleView {
	readonly primitiveCount: number;

	forEach(callback: (proxy: TriangleProxy) => void): void;
	refItem(triangleIndex: number): Triangle;

	subView(fromTriangle: number, triangleCount: number): TriangleView;
	mutableView(): MutableTriangleView;
}

export interface MutableTriangleView extends TriangleView {
	forEachMutable(callback: (proxy: MutableTriangleProxy) => void): void;
	refItemMutable(triangleIndex: number): MutableTriangle;

	subView(fromTriangle: number, triangleCount: number): MutableTriangleView;
}

/** @internal */
class DirectTriangleProxy implements TriangleProxy {
	index(index: number) {
		return this.baseIndex_ + index;
	}
	get a() { return this.baseIndex_; }
	get b() { return this.baseIndex_ + 1; }
	get c() { return this.baseIndex_ + 2; }

	baseIndex_ = 0;
	setTriangleIndex(tri: number) { this.baseIndex_ = tri * 3; }
}

/** @internal */
export class DirectTriangleView implements TriangleView {
	readonly primitiveCount: number;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	/**
	 * @expects fromTriangle === undefined || (fromTriangle >= 0 && fromTriangle < primitiveCount)
	 * @expects toTriangle === undefined || (toTriangle >= fromTriangle && toTriangle < primitiveCount)
	 */
	constructor(elementCount: number, fromTriangle?: number, toTriangle?: number) {
		const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, elementCount);

		if (fromTriangle !== undefined) {
			this.fromTriangle_ = fromTriangle;
		}
		else {
			this.fromTriangle_ = 0;
		}

		if (toTriangle !== undefined) {
			this.toTriangle_ = toTriangle;
		}
		else {
			this.toTriangle_ = primitiveCount;
		}

		// effective count covered by this view
		this.primitiveCount = this.toTriangle_ - this.fromTriangle_;
	}

	forEach(callback: (proxy: TriangleProxy) => void) {
		const primCount = this.toTriangle_ - this.fromTriangle_;
		const dtp = new DirectTriangleProxy();

		for (let tri = 0; tri < primCount; ++tri) {
			dtp.setTriangleIndex(tri + this.fromTriangle_);
			callback(dtp);
		}
	}

	/**
	 * @expects isPositiveInteger(triangleIndex)
	 * @expects triangleIndex >= 0 && triangleIndex < this.primitiveCount
	 */
	refItem(triangleIndex: number): Triangle {
		const baseIndex = (triangleIndex + this.fromTriangle_) * 3;
		return [baseIndex, baseIndex + 1, baseIndex + 2];
	}

	/**
	 * @expects isPositiveInteger(fromTriangle) && isPositiveInteger(triangleCount)
	 * @expects fromTriangle >= 0 && fromTriangle < this.primitiveCount
	 * @expects fromTriangle + triangleCount < primitiveCount
	 */
	subView(fromTriangle: number, triangleCount: number) {
		const elementCount = elementCountForPrimitiveCount(PrimitiveType.Triangle, this.primitiveCount);
		return new DirectTriangleView(elementCount, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
	}

	/**
	 * Direct triangle views are synthesised and thus immutable
	 * Calling this method on a direct triangle view is meaningless.
	 */
	mutableView(): MutableTriangleView {
		throw new Error("This TriangleView is immutable");
	}
}

/** @internal */
class IndexedTriangleProxy implements MutableTriangleProxy {
	private data_!: TypedArray;

	setTriangleIndex(data: TypedArray, triangleIndex: number) {
		this.data_ = data.subarray(triangleIndex * 3, (triangleIndex + 1) * 3);
	}

	index(index: number) { return this.data_[index]; }
	setIndex(index: number, newValue: number) {
		this.data_[index] = newValue;
	}

	get a() { return this.data_[0]; }
	set a(newValue: number) { this.data_[0] = newValue; }
	get b() { return this.data_[1]; }
	set b(newValue: number) { this.data_[1] = newValue; }
	get c() { return this.data_[2]; }
	set c(newValue: number) { this.data_[2] = newValue; }
}


/** @internal */
export class IndexBufferTriangleView implements TriangleView {
	readonly primitiveCount: number;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	/**
	 * @expects fromTriangle === undefined || (fromTriangle >= 0 && fromTriangle < primitiveCount)
	 * @expects toTriangle === undefined || (toTriangle >= fromTriangle && toTriangle < primitiveCount)
	 */
	constructor(private indexBuffer_: IndexBuffer, fromTriangle?: number, toTriangle?: number) {
		const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, this.indexBuffer_.indexCount);

		if (fromTriangle !== undefined) {
			this.fromTriangle_ = fromTriangle;
		}
		else {
			this.fromTriangle_ = 0;
		}

		if (toTriangle !== undefined) {
			this.toTriangle_ = toTriangle;
		}
		else {
			this.toTriangle_ = primitiveCount;
		}

		// effective count covered by this view
		this.primitiveCount = this.toTriangle_ - this.fromTriangle_;
	}

	forEach(callback: (proxy: MutableTriangleProxy) => void) {
		const primCount = this.toTriangle_ - this.fromTriangle_;
		const rangeView = indexBufferRangeView(this.indexBuffer_, this.fromTriangle_ * 3, primCount * 3);
		const itp = new IndexedTriangleProxy();

		for (let tix = 0; tix < primCount; ++tix) {
			itp.setTriangleIndex(rangeView, tix);
			callback(itp);
		}
	}

	forEachMutable = this.forEach;

	/**
	 * @expects isPositiveInteger(triangleIndex)
	 * @expects triangleIndex >= 0 && triangleIndex < this.primitiveCount
	 */
	refItem(triangleIndex: number): MutableTriangle {
		return indexBufferRangeView(this.indexBuffer_, (triangleIndex + this.fromTriangle_) * 3, 3);
	}

	refItemMutable = this.refItem;

	/**
	 * @expects isPositiveInteger(fromTriangle) && isPositiveInteger(triangleCount)
	 * @expects fromTriangle >= 0 && fromTriangle < this.primitiveCount
	 * @expects fromTriangle + triangleCount < primitiveCount
	 */
	subView(fromTriangle: number, toTriangle: number) {
		return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + toTriangle);
	}

	mutableView() {
		return this;
	}
}

// ---- Creating Triangle Views

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
