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
