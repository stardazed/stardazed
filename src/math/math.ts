// math/math - general purpose functions, equations, RNG, etc.
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../../typings/veclib.d.ts" />

namespace sd {
	export const vec2 = veclib.vec2;
	export const vec3 = veclib.vec3;
	export const vec4 = veclib.vec4;
	export const quat = veclib.quat;
	export const mat2 = veclib.mat2;
	export const mat2d = veclib.mat2d;
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

} // ns sd.math
