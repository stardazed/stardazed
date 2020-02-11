/*
vector/vector3 - 3-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clampf, clamp01f, EasingFn, mixf } from "stardazed/core";
import { VEC_EPSILON } from "./common";
import { Vector2 } from "./vector2";

export class Vector3 {
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
		return `Vector3 {x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
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
		return new Vector3(this.x, this.y, this.z);
	}

	set(to: Vector3) {
		this.x = to.x;
		this.y = to.y;
		this.z = to.z;
		return this;
	}

	add(other: Vector3) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	mulAdd(other: Vector3, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		this.z += other.z * factor;
		return this;
	}

	sub(other: Vector3) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	subFrom(other: Vector3) {
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

	scale(factors: Vector3) {
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
		return new Vector3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z));
	}

	// sub-vector access

	get xy() {
		return new Vector2(this.x, this.y);
	}
	set xy(xy: Vector2) {
		this.x = xy.x;
		this.y = xy.y;
	}

	get xz() {
		return new Vector2(this.x, this.z);
	}
	set xz(xz: Vector2) {
		this.x = xz.x;
		this.z = xz.y;
	}

	// static operations

	static fromVec2(vec: Vector2, z = 0) {
		return new Vector3(vec.x, vec.y, z);
	}

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 3) {
			throw new RangeError(`Cannot get 3 values starting at offset ${offset} (out of bounds)`);
		}
		return new Vector3(arr[offset], arr[offset + 1], arr[offset + 2]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		const z = iter.next();
		if (x.done || y.done || z.done) {
			throw new RangeError("Could not get 3 values out of iterator");
		}
		return new Vector3(x.value, y.value, z.value);
	}

	static random(from = 0, to = 1) {
		const range = to - from;
		return new Vector3(
			from + Math.random() * range,
			from + Math.random() * range,
			from + Math.random() * range
		);
	}

	static add(a: Vector3, b: Vector3) {
		return a.clone().add(b);
	}

	static mulAdd(a: Vector3, b: Vector3, factor: number) {
		return new Vector3(
			a.x + b.x * factor,
			a.y + b.y * factor,
			a.z + b.z * factor
		);
	}

	static sub(a: Vector3, b: Vector3) {
		return a.clone().sub(b);
	}

	static mul(a: Vector3, factor: number) {
		return a.clone().mul(factor);
	}

	static div(a: Vector3, factor: number) {
		return a.clone().div(factor);
	}

	static scale(a: Vector3, b: Vector3) {
		return new Vector3(
			a.x * b.x,
			a.y * b.y,
			a.z * b.z,
		);
	}

	static distance(a: Vector3, b: Vector3) {
		return Vector3.sub(a, b).magnitude;
	}

	static dot(a: Vector3, b: Vector3) {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	static cross(a: Vector3, b: Vector3) {
		return new Vector3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}

	static min(a: Vector3, b: Vector3) {
		return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
	}

	static max(a: Vector3, b: Vector3) {
		return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
	}

	static mix(a: Vector3, b: Vector3, ratio: number) {
		return new Vector3(
			mixf(a.x, b.x, ratio),
			mixf(a.y, b.y, ratio),
			mixf(a.z, b.z, ratio)
		);
	}

	static lerp(from: Vector3, to: Vector3, t: number) {
		t = clamp01f(t);
		return Vector3.sub(to, from).mul(t).add(from);
	}

	static lerpUnclamped(from: Vector3, to: Vector3, t: number) {
		return Vector3.sub(to, from).mul(t).add(from);
	}

	static interpolate(from: Vector3, to: Vector3, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vector3.sub(to, from).mul(t).add(from);
	}

	static moveTowards(current: Vector3, target: Vector3, maxDistanceDelta: number) {
		const diff = Vector3.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vector3.mulAdd(current, diff, distToMove);
	}

	static reflect(a: Vector3, normal: Vector3) {
		const out = normal.clone().mul(2.0 * Vector3.dot(a, normal));
		return out.subFrom(a);
	}

	static exactEquals(a: Vector3, b: Vector3) {
		return a.x === b.x && a.y === b.y && a.z === b.z;
	}

	static equals(a: Vector3, b: Vector3) {
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
		return new Vector3(0, 0, 0);
	}

	static get one() {
		return new Vector3(1, 1, 1);
	}

	static get left() {
		return new Vector3(-1, 0, 0);
	}

	static get right() {
		return new Vector3(1, 0, 0);
	}

	static get up() {
		return new Vector3(0, 1, 0);
	}

	static get down() {
		return new Vector3(0, -1, 0);
	}

	static get forward() {
		return new Vector3(0, 0, 1);
	}

	static get back() {
		return new Vector3(0, 0, -1);
	}

	static get negativeInfinity() {
		return new Vector3(-Infinity, -Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vector3(Infinity, Infinity, Infinity);
	}
}
