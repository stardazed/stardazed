/*
vector/vector4 - 4-element vector type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clamp01f, clampf, mixf, EasingFn, Easing } from "stardazed/core";
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

	clone() {
		return new Vector4(this.x, this.y, this.z, this.w);
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

	setFromVector4(src: Vector4) {
		this.x = src.x;
		this.y = src.y;
		this.z = src.z;
		this.w = src.w;
		return this;
	}

	add(v: Vector4) {
		return new Vector4(
			this.x + v.x,
			this.y + v.y,
			this.z + v.z,
			this.w + v.w
		);
	}

	mulAdd(v: Vector4, factor: number) {
		return new Vector4(
			this.x + v.x * factor,
			this.y + v.y * factor,
			this.z + v.z * factor,
			this.w + v.w * factor
		);
	}

	sub(v: Vector4) {
		return new Vector4(
			this.x - v.x,
			this.y - v.y,
			this.z - v.z,
			this.w - v.w
		);
	}

	mul(factor: number) {
		return new Vector4(
			this.x * factor,
			this.y * factor,
			this.z * factor,
			this.w * factor
		);
	}

	div(factor: number) {
		return new Vector4(
			this.x / factor,
			this.y / factor,
			this.z / factor,
			this.w / factor
		);
	}

	scale(factors: Vector4) {
		return new Vector4(
			this.x * factors.x,
			this.y * factors.y,
			this.z * factors.z,
			this.w * factors.w
		);
	}

	negate() {
		return new Vector4(
			-this.x,
			-this.y,
			-this.z,
			-this.w
		);
	}

	inverse() {
		return new Vector4(
			1 / this.x,
			1 / this.y,
			1 / this.z,
			1 / this.w
		);
	}

	ceil() {
		return new Vector4(
			Math.ceil(this.x),
			Math.ceil(this.y),
			Math.ceil(this.z),
			Math.ceil(this.w)
		);
	}

	floor() {
		return new Vector4(
			Math.floor(this.x),
			Math.floor(this.y),
			Math.floor(this.z),
			Math.floor(this.w)
		);
	}

	round() {
		return new Vector4(
			Math.round(this.x),
			Math.round(this.y),
			Math.round(this.z),
			Math.round(this.w)
		);
	}

	clamp(min: number, max: number) {
		return new Vector4(
			clampf(this.x, min, max),
			clampf(this.y, min, max),
			clampf(this.z, min, max),
			clampf(this.w, min, max)
		);
	}

	clamp01() {
		return new Vector4(
			clamp01f(this.x),
			clamp01f(this.y),
			clamp01f(this.z),
			clamp01f(this.w)
		);
	}

	clampMagnitude(maxLength: number) {
		const curMag = this.magnitude;
		if (curMag <= maxLength) {
			return this;
		}
		const scale = maxLength / curMag;
		return new Vector4(
			this.x * scale,
			this.y * scale,
			this.z * scale,
			this.w * scale
		);
	}

	distance(to: Vector4) {
		return to.sub(this).magnitude;
	}

	sqrDistance(to: Vector4) {
		return to.sub(this).sqrMagnitude;
	}

	dot(v: Vector4) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	mix(v: Vector4, ratio: number) {
		return new Vector4(
			mixf(this.x, v.x, ratio),
			mixf(this.y, v.y, ratio),
			mixf(this.z, v.z, ratio),
			mixf(this.w, v.w, ratio)
		);
	}

	setNormalized() {
		const { x, y, z, w } = this;
		let len = x * x + y * y + z * z + w * w;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		this.z *= len;
		this.w *= len;
		return this;
	}

	normalize() {
		return this.clone().setNormalized();
	}

	get magnitude() {
		const { x, y, z, w } = this;
		return Math.sqrt(x * x + y * y + z * z + w * w);
	}

	get sqrMagnitude() {
		const { x, y, z, w } = this;
		return x * x + y * y + z * z + w * w;
	}

	get signs() {
		return new Vector4(
			Math.sign(this.x),
			Math.sign(this.y),
			Math.sign(this.z),
			Math.sign(this.z)
		);
	}

	moveTowards(target: Vector4, maxDistanceDelta: number) {
		const diff = target.sub(this);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return this.mulAdd(diff, distToMove);
	}

	exactEquals(v: Vector4) {
		return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
	}

	equals(v: Vector4) {
		const ax = this.x, ay = this.y, az = this.z, aw = this.w;
		const bx = v.x, by = v.y, bz = v.z, bw = v.w;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1, Math.abs(ay), Math.abs(by)) &&
			Math.abs(az - bz) <= VEC_EPSILON * Math.max(1, Math.abs(az), Math.abs(bz)) &&
			Math.abs(aw - bw) <= VEC_EPSILON * Math.max(1, Math.abs(aw), Math.abs(bw))
		);
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

	static min(a: Vector4, b: Vector4) {
		return new Vector4(
			Math.min(a.x, b.x),
			Math.min(a.y, b.y),
			Math.min(a.z, b.z),
			Math.min(a.w, b.w)
		);
	}

	static max(a: Vector4, b: Vector4) {
		return new Vector4(
			Math.max(a.x, b.x),
			Math.max(a.y, b.y),
			Math.max(a.z, b.z),
			Math.max(a.w, b.w)
		);
	}

	static lerp(from: Vector4, to: Vector4, t: number, easing: EasingFn = Easing.linear) {
		t = easing(clamp01f(t));
		return from.mulAdd(to.sub(from), t);
	}

	static lerpUnclamped(from: Vector4, to: Vector4, t: number) {
		return from.mulAdd(to.sub(from), t);
	}

	// static constructors

	static fromVector2(vec: Vector2, z = 0, w = 0) {
		return new Vector4(vec.x, vec.y, z, w);
	}

	static fromVector3(vec: Vector3, w = 0) {
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

	static random(min = 0, max = 1) {
		const range = max - min;
		return new Vector4(
			min + Math.random() * range,
			min + Math.random() * range,
			min + Math.random() * range,
			min + Math.random() * range
		);
	}

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
