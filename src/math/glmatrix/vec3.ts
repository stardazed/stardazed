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

import { EPSILON, GLMForEach, GLMForEachOptions, GLMForEachFunction } from "./common";
import { clamp as clampf, clamp01 as clamp01f, mix as mixf } from "math/math";
import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN } from "math/primarray";

namespace vec3 {

export function create() {
	const out = new Float32Array(3);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	return out;
}

export function clone(a: ACN) {
	const out = new Float32Array(3);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
}

export function fromValues(x: number, y: number, z: number) {
	const out = new Float32Array(3);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}

export function copy(out: number[], a: ACN): number[];
export function copy<T extends AN>(out: T, a: ACN): T;
export function copy(out: AN, a: ACN) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
}

export function set(out: number[], x: number, y: number, z: number): number[];
export function set<T extends AN>(out: T, x: number, y: number, z: number): T;
export function set(out: AN, x: number, y: number, z: number) {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
}

export function add(out: number[], a: ACN, b: ACN): number[];
export function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export function add(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	return out;
}

export function subtract(out: number[], a: ACN, b: ACN): number[];
export function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export function subtract(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	return out;
}

export const sub = subtract;

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	return out;
}

export const mul = multiply;

export function divide(out: number[], a: ACN, b: ACN): number[];
export function divide<T extends AN>(out: T, a: ACN, b: ACN): T;
export function divide(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	return out;
}

export const div = divide;

export function ceil(out: number[], a: ACN): number[];
export function ceil<T extends AN>(out: T, a: ACN): T;
export function ceil(out: AN, a: ACN) {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	out[2] = Math.ceil(a[2]);
	return out;
}

export function floor(out: number[], a: ACN): number[];
export function floor<T extends AN>(out: T, a: ACN): T;
export function floor(out: AN, a: ACN) {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	out[2] = Math.floor(a[2]);
	return out;
}

export function min(out: number[], a: ACN, b: ACN): number[];
export function min<T extends AN>(out: T, a: ACN, b: ACN): T;
export function min(out: AN, a: ACN, b: ACN) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	return out;
}

export function max(out: number[], a: ACN, b: ACN): number[];
export function max<T extends AN>(out: T, a: ACN, b: ACN): T;
export function max(out: AN, a: ACN, b: ACN) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	return out;
}

export function round(out: number[], a: ACN): number[];
export function round<T extends AN>(out: T, a: ACN): T;
export function round(out: AN, a: ACN) {
	out[0] = Math.round(a[0]);
	out[1] = Math.round(a[1]);
	out[2] = Math.round(a[2]);
	return out;
}

export function scale(out: number[], a: ACN, s: number): number[];
export function scale<T extends AN>(out: T, a: ACN, s: number): T;
export function scale(out: AN, a: ACN, s: number) {
	out[0] = a[0] * s;
	out[1] = a[1] * s;
	out[2] = a[2] * s;
	return out;
}

export function scaleAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export function scaleAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export function scaleAndAdd(out: AN, a: ACN, b: ACN, scale: number) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	return out;
}

export function distance(a: ACN, b: ACN) {
	const x = b[0] - a[0];
	const y = b[1] - a[1];
	const z = b[2] - a[2];
	return Math.sqrt(x * x + y * y + z * z);
}

export const dist = distance;

export function squaredDistance(a: ACN, b: ACN) {
	const x = b[0] - a[0];
	const y = b[1] - a[1];
	const z = b[2] - a[2];
	return x * x + y * y + z * z;
}

export const sqrDist = squaredDistance;

export function length(a: ACN) {
	const x = a[0],
		y = a[1],
		z = a[2];
	return Math.sqrt(x * x + y * y + z * z);
}

export const len = length;

export function squaredLength(a: ACN) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	return x * x + y * y + z * z;
}

export const sqrLen = squaredLength;

export function negate(out: number[], a: ACN): number[];
export function negate<T extends AN>(out: T, a: ACN): T;
export function negate(out: AN, a: ACN) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	return out;
}

