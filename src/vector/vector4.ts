/*
vector/vector4 - 4-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clampf, clamp01f, EasingFn, mixf } from "stardazed/core";
import { VEC_EPSILON } from "./common";
import { Vector2 } from "./vector2";
import { Vector3 } from "./vector3";

export class Vector4 {
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
		return `Vector4 {x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w}}`;
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

	readFromArray(arr: NumArray, offset: number) {
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

	clone() {
		return new Vector4(this.x, this.y, this.z, this.w);
	}

	set(to: Vector4) {
		this.x = to.x;
		this.y = to.y;
		this.z = to.z;
		this.w = to.w;
		return this;
	}

	add(other: Vector4) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		this.w += other.w;
		return this;
	}

	mulAdd(other: Vector4, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		this.z += other.z * factor;
		this.w += other.w * factor;
		return this;
	}

	sub(other: Vector4) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		this.w -= other.w;
		return this;
	}

	subFrom(other: Vector4) {
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

	scale(factors: Vector4) {
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
		return new Vector4(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z), Math.sign(this.z));
	}

	// sub-vector access

	get xy() {
		return new Vector2(this.x, this.y);
	}
	set xy(xy: Vector2) {
		this.x = xy.x;
		this.y = xy.y;
	}

	get xyz() {
		return new Vector3(this.x, this.y, this.z);
	}
	set xyz(xyz: Vector3) {
		this.x = xyz.x;
		this.y = xyz.y;
		this.z = xyz.z;
	}

	// static operations

	static fromVec2(vec: Vector2, z = 0, w = 0) {
		return new Vector4(vec.x, vec.y, z, w);
	}

	static fromVec3(vec: Vector3, w = 0) {
		return new Vector4(vec.x, vec.y, vec.z, w);
	}

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 4) {
			throw new RangeError(`Cannot get 4 values starting at offset ${offset} (out of bounds)`);
		}
		return new Vector4(arr[offset], arr[offset + 1], arr[offset + 2], arr[offset + 3]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		const z = iter.next();
		const w = iter.next();
		if (x.done || y.done || z.done  || w.done) {
			throw new RangeError("Could not get 4 values out of iterator");
		}
		return new Vector4(x.value, y.value, z.value, w.value);
	}

	static random(from = 0, to = 1) {
		const range = to - from;
		return new Vector4(
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range
		);
	}

	static add(a: Vector4, b: Vector4) {
		return a.clone().add(b);
	}

	static mulAdd(a: Vector4, b: Vector4, factor: number) {
		return new Vector4(
			a.x + b.x * factor,
			a.y + b.y * factor,
			a.z + b.z * factor,
			a.w + b.w * factor
		);
	}

	static sub(a: Vector4, b: Vector4) {
		return a.clone().sub(b);
	}

	static mul(a: Vector4, factor: number) {
		return a.clone().mul(factor);
	}

	static div(a: Vector4, factor: number) {
		return a.clone().div(factor);
	}

	static scale(a: Vector4, b: Vector4) {
		return new Vector4(
			a.x * b.x,
			a.y * b.y,
			a.z * b.z,
			a.w * b.w
		);
	}

	static distance(a: Vector4, b: Vector4) {
		return Vector4.sub(a, b).magnitude;
	}

	static dot(a: Vector4, b: Vector4) {
		return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
	}

	static min(a: Vector4, b: Vector4) {
		return new Vector4(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z), Math.min(a.w, b.w));
	}

	static max(a: Vector4, b: Vector4) {
		return new Vector4(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z), Math.max(a.w, b.w));
	}

	static mix(a: Vector4, b: Vector4, ratio: number) {
		return new Vector4(
			mixf(a.x, b.x, ratio),
			mixf(a.y, b.y, ratio),
			mixf(a.z, b.z, ratio),
			mixf(a.w, b.w, ratio)
		);
	}

	static lerp(from: Vector4, to: Vector4, t: number) {
		t = clamp01f(t);
		return Vector4.sub(to, from).mul(t).add(from);
	}

	static lerpUnclamped(from: Vector4, to: Vector4, t: number) {
		return Vector4.sub(to, from).mul(t).add(from);
	}

	static interpolate(from: Vector4, to: Vector4, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vector4.sub(to, from).mul(t).add(from);
	}

	static moveTowards(current: Vector4, target: Vector4, maxDistanceDelta: number) {
		const diff = Vector4.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vector4.mulAdd(current, diff, distToMove);
	}

	static exactEquals(a: Vector4, b: Vector4) {
		return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
	}

	static equals(a: Vector4, b: Vector4) {
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
		return new Vector4(0, 0, 0, 0);
	}

	static get one() {
		return new Vector4(1, 1, 1, 1);
	}

	static get negativeInfinity() {
		return new Vector4(-Infinity, -Infinity, -Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vector4(Infinity, Infinity, Infinity, Infinity);
	}
}
