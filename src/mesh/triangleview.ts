// meshdata/triangleview - (mutable) triangle index views
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

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


	// ---- TriangleView for non-indexed meshes

	class DirectTriangleProxy implements meshdata.TriangleProxy {
		index(index: number) {
			return this.baseIndex_ + index;
		}
		a() { return this.baseIndex_; }
		b() { return this.baseIndex_ + 1; }
		c() { return this.baseIndex_ + 2; }

		baseIndex_: number = 0; // tslint:disable-line
		setTriangleIndex(tri: number) { this.baseIndex_ = tri * 3; }
	}

	class DirectTriangleView implements TriangleView {
		readonly mutable = false;
		readonly count: number = 0; // tslint:disable-line

		constructor(vertexCount: number, private fromTriangle_ = -1, private toTriangle_ = -1) {
			this.count = primitiveCountForElementCount(PrimitiveType.Triangle, vertexCount);

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


	// ---- TriangleView for indexed meshes

	class IndexedTriangleProxy implements MutableTriangleProxy {
		private data_: TypedIndexArray;

		constructor(data: TypedIndexArray, triangleIndex: number) {
			this.data_ = data.subarray(triangleIndex * 3, (triangleIndex + 1) * 3);
		}

		index(index: number) { return this.data_[index]; }
		a() { return this.data_[0]; }
		b() { return this.data_[1]; }
		c() { return this.data_[2]; }

		setIndex(index: number, newValue: number) {
			this.data_[index] = newValue;
		}
		setA(newValue: number) { this.data_[0] = newValue; }
		setB(newValue: number) { this.data_[1] = newValue; }
		setC(newValue: number) { this.data_[2] = newValue; }
	}

	export class IndexBufferTriangleView implements TriangleView {
		constructor(private indexBuffer_: IndexBuffer, private fromTriangle_ = -1, private toTriangle_ = -1) {
			// clamp range to available primitives, default to all triangles
			const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, this.indexBuffer_.indexCount);

			if (this.fromTriangle_ < 0) {
				this.fromTriangle_ = 0;
			}
			if (this.fromTriangle_ >= primitiveCount) {
				this.fromTriangle_ = primitiveCount - 1;
			}
			if ((this.toTriangle_ < 0) || (this.toTriangle_ > primitiveCount)) {
				this.toTriangle_ = primitiveCount;
			}
		}

		forEach(callback: (proxy: TriangleProxy) => void) {
			const primCount = this.toTriangle_ - this.fromTriangle_;
			const basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);

			for (let tix = 0; tix < primCount; ++tix) {
				callback(new IndexedTriangleProxy(basePtr, tix));
			}
		}

		refItem(triangleIndex: number) {
			return this.indexBuffer_.typedBasePtr((triangleIndex + this.fromTriangle_) * 3, 3);
		}

		subView(fromTriangle: number, triangleCount: number) {
			return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
		}

		get count() {
			return this.toTriangle_ - this.fromTriangle_;
		}

		get mutable() { return false; }
	}

} // ns sd.meshdata
