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
		private jointDataTex_: render.Texture;
		private nextFreeJointIndex_ = 0;

		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager) {
			var fields: container.MABField[] = [
				
			];

			// 
			var texData = new Float32Array(256 * 256 * 4);
			var td = render.makeTexDesc2D(render.PixelFormat.RGBA32F, 256, 256, render.UseMipMaps.No);
			td.pixelData = [texData];
			td.sampling.magFilter = render.TextureSizingFilter.Nearest;
			td.sampling.minFilter = render.TextureSizingFilter.Nearest;
			td.sampling.mipFilter = render.TextureMipFilter.None;
			td.sampling.repeatS = render.TextureRepeatMode.ClampToEdge;
			td.sampling.repeatT = render.TextureRepeatMode.ClampToEdge;
			this.jointDataTex_ = new render.Texture(rc, td);
		}


		registerSkeleton(name: string, bindPose: asset.Model) {

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
