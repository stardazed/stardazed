// math/rect - rectangle primitive
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.math {

	export interface Rect {
		left: number;
		top: number;
		right: number;
		bottom: number;
	}

	export class RectStorage {
		private data_: container.FixedMultiArray;
		leftBase: TypedArray;
		topBase: TypedArray;
		rightBase: TypedArray;
		bottomBase: TypedArray;

		constructor(elementType: NumericType, capacity: number) {
			const fields: container.MABField[] = [
				{ type: elementType, count: 1 }, // left
				{ type: elementType, count: 1 }, // top
				{ type: elementType, count: 1 }, // right
				{ type: elementType, count: 1 }, // bottom
			];
			this.data_ = new container.FixedMultiArray(capacity, fields);
			this.leftBase = this.data_.indexedFieldView(0);
			this.topBase = this.data_.indexedFieldView(1);
			this.rightBase = this.data_.indexedFieldView(2);
			this.bottomBase = this.data_.indexedFieldView(3);
		}

		get capacity() { return this.data_.capacity; }
	}

	export class RectStorageProxy implements Rect {
		constructor(private storage_: RectStorage, public index: number) {}

		get left() { return this.storage_.leftBase[this.index]; }
		set left(newLeft: number) { this.storage_.leftBase[this.index] = newLeft; }
		get top() { return this.storage_.topBase[this.index]; }
		set top(newTop: number) { this.storage_.topBase[this.index] = newTop; }
		get right() { return this.storage_.rightBase[this.index]; }
		set right(newRight: number) { this.storage_.rightBase[this.index] = newRight; }
		get bottom() { return this.storage_.bottomBase[this.index]; }
		set bottom(newBottom: number) { this.storage_.bottomBase[this.index] = newBottom; }
	}

	export function setRectLTRB(r: Rect, left: number, top: number, right: number, bottom: number) {
		r.left = left;
		r.top = top;
		r.right = right;
		r.bottom = bottom;
	}

	export function setRectLTWH(r: Rect, left: number, top: number, width: number, height: number) {
		r.left = left;
		r.top = top;
		r.right = left + width;
		r.bottom = top + height;
	}

	// ------

	// FIXME: the following class is only used by an old test project, to be refactored
	export class RectEx implements Rect {
		topLeft: Float32Array;
		topRight: Float32Array;
		bottomLeft: Float32Array;
		bottomRight: Float32Array;

		constructor(public left: number, public top: number, public right: number, public bottom: number) {
			this.topLeft = vec2.fromValues(left, top);
			this.topRight = vec2.fromValues(right, top);
			this.bottomLeft = vec2.fromValues(left, bottom);
			this.bottomRight = vec2.fromValues(right, bottom);
		}

		intersectsLineSegment(ptA: Float3, ptB: Float3): boolean {
			const d = [ptB[0] - ptA[0], ptB[1] - ptA[1]];

			let tmin = 0;
			let tmax = 9999;

			for (let i = 0; i < 2; ++i) {
				if (Math.abs(d[i]) < 0.00001) {
					if (ptA[i] < this.topLeft[i] || ptA[i] > this.bottomRight[i]) {
						return false;
					}
				}
				else {
					const ood = 1 / d[i];
					let t1 = (this.topLeft[i] - ptA[i]) * ood;
					let t2 = (this.bottomRight[i] - ptA[i]) * ood;

					if (t1 > t2) {
						const tt = t2;
						t2 = t1;
						t1 = tt;
					}

					if (t1 > tmin) { tmin = t1; }
					if (t2 < tmax) { tmax = t2; }

					if (tmin > tmax) {
						return false;
					}
				}
			}

			return tmin < 1.0;
		}
	}

} // ns sd.math
