// AABB (Axis-Aligned Bounding Box)
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.math {

	export class AABB {
		// initialize min-max to extreme invalid bounds so it can be be used
		// as a starting point with def ctor and then using include(…) calls
		private min_ = new Float32Array([Float.max, Float.max, Float.max]);
		private max_ = new Float32Array([Float.min, Float.min, Float.min]);


		static fromCenterAndSize(center: ArrayOfNumber, size: ArrayOfNumber): AABB {
			var bounds = new AABB;
			bounds.setCenterAndSize(center, size);
			return bounds;
		}

		static fromMinAndMax(min: ArrayOfNumber, max: ArrayOfNumber): AABB {
			var bounds = new AABB;
			bounds.setMinAndMax(min, max);
			return bounds;
		}

		// --

		setCenterAndSize(center: ArrayOfNumber, size: ArrayOfNumber) {
			assert(size[0] >= 0);
			assert(size[1] >= 0);
			assert(size[2] >= 0);

			var extents = vec3.scale([], size, 0.5);
			vec3.sub(this.min_, center, extents);
			vec3.add(this.max_, center, extents);
		}

		setMinAndMax(min: ArrayOfNumber, max: ArrayOfNumber) {
			assert(min[0] <= max[0]);
			assert(min[1] <= max[1]);
			assert(min[2] <= max[2]);

			vec3.copy(this.min_, min);
			vec3.copy(this.max_, max);
		}

		includePoint(pt: ArrayOfNumber) {
			if (pt[0] < this.min_[0]) this.min_[0] = pt[0];
			if (pt[0] > this.max_[0]) this.max_[0] = pt[0];

			if (pt[1] < this.min_[1]) this.min_[1] = pt[1];
			if (pt[1] > this.max_[1]) this.max_[1] = pt[1];

			if (pt[2] < this.min_[2]) this.min_[2] = pt[2];
			if (pt[2] > this.max_[2]) this.max_[2] = pt[2];
		}

		includeAABB(bounds: AABB) {
			if (bounds.min_[0] < this.min_[0]) this.min_[0] = bounds.min_[0];
			if (bounds.max_[0] > this.max_[0]) this.max_[0] = bounds.max_[0];

			if (bounds.min_[1] < this.min_[1]) this.min_[1] = bounds.min_[1];
			if (bounds.max_[1] > this.max_[1]) this.max_[1] = bounds.max_[1];

			if (bounds.min_[2] < this.min_[2]) this.min_[2] = bounds.min_[2];
			if (bounds.max_[2] > this.max_[2]) this.max_[2] = bounds.max_[2];
		}

		// --

		get min() { return this.min_; }
		get max() { return this.max_; }

		size() { return vec3.subtract([], this.max_, this.min_); }
		extents() { return vec3.scale([], this.size(), 0.5); }
		center() { return vec3.add([], this.min_, this.extents()); }
		
		// --
		
		containsPoint(pt: ArrayOfNumber) {
			return pt[0] >= this.min_[0] && pt[1] >= this.min_[1] && pt[2] >= this.min_[2] &&
				   pt[0] <= this.max_[0] && pt[1] <= this.max_[1] && pt[2] <= this.max_[2];
		}

		containsAABB(bounds: AABB) {
			return bounds.min_[0] >= this.min_[0] && bounds.min_[1] >= this.min_[1] && bounds.min_[2] >= this.min_[2] &&
				   bounds.max_[0] <= this.max_[0] && bounds.max_[1] <= this.max_[1] && bounds.max_[2] <= this.max_[2];
		}

		intersects(bounds: AABB) {
			return bounds.min_[0] <= this.max_[0] && bounds.max_[0] >= this.min_[0] &&
				   bounds.min_[1] <= this.max_[1] && bounds.max_[1] >= this.min_[1] &&
				   bounds.min_[2] <= this.max_[2] && bounds.max_[2] >= this.min_[2];
		}

		closestPoint(pt: ArrayOfNumber): number[] {
			return [
				math.clamp(pt[0], this.min_[0], this.max_[0]),
				math.clamp(pt[1], this.min_[1], this.max_[1]),
				math.clamp(pt[2], this.min_[2], this.max_[2])
			];
		}
	}

} // ns sd.math
