// AABB (Axis-Aligned Bounding Box component)
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type AABB = Instance<AABBManager>;

	export class AABBManager {
		private instanceData_: container.MultiArrayBuffer;

		private minBase_: Float32Array;
		private maxBase_: Float32Array;


		constructor() {
			var fields: container.MABField[] = [
				{ type: Float, count: 3 }, // min
				{ type: Float, count: 3 }, // max
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, fields);
			this.rebase();
		}


		private rebase() {
			this.minBase_ = <Float32Array>this.instanceData_.indexedFieldView(0);
			this.maxBase_ = <Float32Array>this.instanceData_.indexedFieldView(1);
		}


		createFromCenterAndSize(center: ArrayOfNumber, size: ArrayOfNumber): AABB {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.setCenterAndSize(instance, center, size);
			return instance;
		}


		createFromMinAndMax(min: ArrayOfNumber, max: ArrayOfNumber): AABB {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.setMinAndMax(instance, min, max);
			return instance;
		}


		// ----


		setCenterAndSize(inst: AABB, center: ArrayOfNumber, size: ArrayOfNumber) {
			assert(size[0] >= 0);
			assert(size[1] >= 0);
			assert(size[2] >= 0);

			var extents = vec3.scale([], size, 0.5);
			var offset = 3 * <number>inst;

			this.minBase_[offset    ] = center[0] - extents[0];
			this.minBase_[offset + 1] = center[1] - extents[1];
			this.minBase_[offset + 2] = center[2] - extents[2];

			this.maxBase_[offset    ] = center[0] + extents[0];
			this.maxBase_[offset + 1] = center[1] + extents[1];
			this.maxBase_[offset + 2] = center[2] + extents[2];
		}


		setMinAndMax(inst: AABB, min: ArrayOfNumber, max: ArrayOfNumber) {
			assert(min[0] <= max[0]);
			assert(min[1] <= max[1]);
			assert(min[2] <= max[2]);

			container.setIndexedVec3(this.minBase_, <number>inst, min);
			container.setIndexedVec3(this.maxBase_, <number>inst, max);
		}


		includePoint(inst: AABB, pt3: ArrayOfNumber) {
			var instMin = container.copyIndexedVec3(this.minBase_, <number>inst);
			var instMax = container.copyIndexedVec3(this.maxBase_, <number>inst);
			
			if (pt3[0] < instMin[0]) instMin[0] = pt3[0];
			if (pt3[0] > instMax[0]) instMax[0] = pt3[0];

			if (pt3[1] < instMin[1]) instMin[1] = pt3[1];
			if (pt3[1] > instMax[1]) instMax[1] = pt3[1];

			if (pt3[2] < instMin[2]) instMin[2] = pt3[2];
			if (pt3[2] > instMax[2]) instMax[2] = pt3[2];

			container.setIndexedVec3(this.minBase_, <number>inst, instMin);
			container.setIndexedVec3(this.maxBase_, <number>inst, instMax);
		}


		includeAABB(into: AABB, source: AABB) {
			var intoMin = container.copyIndexedVec3(this.minBase_, <number>into);
			var intoMax = container.copyIndexedVec3(this.maxBase_, <number>into);
			var sourceMin = container.copyIndexedVec3(this.minBase_, <number>source);
			var sourceMax = container.copyIndexedVec3(this.maxBase_, <number>source);

			if (sourceMin[0] < intoMin[0]) intoMin[0] = sourceMin[0];
			if (sourceMax[0] > intoMax[0]) intoMax[0] = sourceMax[0];

			if (sourceMin[1] < intoMin[1]) intoMin[1] = sourceMin[1];
			if (sourceMax[1] > intoMax[1]) intoMax[1] = sourceMax[1];

			if (sourceMin[2] < intoMin[2]) intoMin[2] = sourceMin[2];
			if (sourceMax[2] > intoMax[2]) intoMax[2] = sourceMax[2];

			container.setIndexedVec3(this.minBase_, <number>into, intoMin);
			container.setIndexedVec3(this.maxBase_, <number>into, intoMax);
		}


		// --


		min(inst: AABB) { return container.copyIndexedVec3(this.minBase_, <number>inst); }
		max(inst: AABB) { return container.copyIndexedVec3(this.maxBase_, <number>inst); }

		size(inst: AABB) { return vec3.subtract([], this.max(inst), this.min(inst)); }
		extents(inst: AABB) { return vec3.scale([], this.size(inst), 0.5); }
		center(inst: AABB) { return vec3.add([], this.min(inst), this.extents(inst)); }

		
		// --

		
		containsPoint(inst: AABB, pt: ArrayOfNumber) {
			var instMin = container.copyIndexedVec3(this.minBase_, <number>inst);
			var instMax = container.copyIndexedVec3(this.maxBase_, <number>inst);
			
			return pt[0] >= instMin[0] && pt[1] >= instMin[1] && pt[2] >= instMin[2] &&
				   pt[0] <= instMax[0] && pt[1] <= instMax[1] && pt[2] <= instMax[2];
		}


		containsAABB(outer: AABB, inner: AABB) {
			var outerMin = container.copyIndexedVec3(this.minBase_, <number>outer);
			var outerMax = container.copyIndexedVec3(this.maxBase_, <number>outer);
			var innerMin = container.copyIndexedVec3(this.minBase_, <number>inner);
			var innerMax = container.copyIndexedVec3(this.maxBase_, <number>inner);

			return innerMin[0] >= outerMin[0] && innerMin[1] >= outerMin[1] && innerMin[2] >= outerMin[2] &&
				   innerMax[0] <= outerMax[0] && innerMax[1] <= outerMax[1] && innerMax[2] <= outerMax[2];
		}


		intersects(a: AABB, b: AABB) {
			var aMin = container.copyIndexedVec3(this.minBase_, <number>a);
			var aMax = container.copyIndexedVec3(this.maxBase_, <number>a);
			var bMin = container.copyIndexedVec3(this.minBase_, <number>b);
			var bMax = container.copyIndexedVec3(this.maxBase_, <number>b);
			
			return bMin[0] <= aMax[0] && bMax[0] >= aMin[0] &&
				   bMin[1] <= aMax[1] && bMax[1] >= aMin[1] &&
				   bMin[2] <= aMax[2] && bMax[2] >= aMin[2];
		}


		closestPoint(inst: AABB, pt3: ArrayOfNumber): number[] {
			var instMin = container.copyIndexedVec3(this.minBase_, <number>inst);
			var instMax = container.copyIndexedVec3(this.maxBase_, <number>inst);
			
			return [
				math.clamp(pt3[0], instMin[0], instMax[0]),
				math.clamp(pt3[1], instMin[1], instMax[1]),
				math.clamp(pt3[2], instMin[2], instMax[2])
			];
		}
	}

} // ns sd.world
