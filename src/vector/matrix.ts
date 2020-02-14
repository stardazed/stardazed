/*
vector/matrix - 4x4 matrix type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { AngleConvert } from "stardazed/core";
import { VEC_EPSILON } from "./common";
import { Vector3 } from "./vector3";
import { Vector4 } from "./vector4";
import { Quaternion } from "./quaternion";

export class Matrix {
	private data_: Float32Array;

	constructor();
	constructor(col0: Vector4, col1: Vector4, col2: Vector4, col3: Vector4);
	constructor(m00: number, m01: number, m02: number, m03: number,
		m10: number, m11: number, m12: number, m13: number,
		m20: number, m21: number, m22: number, m23: number,
		m30: number, m31: number, m32: number, m33: number);
	constructor(m00?: Vector4 | number, m01?: Vector4 | number, m02?: Vector4 | number, m03?: Vector4 | number,
		m10?: number, m11?: number, m12?: number, m13?: number,
		m20?: number, m21?: number, m22?: number, m23?: number,
		m30?: number, m31?: number, m32?: number, m33?: number
	) {
		if (arguments.length === 4) {
			const col0 = m00! as Vector4, col1 = m01! as Vector4, col2 = m02! as Vector4, col3 = m03! as Vector4;
			this.data_ = new Float32Array([
				col0.x, col0.y, col0.z, col0.w,
				col1!.x, col1!.y, col1!.z, col1!.w,
				col2!.x, col2!.y, col2!.z, col2!.w,
				col3!.x, col3!.y, col3!.z, col3!.w
			]);
		}
		else if (arguments.length === 16) {
			this.data_ = new Float32Array([
				m00! as number, m01! as number, m02! as number, m03! as number,
				m10!, m11!, m12!, m13!,
				m20!, m21!, m22!, m23!,
				m30!, m31!, m32!, m33!,
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

	get data() {
		return this.data_;
	}

	asArray() {
		return Array.from(this.data_);
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.from(this.data_);
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

	mul(other: Matrix) {
		const a = this.data_;
		const b = other.data_;
		const m = new Matrix();
		const out = m.data_;

		const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
		a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
		a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
		a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

		// Cache only the current line of the second matrix
		let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
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

		return m;
	}

	// static operations

	// static constructors

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 16) {
			throw new RangeError(`Cannot get 16 values starting at offset ${offset} (out of bounds)`);
		}
		return new Matrix(
			arr[offset + 0], arr[offset + 1], arr[offset + 2], arr[offset + 3],
			arr[offset + 4], arr[offset + 5], arr[offset + 6], arr[offset + 7],
			arr[offset + 8], arr[offset + 9], arr[offset + 10], arr[offset + 11],
			arr[offset + 12], arr[offset + 13], arr[offset + 14], arr[offset + 15]
		);
	}

	static from(iter: Iterator<number>) {
		const m = new Matrix();
		for (let n = 0; n < 16; ++n) {
			const v = iter.next();
			if (v.done) {
				throw new RangeError("Could not get 16 values out of iterator");
			}
			m.data_[n] = v.value;
		}
		return m;
	}

	static trs(pos: Vector3, q: Quaternion, s: Vector3) {
		return new Matrix().setTRS(pos, q, s);
	}

	static lookAt(eye: Vector3, center: Vector3, up: Vector3) {
		const eyex = eye.x,
			eyey = eye.y,
			eyez = eye.z,
			upx = up.x,
			upy = up.y,
			upz = up.z,
			centerx = center.x,
			centery = center.y,
			centerz = center.z;

		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

		if (Math.abs(eyex - centerx) < VEC_EPSILON &&
			Math.abs(eyey - centery) < VEC_EPSILON &&
			Math.abs(eyez - centerz) < VEC_EPSILON) {
			return Matrix.identity;
		}

		const m = new Matrix();
		const out = m.data_;

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
		}
		else {
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
		}
		else {
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

		return m;
	}

	static perspective(fovDegrees: number, aspect: number, zNear: number, zFar: number) {
		const tanHalfFov = Math.tan((AngleConvert.DEG2RAD * fovDegrees) / 2);

		const result = new Matrix();
		result.data_[0] = 1 / (aspect * tanHalfFov);
		result.data_[5] = 1 / tanHalfFov;
		result.data_[10] = -(zFar + zNear) / (zFar - zNear);
		result.data_[11] = -1;
		result.data_[14] = -(2 * zFar * zNear) / (zFar - zNear);
		return result;
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
