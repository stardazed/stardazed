/**
 * math/mat2d - 3x2 matrix type 
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 * 
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
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

export const ELEMENT_COUNT = 6;

export function create() {
	return new Float32Array([1, 0, 0, 1, 0, 0]);
}

export function clone(a: ACN) {
	return new Float32Array([a[0], a[1], a[2], a[3], a[4], a[5]]);
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
	return out;
}

export function identity(out: number[]): number[];
export function identity<T extends AN>(out: T): T;
export function identity(out: AN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = 0;
	out[5] = 0;
	return out;
}

export function fromValues(a: number, b: number, c: number, d: number, tx: number, ty: number) {
	return new Float32Array([a, b, c, d, tx, ty]);
}

export function set(out: number[], a: number, b: number, c: number, d: number, tx: number, ty: number): number[];
export function set<T extends AN>(out: T, a: number, b: number, c: number, d: number, tx: number, ty: number): T;
export function set(out: AN, a: number, b: number, c: number, d: number, tx: number, ty: number) {
	out[0] = a;
	out[1] = b;
	out[2] = c;
	out[3] = d;
	out[4] = tx;
	out[5] = ty;
	return out;
}

export function invert(out: number[], a: ACN): number[];
export function invert<T extends AN>(out: T, a: ACN): T;
export function invert(out: AN, a: ACN) {
	const aa = a[0], ab = a[1], ac = a[2], ad = a[3];
	const atx = a[4], aty = a[5];

	let det = aa * ad - ab * ac;
	if (! det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = ad * det;
	out[1] = -ab * det;
	out[2] = -ac * det;
	out[3] = aa * det;
	out[4] = (ac * aty - ad * atx) * det;
	out[5] = (ab * atx - aa * aty) * det;
	return out;
}

export function determinant(a: ACN) {
	return a[0] * a[3] - a[1] * a[2];
}

export function multiply(out: number[], a: ACN, b: ACN): number[];
export function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export function multiply(out: AN, a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	out[0] = a0 * b0 + a2 * b1;
	out[1] = a1 * b0 + a3 * b1;
	out[2] = a0 * b2 + a2 * b3;
	out[3] = a1 * b2 + a3 * b3;
	out[4] = a0 * b4 + a2 * b5 + a4;
	out[5] = a1 * b4 + a3 * b5 + a5;
	return out;
}

export const mul = multiply;

export function rotate(out: number[], a: ACN, rad: number): number[];
export function rotate<T extends AN>(out: T, a: ACN, rad: number): T;
export function rotate(out: AN, a: ACN, rad: number) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	const s = Math.sin(rad);
	const c = Math.cos(rad);
	out[0] = a0 *  c + a2 * s;
	out[1] = a1 *  c + a3 * s;
	out[2] = a0 * -s + a2 * c;
	out[3] = a1 * -s + a3 * c;
	out[4] = a4;
	out[5] = a5;
	return out;
}

export function scale(out: number[], a: ACN, v2: ACN): number[];
export function scale<T extends AN>(out: T, a: ACN, v2: ACN): T;
export function scale(out: AN, a: ACN, v2: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	const v0 = v2[0], v1 = v2[1];
	out[0] = a0 * v0;
	out[1] = a1 * v0;
	out[2] = a2 * v1;
	out[3] = a3 * v1;
	out[4] = a4;
	out[5] = a5;
	return out;
}

export function translate(out: number[], a: ACN, v2: ACN): number[];
export function translate<T extends AN>(out: T, a: ACN, v2: ACN): T;
export function translate(out: AN, a: ACN, v2: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	const v0 = v2[0], v1 = v2[1];
	out[0] = a0;
	out[1] = a1;
	out[2] = a2;
	out[3] = a3;
	out[4] = a0 * v0 + a2 * v1 + a4;
	out[5] = a1 * v0 + a3 * v1 + a5;
	return out;
}

export function fromRotation(out: number[], rad: number): number[];
export function fromRotation<T extends AN>(out: T, rad: number): T;
export function fromRotation(out: AN, rad: number) {
	const s = Math.sin(rad);
	const c = Math.cos(rad);
	out[0] = c;
	out[1] = s;
	out[2] = -s;
	out[3] = c;
	out[4] = 0;
	out[5] = 0;
	return out;
}

export function fromScaling(out: number[], v2: ACN): number[];
export function fromScaling<T extends AN>(out: T, v2: ACN): T;
export function fromScaling(out: AN, v2: ACN) {
	out[0] = v2[0];
	out[1] = 0;
	out[2] = 0;
	out[3] = v2[1];
	out[4] = 0;
	out[5] = 0;
	return out;
}

export function fromTranslation(out: number[], v2: ACN): number[];
export function fromTranslation<T extends AN>(out: T, v2: ACN): T;
export function fromTranslation(out: AN, v2: ACN) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = v2[0];
	out[5] = v2[1];
	return out;
}

export function str(a: ACN) {
	return `mat2d(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]})`;
}

export function frob(a: ACN) {
	return	Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) +
			Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
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
	return out;
}

export function exactEquals(a: ACN, b: ACN) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}

export function equals(a: ACN, b: ACN) {
	const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
			Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
			Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
			Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)));
}
