/*
vector/vector2 - 2-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clamp01f, clampf, rad2deg, mixf, EasingFn, Easing } from "stardazed/core";
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

	clone() {
		return new Vector2(this.x, this.y);
	}

	asArray() {
		return [this.x, this.y];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y);
	}

	setFromArray(arr: NumArray, offset: number) {
		this.x = arr[offset];
		this.y = arr[offset + 1];
		return this;
	}

	writeToArray(arr: MutNumArray, offset: number) {
		arr[offset] = this.x;
		arr[offset + 1] = this.y;
		return this;
	}

	setElements(x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}

	setFromVector2(src: Vector2) {
		this.x = src.x;
		this.y = src.y;
		return this;
	}

	add(v: Vector2) {
		return new Vector2(
			this.x + v.x,
			this.y + v.y
		);
	}

	mulAdd(v: Vector2, factor: number) {
		return new Vector2(
			this.x + v.x * factor,
			this.y + v.y * factor
		);
	}

	sub(v: Vector2) {
		return new Vector2(
			this.x - v.x,
			this.y - v.y
		);
	}

	mul(factor: number) {
		return new Vector2(
			this.x * factor,
			this.y * factor
		);
	}

	div(factor: number) {
		return new Vector2(
			this.x / factor,
			this.y / factor
		);
	}

	scale(factors: Vector2) {
		return new Vector2(
			this.x * factors.x,
			this.y * factors.y
		);
	}

	negate() {
		return new Vector2(
			-this.x,
			-this.y
		);
	}

	inverse() {
		return new Vector2(
			1 / this.x,
			1 / this.y
		);
	}

	ceil() {
		return new Vector2(
			Math.ceil(this.x),
			Math.ceil(this.y)
		);
	}

	floor() {
		return new Vector2(
			Math.floor(this.x),
			Math.floor(this.y)
		);
	}

	round() {
		return new Vector2(
			Math.round(this.x),
			Math.round(this.y)
		);
	}

	clamp(min: number, max: number): Vector2;
	clamp(min: Vector2, max: Vector2): Vector2;
	clamp(min: number | Vector2, max: number | Vector2) {
		if (typeof min === "number") {
			return new Vector2(
				clampf(this.x, min, max as number),
				clampf(this.y, min, max as number)
			);
		}
		return new Vector2(
			clampf(this.x, min.x, (max as Vector2).x),
			clampf(this.y, min.y, (max as Vector2).y)
		);
	}

	clamp01() {
		return new Vector2(
			clamp01f(this.x),
			clamp01f(this.y)
		);
	}

	clampMagnitude(maxLength: number) {
		const curMag = this.magnitude;
		if (curMag <= maxLength) {
			return this;
		}
		const scale = maxLength / curMag;
		return new Vector2(
			this.x * scale,
			this.y * scale
		);
	}

	distance(to: Vector2) {
		return to.sub(this).magnitude;
	}

	sqrDistance(to: Vector2) {
		return to.sub(this).sqrMagnitude;
	}

	dot(v: Vector2) {
		return this.x * v.x + this.y * v.y;
	}

	mix(v: Vector2, ratio: number) {
		return new Vector2(
			mixf(this.x, v.x, ratio),
			mixf(this.y, v.y, ratio)
		);
	}

	setNormalized() {
		const { x, y } = this;
		let len = x * x + y * y;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		return this;
	}

	normalize() {
		return this.clone().setNormalized();
	}

	get magnitude() {
		const { x, y } = this;
		return Math.sqrt(x * x + y * y);
	}

	get sqrMagnitude() {
		const { x, y } = this;
		return x * x + y * y;
	}

	get perpendicular() {
		return new Vector2(-this.y, this.x);
	}

	get signs() {
		return new Vector2(
			Math.sign(this.x),
			Math.sign(this.y)
		);
	}

	moveTowards(target: Vector2, maxDistanceDelta: number) {
		const diff = target.sub(this);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return this.mulAdd(diff, distToMove);
	}

	reflect(normal: Vector2) {
		const out = normal.clone().mul(2 * this.dot(normal));
		return this.sub(out);
	}

	exactEquals(v: Vector2) {
		return this.x === v.x && this.y === v.y;
	}

	equals(v: Vector2) {
		const ax = this.x, ay = this.y;
		const bx = v.x, by = v.y;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1, Math.abs(ay), Math.abs(by))
		);
	}

	// static operations

	static angle(a: Vector2, b: Vector2) {
		return Math.abs(Vector2.signedAngle(a, b));
	}

	static signedAngle(a: Vector2, b: Vector2) {
		const cosAngle = a.dot(b) / (a.magnitude * b.magnitude);
		const rad = Math.acos(cosAngle);
		return rad2deg(rad);
	}

	static min(a: Vector2, b: Vector2) {
		return new Vector2(
			Math.min(a.x, b.x),
			Math.min(a.y, b.y)
		);
	}

	static max(a: Vector2, b: Vector2) {
		return new Vector2(
			Math.max(a.x, b.x),
			Math.max(a.y, b.y)
		);
	}

	static lerp(from: Vector2, to: Vector2, t: number, easing: EasingFn = Easing.linear) {
		t = easing(clamp01f(t));
		return from.mulAdd(to.sub(from), t);
	}

	static lerpUnclamped(from: Vector2, to: Vector2, t: number) {
		return from.mulAdd(to.sub(from), t);
	}

	// static constructors

	static fromArray(arr: NumArray, offset = 0) {
		if (arr.length < offset + 2) {
			throw new RangeError(`Cannot get 2 values starting at offset ${offset} (out of bounds)`);
		}
		return new Vector2(arr[offset], arr[offset + 1]);
	}

	static from(iter: Iterator<number>) {
		const x = iter.next();
		const y = iter.next();
		if (x.done || y.done) {
			throw new RangeError("Could not get 2 values out of iterator");
		}
		return new Vector2(x.value, y.value);
	}

	static random(min = 0, max = 1) {
		const range = max - min;
		return new Vector2(
			min + Math.random() * range,
			min + Math.random() * range
		);
	}

	static splat(n: number) {
		return new Vector2(n, n);
	}

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
