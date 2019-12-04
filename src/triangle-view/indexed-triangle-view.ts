/*
index-buffer/indexed-triangle-view - mutable triangle view for indexed data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { IndexBuffer, PrimitiveType, primitiveCountForElementCount, indexBufferRangeView } from "stardazed/index-buffer";
import { MutableTriangle, MutableTriangleProxy, TriangleView } from "./types";

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
