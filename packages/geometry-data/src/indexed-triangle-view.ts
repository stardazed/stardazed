/**
 * geometry-data/indexed-triangle-view - mutable triangle view for indexed data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedIndexArray, IndexBuffer, primitiveCountForElementCount, PrimitiveType } from "@stardazed/geometry";
import { MutableTriangleProxy, MutableTriangle, TriangleView } from "./triangle-view";

class IndexedTriangleProxy implements MutableTriangleProxy {
	private data_!: TypedIndexArray;

	setTriangleIndex(data: TypedIndexArray, triangleIndex: number) {
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

export class IndexBufferTriangleView implements TriangleView {
	readonly primitiveCount: number;
	private readonly fromTriangle_: number;
	private readonly toTriangle_: number;

	constructor(private indexBuffer_: IndexBuffer, fromTriangle?: number, toTriangle?: number) {
		const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, this.indexBuffer_.indexCount);

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

	forEach(callback: (proxy: MutableTriangleProxy) => void) {
		const primCount = this.toTriangle_ - this.fromTriangle_;
		const basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);
		const itp = new IndexedTriangleProxy();

		for (let tix = 0; tix < primCount; ++tix) {
			itp.setTriangleIndex(basePtr, tix);
			callback(itp);
		}
	}

	forEachMutable = this.forEach;

	refItem(triangleIndex: number): MutableTriangle {
		return this.indexBuffer_.typedBasePtr((triangleIndex + this.fromTriangle_) * 3, 3);
	}

	refItemMutable = this.refItem;

	subView(fromTriangle: number, toTriangle: number) {
		return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + toTriangle);
	}

	mutableView() {
		return Promise.resolve(this);
	}
}
