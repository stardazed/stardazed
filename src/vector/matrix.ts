/*
vector/matrix - 4x4 matrix type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { Vector3 } from "./vector3";
import { Vector4 } from "./vector4";
import { Quaternion } from "./quaternion";

export class Matrix {
	private data_: Float32Array;

	constructor();
	constructor(col0: Vector4, col1: Vector4, col2: Vector4, col3: Vector4);
	constructor(col0?: Vector4, col1?: Vector4, col2?: Vector4, col3?: Vector4) {
		if (col0) {
			this.data_ = new Float32Array([
				col0.x, col0.y, col0.z, col0.w,
				col1!.x, col1!.y, col1!.z, col1!.w,
				col2!.x, col2!.y, col2!.z, col2!.w,
				col3!.x, col3!.y, col3!.z, col3!.w
			]);
		}
		else {
			this.data_ = new Float32Array(16);
			this.data_[0] = 1;
			this.data_[5] = 1;
			this.data_[10] = 1;
			this.data_[15] = 1;
		}
	}

	*[Symbol.iterator]() {
		for (let n = 0; n < 16; ++n) {
			yield this.data_[n];
		}
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "number") {
			return NaN;
		}
		const d = this.data_;
		return `Matrix {\n` +
			`  00: ${d[0]}, 01: ${d[4]}, 02: ${d[8]}, 03: ${d[12]}\n` +
			`  10: ${d[1]}, 11: ${d[5]}, 12: ${d[9]}, 13: ${d[13]}\n` +
			`  20: ${d[2]}, 21: ${d[6]}, 22: ${d[10]}, 23: ${d[14]}\n` +
			`  30: ${d[3]}, 31: ${d[7]}, 32: ${d[11]}, 33: ${d[15]}\n` +
		`}`;
	}

	getElement(row: number, column: number) {
		return this.data_[row + column * 4];
	}

	setElement(row: number, column: number, value: number) {
		this.data_[row + column * 4] = value;
	}

	clone() {
		return new Matrix().setFromArray(this.data_, 0);
	}

	setFromArray(arr: NumArray, offset: number) {
		for (let n = 0; n < 16; ++n) {
			this.data_[n] = arr[offset + n];
		}
		return this;
	}

	writeToArray(arr: MutNumArray, offset: number) {
		for (let n = 0; n < 16; ++n) {
			arr[offset + n] = this.data_[n];
		}
		return this;
	}

	getColumn(index: number) {
		const offset = index * 4;
		const d = this.data_;
		return new Vector4(d[offset], d[offset + 1], d[offset + 2], d[offset + 3]);
	}

	setColumn(index: number, column: Vector4) {
		const offset = index * 4;
		const d = this.data_;
		d[offset] = column.x;
		d[offset + 1] = column.y;
		d[offset + 2] = column.z;
		d[offset + 3] = column.w;
		return this;
	}

	setTRS(pos: Vector3, q: Quaternion, s: Vector3) {
		const { x, y, z, w } = q;
		const x2 = x + x,
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
			sx = s.x,
			sy = s.y,
			sz = s.z;

		const d = this.data_;
		d[0] = (1 - (yy + zz)) * sx;
		d[1] = (xy + wz) * sx;
		d[2] = (xz - wy) * sx;
		d[3] = 0;
		d[4] = (xy - wz) * sy;
		d[5] = (1 - (xx + zz)) * sy;
		d[6] = (yz + wx) * sy;
		d[7] = 0;
		d[8] = (xz + wy) * sz;
		d[9] = (yz - wx) * sz;
		d[10] = (1 - (xx + yy)) * sz;
		d[11] = 0;
		d[12] = pos.x;
		d[13] = pos.y;
		d[14] = pos.z;
		d[15] = 1;
		return this;
	}

	// static operations

	// static constructors

	static trs(pos: Vector3, q: Quaternion, s: Vector3) {
		return new Matrix().setTRS(pos, q, s);
	}

	static lookAt(from: Vector3, to: Vector3, up: Vector3) {
		return new Matrix().setTRS(from, Quaternion.lookRotation(to.sub(from), up), Vector3.up);
	}

	static perspective() {

	}

	static get identity() {
		return new Matrix();
	}

	static get zero() {
		const m = new Matrix();
		m.data_[0] = 0;
		m.data_[5] = 0;
		m.data_[10] = 0;
		m.data_[15] = 0;
		return m;
	}
}
