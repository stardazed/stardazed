/*
vector/vector2 - 2-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clamp01f, clampf, rad2deg, EasingFn, mixf } from "stardazed/core";
import { VEC_EPSILON } from "./common";

export class Vector2 {
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
		return `Vector2 {x: ${this.x}, y: ${this.y}}`;
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

	readFromArray(arr: NumArray, offset: number) {
		this.x = arr[offset];
		this.y = arr[offset + 1];
		return this;
	}

	writeToArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		return this;
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	set(to: Vector2) {
		this.x = to.x;
		this.y = to.y;
		return this;
	}

	add(other: Vector2) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	mulAdd(other: Vector2, factor: number) {
		this.x += other.x * factor;
		this.y += other.y * factor;
		return this;
	}

	sub(other: Vector2) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	subFrom(other: Vector2) {
		this.x = other.x - this.x;
		this.y = other.y - this.y;
		return this;
	}

	mul(factor: number) {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	div(factor: number) {
		this.x /= factor;
		this.y /= factor;
		return this;
	}

	scale(factors: Vector2) {
		this.x *= factors.x;
		this.y *= factors.y;
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
		return new Vector2(-this.y, this.x);
	}

	get signs() {
		return new Vector2(Math.sign(this.x), Math.sign(this.y));
	}

	// static operations

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 2) {
			throw new RangeError(`Cannot get 2 values starting at offset ${offset} (out of bounds)`);
		}
		new Vector2(arr[offset], arr[offset + 1]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		if (x.done || y.done) {
			throw new RangeError("Could not get 2 values out of iterator");
		}
		return new Vector2(x.value, y.value);
	}

	static random(from = 0, to = 1) {
		const range = to - from;
		return new Vector2(
			from + Math.random() * range,
			from + Math.random() * range
		);
	}

	static add(a: Vector2, b: Vector2) {
		return a.clone().add(b);
	}

	static mulAdd(a: Vector2, b: Vector2, factor: number) {
		return new Vector2(
			a.x + b.x * factor,
			a.y + b.y * factor
		);
	}

	static sub(a: Vector2, b: Vector2) {
		return a.clone().sub(b);
	}

	static mul(a: Vector2, factor: number) {
		return a.clone().mul(factor);
	}

	static div(a: Vector2, factor: number) {
		return a.clone().div(factor);
	}

	static scale(a: Vector2, b: Vector2) {
		return new Vector2(
			a.x * b.x,
			a.y * b.y
		);
	}

	static angle(a: Vector2, b: Vector2) {
		return Math.abs(Vector2.signedAngle(a, b));
	}

	static signedAngle(a: Vector2, b: Vector2) {
		const cosAngle = Vector2.dot(a, b) / (a.magnitude * b.magnitude);
		const rad = Math.acos(cosAngle);
		return rad2deg(rad);
	}

	static distance(a: Vector2, b: Vector2) {
		return Vector2.sub(a, b).magnitude;
	}

	static dot(a: Vector2, b: Vector2) {
		return a.x * b.x + a.y * b.y;
	}

	static min(a: Vector2, b: Vector2) {
		return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}

	static max(a: Vector2, b: Vector2) {
		return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	static mix(a: Vector2, b: Vector2, ratio: number) {
		return new Vector2(
			mixf(a.x, b.x, ratio),
			mixf(a.y, b.y, ratio)
		);
	}

	static lerp(from: Vector2, to: Vector2, t: number) {
		t = clamp01f(t);
		return Vector2.sub(to, from).mul(t).add(from);
	}

	static lerpUnclamped(from: Vector2, to: Vector2, t: number) {
		return Vector2.sub(to, from).mul(t).add(from);
	}

	static interpolate(from: Vector2, to: Vector2, t: number, easing: EasingFn) {
		t = easing(clamp01f(t));
		return Vector2.sub(to, from).mul(t).add(from);
	}

	static moveTowards(current: Vector2, target: Vector2, maxDistanceDelta: number) {
		const diff = Vector2.sub(target, current);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return Vector2.mulAdd(current, diff, distToMove);
	}

	static reflect(a: Vector2, normal: Vector2) {
		const out = normal.clone().mul(2.0 * Vector2.dot(a, normal));
		return out.subFrom(a);
	}

	static exactEquals(a: Vector2, b: Vector2) {
		return a.x === b.x && a.y === b.y;
	}

	static equals(a: Vector2, b: Vector2) {
		const ax = a.x, ay = a.y;
		const bx = b.x, by = b.y;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1.0, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1.0, Math.abs(ay), Math.abs(by))
		);
	}

	// shorthand static constructors

	static get zero() {
		return new Vector2(0, 0);
	}

	static get one() {
		return new Vector2(1, 1);
	}

	static get left() {
		return new Vector2(-1, 0);
	}

	static get right() {
		return new Vector2(1, 0);
	}

	static get up() {
		return new Vector2(0, 1);
	}

	static get down() {
		return new Vector2(0, -1);
	}

	static get negativeInfinity() {
		return new Vector2(-Infinity, -Infinity);
	}

	static get positiveInfinity() {
		return new Vector2(Infinity, Infinity);
	}
}
