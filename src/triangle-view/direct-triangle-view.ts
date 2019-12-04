/*
triangle-view/direct-triangle-view - immutable triangle view for non-indexed data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { PrimitiveType, elementCountForPrimitiveCount, primitiveCountForElementCount } from "stardazed/index-buffer";
import { TriangleProxy, TriangleView, Triangle, MutableTriangleView } from "./types";

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