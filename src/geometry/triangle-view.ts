/*
geometry/triangle-view - geometry triangle primitive array views
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { IndexBuffer, Geometry, TrianglePrimitive } from "stardazed/geometry";

export interface TriangleProxy {
	index(index: number): number;
	readonly a: number;
	readonly b: number;
	readonly c: number;
}

export interface TriangleView extends Iterable<TriangleProxy> {
	readonly length: number;

	setItem(triangle: number, indexes: NumArray): void;
	subView(fromTriangle: number, triangleCount: number): TriangleView;
}

/** @internal */
class DirectTriangleProxy implements TriangleProxy {
	baseElement: number;

	constructor(baseElement: number) {
		this.baseElement = baseElement;
	}

	index(index: number) {
		return this.baseElement + index;
	}
	get a() { return this.baseElement; }
	get b() { return this.baseElement + 1; }
	get c() { return this.baseElement + 2; }

}

/** @internal */
class DirectTriangleView implements TriangleView {
	readonly length: number;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	/**
	 * @expects fromTriangle === undefined || (fromTriangle >= 0 && fromTriangle < primitiveCount)
	 * @expects toTriangle === undefined || (toTriangle >= fromTriangle && toTriangle < primitiveCount)
	 */
	constructor(elementCount: number, fromTriangle?: number, toTriangle?: number) {
		const primitiveCount = TrianglePrimitive.countForElements(elementCount);
		this.fromTriangle_ = fromTriangle ?? 0;
		this.toTriangle_ = toTriangle ?? primitiveCount;
		this.length = this.toTriangle_ - this.fromTriangle_;
	}

	*[Symbol.iterator]() {
		const dtp = new DirectTriangleProxy(this.fromTriangle_ * 3);
		const primCount = this.length;

		for (let tri = 0; tri < primCount; ++tri) {
			yield dtp;
			dtp.baseElement += 3;
		}
	}

	/**
	 * @expects isPositiveInteger(_triangle)
	 * @expects _triangle >= 0 && _triangle < this.length
	 */
	setItem(_triangle: number, _indexes: NumArray) {
		/* cannot modify a direct view */
	}

	/**
	 * @expects isPositiveInteger(fromTriangle) && isPositiveInteger(triangleCount)
	 * @expects fromTriangle >= 0 && fromTriangle < this.primitiveCount
	 * @expects toTriangle <= primitiveCount
	 */
	subView(fromTriangle: number, toTriangle: number) {
		const elementCount = TrianglePrimitive.elementsForCount(this.length);
		return new DirectTriangleView(elementCount, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + toTriangle);
	}
}

/** @internal */
class IndexedTriangleProxy implements TriangleProxy {
	private rangeView_: TypedArray;
	baseElement: number;

	constructor(rangeView: TypedArray) {
		this.rangeView_ = rangeView;
		this.baseElement = 0;
	}

	index(index: number) { return this.rangeView_[this.baseElement + index]; }

	get a() { return this.rangeView_[this.baseElement]; }
	get b() { return this.rangeView_[this.baseElement + 1]; }
	get c() { return this.rangeView_[this.baseElement + 2]; }
}


/** @internal */
class IndexBufferTriangleView implements TriangleView {
	readonly length: number;
	private readonly indexBuffer_: IndexBuffer;
	private readonly rangeView_: TypedArray;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	/**
	 * @expects fromTriangle === undefined || (fromTriangle >= 0 && fromTriangle < primitiveCount)
	 * @expects toTriangle === undefined || (toTriangle >= fromTriangle && toTriangle < primitiveCount)
	 */
	constructor(indexBuffer: IndexBuffer, fromTriangle?: number, toTriangle?: number) {
		this.indexBuffer_ = indexBuffer;
		const primitiveCount = TrianglePrimitive.countForElements(indexBuffer.count);

		this.fromTriangle_ = fromTriangle ?? 0;
		this.toTriangle_ = toTriangle || primitiveCount;
		this.length = this.toTriangle_ - this.fromTriangle_;
		this.rangeView_ = this.indexBuffer_.arrayView(this.fromTriangle_ * 3, this.toTriangle_ * 3);
	}

	*[Symbol.iterator]() {
		const itp = new IndexedTriangleProxy(this.rangeView_);
		const primCount = this.length;

		for (let tix = 0; tix < primCount; ++tix) {
			yield itp;
			itp.baseElement += 3;
		}
	}

	/**
	 * @expects isPositiveInteger(triangle)
	 * @expects triangle >= 0 && triangle < this.length
	 */
	setItem(triangle: number, indexes: NumArray) {
		const r = this.rangeView_;
		const index = triangle * 3;
		r[index] = indexes[0];
		r[index + 1] = indexes[1];
		r[index + 2] = indexes[2];
	}

	/**
	 * @expects isPositiveInteger(fromTriangle) && isPositiveInteger(triangleCount)
	 * @expects fromTriangle >= 0 && fromTriangle < this.primitiveCount
	 * @expects fromTriangle + triangleCount < primitiveCount
	 */
	subView(fromTriangle: number, toTriangle: number) {
		return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + toTriangle);
	}
}

// ---- Creating Triangle Views

export function triangleViewForIndexBuffer(ib: IndexBuffer): TriangleView {
	return new IndexBufferTriangleView(ib);
}

export function triangleViewSupportedOnGeometry(geom: Geometry) {
	return geom.groups.every(sm => sm.type === TrianglePrimitive);
}

/**
 * @expects triangleViewSupportedOnGeometry(geom)
 */
export function triangleViewForGeometry(geom: Geometry): TriangleView {
	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer);
	}

	const elementCount = geom.groups.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
	return new DirectTriangleView(elementCount);
}

export function triangleViewSupportedOnGroup(geom: Geometry, groupIndex: number) {
	return geom.groups[groupIndex] !== undefined &&
		geom.groups[groupIndex].type === TrianglePrimitive;
}

/**
 * @expects triangleViewSupportedOnGroup(geom, groupIndex)
 */
export function triangleViewForGroup(geom: Geometry, groupIndex: number): TriangleView {
	const group = geom.groups[groupIndex];
	const fromTriangle = TrianglePrimitive.countForElements(group.fromElement);
	const toTriangle = fromTriangle + TrianglePrimitive.countForElements(group.elementCount);

	if (geom.indexBuffer) {
		return new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle);
	}
	return new DirectTriangleView(group.elementCount, fromTriangle, toTriangle);
}
