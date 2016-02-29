// skeleton.ts - Joints and Animation management
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type SkeletonInstance = Instance<SkeletonManager>;
	export type SkeletonRange = InstanceRange<SkeletonManager>;
	export type SkeletonSet = InstanceSet<SkeletonManager>;
	export type SkeletonIterator = InstanceIterator<SkeletonManager>;
	export type SkeletonArrayView = InstanceArrayView<SkeletonManager>;


	export interface SkelAnimX {
		anim: asset.SkeletonAnimation;
		looping: boolean;
		movementScale?: number;
		speedMultiplier?: number;
	}


	export class SkeletonManager implements ComponentManager<SkeletonManager> {
		private instanceData_: container.MultiArrayBuffer;

		constructor(private transformMgr_: TransformManager) {
			var fields: container.MABField[] = [

			];
		}


		create(rootTX: TransformInstance) {

		}


		destroy(inst: SkeletonInstance) {
		}


		destroyRange(range: SkeletonRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() {
			return this.instanceData_.count;
		}

		valid(inst: SkeletonInstance) {
			return <number>inst <= this.count;
		}

		all(): SkeletonRange {
			return new InstanceLinearRange<SkeletonManager>(1, this.count);
		}


		// ----


		startAnimation(skel: SkeletonInstance, anim: asset.SkeletonAnimation) {
			
		}


		update(dt: number) {
			
		}
	}

} // ns sd.world
