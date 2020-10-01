/*
vector/vector3 - 3-element vector type
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clamp01f, clampf, mixf, EasingFn, Easing } from "stardazed/core";
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

	clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	asArray() {
		return [this.x, this.y, this.z];
	}

	asTypedArray(ctor: TypedArrayConstructor = Float32Array) {
		return ctor.of(this.x, this.y, this.z);
	}

	setFromArray(arr: NumArray, offset: number) {
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

	setElements(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	setFromVector3(src: Vector3) {
		this.x = src.x;
		this.y = src.y;
		this.z = src.z;
		return this;
	}

	add(v: Vector3) {
		return new Vector3(
			this.x + v.x,
			this.y + v.y,
			this.z + v.z
		);
	}

	setAdding(v: Vector3) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	mulAdd(v: Vector3, factor: number) {
		return new Vector3(
			this.x + v.x * factor,
			this.y + v.y * factor,
			this.z + v.z * factor
		);
	}

	setMultiplyAdding(v: Vector3, factor: number) {
		this.x += v.x * factor;
		this.y += v.y * factor;
		this.z += v.z * factor;
		return this;
	}

	sub(v: Vector3) {
		return new Vector3(
			this.x - v.x,
			this.y - v.y,
			this.z - v.z
		);
	}

	setSubtracting(v: Vector3) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}

	mul(factor: number) {
		return new Vector3(
			this.x * factor,
			this.y * factor,
			this.z * factor
		);
	}

	setMultiplying(factor: number) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;
		return this;
	}

	div(factor: number) {
		return new Vector3(
			this.x / factor,
			this.y / factor,
			this.z / factor
		);
	}

	setDividing(factor: number) {
		this.x /= factor;
		this.y /= factor;
		this.z /= factor;
		return this;
	}

	scale(factors: Vector3) {
		return new Vector3(
			this.x * factors.x,
			this.y * factors.y,
			this.z * factors.z
		);
	}

	setScaling(factors: Vector3) {
		this.x *= factors.x;
		this.y *= factors.y;
		this.z *= factors.z;
		return this;
	}

	negate() {
		return new Vector3(
			-this.x,
			-this.y,
			-this.z
		);
	}

	setNegated() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	}

	inverse() {
		return new Vector3(
			1 / this.x,
			1 / this.y,
			1 / this.z
		);
	}

	setInverted() {
		this.x = 1 / this.x;
		this.y = 1 / this.y;
		this.z = 1 / this.z;
		return this;
	}

	ceil() {
		return new Vector3(
			Math.ceil(this.x),
			Math.ceil(this.y),
			Math.ceil(this.z)
		);
	}

	floor() {
		return new Vector3(
			Math.floor(this.x),
			Math.floor(this.y),
			Math.floor(this.z)
		);
	}

	round() {
		return new Vector3(
			Math.round(this.x),
			Math.round(this.y),
			Math.round(this.z)
		);
	}

	clamp(min: number, max: number): Vector3;
	clamp(min: Vector3, max: Vector3): Vector3;
	clamp(min: number | Vector3, max: number | Vector3) {
		if (typeof min === "number") {
			return new Vector3(
				clampf(this.x, min, max as number),
				clampf(this.y, min, max as number),
				clampf(this.z, min, max as number)
			);
		}
		return new Vector3(
			clampf(this.x, min.x, (max as Vector3).x),
			clampf(this.y, min.y, (max as Vector3).y),
			clampf(this.z, min.z, (max as Vector3).z)
		);
	}

	clamp01() {
		return new Vector3(
			clamp01f(this.x),
			clamp01f(this.y),
			clamp01f(this.z)
		);
	}

	clampMagnitude(maxLength: number) {
		const curMag = this.magnitude;
		if (curMag <= maxLength) {
			return this;
		}
		const scale = maxLength / curMag;
		return new Vector3(
			this.x * scale,
			this.y * scale,
			this.z * scale
		);
	}

	distance(to: Vector3) {
		return to.sub(this).magnitude;
	}

	sqrDistance(to: Vector3) {
		return to.sub(this).sqrMagnitude;
	}

	dot(v: Vector3) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	cross(v: Vector3) {
		return new Vector3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}

	setCross(v: Vector3) {
		const { x, y, z } = this;
		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;
		return this;
	}

	mix(v: Vector3, ratio: number) {
		return new Vector3(
			mixf(this.x, v.x, ratio),
			mixf(this.y, v.y, ratio),
			mixf(this.z, v.z, ratio)
		);
	}

	setNormalized() {
		const { x, y, z } = this;
		let len = x * x + y * y + z * z;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}
		this.x *= len;
		this.y *= len;
		this.z *= len;
		return this;
	}

	normalize() {
		return this.clone().setNormalized();
	}

	get magnitude() {
		const { x, y, z } = this;
		return Math.sqrt(x * x + y * y + z * z);
	}

	get sqrMagnitude() {
		const { x, y, z } = this;
		return x * x + y * y + z * z;
	}

	get signs() {
		return new Vector3(
			Math.sign(this.x),
			Math.sign(this.y),
			Math.sign(this.z)
		);
	}

	moveTowards(target: Vector3, maxDistanceDelta: number) {
		const diff = target.sub(this);
		const distToMove = Math.min(maxDistanceDelta, diff.magnitude);
		return this.mulAdd(diff, distToMove);
	}

	reflect(normal: Vector3) {
		return this.sub(normal.mul(2 * this.dot(normal)));
	}

	exactEquals(v: Vector3) {
		return this.x === v.x && this.y === v.y && this.z === v.z;
	}

	equals(v: Vector3) {
		const ax = this.x, ay = this.y, az = this.z;
		const bx = v.x, by = v.y, bz = v.z;
		return (
			Math.abs(ax - bx) <= VEC_EPSILON * Math.max(1, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= VEC_EPSILON * Math.max(1, Math.abs(ay), Math.abs(by)) &&
			Math.abs(az - bz) <= VEC_EPSILON * Math.max(1, Math.abs(az), Math.abs(bz))
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

	get xz() {
		return new Vector2(this.x, this.z);
	}
	set xz(xz: Vector2) {
		this.x = xz.x;
		this.z = xz.y;
	}

	// static operations

	static min(a: Vector3, b: Vector3) {
		return new Vector3(
			Math.min(a.x, b.x),
			Math.min(a.y, b.y),
			Math.min(a.z, b.z)
		);
	}

	static max(a: Vector3, b: Vector3) {
		return new Vector3(
			Math.max(a.x, b.x),
			Math.max(a.y, b.y),
			Math.max(a.z, b.z)
		);
	}

	static lerp(from: Vector3, to: Vector3, t: number, easing: EasingFn = Easing.linear) {
		t = easing(clamp01f(t));
		return from.mulAdd(to.sub(from), t);
	}

	static lerpUnclamped(from: Vector3, to: Vector3, t: number) {
		return from.mulAdd(to.sub(from), t);
	}

	static orthoNormalize(normal: Vector3, tangent: Vector3) {
		// normalizeInPlace(normal);
		normal.setNormalized();
		// auto proj = normal * dot(tangent, normal);
		const proj = normal.mul(tangent.dot(normal));
		// tangent -= proj;
		tangent.x -= proj.x;
		tangent.y -= proj.y;
		tangent.z -= proj.z;
		// normalizeInPlace(tangent);
		tangent.setNormalized();
	}


	// static constructors

	static fromVector2(vec: Vector2, z = 0) {
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

	static random(min = 0, max = 1) {
		const range = max - min;
		return new Vector3(
			min + Math.random() * range,
			min + Math.random() * range,
			min + Math.random() * range
		);
	}

	static splat(n: number) {
		return new Vector3(n, n, n);
	}

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
