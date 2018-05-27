/**
 * math/quat - quaternion type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/* Copyright (c) 2015-2017, Brandon Jones, Colin MacKenzie IV, Arthur Langereis

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

import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN } from "@stardazed/core";
import { EPSILON } from "./common";
import { create as mat3Create } from "./mat3";
import * as vec3 from "./vec3";
import * as vec4 from "./vec4";

export const ELEMENT_COUNT = 4;

export function create() {
	const out = new Float32Array(ELEMENT_COUNT);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
}

const tmpVec3_ = vec3.create();
const xUnitVec3_ = vec3.fromValues(1, 0, 0);
const yUnitVec3_ = vec3.fromValues(0, 1, 0);

export function rotationTo(out: number[], a: ACN, b: ACN): number[];
export function rotationTo<T extends AN>(out: T, a: ACN, b: ACN): T;
export function rotationTo(out: AN, a: ACN, b: ACN) {
	const dot = vec3.dot(a, b);
	if (dot < (-1 + EPSILON)) {
		vec3.cross(tmpVec3_, xUnitVec3_, a);
		if (vec3.length(tmpVec3_) < EPSILON) {
			vec3.cross(tmpVec3_, yUnitVec3_, a);
		}
		vec3.normalize(tmpVec3_, tmpVec3_);
		setAxisAngle(out, tmpVec3_, Math.PI);
		return out;
	} else if (dot > (1 - EPSILON)) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
		out[3] = 1;
		return out;
	} else {
		vec3.cross(tmpVec3_, a, b);
		out[0] = tmpVec3_[0];
		out[1] = tmpVec3_[1];
		out[2] = tmpVec3_[2];
		out[3] = 1 + dot;
		return normalize(out, out);
	}
}

const mat_ = mat3Create();

export function setAxes(out: number[], view: ACN, right: ACN, up: ACN): number[];
export function setAxes<T extends AN>(out: T, view: ACN, right: ACN, up: ACN): T;
export function setAxes(out: AN, view: ACN, right: ACN, up: ACN) {
	mat_[0] = right[0];
	mat_[3] = right[1];
	mat_[6] = right[2];

	mat_[1] = up[0];
	mat_[4] = up[1];
	mat_[7] = up[2];

	mat_[2] = -view[0];
	mat_[5] = -view[1];
	mat_[8] = -view[2];

	return normalize(out, fromMat3(out, mat_));
}

export const clone = vec4.clone;

export const fromValues = vec4.fromValues;

export const copy = vec4.copy;

export const set = vec4.set;

export function identity(out: number[]): number[];
export function identity<T extends AN>(out: T): T;
export function identity(out: AN) {
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
}

export function setAxisAngle(out: number[], axis: ACN, rad: number): number[];
export function setAxisAngle<T extends AN>(out: T, axis: ACN, rad: number): T;
export function setAxisAngle(out: AN, axis: ACN, rad: number) {
	rad = rad * 0.5;
	const s = Math.sin(rad);
	out[0] = s * axis[0];
	out[1] = s * axis[1];
	out[2] = s * axis[2];
	out[3] = Math.cos(rad);
	return out;
}

export function getAxisAngle(outAxis: AN, q: ACN): number {
	const rad = Math.acos(q[3]) * 2.0;
	const s = Math.sin(rad / 2.0);
	if (s !== 0.0) {
		outAxis[0] = q[0] / s;
		outAxis[1] = q[1] / s;
		outAxis[2] = q[2] / s;
	}
	else {
		// If s is zero, return any axis (no rotation - axis does not matter)
		outAxis[0] = 1;
		outAxis[1] = 0;
		outAxis[2] = 0;
	}
	return rad;
}

export const add = vec4.add;

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	const ax = a[0], ay = a[1], az = a[2], aw = a[3],
		bx = b[0], by = b[1], bz = b[2], bw = b[3];

	out[0] = ax * bw + aw * bx + ay * bz - az * by;
	out[1] = ay * bw + aw * by + az * bx - ax * bz;
	out[2] = az * bw + aw * bz + ax * by - ay * bx;
	out[3] = aw * bw - ax * bx - ay * by - az * bz;
	return out;
}

export const mul = multiply;

export const scale = vec4.scale;

export function rotateX(out: number[], a: ACN, rad: number): number[];
export function rotateX<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateX(out: AN, a: ACN, rad: number) {
	rad *= 0.5;

	const ax = a[0], ay = a[1], az = a[2], aw = a[3],
		bx = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw + aw * bx;
	out[1] = ay * bw + az * bx;
	out[2] = az * bw - ay * bx;
	out[3] = aw * bw - ax * bx;
	return out;
}

export function rotateY(out: number[], a: ACN, rad: number): number[];
export function rotateY<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateY(out: AN, a: ACN, rad: number) {
	rad *= 0.5;

	const ax = a[0], ay = a[1], az = a[2], aw = a[3],
		by = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw - az * by;
	out[1] = ay * bw + aw * by;
	out[2] = az * bw + ax * by;
	out[3] = aw * bw - ay * by;
	return out;
}

export function rotateZ(out: number[], a: ACN, rad: number): number[];
export function rotateZ<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateZ(out: AN, a: ACN, rad: number) {
	rad *= 0.5;

	const ax = a[0], ay = a[1], az = a[2], aw = a[3],
		bz = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw + ay * bz;
	out[1] = ay * bw - ax * bz;
	out[2] = az * bw + aw * bz;
	out[3] = aw * bw - az * bz;
	return out;
}

export function calculateW(out: number[], a: ACN): number[];
export function calculateW<T extends AN>(out: T, a: ACN): T;
export function calculateW(out: AN, a: ACN) {
	const x = a[0], y = a[1], z = a[2];

	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	return out;
}

export const dot = vec4.dot;

export const lerp = vec4.lerp;

export function slerp(out: number[], a: ACN, b: ACN, t: number): number[];
export function slerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export function slerp(out: AN, a: ACN, b: ACN, t: number) {
	// benchmarks:
	//    http://jsperf.com/quaternion-slerp-implementations

	const ax = a[0], ay = a[1], az = a[2], aw = a[3];
	let bx = b[0], by = b[1], bz = b[2], bw = b[3];

	let omega, cosom, sinom, scale0, scale1;

	// calc cosine
	cosom = ax * bx + ay * by + az * bz + aw * bw;
	// adjust signs (if necessary)
	if (cosom < 0.0) {
		cosom = -cosom;
		bx = - bx;
		by = - by;
		bz = - bz;
		bw = - bw;
	}
	// calculate coefficients
	if ((1.0 - cosom) > EPSILON) {
		// standard case (slerp)
		omega  = Math.acos(cosom);
		sinom  = Math.sin(omega);
		scale0 = Math.sin((1.0 - t) * omega) / sinom;
		scale1 = Math.sin(t * omega) / sinom;
	}
	else {
		// "from" and "to" quaternions are very close 
		//  ... so we can do a linear interpolation
		scale0 = 1.0 - t;
		scale1 = t;
	}
	// calculate final values
	out[0] = scale0 * ax + scale1 * bx;
	out[1] = scale0 * ay + scale1 * by;
	out[2] = scale0 * az + scale1 * bz;
	out[3] = scale0 * aw + scale1 * bw;

	return out;
}

const tempQ1_ = create();
const tempQ2_ = create();

export function sqlerp(out: number[], a: ACN, b: ACN, c: ACN, d: ACN, t: number): number[];
export function sqlerp<T extends AN>(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): T;
export function sqlerp(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number) {
	slerp(tempQ1_, a, d, t);
	slerp(tempQ2_, b, c, t);
	slerp(out, tempQ1_, tempQ2_, 2 * t * (1 - t));

	return out;
}

export function invert(out: number[], a: ACN): number[];
export function invert<T extends AN>(out: T, a: ACN): T;
export function invert(out: AN, a: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
		dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3, // tslint:disable-line:no-shadowed-variable
		invDot = dot ? 1.0 / dot : 0;

	// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
	out[0] = -a0 * invDot;
	out[1] = -a1 * invDot;
	out[2] = -a2 * invDot;
	out[3] =  a3 * invDot;
	return out;
}

export function conjugate(out: number[], a: ACN): number[];
export function conjugate<T extends AN>(out: T, a: ACN): T;
export function conjugate(out: AN, a: ACN) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = a[3];
	return out;
}

export const length = vec4.length;

export const len = length;

export const squaredLength = vec4.squaredLength;

export const sqrLen = squaredLength;

export const normalize = vec4.normalize;

export function fromMat3(out: number[], m: ACN): number[];
export function fromMat3<T extends AN>(out: T, m: ACN): T;
export function fromMat3(out: AN, m: ACN) {
	// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	// article "Quaternion Calculus and Fast Animation".
	const fTrace = m[0] + m[4] + m[8];
	let fRoot;

	if (fTrace > 0.0) {
		// |w| > 1/2, may as well choose w > 1/2
		fRoot = Math.sqrt(fTrace + 1.0);  // 2w
		out[3] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot;  // 1/(4w)
		out[0] = (m[5] - m[7]) * fRoot;
		out[1] = (m[6] - m[2]) * fRoot;
		out[2] = (m[1] - m[3]) * fRoot;
	}
	else {
		// |w| <= 1/2
		let i = 0;
		if (m[4] > m[0]) {
			i = 1;
		}
		if (m[8] > m[i * 3 + i]) {
			i = 2;
		}
		const j = (i + 1) % 3;
		const k = (i + 2) % 3;

		fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
		out[i] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot;
		out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
		out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
		out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
	}

	return out;
}

export function fromEuler(yaw: number, pitch: number, roll: number) {
	const y = yaw * 0.5;
	const p = pitch * 0.5;
	const r = roll * 0.5;

	const siny = Math.sin(y), cosy = Math.cos(y);
	const sinp = Math.sin(p), cosp = Math.cos(p);
	const sinr = Math.sin(r), cosr = Math.cos(r);

	// evaluated form of 3 Quat multiplications (of yaw, pitch and roll)
	return normalize(new Float32Array(ELEMENT_COUNT), [
		sinr * cosp * cosy - cosr * sinp * siny,
		cosr * sinp * cosy + sinr * cosp * siny,
		cosr * cosp * siny - sinr * sinp * cosy,
		cosr * cosp * cosy + sinr * sinp * siny
	]);
}


export function str(a: ACN) {
	return `quat(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
}

export const exactEquals = vec4.exactEquals;

export const equals = vec4.equals;
