/*
vector/quaternion - quaternion rotation type
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { AngleConvert } from "stardazed/core";
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
		return new Quaternion(this.x, this.y, this.z, this.w);
	}

	set(to: Quaternion | Vector4) {
		this.x = to.x;
		this.y = to.y;
		this.z = to.z;
		this.w = to.w;
		return this;
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

	// static operations

	static fromAxisAngle(axis: Vector3, angleDegrees: number) {
		const halfAngleRad = angleDegrees * AngleConvert.DEG2RAD * 0.5;
		const sa = Math.sin(halfAngleRad);
		return new Quaternion(
			axis.x * sa,
			axis.y * sa,
			axis.z * sa,
			Math.cos(halfAngleRad)
		);
	}
}
