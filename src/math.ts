// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="numeric.ts" />

interface Math {
	sign(n: number): number;
}


interface quat {
	fromEuler(yaw: number, pitch: number, roll: number): Float32Array;
}

quat.fromEuler = function(yaw: number, pitch: number, roll: number) {
	var y = yaw * 0.5;
	var p = pitch * 0.5;
	var r = roll * 0.5;

	var siny = Math.sin(y), cosy = Math.cos(y);
	var sinp = Math.sin(p), cosp = Math.cos(p);
	var sinr = Math.sin(r), cosr = Math.cos(r);

	// evaluated form of 3 Quat multiplications (of yaw, pitch and roll)
	return <Float32Array>quat.normalize(new Float32Array(4), [
		sinr * cosp * cosy - cosr * sinp * siny,
		cosr * sinp * cosy + sinr * cosp * siny,
		cosr * cosp * siny - sinr * sinp * cosy,
		cosr * cosp * cosy + sinr * sinp * siny
	]);
}



namespace sd.math {

	export function intRandom(maximum: number): number {
		return (Math.random() * (maximum + 1)) | 0;
	}


	export function intRandomRange(minimum: number, maximum: number): number {
		var diff = (maximum - minimum) | 0;
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


	export function clamp(n: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, n));
	}


	export function clamp01(n: number): number {
		return Math.max(0.0, Math.min(1.0, n));
	}


	export function isPowerOf2(n: number) {
		return (n & (n - 1)) == 0;
	}


	// roundUpPowerOf2
	// return closest powerOf2 number that is >= n
	// e.g.: 15 -> 16; 16 -> 16; 17 -> 32

	export function roundUpPowerOf2(n: number) {
		if (n <= 0) return 1;
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

		intersectsLineSegment(ptA: ArrayOfNumber, ptB: ArrayOfNumber): boolean {
			var d = [ptB[0] - ptA[0], ptB[1] - ptA[1]];

			var tmin = 0;
			var tmax = 9999;

			for (var i = 0; i < 2; ++i) {
				if (Math.abs(d[i]) < 0.00001) {
					if (ptA[i] < this.topLeft[i] || ptA[i] > this.bottomRight[i])
						return false;
				}
				else {
					var ood = 1 / d[i];
					var t1 = (this.topLeft[i] - ptA[i]) * ood;
					var t2 = (this.bottomRight[i] - ptA[i]) * ood;

					if (t1 > t2) {
						var tt = t2;
						t2 = t1;
						t1 = tt;
					}

					if (t1 > tmin) tmin = t1;
					if (t2 < tmax) tmax = t2;

					if (tmin > tmax)
						return false;
				}
			}

			return tmin < 1.0;
		}
	}


	// --- Float vector types

	export interface VectorType {
		elementCount: number;
		byteSize: number;
	}

	export class Vec2 {
		static zero = new Float32Array([0, 0]);
		static one = new Float32Array([1, 1]);

		static elementCount = 2;
		static byteSize = Float.byteSize * Vec2.elementCount;
	}

	export class Vec3 {
		static zero = new Float32Array([0, 0, 0]);
		static one = new Float32Array([1, 1, 1]);
	
		static elementCount = 3;
		static byteSize = Float.byteSize * Vec3.elementCount;
	}

	export class Vec4 {
		static zero = new Float32Array([0, 0, 0, 0]);
		static one = new Float32Array([1, 1, 1, 1]);
	
		static elementCount = 4;
		static byteSize = Float.byteSize * Vec4.elementCount;
	}

	export class Quat {
		static identity = new Float32Array([0, 0, 0, 1]);

		static elementCount = 4;
		static byteSize = Float.byteSize * Quat.elementCount;
	}

	export class Mat3 {
		static identity = new Float32Array([
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		]);

		static elementCount = 9;
		static byteSize = Float.byteSize * Mat3.elementCount;
	}

	export class Mat4 {
		static identity = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0, 
			0, 0, 1, 0, 
			0, 0, 0, 1
		]);

		static elementCount = 16;
		static byteSize = Float.byteSize * Mat4.elementCount;
	}


	// ----

	export function reflectVec3(v3: ArrayOfNumber, normal: ArrayOfNumber) {
		return vec3.sub([], v3, vec3.scale([], normal, 2 * vec3.dot(v3, normal)));
	}

} // ns sd.math
