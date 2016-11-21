/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

import { EPSILON } from "math/util";
import { clamp as clampf, clamp01 as clamp01f, mix as mixf } from "math/util";
import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN, VecArrayIterationOptions, VecArrayIterationFunction } from "math/primarray";

namespace vec4 {

export const ELEMENT_COUNT = 4;

export function create() {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	return out;
}

export const zero = create();

export function one() {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = 1;
	out[1] = 1;
	out[2] = 1;
	out[3] = 1;
	return out;
}

export function clone(a: ACN) {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
}

export function fromValues(x: number, y: number, z: number, w: number) {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
}

export function copy(out: number[], a: ACN): number[];
export function copy<T extends AN>(out: T, a: ACN): T;
export function copy(out: AN, a: ACN) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
}

export function set(out: number[], x: number, y: number, z: number, w: number): number[];
export function set<T extends AN>(out: T, x: number, y: number, z: number, w: number): T;
export function set(out: AN, x: number, y: number, z: number, w: number) {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
}

export function add(out: number[], a: ACN, b: ACN): number[];
export function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export function add(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	return out;
}

export function subtract(out: number[], a: ACN, b: ACN): number[];
export function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export function subtract(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	return out;
}

export const sub = subtract;

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	out[3] = a[3] * b[3];
	return out;
}

export const mul = multiply;

export function divide(out: number[], a: ACN, b: ACN): number[];
export function divide<T extends AN>(out: T, a: ACN, b: ACN): T;
export function divide(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	out[3] = a[3] / b[3];
	return out;
}

export const div = divide;

export function ceil(out: number[], a: ACN): number[];
export function ceil<T extends AN>(out: T, a: ACN): T;
export function ceil(out: AN, a: ACN) {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	out[2] = Math.ceil(a[2]);
	out[3] = Math.ceil(a[3]);
	return out;
}

export function floor(out: number[], a: ACN): number[];
export function floor<T extends AN>(out: T, a: ACN): T;
export function floor(out: AN, a: ACN) {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	out[2] = Math.floor(a[2]);
	out[3] = Math.floor(a[3]);
	return out;
}

export function min(out: number[], a: ACN, b: ACN): number[];
export function min<T extends AN>(out: T, a: ACN, b: ACN): T;
export function min(out: AN, a: ACN, b: ACN) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	out[3] = Math.min(a[3], b[3]);
	return out;
}

export function max(out: number[], a: ACN, b: ACN): number[];
export function max<T extends AN>(out: T, a: ACN, b: ACN): T;
export function max(out: AN, a: ACN, b: ACN) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	out[3] = Math.max(a[3], b[3]);
	return out;
}

export function round(out: number[], a: ACN): number[];
export function round<T extends AN>(out: T, a: ACN): T;
export function round(out: AN, a: ACN) {
	out[0] = Math.round(a[0]);
	out[1] = Math.round(a[1]);
	out[2] = Math.round(a[2]);
	out[3] = Math.round(a[3]);
	return out;
}

export function scale(out: number[], a: ACN, s: number): number[];
export function scale<T extends AN>(out: T, a: ACN, s: number): T;
export function scale(out: AN, a: ACN, s: number) {
	out[0] = a[0] * s;
	out[1] = a[1] * s;
	out[2] = a[2] * s;
	out[3] = a[3] * s;
	return out;
}

export function scaleAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export function scaleAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export function scaleAndAdd(out: AN, a: ACN, b: ACN, scale: number) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	out[3] = a[3] + (b[3] * scale);
	return out;
}

export function distance(a: ACN, b: ACN) {
	const x = b[0] - a[0],
		y = b[1] - a[1],
		z = b[2] - a[2],
		w = b[3] - a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
}

export const dist = distance;

export function squaredDistance(a: ACN, b: ACN) {
	const x = b[0] - a[0],
		y = b[1] - a[1],
		z = b[2] - a[2],
		w = b[3] - a[3];
	return x * x + y * y + z * z + w * w;
}

export const sqrDist = squaredDistance;

export function length(a: ACN) {
	const x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
}

export const len = length;

export function squaredLength(a: ACN) {
	const x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];
	return x * x + y * y + z * z + w * w;
}

export const sqrLen = squaredLength;

export function negate(out: number[], a: ACN): number[];
export function negate<T extends AN>(out: T, a: ACN): T;
export function negate(out: AN, a: ACN) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = -a[3];
	return out;
}

export function inverse(out: number[], a: ACN): number[];
export function inverse<T extends AN>(out: T, a: ACN): T;
export function inverse(out: AN, a: ACN) {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	out[3] = 1.0 / a[3];
	return out;
}

export function normalize(out: number[], a: ACN): number[];
export function normalize<T extends AN>(out: T, a: ACN): T;
export function normalize(out: AN, a: ACN) {
	const x = a[0],
		y = a[1],
		z = a[2],
		w = a[3];
	let len = x * x + y * y + z * z + w * w; // tslint:disable-line:no-shadowed-variable
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		out[0] = x * len;
		out[1] = y * len;
		out[2] = z * len;
		out[3] = w * len;
	}
	return out;
}

