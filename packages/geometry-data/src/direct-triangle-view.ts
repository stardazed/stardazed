/**
 * geometry-data/direct-triangle-view - immutable triangle view for non-indexed data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { primitiveCountForElementCount, PrimitiveType, elementCountForPrimitiveCount } from "@stardazed/geometry";
import { TriangleProxy, TriangleView, Triangle } from "./triangle-view";

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

export class DirectTriangleView implements TriangleView {
	readonly primitiveCount: number;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	constructor(elementCount: number, fromTriangle?: number, toTriangle?: number) {
		const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, elementCount);

		if (fromTriangle !== undefined) {
			if (fromTriangle < 0 || fromTriangle >= primitiveCount) {
				throw new Error("Invalid fromTriangle index");
			}
			this.fromTriangle_ = fromTriangle;
		}
		else {
			this.fromTriangle_ = 0;
		}

		if (toTriangle !== undefined) {
			if ((toTriangle < this.fromTriangle_) || (toTriangle > primitiveCount)) {
				throw new Error("Invalid toTriangle index");
			}
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

	refItem(triangleIndex: number): Triangle {
		const baseIndex = triangleIndex * 3;
		return [baseIndex, baseIndex + 1, baseIndex + 2];
	}

	subView(fromTriangle: number, triangleCount: number) {
		const elementCount = elementCountForPrimitiveCount(PrimitiveType.Triangle, this.primitiveCount);
		return new DirectTriangleView(elementCount, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
	}

	mutableView() {
		// direct triangle views are immutable
		return undefined;
	}
}
