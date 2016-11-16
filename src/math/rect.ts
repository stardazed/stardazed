// rect - rectangle primitive
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

export default class Rect {
	topLeft: Float32Array;
	topRight: Float32Array;
	bottomLeft: Float32Array;
	bottomRight: Float32Array;

	constructor(public left: number, public top: number, public right: number, public bottom: number) {
		this.topLeft = vec2.fromValues(left, top);
		this.topRight = vec2.fromValues(right, top);
		this.bottomLeft = vec2.fromValues(left, bottom);
		this.bottomRight = vec2.fromValues(right, bottom);

		// console.info("FRAME", this.topLeft, this.topRight, this.bottomLeft, this.bottomRight);
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