export function dot(a: ACN, b: ACN) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function lerp(out: number[], a: ACN, b: ACN, t: number): number[];
export function lerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export function lerp(out: AN, a: ACN, b: ACN, t: number) {
	const ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	out[3] = aw + t * (b[3] - aw);
	return out;
}

export function random(out: number[], scale: number): number[];
export function random<T extends AN>(out: T, scale: number): T;
export function random(out: AN, scale = 1.0) {
	// TODO: This is a pretty awful way of doing this. Find something better.
	out[0] = Math.random();
	out[1] = Math.random();
	out[2] = Math.random();
	out[3] = Math.random();
	vec4.normalize(out, out);
	vec4.scale(out, out, scale);
	return out;
}

export function clamp(out: number[], a: ACN, min: number, max: number): number[];
export function clamp<T extends AN>(out: AN, a: ACN, min: number, max: number): T;
export function clamp(out: number[], a: ACN, min: ACN, max: ACN): number[];
export function clamp<T extends AN>(out: AN, a: ACN, min: ACN, max: ACN): T;
export function clamp(out: AN, a: ACN, min: number | ACN, max: number | ACN) {
	if (typeof min === "number") {
		out[0] = clampf(a[0], min, max as number);
		out[1] = clampf(a[1], min, max as number);
		out[2] = clampf(a[2], min, max as number);
		out[3] = clampf(a[3], min, max as number);
	}
	else {
		out[0] = clampf(a[0], min[0], (max as ACN)[0]);
		out[1] = clampf(a[1], min[1], (max as ACN)[1]);
		out[2] = clampf(a[2], min[2], (max as ACN)[2]);
		out[3] = clampf(a[3], min[3], (max as ACN)[3]);
	}

	return out;
}

export function clamp01(out: number[], a: ACN): number[];
export function clamp01<T extends AN>(out: T, a: ACN): T;
export function clamp01(out: AN, a: ACN) {
	out[0] = clamp01f(a[0]);
	out[1] = clamp01f(a[1]);
	out[2] = clamp01f(a[2]);
	out[3] = clamp01f(a[3]);
	return out;
}

export function mix(out: number[], a: ACN, b: ACN, ratio: number): number[];
export function mix<T extends AN>(out: T, a: ACN, b: ACN, ratio: number): T;
export function mix(out: number[], a: ACN, b: ACN, ratios: ACN): number[];
export function mix<T extends AN>(out: T, a: ACN, b: ACN, ratios: ACN): T;
export function mix(out: AN, a: ACN, b: ACN, ratio: number | ACN) {
	if (typeof ratio === "number") {
		out[0] = mixf(a[0], b[0], ratio);
		out[1] = mixf(a[1], b[1], ratio);
		out[2] = mixf(a[2], b[2], ratio);
		out[3] = mixf(a[3], b[3], ratio);
	}
	else {
		out[0] = mixf(a[0], b[0], ratio[0]);
		out[1] = mixf(a[1], b[1], ratio[1]);
		out[2] = mixf(a[2], b[2], ratio[2]);
		out[3] = mixf(a[3], b[3], ratio[3]);
	}
	return out;
}

export function sign(out: number[], a: ACN): number[];
export function sign<T extends AN>(out: T, a: ACN): T;
export function sign(out: AN, a: ACN) {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);
	out[2] = Math.sign(a[2]);
	out[3] = Math.sign(a[3]);
	return out;
}

export function transformMat4(out: number[], a: ACN, m: ACN): number[];
export function transformMat4<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat4(out: AN, a: ACN, m: ACN) {
	const x = a[0], y = a[1], z = a[2], w = a[3];
	out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	return out;
}

export function transformQuat(out: number[], a: ACN, m: ACN): number[];
export function transformQuat<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformQuat(out: AN, a: ACN, q: ACN) {
	const x = a[0], y = a[1], z = a[2],
		qx = q[0], qy = q[1], qz = q[2], qw = q[3],

		// calculate quat * vec
		ix = qw * x + qy * z - qz * y,
		iy = qw * y + qz * x - qx * z,
		iz = qw * z + qx * y - qy * x,
		iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	out[3] = a[3];
	return out;
}

export function forEach(a: number[], opt: VecArrayIterationOptions, fn: VecArrayIterationFunction, ...args: any[]): number[];
export function forEach<T extends AN>(a: T, opt: VecArrayIterationOptions, fn: VecArrayIterationFunction, ...args: any[]): T;
export function forEach(a: AN, opt: VecArrayIterationOptions, fn: VecArrayIterationFunction, ...args: any[]) {
	const stride = opt.stride || ELEMENT_COUNT;
	const offset = opt.offset || 0;
	const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
	const vec = create();

	for (let i = offset; i < count; i += stride) {
		vec[0] = a[i];
		vec[1] = a[i + 1];
		vec[2] = a[i + 2];
		vec[3] = a[i + 3];
		fn(vec, vec, args);
		a[i] = vec[0];
		a[i + 1] = vec[1];
		a[i + 2] = vec[2];
		a[i + 3] = vec[3];
	}

	return a;
}

export function str(a: ACN) {
	return `vec4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
}

export function exactEquals(a: ACN, b: ACN) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export function equals(a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
}

} // ns vec4

export { vec4 };
