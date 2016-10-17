// AABB (Axis-Aligned Bounding Box)
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="math.ts" />

namespace sd.math {

	export namespace aabb {

		export function setCenterAndSize(min: ConstFloat3, max: ConstFloat3, center: ConstFloat3, size: ConstFloat3): void {
			vec3.scaleAndAdd(min, center, size, -0.5);
			vec3.scaleAndAdd(max, center, size, 0.5);
		}


		export function calculateCenterAndSize(center: ConstFloat3, size: ConstFloat3, min: ConstFloat3, max: ConstFloat3): void {
			vec3.subtract(size, max, min);
			vec3.scaleAndAdd(center, min, size, 0.5);
		}


		export function encapsulatePoint(min: Float3, max: Float3, pt: ConstFloat3): void {
			if (pt[0] < min[0]) { min[0] = pt[0]; }
			if (pt[0] > max[0]) { max[0] = pt[0]; }

			if (pt[1] < min[1]) { min[1] = pt[1]; }
			if (pt[1] > max[1]) { max[1] = pt[1]; }

			if (pt[2] < min[2]) { min[2] = pt[2]; }
			if (pt[2] > max[2]) { max[2] = pt[2]; }
		}


		export function encapsulateAABB(min: Float3, max: Float3, otherMin: ConstFloat3, otherMax: ConstFloat3): void {
			if (otherMin[0] < min[0]) { min[0] = otherMin[0]; }
			if (otherMax[0] > max[0]) { max[0] = otherMax[0]; }

			if (otherMin[1] < min[1]) { min[1] = otherMin[1]; }
			if (otherMax[1] > max[1]) { max[1] = otherMax[1]; }

			if (otherMin[2] < min[2]) { min[2] = otherMin[2]; }
			if (otherMax[2] > max[2]) { max[2] = otherMax[2]; }
		}


		export function containsPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3): boolean {
			return	pt[0] >= min[0] && pt[1] >= min[1] && pt[2] >= min[2] &&
					pt[0] <= max[0] && pt[1] <= max[1] && pt[2] <= max[2];
		}


		export function containsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean {
			return	otherMin[0] >= min[0] && otherMin[1] >= min[1] && otherMin[2] >= min[2] &&
					otherMax[0] <= max[0] && otherMax[1] <= max[1] && otherMax[2] <= max[2];
		}


		export function intersectsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean {
			return	otherMin[0] <= max[0] && otherMax[0] >= min[0] &&
					otherMin[1] <= max[1] && otherMax[1] >= min[1] &&
					otherMin[2] <= max[2] && otherMax[2] >= min[2];
		}


		export function closestPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3) {
			return [
				math.clamp(pt[0], min[0], max[0]),
				math.clamp(pt[1], min[1], max[1]),
				math.clamp(pt[2], min[2], max[2])
			];
		}


		export function size(min: ConstFloat3, max: ConstFloat3) {
			return vec3.subtract([0, 0, 0], max, min);
		}


		export function extents(min: ConstFloat3, max: ConstFloat3) {
			return vec3.scale([], size(min, max), 0.5);
		}


		export function center(min: ConstFloat3, max: ConstFloat3) {
			return vec3.add([], min, extents(min, max));
		}


		export function transformMat3(destMin: Float3, destMax: Float3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat3x3) {
			const destA = vec3.transformMat3([], sourceMin, mat);
			const destB = vec3.transformMat3([], sourceMax, mat);
			vec3.min(destMin, destA, destB);
			vec3.max(destMax, destA, destB);
		}


		export function transformMat4(destMin: Float3, destMax: ConstFloat3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat4x4) {
			const destA = vec3.transformMat4([], sourceMin, mat);
			const destB = vec3.transformMat4([], sourceMax, mat);
			vec3.min(destMin, destA, destB);
			vec3.max(destMax, destA, destB);
		}

	} // ns sd.math.aabb


	export class AABB {
		public min: Float32Array;
		public max: Float32Array;

		constructor();
		constructor(min: Float3, max: Float3);
		constructor(min?: Float3, max?: Float3) {
			const data = new Float32Array(6);
			this.min = data.subarray(0, 3);
			this.max = data.subarray(3, 6);

			if (min && max) {
				this.min[0] = min[0]; this.min[1] = min[1]; this.min[2] = min[2];
				this.max[0] = max[0]; this.max[1] = max[1]; this.max[2] = max[2];
			}
			else {
				this.min[0] = Float.max; this.min[1] = Float.max; this.min[2] = Float.max;
				this.max[0] = Float.min; this.max[1] = Float.min; this.max[2] = Float.min;
			}
		}

		static fromCenterAndSize(center: ConstFloat3, size: ConstFloat3): AABB {
			const min = <number[]>[];
			const max = <number[]>[];
			aabb.setCenterAndSize(min, max, center, size);
			return new AABB(min, max);
		}

		setCenterAndSize(center: ConstFloat3, size: ConstFloat3) {
			aabb.setCenterAndSize(this.min, this.max, center, size);
		}

		setMinAndMax(min: ConstFloat3, max: ConstFloat3) {
			this.min[0] = min[0]; this.min[1] = min[1]; this.min[2] = min[2];
			this.max[0] = max[0]; this.max[1] = max[1]; this.max[2] = max[2];
		}

		encapsulatePoint(pt: ConstFloat3) {
			aabb.encapsulatePoint(this.min, this.max, pt);
		}

		encapsulateAABB(bounds: AABB) {
			aabb.encapsulateAABB(this.min, this.max, bounds.min, bounds.max);
		}

		// --

		get size() { return aabb.size(this.min, this.max); }
		get extents() { return aabb.extents(this.min, this.max); }
		get center() { return aabb.center(this.min, this.max); }

		// --

		containsPoint(pt: ConstFloat3) {
			return aabb.containsPoint(this.min, this.max, pt);
		}

		containsAABB(bounds: AABB) {
			return aabb.containsAABB(this.min, this.max, bounds.min, bounds.max);
		}

		intersectsAABB(bounds: AABB) {
			return aabb.intersectsAABB(this.min, this.max, bounds.min, bounds.max);
		}

		closestPoint(pt: ConstFloat3) {
			return aabb.closestPoint(this.min, this.max, pt);
		}
	}


} // ns sd.math
