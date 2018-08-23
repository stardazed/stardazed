/**
 * vector/mat4 - 4x4 matrix type
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

import { NumArray as ACN, MutNumArray as AN } from "@stardazed/array";
import { EPSILON } from "./common";

export const ELEMENT_COUNT = 16;

export function create() {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}

export function clone(a: ACN) {
	return new Float32Array([
		a[0], a[1], a[2], a[3],
		a[4], a[5], a[6], a[7],
		a[8], a[9], a[10], a[11],
		a[12], a[13], a[14], a[15]
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
	out[9] = a[9];
	out[10] = a[10];
	out[11] = a[11];
	out[12] = a[12];
	out[13] = a[13];
	out[14] = a[14];
	out[15] = a[15];
	return out;
}

export function identity(out: number[]): number[];
export function identity<T extends AN>(out: T): T;
export function identity(out: AN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromValues(
	m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number,
	m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number
) {
	return new Float32Array([
		m00, m01, m02, m03,
		m10, m11, m12, m13,
		m20, m21, m22, m23,
		m30, m31, m32, m33
	]);
}

export function set(
	out: number[],
	m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number,
	m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number
): number[];
export function set<T extends AN>(
	out: T,
	m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number,
	m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number
): T;
export function set(
	out: AN,
	m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number,
	m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number
) {
	out[0] = m00;
	out[1] = m01;
	out[2] = m02;
	out[3] = m03;
	out[4] = m10;
	out[5] = m11;
	out[6] = m12;
	out[7] = m13;
	out[8] = m20;
	out[9] = m21;
	out[10] = m22;
	out[11] = m23;
	out[12] = m30;
	out[13] = m31;
	out[14] = m32;
	out[15] = m33;
	return out;
}

export function transpose(out: number[], a: ACN): number[];
export function transpose<T extends AN>(out: T, a: ACN): T;
export function transpose(out: AN, a: ACN) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if (out === a) {
		const a01 = a[1], a02 = a[2], a03 = a[3],
			a12 = a[6], a13 = a[7],
			a23 = a[11];

		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a01;
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a02;
		out[9] = a12;
		out[11] = a[14];
		out[12] = a03;
		out[13] = a13;
		out[14] = a23;
	}
	else {
		out[0] = a[0];
		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a[1];
		out[5] = a[5];
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a[2];
		out[9] = a[6];
		out[10] = a[10];
		out[11] = a[14];
		out[12] = a[3];
		out[13] = a[7];
		out[14] = a[11];
		out[15] = a[15];
	}

	return out;
}

export function invert(out: number[], a: ACN): number[];
export function invert<T extends AN>(out: T, a: ACN): T;
export function invert(out: AN, a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

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
	out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	return out;
}

export function adjoint(out: number[], a: ACN): number[];
export function adjoint<T extends AN>(out: T, a: ACN): T;
export function adjoint(out: AN, a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	return out;
}

export function determinant(a: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

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
	return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	// Cache only the current line of the second matrix
	let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
}

export const mul = multiply;

export function rotate(out: number[], a: ACN, rad: number, axis: ACN): number[];
export function rotate<T extends AN>(out: T, a: ACN, rad: number, axis: ACN): T;
export function rotate(out: AN, a: ACN, rad: number, axis: ACN) {
	let x = axis[0], y = axis[1], z = axis[2];

	let len = Math.sqrt(x * x + y * y + z * z);
	if (Math.abs(len) < EPSILON) {
		return null;
	}

	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;

	const s = Math.sin(rad);
	const c = Math.cos(rad);
	const t = 1 - c;

	const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

	// Construct the elements of the rotation matrix
	const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
	const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
	const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;

	// Perform rotation-specific matrix multiplication
	out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	out[11] = a03 * b20 + a13 * b21 + a23 * b22;

	if (a !== out) { // If the source and destination differ, copy the unchanged last row
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}
	return out;
}

export function rotateX(out: number[], a: ACN, rad: number): number[];
export function rotateX<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateX(out: AN, a: ACN, rad: number) {
	const s = Math.sin(rad),
		c = Math.cos(rad),
		a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7],
		a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];

	if (a !== out) { // If the source and destination differ, copy the unchanged rows
		out[0]  = a[0];
		out[1]  = a[1];
		out[2]  = a[2];
		out[3]  = a[3];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[4] = a10 * c + a20 * s;
	out[5] = a11 * c + a21 * s;
	out[6] = a12 * c + a22 * s;
	out[7] = a13 * c + a23 * s;
	out[8] = a20 * c - a10 * s;
	out[9] = a21 * c - a11 * s;
	out[10] = a22 * c - a12 * s;
	out[11] = a23 * c - a13 * s;
	return out;
}

export function rotateY(out: number[], a: ACN, rad: number): number[];
export function rotateY<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateY(out: AN, a: ACN, rad: number) {
	const s = Math.sin(rad),
		c = Math.cos(rad),
		a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3],
		a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];

	if (a !== out) { // If the source and destination differ, copy the unchanged rows
		out[4]  = a[4];
		out[5]  = a[5];
		out[6]  = a[6];
		out[7]  = a[7];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[0] = a00 * c - a20 * s;
	out[1] = a01 * c - a21 * s;
	out[2] = a02 * c - a22 * s;
	out[3] = a03 * c - a23 * s;
	out[8] = a00 * s + a20 * c;
	out[9] = a01 * s + a21 * c;
	out[10] = a02 * s + a22 * c;
	out[11] = a03 * s + a23 * c;
	return out;
}

export function rotateZ(out: number[], a: ACN, rad: number): number[];
export function rotateZ<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotateZ(out: AN, a: ACN, rad: number) {
	const s = Math.sin(rad),
		c = Math.cos(rad),
		a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3],
		a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];

	if (a !== out) { // If the source and destination differ, copy the unchanged last row
		out[8]  = a[8];
		out[9]  = a[9];
		out[10] = a[10];
		out[11] = a[11];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[0] = a00 * c + a10 * s;
	out[1] = a01 * c + a11 * s;
	out[2] = a02 * c + a12 * s;
	out[3] = a03 * c + a13 * s;
	out[4] = a10 * c - a00 * s;
	out[5] = a11 * c - a01 * s;
	out[6] = a12 * c - a02 * s;
	out[7] = a13 * c - a03 * s;
	return out;
}

export function scale(out: number[], a: ACN, v3: ACN): number[];
export function scale<T extends AN>(out: T, a: ACN, v3: ACN): T;
export function scale(out: AN, a: ACN, v3: ACN) {
	const x = v3[0], y = v3[1], z = v3[2];

	out[0] = a[0] * x;
	out[1] = a[1] * x;
	out[2] = a[2] * x;
	out[3] = a[3] * x;
	out[4] = a[4] * y;
	out[5] = a[5] * y;
	out[6] = a[6] * y;
	out[7] = a[7] * y;
	out[8] = a[8] * z;
	out[9] = a[9] * z;
	out[10] = a[10] * z;
	out[11] = a[11] * z;
	out[12] = a[12];
	out[13] = a[13];
	out[14] = a[14];
	out[15] = a[15];
	return out;
}

export function translate(out: number[], a: ACN, v3: ACN): number[];
export function translate<T extends AN>(out: T, a: ACN, v3: ACN): T;
export function translate(out: AN, a: ACN, v3: ACN) {
	const x = v3[0], y = v3[1], z = v3[2];

	if (a === out) {
		out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
		out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
		out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
		out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	} else {
		const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
		const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
		const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

		out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
		out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
		out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

		out[12] = a00 * x + a10 * y + a20 * z + a[12];
		out[13] = a01 * x + a11 * y + a21 * z + a[13];
		out[14] = a02 * x + a12 * y + a22 * z + a[14];
		out[15] = a03 * x + a13 * y + a23 * z + a[15];
	}

	return out;
}

export function fromRotation(out: number[], rad: number, axis: ACN): number[];
export function fromRotation<T extends AN>(out: T, rad: number, axis: ACN): T;
export function fromRotation(out: AN, rad: number, axis: ACN) {
	let x = axis[0], y = axis[1], z = axis[2];

	let len = Math.sqrt(x * x + y * y + z * z);
	if (Math.abs(len) < EPSILON) {
		return null;
	}

	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;

	const s = Math.sin(rad);
	const c = Math.cos(rad);
	const t = 1 - c;

	// Perform rotation-specific matrix multiplication
	out[0] = x * x * t + c;
	out[1] = y * x * t + z * s;
	out[2] = z * x * t - y * s;
	out[3] = 0;
	out[4] = x * y * t - z * s;
	out[5] = y * y * t + c;
	out[6] = z * y * t + x * s;
	out[7] = 0;
	out[8] = x * z * t + y * s;
	out[9] = y * z * t - x * s;
	out[10] = z * z * t + c;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromScaling(out: number[], v3: ACN): number[];
export function fromScaling<T extends AN>(out: T, v3: ACN): T;
export function fromScaling(out: AN, v3: ACN) {
	out[0] = v3[0];
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = v3[1];
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = v3[2];
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromTranslation(out: number[], v3: ACN): number[];
export function fromTranslation<T extends AN>(out: T, v3: ACN): T;
export function fromTranslation(out: AN, v3: ACN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = v3[0];
	out[13] = v3[1];
	out[14] = v3[2];
	out[15] = 1;
	return out;
}

export function fromXRotation(out: number[], rad: number): number[];
export function fromXRotation<T extends AN>(out: T, rad: number): T;
export function fromXRotation(out: AN, rad: number) {
	const s = Math.sin(rad);
	const c = Math.cos(rad);

	// Perform axis-specific matrix multiplication
	out[0]  = 1;
	out[1]  = 0;
	out[2]  = 0;
	out[3]  = 0;
	out[4] = 0;
	out[5] = c;
	out[6] = s;
	out[7] = 0;
	out[8] = 0;
	out[9] = -s;
	out[10] = c;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromYRotation(out: number[], rad: number): number[];
export function fromYRotation<T extends AN>(out: T, rad: number): T;
export function fromYRotation(out: AN, rad: number) {
	const s = Math.sin(rad);
	const c = Math.cos(rad);

	// Perform axis-specific matrix multiplication
	out[0]  = c;
	out[1]  = 0;
	out[2]  = -s;
	out[3]  = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = s;
	out[9] = 0;
	out[10] = c;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromZRotation(out: number[], rad: number): number[];
export function fromZRotation<T extends AN>(out: T, rad: number): T;
export function fromZRotation(out: AN, rad: number) {
	const s = Math.sin(rad);
	const c = Math.cos(rad);

	// Perform axis-specific matrix multiplication
	out[0]  = c;
	out[1]  = s;
	out[2]  = 0;
	out[3]  = 0;
	out[4] = -s;
	out[5] = c;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function fromRotationTranslation(out: number[], q: ACN, v3: ACN): number[];
export function fromRotationTranslation<T extends AN>(out: T, q: ACN, v3: ACN): T;
export function fromRotationTranslation(out: AN, q: ACN, v3: ACN) {
	// Quaternion math
	const x = q[0], y = q[1], z = q[2], w = q[3],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2;

	out[0] = 1 - (yy + zz);
	out[1] = xy + wz;
	out[2] = xz - wy;
	out[3] = 0;
	out[4] = xy - wz;
	out[5] = 1 - (xx + zz);
	out[6] = yz + wx;
	out[7] = 0;
	out[8] = xz + wy;
	out[9] = yz - wx;
	out[10] = 1 - (xx + yy);
	out[11] = 0;
	out[12] = v3[0];
	out[13] = v3[1];
	out[14] = v3[2];
	out[15] = 1;

	return out;
}

export function fromRotationTranslationScale(out: number[], q: ACN, v: ACN, s: ACN): number[];
export function fromRotationTranslationScale<T extends AN>(out: T, q: ACN, v: ACN, s: ACN): T;
export function fromRotationTranslationScale(out: AN, q: ACN, v: ACN, s: ACN) {
	// Quaternion math
	const x = q[0], y = q[1], z = q[2], w = q[3],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2,
		sx = s[0],
		sy = s[1],
		sz = s[2];

	out[0] = (1 - (yy + zz)) * sx;
	out[1] = (xy + wz) * sx;
	out[2] = (xz - wy) * sx;
	out[3] = 0;
	out[4] = (xy - wz) * sy;
	out[5] = (1 - (xx + zz)) * sy;
	out[6] = (yz + wx) * sy;
	out[7] = 0;
	out[8] = (xz + wy) * sz;
	out[9] = (yz - wx) * sz;
	out[10] = (1 - (xx + yy)) * sz;
	out[11] = 0;
	out[12] = v[0];
	out[13] = v[1];
	out[14] = v[2];
	out[15] = 1;

	return out;
}

export function fromRotationTranslationScaleOrigin(out: number[], q: ACN, v: ACN, s: ACN, o: ACN): number[];
export function fromRotationTranslationScaleOrigin<T extends AN>(out: T, q: ACN, v: ACN, s: ACN, o: ACN): T;
export function fromRotationTranslationScaleOrigin(out: AN, q: ACN, v: ACN, s: ACN, o: ACN) {
	// Quaternion math
	const x = q[0], y = q[1], z = q[2], w = q[3],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2,

		sx = s[0],
		sy = s[1],
		sz = s[2],

		ox = o[0],
		oy = o[1],
		oz = o[2];

	out[0] = (1 - (yy + zz)) * sx;
	out[1] = (xy + wz) * sx;
	out[2] = (xz - wy) * sx;
	out[3] = 0;
	out[4] = (xy - wz) * sy;
	out[5] = (1 - (xx + zz)) * sy;
	out[6] = (yz + wx) * sy;
	out[7] = 0;
	out[8] = (xz + wy) * sz;
	out[9] = (yz - wx) * sz;
	out[10] = (1 - (xx + yy)) * sz;
	out[11] = 0;
	out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
	out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
	out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
	out[15] = 1;

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
	out[1] = yx + wz;
	out[2] = zx - wy;
	out[3] = 0;

	out[4] = yx - wz;
	out[5] = 1 - xx - zz;
	out[6] = zy + wx;
	out[7] = 0;

	out[8] = zx + wy;
	out[9] = zy - wx;
	out[10] = 1 - xx - yy;
	out[11] = 0;

	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;

	return out;
}

export function getTranslation(out: number[], a: ACN): number[];
export function getTranslation<T extends AN>(out: T, a: ACN): T;
export function getTranslation(out: AN, a: ACN) {
	out[0] = a[12];
	out[1] = a[13];
	out[2] = a[14];
	return out;
}

export function getScaling(out: number[], a: ACN): number[];
export function getScaling<T extends AN>(out: T, a: ACN): T;
export function getScaling(out: AN, a: ACN) {
	const m11 = a[0],
		m12 = a[1],
		m13 = a[2],
		m21 = a[4],
		m22 = a[5],
		m23 = a[6],
		m31 = a[8],
		m32 = a[9],
		m33 = a[10];

	out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
	out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
	out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
	return out;
}

export function getRotation(out: number[], a: ACN): number[];
export function getRotation<T extends AN>(out: T, a: ACN): T;
export function getRotation(out: AN, a: ACN) {
	// Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
	const trace = a[0] + a[5] + a[10];
	let S;

	if (trace > 0) {
		S = Math.sqrt(trace + 1.0) * 2;
		out[3] = 0.25 * S;
		out[0] = (a[6] - a[9]) / S;
		out[1] = (a[8] - a[2]) / S;
		out[2] = (a[1] - a[4]) / S;
	}
	else if ((a[0] > a[5]) && (a[0] > a[10])) {
		S = Math.sqrt(1.0 + a[0] - a[5] - a[10]) * 2;
		out[3] = (a[6] - a[9]) / S;
		out[0] = 0.25 * S;
		out[1] = (a[1] + a[4]) / S;
		out[2] = (a[8] + a[2]) / S;
	}
	else if (a[5] > a[10]) {
		S = Math.sqrt(1.0 + a[5] - a[0] - a[10]) * 2;
		out[3] = (a[8] - a[2]) / S;
		out[0] = (a[1] + a[4]) / S;
		out[1] = 0.25 * S;
		out[2] = (a[6] + a[9]) / S;
	}
	else {
		S = Math.sqrt(1.0 + a[10] - a[0] - a[5]) * 2;
		out[3] = (a[1] - a[4]) / S;
		out[0] = (a[8] + a[2]) / S;
		out[1] = (a[6] + a[9]) / S;
		out[2] = 0.25 * S;
	}
	return out;
}

export function frustum(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
export function frustum<T extends AN>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
export function frustum(out: AN, left: number, right: number, bottom: number, top: number, near: number, far: number) {
	const rl = 1 / (right - left),
		tb = 1 / (top - bottom),
		nf = 1 / (near - far);
	out[0] = (near * 2) * rl;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = (near * 2) * tb;
	out[6] = 0;
	out[7] = 0;
	out[8] = (right + left) * rl;
	out[9] = (top + bottom) * tb;
	out[10] = (far + near) * nf;
	out[11] = -1;
	out[12] = 0;
	out[13] = 0;
	out[14] = (far * near * 2) * nf;
	out[15] = 0;
	return out;
}

export function perspective(out: number[], fovy: number, aspect: number, near: number, far: number): number[];
export function perspective<T extends AN>(out: T, fovy: number, aspect: number, near: number, far: number): T;
export function perspective(out: AN, fovy: number, aspect: number, near: number, far: number) {
	const f = 1.0 / Math.tan(fovy / 2),
		nf = 1 / (near - far);
	out[0] = f / aspect;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = f;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = (far + near) * nf;
	out[11] = -1;
	out[12] = 0;
	out[13] = 0;
	out[14] = (2 * far * near) * nf;
	out[15] = 0;
	return out;
}

export interface FieldOfViewDegrees {
	upDegrees: number;
	downDegrees: number;
	leftDegrees: number;
	rightDegrees: number;
}

export function perspectiveFromFieldOfView(out: number[], fov: FieldOfViewDegrees, near: number, far: number): number[];
export function perspectiveFromFieldOfView<T extends AN>(out: T, fov: FieldOfViewDegrees, near: number, far: number): T;
export function perspectiveFromFieldOfView(out: AN, fov: FieldOfViewDegrees, near: number, far: number) {
	const upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
		downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
		leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
		rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
		xScale = 2.0 / (leftTan + rightTan),
		yScale = 2.0 / (upTan + downTan);

	out[0] = xScale;
	out[1] = 0.0;
	out[2] = 0.0;
	out[3] = 0.0;
	out[4] = 0.0;
	out[5] = yScale;
	out[6] = 0.0;
	out[7] = 0.0;
	out[8] = -((leftTan - rightTan) * xScale * 0.5);
	out[9] = ((upTan - downTan) * yScale * 0.5);
	out[10] = far / (near - far);
	out[11] = -1.0;
	out[12] = 0.0;
	out[13] = 0.0;
	out[14] = (far * near) / (near - far);
	out[15] = 0.0;
	return out;
}

export function ortho(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
export function ortho<T extends AN>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
export function ortho(out: AN, left: number, right: number, bottom: number, top: number, near: number, far: number) {
	const lr = 1 / (left - right),
		bt = 1 / (bottom - top),
		nf = 1 / (near - far);
	out[0] = -2 * lr;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = -2 * bt;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 2 * nf;
	out[11] = 0;
	out[12] = (left + right) * lr;
	out[13] = (top + bottom) * bt;
	out[14] = (far + near) * nf;
	out[15] = 1;
	return out;
}

export function lookAt(out: number[], eye: ACN, center: ACN, up: ACN): number[];
export function lookAt<T extends AN>(out: T, eye: ACN, center: ACN, up: ACN): T;
export function lookAt(out: AN, eye: ACN, center: ACN, up: ACN) {
	const eyex = eye[0],
		eyey = eye[1],
		eyez = eye[2],
		upx = up[0],
		upy = up[1],
		upz = up[2],
		centerx = center[0],
		centery = center[1],
		centerz = center[2];

	let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

	if (Math.abs(eyex - centerx) < EPSILON &&
		Math.abs(eyey - centery) < EPSILON &&
		Math.abs(eyez - centerz) < EPSILON) {
		return identity(out);
	}

	z0 = eyex - centerx;
	z1 = eyey - centery;
	z2 = eyez - centerz;

	len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy * z2 - upz * z1;
	x1 = upz * z0 - upx * z2;
	x2 = upx * z1 - upy * z0;
	len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}

	y0 = z1 * x2 - z2 * x1;
	y1 = z2 * x0 - z0 * x2;
	y2 = z0 * x1 - z1 * x0;

	len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1 / len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	out[0] = x0;
	out[1] = y0;
	out[2] = z0;
	out[3] = 0;
	out[4] = x1;
	out[5] = y1;
	out[6] = z1;
	out[7] = 0;
	out[8] = x2;
	out[9] = y2;
	out[10] = z2;
	out[11] = 0;
	out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	out[15] = 1;

	return out;
}

export function str(a: ACN) {
	return `mat4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]}, ${a[8]}, ${a[9]}, ${a[10]}, ${a[11]}, ${a[12]}, ${a[13]}, ${a[14]}, ${a[15]})`;
}

export function frob(a: ACN) {
	return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
		Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) +
		Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) +
		Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
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
	out[9] = a[9] + b[9];
	out[10] = a[10] + b[10];
	out[11] = a[11] + b[11];
	out[12] = a[12] + b[12];
	out[13] = a[13] + b[13];
	out[14] = a[14] + b[14];
	out[15] = a[15] + b[15];
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
	out[9] = a[9] - b[9];
	out[10] = a[10] - b[10];
	out[11] = a[11] - b[11];
	out[12] = a[12] - b[12];
	out[13] = a[13] - b[13];
	out[14] = a[14] - b[14];
	out[15] = a[15] - b[15];
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
	out[9] = a[9] * scale;
	out[10] = a[10] * scale;
	out[11] = a[11] * scale;
	out[12] = a[12] * scale;
	out[13] = a[13] * scale;
	out[14] = a[14] * scale;
	out[15] = a[15] * scale;
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
	out[9] = a[9] + (b[9] * scale);
	out[10] = a[10] + (b[10] * scale);
	out[11] = a[11] + (b[11] * scale);
	out[12] = a[12] + (b[12] * scale);
	out[13] = a[13] + (b[13] * scale);
	out[14] = a[14] + (b[14] * scale);
	out[15] = a[15] + (b[15] * scale);
	return out;
}

export function exactEquals(a: ACN, b: ACN) {
	return	a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
			a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
			a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
			a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}

export function equals(a: ACN, b: ACN) {
	const a0  = a[0],  a1  = a[1],  a2  = a[2],  a3  = a[3],
		a4  = a[4],  a5  = a[5],  a6  = a[6],  a7  = a[7],
		a8  = a[8],  a9  = a[9],  a10 = a[10], a11 = a[11],
		a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

	const b0  = b[0],  b1  = b[1],  b2  = b[2],  b3  = b[3],
		b4  = b[4],  b5  = b[5],  b6  = b[6],  b7  = b[7],
		b8  = b[8],  b9  = b[9],  b10 = b[10], b11 = b[11],
		b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
			Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
			Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
			Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
			Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
			Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
			Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
			Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
			Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
			Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
			Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
			Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
			Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
}