export function inverse(out: number[], a: ACN): number[];
export function inverse<T extends AN>(out: T, a: ACN): T;
export function inverse(out: AN, a: ACN) {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	return out;
}

export function normalize(out: number[], a: ACN): number[];
export function normalize<T extends AN>(out: T, a: ACN): T;
export function normalize(out: AN, a: ACN) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	let len = x * x + y * y + z * z; // tslint:disable-line:no-shadowed-variable

	if (len > 0) {
		// TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt(len);
		out[0] = a[0] * len;
		out[1] = a[1] * len;
		out[2] = a[2] * len;
	}
	return out;
}

export function dot(a: ACN, b: ACN) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(out: number[], a: ACN, b: ACN): number[];
export function cross<T extends AN>(out: T, a: ACN, b: ACN): T;
export function cross(out: AN, a: ACN, b: ACN) {
	const ax = a[0], ay = a[1], az = a[2],
		bx = b[0], by = b[1], bz = b[2];

	out[0] = ay * bz - az * by;
	out[1] = az * bx - ax * bz;
	out[2] = ax * by - ay * bx;
	return out;
}

export function lerp(out: number[], a: ACN, b: ACN, t: number): number[];
export function lerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export function lerp(out: AN, a: ACN, b: ACN, t: number) {
	const ax = a[0],
		ay = a[1],
		az = a[2];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	return out;
}

export function hermite(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): AN {
	const factorTimes2 = t * t;
	const factor1 = factorTimes2 * (2 * t - 3) + 1;
	const factor2 = factorTimes2 * (t - 2) + t;
	const factor3 = factorTimes2 * (t - 1);
	const factor4 = factorTimes2 * (3 - 2 * t);

	out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

	return out;
}

export function bezier(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): AN {
	const inverseFactor = 1 - t;
	const inverseFactorTimesTwo = inverseFactor * inverseFactor;
	const factorTimes2 = t * t;
	const factor1 = inverseFactorTimesTwo * inverseFactor;
	const factor2 = 3 * t * inverseFactorTimesTwo;
	const factor3 = 3 * factorTimes2 * inverseFactor;
	const factor4 = factorTimes2 * t;

	out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

	return out;
}

export function random(out: number[], scale: number): number[];
export function random<T extends AN>(out: T, scale: number): T;
export function random(out: AN, scale = 1.0) {
	scale = scale || 1.0;

	const r = Math.random() * 2.0 * Math.PI;
	const z = (Math.random() * 2.0) - 1.0;
	const zScale = Math.sqrt(1.0 - z * z) * scale;

	out[0] = Math.cos(r) * zScale;
	out[1] = Math.sin(r) * zScale;
	out[2] = z * scale;
	return out;
}

export function clamp(out: number[], a: ACN, min: number, max: number): number[];
export function clamp<T extends AN>(out: AN, a: ACN, min: number, max: number): T;
export function clamp(out: number[], a: ACN, min: ACN, max: ACN): number[];
export function clamp<T extends AN>(out: AN, a: ACN, min: ACN, max: ACN): T;
export function clamp(out: AN, a: ACN, min: number | ACN, max: number | ACN) {
	if (typeof min === "number") {
		out[0] = clampf(a[0], <number>min, <number>max);
		out[1] = clampf(a[1], <number>min, <number>max);
		out[2] = clampf(a[2], <number>min, <number>max);
	}
	else {
		out[0] = clampf(a[0], min[0], (max as ACN)[0]);
		out[1] = clampf(a[1], min[1], (max as ACN)[1]);
		out[2] = clampf(a[2], min[2], (max as ACN)[2]);
	}

	return out;
}

export function clamp01(out: number[], a: ACN): number[];
export function clamp01<T extends AN>(out: T, a: ACN): T;
export function clamp01(out: AN, a: ACN) {
	out[0] = clamp01f(a[0]);
	out[1] = clamp01f(a[1]);
	out[2] = clamp01f(a[2]);
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
	}
	else {
		out[0] = mixf(a[0], b[0], ratio[0]);
		out[1] = mixf(a[1], b[1], ratio[1]);
		out[2] = mixf(a[2], b[2], ratio[2]);
	}
	return out;
}

