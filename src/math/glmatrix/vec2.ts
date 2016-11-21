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

import { EPSILON, GLMForEachOptions, GLMForEachFunction } from "./common";
import { clamp as clampf, clamp01 as clamp01f, mix as mixf } from "math/math";
import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN } from "math/primarray";

namespace vec2 {

export const ELEMENT_COUNT = 2;

export function create() {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = 0;
	out[1] = 0;
	return out;
}

export const zero = create();

export function one() {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = 1;
	out[1] = 1;
	return out;
}

export function clone(a: ACN) {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = a[0];
	out[1] = a[1];
	return out;
}

export function fromValues(x: number, y: number) {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = x;
	out[1] = y;
	return out;
}

export function copy(out: number[], a: ACN): number[];
export function copy<T extends AN>(out: T, a: ACN): T;
export function copy(out: AN, a: ACN) {
	out[0] = a[0];
	out[1] = a[1];
	return out;
}

export function set(out: number[], x: number, y: number): number[];
export function set<T extends AN>(out: T, x: number, y: number): T;
export function set(out: AN, x: number, y: number) {
	out[0] = x;
	out[1] = y;
	return out;
}

export function add(out: number[], a: ACN, b: ACN): number[];
export function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export function add(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	return out;
}

export function subtract(out: number[], a: ACN, b: ACN): number[];
export function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export function subtract(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	return out;
}

export const sub = subtract;

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	return out;
}

export const mul = multiply;

export function divide(out: number[], a: ACN, b: ACN): number[];
export function divide<T extends AN>(out: T, a: ACN, b: ACN): T;
export function divide(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	return out;
}

export const div = divide;

export function ceil(out: number[], a: ACN): number[];
export function ceil<T extends AN>(out: T, a: ACN): T;
export function ceil(out: AN, a: ACN) {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	return out;
}

export function floor(out: number[], a: ACN): number[];
export function floor<T extends AN>(out: T, a: ACN): T;
export function floor(out: AN, a: ACN) {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	return out;
}

export function min(out: number[], a: ACN, b: ACN): number[];
export function min<T extends AN>(out: T, a: ACN, b: ACN): T;
export function min(out: AN, a: ACN, b: ACN) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	return out;
}

export function max(out: number[], a: ACN, b: ACN): number[];
export function max<T extends AN>(out: T, a: ACN, b: ACN): T;
export function max(out: AN, a: ACN, b: ACN) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	return out;
}

export function round(out: number[], a: ACN): number[];
export function round<T extends AN>(out: T, a: ACN): T;
export function round(out: AN, a: ACN) {
	out[0] = Math.round(a[0]);
	out[1] = Math.round(a[1]);
	return out;
}

export function scale(out: number[], a: ACN, s: number): number[];
export function scale<T extends AN>(out: T, a: ACN, s: number): T;
export function scale(out: AN, a: ACN, s: number) {
	out[0] = a[0] * s;
	out[1] = a[1] * s;
	return out;
}

export function scaleAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export function scaleAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export function scaleAndAdd(out: AN, a: ACN, b: ACN, scale: number) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	return out;
}

export function distance(a: ACN, b: ACN) {
	const x = b[0] - a[0];
	const y = b[1] - a[1];
	return Math.sqrt(x * x + y * y);
}

export const dist = distance;

export function squaredDistance(a: ACN, b: ACN) {
	const x = b[0] - a[0];
	const y = b[1] - a[1];
	return x * x + y * y;
}

export const sqrDist = squaredDistance;

export function length(a: ACN) {
	const x = a[0];
	const y = a[1];
	return Math.sqrt(x * x + y * y);
};

export const len = length;

export function squaredLength(a: ACN) {
	const x = a[0];
	const y = a[1];
	return x * x + y * y;
};

export const sqrLen = squaredLength;

export function negate(out: number[], a: ACN): number[];
export function negate<T extends AN>(out: T, a: ACN): T;
export function negate(out: AN, a: ACN) {
	out[0] = -a[0];
	out[1] = -a[1];
	return out;
}

export function inverse(out: number[], a: ACN): number[];
export function inverse<T extends AN>(out: T, a: ACN): T;
export function inverse(out: AN, a: ACN) {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	return out;
}

export function normalize(out: number[], a: ACN): number[];
export function normalize<T extends AN>(out: T, a: ACN): T;
export function normalize(out: AN, a: ACN) {
	const x = a[0];
	const y = a[1];
	let len = x * x + y * y; // tslint:disable-line:no-shadowed-variable
	if (len > 0) {
		// TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt(len);
		out[0] = a[0] * len;
		out[1] = a[1] * len;
	}
	return out;
}

