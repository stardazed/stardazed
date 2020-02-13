/*
vector/quaternion - quaternion rotation type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clamp01f, AngleConvert, Easing, EasingFn } from "stardazed/core";
import { VEC_EPSILON } from "./common";
import { Vector3 } from "./vector3";
import { Vector4 } from "./vector4";

export class Quaternion {
	x: number;
	y: number;
	z: number;
	w: number;

	constructor();
	constructor(x: number, y: number, z: number, w: number);
	constructor(x?: number, y?: number, z?: number, w?: number) {
		this.x = x ?? 0;
		this.y = y ?? 0;
		this.z = z ?? 0;
		this.w = w ?? 1;
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		yield this.w;
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "number") {
			return NaN;
		}
		return `Quaternion {x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w}}`;
	}

	get 0() { return this.x; }
	set 0(x) { this.x = x; }
	get 1() { return this.y; }
	set 1(y) { this.y = y; }
	get 2() { return this.z; }
	set 2(z) { this.z = z; }
	get 3() { return this.w; }
	set 3(w) { this.w = w; }

	clone() {
		return new Quaternion(this.x, this.y, this.z, this.w);
	}

	asArray() {
		return [this.x, this.y, this.z, this.w];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y, this.z, this.w);
	}

	setFromArray(arr: NumArray, offset: number) {
		this.x = arr[offset];
		this.y = arr[offset + 1];
		this.z = arr[offset + 2];
		this.w = arr[offset + 3];
		return this;
	}

	writeToArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		arr[offset + 2] = this.z;
		arr[offset + 3] = this.w;
		return this;
	}

	setElements(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}

	setFromQuaternion(src: Quaternion) {
		this.x = src.x;
		this.y = src.y;
		this.z = src.z;
		this.w = src.w;
		return this;
	}

	mul(q: Quaternion) {
		const { x, y, z, w } = this;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		return new Quaternion(
			x * qw + w * qx + y * qz - z * qy,
			y * qw + w * qy + z * qx - x * qz,
			z * qw + w * qz + x * qy - y * qx,
			w * qw - x * qx - y * qy - z * qz
		);
	}

	setAxisAngle(axis: Vector3, angleDegrees: number) {
		const halfAngleRad = angleDegrees * AngleConvert.DEG2RAD * 0.5;
		const sa = Math.sin(halfAngleRad);
		this.x = axis.x * sa;
		this.y = axis.y * sa;
		this.z = axis.z * sa;
		this.w = Math.cos(halfAngleRad);
		return this;
	}

	get axisAngle() {
		const angleRad = Math.acos(this.w) * 2;
		let sa = Math.sin(angleRad * 0.5);
		let axis: Vector3;
		if (sa !== 0.0) {
			sa = 1.0 / sa;
			axis = new Vector3(this.x * sa, this.y * sa, this.z * sa);
		}
		else {
			axis = Vector3.up;
		}
		const angle = angleRad * AngleConvert.RAD2DEG;
		return { axis, angle };
	}

	setFromToRotation(from: Vector3, to: Vector3) {
		let tmp: Vector3;
		const dot = from.dot(to);
		if (dot < (-1 + VEC_EPSILON)) {
			tmp = Vector3.right.cross(from);
			if (tmp.magnitude < VEC_EPSILON) {
				tmp = Vector3.up.cross(from);
			}
			tmp.setNormalized();
			this.setAxisAngle(tmp, 180);
		}
		else if (dot > (1 - VEC_EPSILON)) {
			this.setIdentity();
		}
		else {
			tmp = from.cross(to);
			this.x = tmp.x;
			this.y = tmp.y;
			this.z = tmp.z;
			this.w = 1 + dot;
			this.setNormalized();
		}
		return this;
	}

	setNormalized() {
		return Vector4.prototype.setNormalized.call(this) as unknown as this;
	}

	normalize() {
		return this.clone().setNormalized();
	}

	setIdentity() {
		this.x = this.y = this.z = 0;
		this.w = 1;
		return this;
	}

	dot(q: Quaternion) {
		return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
	}

	inverse() {
		const { x, y, z, w } = this;
		const dot = x * x + y * y + z * z + w * w;
		const invDot = dot ? 1 / dot : 0;

		return new Quaternion(
			-x * invDot,
			-y * invDot,
			-z * invDot,
			w * invDot
		);
	}

	exactEquals(v: Quaternion) {
		return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
	}

	equals(v: Quaternion) {
		const dp = this.dot(v);
		return Math.abs(1 - dp) < VEC_EPSILON;
	}

	// static operations

	static applyToVector(q: Quaternion, v: Vector3): Vector3;
	static applyToVector(q: Quaternion, v: Vector4): Vector4;
	static applyToVector(q: Quaternion, v: Vector3 | Vector4) {
		const { x, y, z } = v;
		const { x: qx, y: qy, z: qz, w: qw } = q;

		// calculate quat * vec
		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = -qx * x - qy * y - qz * z;

		// calculate result * inverse quat
		v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
		return v;
	}

	static transformVector(q: Quaternion, v: Vector3): Vector3;
	static transformVector(q: Quaternion, v: Vector4): Vector4;
	static transformVector(q: Quaternion, v: Vector3 | Vector4) {
		// TS doesn't like the clone call result, so we force it
		return Quaternion.applyToVector(q, v.clone() as any) as typeof v;
	}

	static slerp(from: Quaternion, to: Quaternion, t: number, easing: EasingFn = Easing.linear) {
		t = easing(clamp01f(t));
		return Quaternion.slerpUnclamped(from, to, t);
	}

	static slerpUnclamped(a: Quaternion, b: Quaternion, t: number) {
		const { x: ax, y: ay, z: az, w: aw } = a;
		let { x: bx, y: by, z: bz, w: bw } = b;

		// calc cosine
		let cosom = ax * bx + ay * by + az * bz + aw * bw;
		// adjust signs (if necessary)
		if (cosom < 0) {
			cosom = -cosom;
			bx = - bx;
			by = - by;
			bz = - bz;
			bw = - bw;
		}

		// calculate coefficients
		let scale0, scale1;
		if ((1 - cosom) > VEC_EPSILON) {
			// standard case (slerp)
			const omega = Math.acos(cosom);
			const sinom = Math.sin(omega);
			scale0 = Math.sin((1 - t) * omega) / sinom;
			scale1 = Math.sin(t * omega) / sinom;
		}
		else {
			// "from" and "to" quaternions are very close so we can do a linear interpolation
			scale0 = 1 - t;
			scale1 = t;
		}

		return new Quaternion(
			scale0 * ax + scale1 * bx,
			scale0 * ay + scale1 * by,
			scale0 * az + scale1 * bz,
			scale0 * aw + scale1 * bw
		);
	}

	// static constructors

	static fromVector3(vec: Vector3) {
		const { x, y, z } = vec;
		return new Quaternion(
			x, y, z,
			Math.sqrt(Math.abs(1 - x * x - y * y - z * z))
		);
	}

	static fromVector4(vec: Vector4) {
		return new Quaternion(vec.x, vec.y, vec.z, vec.w);
	}

	static fromAxisAngle(axis: Vector3, angleDegrees: number) {
		return new Quaternion().setAxisAngle(axis, angleDegrees);
	}

	static fromRotationTo(from: Vector3, to: Vector3) {
		return new Quaternion().setFromToRotation(from, to);
	}

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 4) {
			throw new RangeError(`Cannot get 4 values starting at offset ${offset} (out of bounds)`);
		}
		return new Quaternion(arr[offset], arr[offset + 1], arr[offset + 2], arr[offset + 3]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		const z = iter.next();
		const w = iter.next();
		if (x.done || y.done || z.done || w.done) {
			throw new RangeError("Could not get 4 values out of iterator");
		}
		return new Quaternion(x.value, y.value, z.value, w.value);
	}

	static get identity() {
		return new Quaternion(0, 0, 0, 1);
	}
}
