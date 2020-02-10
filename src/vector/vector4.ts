/*
vector/vector4 - 4-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clampf, clamp01f, EasingFn, mixf } from "stardazed/core";
import { VEC_EPSILON } from "common";
import { Vec2 } from "vector2";
import { Vec3 } from "vector3";

export class Vec4 {
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
		this.w = w ?? 0;
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
		return `Vec4 {x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w}}`;
	}

	get 0() { return this.x; }
	set 0(x) { this.x = x; }
	get 1() { return this.y; }
	set 1(y) { this.y = y; }
	get 2() { return this.z; }
	set 2(z) { this.z = z; }
	get 3() { return this.w; }
	set 3(w) { this.w = w; }

	asArray() {
		return [this.x, this.y, this.z, this.w];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y, this.z, this.w);
	}

	writeInArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		arr[offset + 2] = this.z;
		arr[offset + 3] = this.w;
		return this;
	}

	clone() {
		return new Vec4(this.x, this.y, this.z, this.w);
	}

	set(to: Vec4) {
		this.x = to.x;
		this.y = to.y;
		this.z = to.z;
		this.w = to.w;
		return this;
	}

	add(other: Vec4) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		this.w += other.w;
		return this;
	}

	mulAdd(other: Vec4, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		this.z += other.z * factor;
		this.w += other.w * factor;
		return this;
	}

	sub(other: Vec4) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		this.w -= other.w;
		return this;
	}

	subFrom(other: Vec4) {
		this.x = other.x - this.x;
		this.y = other.y - this.y;
		this.z = other.z - this.z;
		this.w = other.w - this.w;
		return this;
	}

	mul(factor: number) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;
		this.w *= factor;
		return this;
	}

	div(factor: number) {
		this.x /= factor;
		this.y /= factor;
		this.z /= factor;
		this.w /= factor;
		return this;
	}

	scale(factors: Vec4) {
		this.x *= factors.x;
		this.y *= factors.y;
		this.z *= factors.z;
		this.w *= factors.w;
		return this;
	}

	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.w = -this.w;
		return this;
	}

	inverse() {
		this.x = 1.0 / this.x;
		this.y = 1.0 / this.y;
		this.z = 1.0 / this.z;
		this.w = 1.0 / this.w;
		return this;
	}

	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		this.w = Math.ceil(this.w);
		return this;
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		this.w = Math.floor(this.w);
		return this;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		this.w = Math.round(this.w);
		return this;
	}

	clamp(min: number, max: number) {
		this.x = clampf(this.x, min, max);
		this.y = clampf(this.y, min, max);
		this.z = clampf(this.z, min, max);
		this.w = clampf(this.w, min, max);
		return this;
	}

	clamp01() {
		this.x = clamp01f(this.x);
		this.y = clamp01f(this.y);
		this.z = clamp01f(this.z);
		this.w = clamp01f(this.w);
		return this;
	}

	clampMagnitude(maxLength: number) {
		const curMag = this.magnitude;
		if (curMag <= maxLength) {
			return this;
		}
		const scale = maxLength / curMag;
		this.x *= scale;
		this.y *= scale;
		this.z *= scale;
		this.w *= scale;
		return this;
	}

	get magnitude() {
		const { x, y, z, w } = this;
		return Math.sqrt(x * x + y * y + z * z + w * w);
	}

	get sqrMagnitude() {
		const { x, y, z, w } = this;
		return x * x + y * y + z * z + w * w;
	}

	normalize() {
		const { x, y, z, w } = this;
		let len = x * x + y * y + z * z + w * w;
		if (len > 0) {
			len = 1.0 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		this.z *= len;
		this.w *= len;
		return this;
	}

	get normalized() {
		return this.clone().normalize();
	}

	get signs() {
		return new Vec4(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z), Math.sign(this.z));
	}

	// sub-vector access

	get xy() {
		return new Vec2(this.x, this.y);
	}
	set xy(xy: Vec2) {
		this.x = xy.x;
		this.y = xy.y;
	}

	get xyz() {
		return new Vec3(this.x, this.y, this.z);
	}
	set xyz(xyz: Vec3) {
		this.x = xyz.x;
		this.y = xyz.y;
		this.z = xyz.z;
	}

	// static operations

	static fromVec2(vec: Vec2, z = 0, w = 0) {
		return new Vec4(vec.x, vec.y, z, w);
	}

	static fromVec3(vec: Vec3, w = 0) {
		return new Vec4(vec.x, vec.y, vec.z, w);
	}

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 4) {
			throw new RangeError(`Cannot get 4 values starting at offset ${offset} (out of bounds)`);
		}
		new Vec4(arr[offset], arr[offset + 1], arr[offset + 2], arr[offset + 3]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		const z = iter.next();
		const w = iter.next();
		if (x.done || y.done || z.done  || w.done) {
			throw new RangeError("Could not get 4 values out of iterator");
		}
		return new Vec4(x.value, y.value, z.value, w.value);
	}

	static random(from = 0, to = 1) {
		const range = to - from;
		return new Vec4(
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range
		);
	}

	static add(a: Vec4, b: Vec4) {
		return a.clone().add(b);
	}

	static mulAdd(a: Vec4, b: Vec4, factor: number) {
		return new Vec4(
			a.x + b.x * factor,
			a.y + b.y * factor,
			a.z + b.z * factor,
			a.w + b.w * factor
		);
	}

	static sub(a: Vec4, b: Vec4) {
		return a.clone().sub(b);
	}

	static mul(a: Vec4, factor: number) {
		return a.clone().mul(factor);
	}

	static div(a: Vec4, factor: number) {
		return a.clone().div(factor);
	}

	static scale(a: Vec4, b: Vec4) {
		return new Vec4(
			a.x * b.x,
			a.y * b.y,
			a.z * b.z,
			a.w * b.w
		);
	}

	static distance(a: Vec4, b: Vec4) {
		return Vec4.sub(a, b).magnitude;
	}

	static dot(a: Vec4, b: Vec4) {
		return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
	}

	static min(a: Vec4, b: Vec4) {
		return new Vec4(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z), Math.min(a.w, b.w));
	}

	static max(a: Vec4, b: Vec4) {
		return new Vec4(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z), Math.max(a.w, b.w));
	}

	static mix(a: Vec4, b: Vec4, ratio: number) {
		return new Vec4(
			mixf(a.x, b.x, ratio),
			mixf(a.y, b.y, ratio),
			mixf(a.z, b.z, ratio),
			mixf(a.w, b.w, ratio)
		);
	}

	static lerp(from: Vec4, to: Vec4, t: number) {
		t = clamp01f(t);
		return Vec4.sub(to, from).mul(t).add(from);
	}

	static lerpUnclamped(from: Vec4, to: Vec4, t: number) {
		return Vec4.sub(to, from).mul(t).add(from);
	}

	static interpolate(from: Vec4, to: Vec4, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vec4.sub(to, from).mul(t).add(from);
	}

	static moveTowards(current: Vec4, target: Vec4, maxDistanceDelta: number) {
		const diff = Vec4.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vec4.mulAdd(current, diff, distToMove);
	}

	static exactEquals(a: Vec4, b: Vec4) {
		return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
	}

	static equals(a: Vec4, b: Vec4) {
		const ax = a.x, ay = a.y, az = a.z, aw = a.w;
		const bx = b.x, by = b.y, bz = b.z, bw = b.w;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1.0, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1.0, Math.abs(ay), Math.abs(by)) &&
			Math.abs(az - bz) <= VEC_EPSILON * Math.max(1.0, Math.abs(az), Math.abs(bz)) &&
			Math.abs(aw - bw) <= VEC_EPSILON * Math.max(1.0, Math.abs(aw), Math.abs(bw))
		);
	}

	// shorthand static constructors

	static get zero() {
		return new Vec4(0, 0, 0, 0);
	}

	static get one() {
		return new Vec4(1, 1, 1, 1);
	}

	static get negativeInfinity() {
		return new Vec4(-Infinity, -Infinity, -Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vec4(Infinity, Infinity, Infinity, Infinity);
	}
}