export function dot(a: ACN, b: ACN) {
	return a[0] * b[0] + a[1] * b[1];
}

export function cross(out: number[], a: ACN, b: ACN): number[];
export function cross<T extends AN>(out: T, a: ACN, b: ACN): T;
export function cross(out: AN, a: ACN, b: ACN) {
	const z = a[0] * b[1] - a[1] * b[0];
	out[0] = out[1] = 0;
	out[2] = z;
	return out;
}

export function lerp(out: number[], a: ACN, b: ACN, t: number): number[];
export function lerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export function lerp(out: AN, a: ACN, b: ACN, t: number) {
	const ax = a[0];
	const ay = a[1];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	return out;
}

export function random(out: number[], scale: number): number[];
export function random<T extends AN>(out: T, scale: number): T;
export function random(out: AN, scale = 1.0) {
	const r = Math.random() * 2.0 * Math.PI;
	out[0] = Math.cos(r) * scale;
	out[1] = Math.sin(r) * scale;
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
	}
	else {
		out[0] = clampf(a[0], min[0], (max as ACN)[0]);
		out[1] = clampf(a[1], min[1], (max as ACN)[1]);
	}
	return out;
}

export function clamp01(out: number[], a: ACN): number[];
export function clamp01<T extends AN>(out: T, a: ACN): T;
export function clamp01(out: AN, a: ACN) {
	out[0] = clamp01f(a[0]);
	out[1] = clamp01f(a[1]);
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
	}
	else {
		out[0] = mixf(a[0], b[0], ratio[0]);
		out[1] = mixf(a[1], b[1], ratio[1]);
	}
	return out;
}

export function sign(out: number[], a: ACN): number[];
export function sign<T extends AN>(out: T, a: ACN): T;
export function sign(out: AN, a: ACN) {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);
	return out;
}

export function transformMat2(out: number[], a: ACN, m: ACN): number[];
export function transformMat2<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat2(out: AN, a: ACN, m: ACN) {
	const x = a[0];
	const y = a[1];
	out[0] = m[0] * x + m[2] * y;
	out[1] = m[1] * x + m[3] * y;
	return out;
}

export function transformMat2d(out: number[], a: ACN, m: ACN): number[];
export function transformMat2d<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat2d(out: AN, a: ACN, m: ACN) {
	const x = a[0];
	const y = a[1];
	out[0] = m[0] * x + m[2] * y + m[4];
	out[1] = m[1] * x + m[3] * y + m[5];
	return out;
}

export function transformMat3(out: number[], a: ACN, m: ACN): number[];
export function transformMat3<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat3(out: AN, a: ACN, m: ACN) {
	const x = a[0];
	const y = a[1];
	out[0] = m[0] * x + m[3] * y + m[6];
	out[1] = m[1] * x + m[4] * y + m[7];
	return out;
}

export function transformMat4(out: number[], a: ACN, m: ACN): number[];
export function transformMat4<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat4(out: AN, a: ACN, m: ACN) {
	const x = a[0];
	const y = a[1];
	out[0] = m[0] * x + m[4] * y + m[12];
	out[1] = m[1] * x + m[5] * y + m[13];
	return out;
}

export function forEach(a: number[], opt: GLMForEachOptions, fn: GLMForEachFunction, ...args: any[]): number[];
export function forEach<T extends AN>(a: T, opt: GLMForEachOptions, fn: GLMForEachFunction, ...args: any[]): T;
export function forEach(a: AN, opt: GLMForEachOptions, fn: GLMForEachFunction, ...args: any[]) {
	const stride = opt.stride || ELEMENT_COUNT;
	const offset = opt.offset || 0;
	const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
	const vec = create();

	for (let i = offset; i < count; i += stride) {
		vec[0] = a[i];
		vec[1] = a[i + 1];
		fn(vec, vec, args);
		a[i] = vec[0];
		a[i + 1] = vec[1];
	}

	return a;
}

export function str(a: ACN) {
	return `vec2(${a[0]}, ${a[1]})`;
}

export function exactEquals(a: ACN, b: ACN) {
	return a[0] === b[0] && a[1] === b[1];
}

export function equals(a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1];
	const b0 = b[0], b1 = b[1];
	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
}

} // ns vec2

export { vec2 };
