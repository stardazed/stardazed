/**
 * vector/vector2 - 2-element vector type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { clamp01f, clampf, rad2deg, EasingFn } from "stardazed/core";
import { VEC_EPSILON } from "./common";

export class Vec2 {
	x: number;
	y: number;

	constructor();
	constructor(x: number, y: number);
	constructor(x?: number, y?: number) {
		this.x = x ?? 0;
		this.y = y ?? 0;
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === "number") {
			return NaN;
		}
		return `Vec2 {x: ${this.x}, y: ${this.y}}`;
	}

	get 0() { return this.x; }
	set 0(x) { this.x = x; }
	get 1() { return this.y; }
	set 1(y) { this.y = y; }

	asArray() {
		return [this.x, this.y];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y);
	}

	writeInArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		return this;
	}

	clone() {
		return new Vec2(this.x, this.y);
	}

	set(to: Vec2) {
		this.x = to.x;
		this.y = to.y;
		return this;
	}

	add(other: Vec2) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	scaledAdd(other: Vec2, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		return this;
	}

	sub(other: Vec2) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	subFrom(other: Vec2) {
		this.x = other.x - this.x;
		this.y = other.y - this.y;
		return this;
	}

	mul(other: Vec2) {
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}

	div(other: Vec2) {
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}

	divBy(other: Vec2) {
		this.x = other.x / this.x;
		this.y = other.y / this.y;
		return this;
	}

	scale(factor: number) {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	negate() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}

	inverse() {
		this.x = 1.0 / this.x;
		this.y = 1.0 / this.y;
		return this;
	}

	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}

	get magnitude() {
		const { x, y } = this;
		return Math.sqrt(x * x + y * y);
	}

	get sqrMagnitude() {
		const { x, y } = this;
		return x * x + y * y;
	}

	normalize() {
		const { x, y } = this;
		let len = x * x + y * y;
		if (len > 0) {
			len = 1.0 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		return this;
	}

	get normalized() {
		return this.clone().normalize();
	}

	get perpendicular() {
		return new Vec2(-this.y, this.x);
	}

	get signs() {
		return new Vec2(Math.sign(this.x), Math.sign(this.y));
	}

	clamp(min: number, max: number) {
		this.x = clampf(this.x, min, max);
		this.y = clampf(this.y, min, max);
		return this;
	}

	clamp01() {
		this.x = clamp01f(this.x);
		this.y = clamp01f(this.y);
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
		return this;
	}

	// static operations

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 2) {
			throw new RangeError(`Cannot get 2 values starting at offset ${offset} (out of bounds)`);
		}
		new Vec2(arr[offset], arr[offset + 1]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		if (x.done || y.done) {
			throw new RangeError("Could not get 2 values out of iterator");
		}
		return new Vec2(x.value, y.value);
	}

	static angle(a: Vec2, b: Vec2) {
		return Math.abs(Vec2.signedAngle(a, b));
	}

	static signedAngle(a: Vec2, b: Vec2) {
		const cosAngle = Vec2.dot(a, b) / (a.magnitude * b.magnitude);
		const rad = Math.acos(cosAngle);
		return rad2deg(rad);
	}

	static distance(a: Vec2, b: Vec2) {
		return Vec2.sub(a, b).magnitude;
	}

	static dot(a: Vec2, b: Vec2) {
		return a.x * b.x + a.y * b.y;
	}

	static min(a: Vec2, b: Vec2) {
		return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}

	static max(a: Vec2, b: Vec2) {
		return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	static lerp(from: Vec2, to: Vec2, t: number) {
		t = clamp01f(t);
		return Vec2.sub(to, from).scale(t).add(from);
	}

	static lerpUnclamped(from: Vec2, to: Vec2, t: number) {
		return Vec2.sub(to, from).scale(t).add(from);
	}

	static interpolate(from: Vec2, to: Vec2, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vec2.sub(to, from).scale(t).add(from);
	}

	static moveTowards(current: Vec2, target: Vec2, maxDistanceDelta: number) {
		const diff = Vec2.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vec2.scaledAdd(current, diff, distToMove);
	}

	static reflect(a: Vec2, normal: Vec2) {
		const out = normal.clone().scale(2.0 * Vec2.dot(a, normal));
		return out.subFrom(a);
	}

	static exactEquals(a: Vec2, b: Vec2) {
		return a.x === b.x && a.y === b.y;
	}

	static equals(a: Vec2, b: Vec2) {
		const ax = a.x, ay = a.y;
		const bx = b.x, by = b.y;
		return (Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1.0, Math.abs(ax), Math.abs(bx)) &&
				Math.abs(ay - by) <= VEC_EPSILON * Math.max(1.0, Math.abs(ay), Math.abs(by)));
	}

	static add(a: Vec2, b: Vec2) {
		return a.clone().add(b);
	}

	static scaledAdd(a: Vec2, b: Vec2, factor: number) {
		return new Vec2(
			a.x + b.x * factor,
			a.y + b.y * factor
		);
	}

	static sub(a: Vec2, b: Vec2) {
		return a.clone().sub(b);
	}

	static mul(a: Vec2, b: Vec2) {
		return a.clone().mul(b);
	}

	static div(a: Vec2, b: Vec2) {
		return a.clone().div(b);
	}

	// shorthand static constructors

	static get zero() {
		return new Vec2(0, 0);
	}

	static get one() {
		return new Vec2(1, 1);
	}

	static get left() {
		return new Vec2(-1, 0);
	}

	static get right() {
		return new Vec2(1, 0);
	}

	static get up() {
		return new Vec2(0, 1);
	}

	static get down() {
		return new Vec2(0, -1);
	}

	static get negativeInfinity() {
		return new Vec2(-Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vec2(Infinity, Infinity);
	}
}
