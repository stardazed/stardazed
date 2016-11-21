// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { Float } from "core/numeric";

declare global {
	interface Math {
		sign(n: number): number;
	}
}

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


export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


export function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}


export function mix(a: number, b: number, ratio: number): number {
	return a * (1 - ratio) + b * ratio;
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



// --- Float vector types

export class Vec2 {
	static get zero() { return new Float32Array([0, 0]); }
	static get one() { return new Float32Array([1, 1]); }

	static elementCount = 2;
	static byteSize = Float.byteSize * Vec2.elementCount;
}

export class Vec3 {
	static get zero() { return new Float32Array([0, 0, 0]); }
	static get one() { return new Float32Array([1, 1, 1]); }

	static elementCount = 3;
	static byteSize = Float.byteSize * Vec3.elementCount;
}

export class Vec4 {
	static get zero() { return new Float32Array([0, 0, 0, 0]); }
	static get one() { return new Float32Array([1, 1, 1, 1]); }

	static elementCount = 4;
	static byteSize = Float.byteSize * Vec4.elementCount;
}

export class Quat {
	static get identity() { return new Float32Array([0, 0, 0, 1]); }

	static elementCount = 4;
	static byteSize = Float.byteSize * Quat.elementCount;
}

export class Mat3 {
	static get identity() {
		return new Float32Array([
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		]);
	}

	static elementCount = 9;
	static byteSize = Float.byteSize * Mat3.elementCount;
}

export class Mat4 {
	static get identity() {
		return new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static elementCount = 16;
	static byteSize = Float.byteSize * Mat4.elementCount;
}