export function sign(out: number[], a: ACN): number[];
export function sign<T extends AN>(out: T, a: ACN): T;
export function sign(out: AN, a: ACN) {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);
	out[2] = Math.sign(a[2]);
	return out;
}

export function transformMat3(out: number[], a: ACN, m: ACN): number[];
export function transformMat3<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat3(out: AN, a: ACN, m: ACN) {
	const x = a[0], y = a[1], z = a[2];
	out[0] = x * m[0] + y * m[3] + z * m[6];
	out[1] = x * m[1] + y * m[4] + z * m[7];
	out[2] = x * m[2] + y * m[5] + z * m[8];
	return out;
}

export function transformMat4(out: number[], a: ACN, m: ACN): number[];
export function transformMat4<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformMat4(out: AN, a: ACN, m: ACN) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;

	out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	return out;
}

export function transformQuat(out: number[], a: ACN, m: ACN): number[];
export function transformQuat<T extends AN>(out: T, a: ACN, m: ACN): T;
export function transformQuat(out: AN, a: ACN, q: ACN) {
	// benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

	const x = a[0], y = a[1], z = a[2];
	const qx = q[0], qy = q[1], qz = q[2], qw = q[3];

	// calculate quat * vec
	const ix = qw * x + qy * z - qz * y;
	const iy = qw * y + qz * x - qx * z;
	const iz = qw * z + qx * y - qy * x;
	const iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	return out;
}

export function rotateX(out: number[], a: ACN, b: ACN, c: number): number[];
export function rotateX<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export function rotateX(out: AN, a: ACN, b: ACN, c: number) {
	const p = [];
	const r = [];

	// translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	// perform rotation
	r[0] = p[0];
	r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
	r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

	// translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

export function rotateY(out: number[], a: ACN, b: ACN, c: number): number[];
export function rotateY<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export function rotateY(out: AN, a: ACN, b: ACN, c: number) {
	const p = [];
	const r = [];

	// translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	// perform rotation
	r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
	r[1] = p[1];
	r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

	// translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

export function rotateZ(out: number[], a: ACN, b: ACN, c: number): number[];
export function rotateZ<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export function rotateZ(out: AN, a: ACN, b: ACN, c: number) {
	const p = [];
	const r = [];

	// translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];

	// perform rotation
	r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
	r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
	r[2] = p[2];

	// translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];

	return out;
}

export const forEach = (function() {
	const vec = create();

	return function(a: AN, opt: GLMForEachOptions, fn: GLMForEachFunction, ...args: any[]) {
		const stride = opt.stride || 3;
		const offset = opt.offset || 0;
		const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;

		for (let i = offset; i < count; i += stride) {
			vec[0] = a[i];
			vec[1] = a[i + 1];
			vec[2] = a[i + 2];
			fn(vec, vec, args);
			a[i] = vec[0];
			a[i + 1] = vec[1];
			a[i + 2] = vec[2];
		}

		return a;
	} as GLMForEach;
})();


export function angle(a: ACN, b: ACN) {
	const tempA = clone(a);
	const tempB = clone(b);

	normalize(tempA, tempA);
	normalize(tempB, tempB);

	const cosine = dot(tempA, tempB);

	if (cosine > 1.0) {
		return 0;
	}
	else if (cosine < -1.0) {
		return Math.PI;
	} else {
		return Math.acos(cosine);
	}
}

export function str(a: ACN) {
	return `vec3(${a[0]}, ${a[1]}, ${a[2]})`;
}

export function exactEquals(a: ACN, b: ACN) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function equals(a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2];
	const b0 = b[0], b1 = b[1], b2 = b[2];
	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
}

} // ns vec3

export { vec3 };
