// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/gl-matrix.d.ts" />

function intRandom(maximum: number): number {
	return (Math.random() * (maximum + 1)) << 0;
}


function intRandomRange(minimum: number, maximum: number): number {
	var diff = (maximum - minimum) << 0;
	return minimum + intRandom(diff);
}


function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}


function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}


function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}


// roundUpPowerOf2
// return closest powerOf2 number that is >= n
// e.g.: 15 -> 16; 16 -> 16; 17 -> 32

function roundUpPowerOf2(n: number) {
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

function alignUp(val: number, alignmentPow2: number) {
	return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
}


// alignDown
// round val down to closest alignmentPow2

function alignDown(val: number, alignmentPow2: number) {
	return val & (~(alignmentPow2 - 1));
}



interface Math {
	sign(n: number): number;
}


interface vec3 {
	add3(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: ArrayOfNumber): ArrayOfNumber;
}

vec3.add3 = function(out, a, b, c) {
	out[0] = a[0] + b[0] + c[0];
	out[1] = a[1] + b[1] + c[1];
	out[2] = a[2] + b[2] + c[2];
	return out;
};


//  ___        _   
// | _ \___ __| |_ 
// |   / -_) _|  _|
// |_|_\___\__|\__|
//                 

class Rect {
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
		var d = vec2.create();
		vec2.subtract(d, ptB, ptA);

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

				tmin = Math.max(tmin, t1);
				tmax = Math.min(tmax, t2);

				if (tmin > tmax)
					return false;
			}
		}

		return tmin < 1.0;
	}
}


