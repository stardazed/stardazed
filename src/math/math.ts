// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="../../typings/veclib.d.ts" />
/// <reference path="../core/array.ts" />

namespace sd {
	export const vec2 = veclib.vec2;
	export const vec3 = veclib.vec3;
	export const vec4 = veclib.vec4;
	export const quat = veclib.quat;
	export const mat2 = veclib.mat2;
	export const mat3 = veclib.mat3;
	export const mat4 = veclib.mat4;
} // ns sd


namespace sd.math {

	// re-export some functions defined in veclib
	export const clamp = veclib.clamp;
	export const clamp01 = veclib.clamp01;
	export const mix = veclib.mix;


	// common functions
	export function intRandom(maximum: number): number {
		return (Math.random() * (maximum + 1)) | 0;
	}

	export function intRandomRange(minimum: number, maximum: number): number {
		const diff = (maximum - minimum) | 0;
		return minimum + intRandom(diff);
	}

	export function hertz(hz: number) {
		return 1 / hz;
	}

	export function deg2rad(deg: number): number {
		return deg * Math.PI / 180.0;
	}

	export function rad2deg(rad: number): number {
		return rad * 180.0 / Math.PI;
	}

	export function isPowerOf2(n: number) {
		return (n & (n - 1)) == 0;
	}


	// roundUpPowerOf2
	// return closest powerOf2 number that is >= n
	// e.g.: 15 -> 16; 16 -> 16; 17 -> 32

	export function roundUpPowerOf2(n: number) {
		if (n <= 0) { return 1; }
		n = (n | 0) - 1;
		n |= n >> 1;
		n |= n >> 2;
		n |= n >> 4;
		n |= n >> 8;
		n |= n >> 16;
		return n + 1;
	}


	// alignUp
	// round val up to closest alignmentPow2

	export function alignUp(val: number, alignmentPow2: number) {
		return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
	}


	// alignDown
	// round val down to closest alignmentPow2

	export function alignDown(val: number, alignmentPow2: number) {
		return val & (~(alignmentPow2 - 1));
	}


	//  ___        _   
	// | _ \___ __| |_ 
	// |   / -_) _|  _|
	// |_|_\___\__|\__|
	//                 

	export class Rect {
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

} // ns sd.math
