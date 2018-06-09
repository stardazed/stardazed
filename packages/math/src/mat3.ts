/**
 * math/mat3 - 3x3 matrix type
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

import { NumArray as ACN, MutNumArray as AN } from "@stardazed/core";
import { EPSILON } from "./common";

export const ELEMENT_COUNT = 9;

export function create() {
	return new Float32Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
}

export function clone(a: ACN) {
	return new Float32Array([
		a[0], a[1], a[2],
		a[3], a[4], a[5],
		a[6], a[7], a[8]
	]);
}

export function copy(out: number[], a: ACN): number[];
export function copy<T extends AN>(out: T, a: ACN): T;
export function copy(out: AN, a: ACN) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
}

export function identity(out: number[]): number[];
export function identity<T extends AN>(out: T): T;
export function identity(out: AN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

export function fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) {
	return new Float32Array([
		m00, m01, m02,
		m10, m11, m12,
		m20, m21, m22
	]);
}

export function set(out: number[], m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): number[];
export function set<T extends AN>(out: T, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): T;
export function set(out: AN, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) {
	out[0] = m00;
	out[1] = m01;
	out[2] = m02;
	out[3] = m10;
	out[4] = m11;
	out[5] = m12;
	out[6] = m20;
	out[7] = m21;
	out[8] = m22;
	return out;
}

export function transpose(out: number[], a: ACN): number[];
export function transpose<T extends AN>(out: T, a: ACN): T;
export function transpose(out: AN, a: ACN) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if (out === a) {
		const a01 = a[1], a02 = a[2], a12 = a[5];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a01;
		out[5] = a[7];
		out[6] = a02;
		out[7] = a12;
	} else {
		out[0] = a[0];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a[1];
		out[4] = a[4];
		out[5] = a[7];
		out[6] = a[2];
		out[7] = a[5];
		out[8] = a[8];
	}

	return out;
}

export function invert(out: number[], a: ACN): number[];
export function invert<T extends AN>(out: T, a: ACN): T;
export function invert(out: AN, a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8],

		b01 = a22 * a11 - a12 * a21,
		b11 = -a22 * a10 + a12 * a20,
		b21 = a21 * a10 - a11 * a20;

	// Calculate the determinant
	let det = a00 * b01 + a01 * b11 + a02 * b21;

	if (! det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = b01 * det;
	out[1] = (-a22 * a01 + a02 * a21) * det;
	out[2] = (a12 * a01 - a02 * a11) * det;
	out[3] = b11 * det;
	out[4] = (a22 * a00 - a02 * a20) * det;
	out[5] = (-a12 * a00 + a02 * a10) * det;
	out[6] = b21 * det;
	out[7] = (-a21 * a00 + a01 * a20) * det;
	out[8] = (a11 * a00 - a01 * a10) * det;
	return out;
}

export function adjoint(out: number[], a: ACN): number[];
export function adjoint<T extends AN>(out: T, a: ACN): T;
export function adjoint(out: AN, a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8];

	out[0] = (a11 * a22 - a12 * a21);
	out[1] = (a02 * a21 - a01 * a22);
	out[2] = (a01 * a12 - a02 * a11);
	out[3] = (a12 * a20 - a10 * a22);
	out[4] = (a00 * a22 - a02 * a20);
	out[5] = (a02 * a10 - a00 * a12);
	out[6] = (a10 * a21 - a11 * a20);
	out[7] = (a01 * a20 - a00 * a21);
	out[8] = (a00 * a11 - a01 * a10);
	return out;
}

export function determinant(a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8];

	return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8],

		b00 = b[0], b01 = b[1], b02 = b[2],
		b10 = b[3], b11 = b[4], b12 = b[5],
		b20 = b[6], b21 = b[7], b22 = b[8];

	out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	out[2] = b00 * a02 + b01 * a12 + b02 * a22;

	out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	out[5] = b10 * a02 + b11 * a12 + b12 * a22;

	out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	return out;
}

export const mul = multiply;

export function rotate(out: number[], a: ACN, rad: number): number[];
export function rotate<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotate(out: AN, a: ACN, rad: number) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8];

	const s = Math.sin(rad);
	const c = Math.cos(rad);

	out[0] = c * a00 + s * a10;
	out[1] = c * a01 + s * a11;
	out[2] = c * a02 + s * a12;

	out[3] = c * a10 - s * a00;
	out[4] = c * a11 - s * a01;
	out[5] = c * a12 - s * a02;

	out[6] = a20;
	out[7] = a21;
	out[8] = a22;
	return out;
}

export function scale(out: number[], a: ACN, v2: ACN): number[];
export function scale<T extends AN>(out: T, a: ACN, v2: ACN): T;
export function scale(out: AN, a: ACN, v2: ACN) {
	const x = v2[0], y = v2[1];

	out[0] = x * a[0];
	out[1] = x * a[1];
	out[2] = x * a[2];

	out[3] = y * a[3];
	out[4] = y * a[4];
	out[5] = y * a[5];

	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
}

export function translate(out: number[], a: ACN, v2: ACN): number[];
export function translate<T extends AN>(out: T, a: ACN, v2: ACN): T;
export function translate(out: AN, a: ACN, v2: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2],
		a10 = a[3], a11 = a[4], a12 = a[5],
		a20 = a[6], a21 = a[7], a22 = a[8];
	const x = v2[0], y = v2[1];

	out[0] = a00;
	out[1] = a01;
	out[2] = a02;

	out[3] = a10;
	out[4] = a11;
	out[5] = a12;

	out[6] = x * a00 + y * a10 + a20;
	out[7] = x * a01 + y * a11 + a21;
	out[8] = x * a02 + y * a12 + a22;
	return out;
}

export function fromRotation(out: number[], rad: number): number[];
export function fromRotation<T extends AN>(out: T, rad: number): T;
export function fromRotation(out: AN, rad: number) {
	const s = Math.sin(rad), c = Math.cos(rad);

	out[0] = c;
	out[1] = s;
	out[2] = 0;

	out[3] = -s;
	out[4] = c;
	out[5] = 0;

	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

export function fromScaling(out: number[], v2: ACN): number[];
export function fromScaling<T extends AN>(out: T, v2: ACN): T;
export function fromScaling(out: AN, v2: ACN) {
	out[0] = v2[0];
	out[1] = 0;
	out[2] = 0;

	out[3] = 0;
	out[4] = v2[1];
	out[5] = 0;

	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
}

export function fromTranslation(out: number[], v2: ACN): number[];
export function fromTranslation<T extends AN>(out: T, v2: ACN): T;
export function fromTranslation(out: AN, v2: ACN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = v2[0];
	out[7] = v2[1];
	out[8] = 1;
	return out;
}

export function fromMat2d(out: number[], m2d: ACN): number[];
export function fromMat2d<T extends AN>(out: T, m2d: ACN): T;
export function fromMat2d(out: AN, m2d: ACN) {
	out[0] = m2d[0];
	out[1] = m2d[1];
	out[2] = 0;

	out[3] = m2d[2];
	out[4] = m2d[3];
	out[5] = 0;

	out[6] = m2d[4];
	out[7] = m2d[5];
	out[8] = 1;
	return out;
}

export function fromMat4(out: number[], m4: ACN): number[];
export function fromMat4<T extends AN>(out: T, m4: ACN): T;
export function fromMat4(out: AN, m4: ACN) {
	out[0] = m4[0];
	out[1] = m4[1];
	out[2] = m4[2];
	out[3] = m4[4];
	out[4] = m4[5];
	out[5] = m4[6];
	out[6] = m4[8];
	out[7] = m4[9];
	out[8] = m4[10];
	return out;
}

export function fromQuat(out: number[], q: ACN): number[];
export function fromQuat<T extends AN>(out: T, q: ACN): T;
export function fromQuat(out: AN, q: ACN) {
	const x = q[0], y = q[1], z = q[2], w = q[3],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		yx = y * x2,
		yy = y * y2,
		zx = z * x2,
		zy = z * y2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2;

	out[0] = 1 - yy - zz;
	out[3] = yx - wz;
	out[6] = zx + wy;

	out[1] = yx + wz;
	out[4] = 1 - xx - zz;
	out[7] = zy - wx;

	out[2] = zx - wy;
	out[5] = zy + wx;
	out[8] = 1 - xx - yy;

	return out;
}

export function normalFromMat4(out: number[], m4: ACN): number[];
export function normalFromMat4<T extends AN>(out: T, m4: ACN): T;
export function normalFromMat4(out: AN, m4: ACN) {
	const a00 = m4[0], a01 = m4[1], a02 = m4[2], a03 = m4[3],
		a10 = m4[4], a11 = m4[5], a12 = m4[6], a13 = m4[7],
		a20 = m4[8], a21 = m4[9], a22 = m4[10], a23 = m4[11],
		a30 = m4[12], a31 = m4[13], a32 = m4[14], a33 = m4[15],

		b00 = a00 * a11 - a01 * a10,
		b01 = a00 * a12 - a02 * a10,
		b02 = a00 * a13 - a03 * a10,
		b03 = a01 * a12 - a02 * a11,
		b04 = a01 * a13 - a03 * a11,
		b05 = a02 * a13 - a03 * a12,
		b06 = a20 * a31 - a21 * a30,
		b07 = a20 * a32 - a22 * a30,
		b08 = a20 * a33 - a23 * a30,
		b09 = a21 * a32 - a22 * a31,
		b10 = a21 * a33 - a23 * a31,
		b11 = a22 * a33 - a23 * a32;

	// Calculate the determinant
	let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (! det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

	out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

	out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

	return out;
}

export function str(a: ACN) {
	return `mat3(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]}, ${a[8]})`;
}

export function frob(a: ACN) {
	return	Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
			Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
}

export function add(out: number[], a: ACN, b: ACN): number[];
export function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export function add(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	out[4] = a[4] + b[4];
	out[5] = a[5] + b[5];
	out[6] = a[6] + b[6];
	out[7] = a[7] + b[7];
	out[8] = a[8] + b[8];
	return out;
}

export function subtract(out: number[], a: ACN, b: ACN): number[];
export function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export function subtract(out: AN, a: ACN, b: ACN) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	out[4] = a[4] - b[4];
	out[5] = a[5] - b[5];
	out[6] = a[6] - b[6];
	out[7] = a[7] - b[7];
	out[8] = a[8] - b[8];
	return out;
}

export const sub = subtract;

export function multiplyScalar(out: number[], a: ACN, scale: number): number[];
export function multiplyScalar<T extends AN>(out: T, a: ACN, scale: number): T;
export function multiplyScalar(out: AN, a: ACN, scale: number) {
	out[0] = a[0] * scale;
	out[1] = a[1] * scale;
	out[2] = a[2] * scale;
	out[3] = a[3] * scale;
	out[4] = a[4] * scale;
	out[5] = a[5] * scale;
	out[6] = a[6] * scale;
	out[7] = a[7] * scale;
	out[8] = a[8] * scale;
	return out;
}

export function multiplyScalarAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export function multiplyScalarAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export function multiplyScalarAndAdd(out: AN, a: ACN, b: ACN, scale: number) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	out[3] = a[3] + (b[3] * scale);
	out[4] = a[4] + (b[4] * scale);
	out[5] = a[5] + (b[5] * scale);
	out[6] = a[6] + (b[6] * scale);
	out[7] = a[7] + (b[7] * scale);
	out[8] = a[8] + (b[8] * scale);
	return out;
}

export function exactEquals(a: ACN, b: ACN) {
	return	a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
			a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
			a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}

export function equals(a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
	const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
			Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
			Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
			Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
			Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
			Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
}
