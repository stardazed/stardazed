/*
vector/vector3 - 3-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clampf, clamp01f, EasingFn, mixf } from "stardazed/core";
import { VEC_EPSILON } from "common";
import { Vec2 } from "vector2";

export class Vec3 {
	x: number;
	y: number;
	z: number;

	constructor();
	constructor(x: number, y: number, z: number);
	constructor(x?: number, y?: number, z?: number) {
		this.x = x ?? 0;
		this.y = y ?? 0;
		this.z = z ?? 0;
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "number") {
			return NaN;
		}
		return `Vec3 {x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
	}

	get 0() { return this.x; }
	set 0(x) { this.x = x; }
	get 1() { return this.y; }
	set 1(y) { this.y = y; }
	get 2() { return this.z; }
	set 2(z) { this.z = z; }

	asArray() {
		return [this.x, this.y, this.z];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y, this.z);
	}

	readFromArray(arr: NumArray, offset: number) {
		this.x = arr[offset];
		this.y = arr[offset + 1];
		this.z = arr[offset + 2];
		return this;
	}

	writeToArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		arr[offset + 2] = this.z;
		return this;
	}

	clone() {
		return new Vec3(this.x, this.y, this.z);
	}

	set(to: Vec3) {
		this.x = to.x;
		this.y = to.y;
		this.z = to.z;
		return this;
	}

	add(other: Vec3) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	mulAdd(other: Vec3, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		this.z += other.z * factor;
		return this;
	}

	sub(other: Vec3) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	subFrom(other: Vec3) {
		this.x = other.x - this.x;
		this.y = other.y - this.y;
		this.z = other.z - this.z;
		return this;
	}

	mul(factor: number) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;
		return this;
	}

	div(factor: number) {
		this.x /= factor;
		this.y /= factor;
		this.z /= factor;
		return this;
	}

	scale(factors: Vec3) {
		this.x *= factors.x;
		this.y *= factors.y;
		this.z *= factors.z;
		return this;
	}

	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	}

	inverse() {
		this.x = 1.0 / this.x;
		this.y = 1.0 / this.y;
		this.z = 1.0 / this.z;
		return this;
	}

	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		return this;
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	}

	clamp(min: number, max: number) {
		this.x = clampf(this.x, min, max);
		this.y = clampf(this.y, min, max);
		this.z = clampf(this.z, min, max);
		return this;
	}

	clamp01() {
		this.x = clamp01f(this.x);
		this.y = clamp01f(this.y);
		this.z = clamp01f(this.z);
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
		return this;
	}

	get magnitude() {
		const { x, y, z } = this;
		return Math.sqrt(x * x + y * y + z * z);
	}

	get sqrMagnitude() {
		const { x, y, z } = this;
		return x * x + y * y + z * z;
	}

	normalize() {
		const { x, y , z } = this;
		let len = x * x + y * y + z * z;
		if (len > 0) {
			len = 1.0 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		this.z *= len;
		return this;
	}

	get normalized() {
		return this.clone().normalize();
	}

	get signs() {
		return new Vec3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z));
	}

	// sub-vector access

	get xy() {
		return new Vec2(this.x, this.y);
	}
	set xy(xy: Vec2) {
		this.x = xy.x;
		this.y = xy.y;
	}

	get xz() {
		return new Vec2(this.x, this.z);
	}
	set xz(xz: Vec2) {
		this.x = xz.x;
		this.z = xz.y;
	}

	// static operations

	static fromVec2(vec: Vec2, z = 0) {
		return new Vec3(vec.x, vec.y, z);
	}

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 3) {
			throw new RangeError(`Cannot get 3 values starting at offset ${offset} (out of bounds)`);
		}
		new Vec3(arr[offset], arr[offset + 1], arr[offset + 2]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		const z = iter.next();
		if (x.done || y.done || z.done) {
			throw new RangeError("Could not get 3 values out of iterator");
		}
		return new Vec3(x.value, y.value, z.value);
	}

	static random(from = 0, to = 1) {
		const range = to - from;
		return new Vec3(
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range
		);
	}

	static add(a: Vec3, b: Vec3) {
		return a.clone().add(b);
	}

	static mulAdd(a: Vec3, b: Vec3, factor: number) {
		return new Vec3(
			a.x + b.x * factor,
			a.y + b.y * factor,
			a.z + b.z * factor
		);
	}

	static sub(a: Vec3, b: Vec3) {
		return a.clone().sub(b);
	}

	static mul(a: Vec3, factor: number) {
		return a.clone().mul(factor);
	}

	static div(a: Vec3, factor: number) {
		return a.clone().div(factor);
	}

	static scale(a: Vec3, b: Vec3) {
		return new Vec3(
			a.x * b.x,
			a.y * b.y,
			a.z * b.z,
		);
	}

	static distance(a: Vec3, b: Vec3) {
		return Vec3.sub(a, b).magnitude;
	}

	static dot(a: Vec3, b: Vec3) {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	static cross(a: Vec3, b: Vec3) {
		return new Vec3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}

	static min(a: Vec3, b: Vec3) {
		return new Vec3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
	}

	static max(a: Vec3, b: Vec3) {
		return new Vec3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
	}

	static mix(a: Vec3, b: Vec3, ratio: number) {
		return new Vec3(
			mixf(a.x, b.x, ratio),
			mixf(a.y, b.y, ratio),
			mixf(a.z, b.z, ratio)
		);
	}

	static lerp(from: Vec3, to: Vec3, t: number) {
		t = clamp01f(t);
		return Vec3.sub(to, from).mul(t).add(from);
	}

	static lerpUnclamped(from: Vec3, to: Vec3, t: number) {
		return Vec3.sub(to, from).mul(t).add(from);
	}

	static interpolate(from: Vec3, to: Vec3, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vec3.sub(to, from).mul(t).add(from);
	}

	static moveTowards(current: Vec3, target: Vec3, maxDistanceDelta: number) {
		const diff = Vec3.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vec3.mulAdd(current, diff, distToMove);
	}

	static reflect(a: Vec3, normal: Vec3) {
		const out = normal.clone().mul(2.0 * Vec3.dot(a, normal));
		return out.subFrom(a);
	}

	static exactEquals(a: Vec3, b: Vec3) {
		return a.x === b.x && a.y === b.y && a.z === b.z;
	}

	static equals(a: Vec3, b: Vec3) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1.0, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1.0, Math.abs(ay), Math.abs(by)) &&
			Math.abs(az - bz) <= VEC_EPSILON * Math.max(1.0, Math.abs(az), Math.abs(bz))
		);
	}

	// shorthand static constructors

	static get zero() {
		return new Vec3(0, 0, 0);
	}

	static get one() {
		return new Vec3(1, 1, 1);
	}

	static get left() {
		return new Vec3(-1, 0, 0);
	}

	static get right() {
		return new Vec3(1, 0, 0);
	}

	static get up() {
		return new Vec3(0, 1, 0);
	}

	static get down() {
		return new Vec3(0, -1, 0);
	}

	static get forward() {
		return new Vec3(0, 0, 1);
	}

	static get back() {
		return new Vec3(0, 0, -1);
	}

	static get negativeInfinity() {
		return new Vec3(-Infinity, -Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vec3(Infinity, Infinity, Infinity);
	}
}
