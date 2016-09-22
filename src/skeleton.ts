// skeleton.ts - Joints and Animation management
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export type SkeletonInstance = Instance<SkeletonManager>;
	export type SkeletonRange = InstanceRange<SkeletonManager>;
	export type SkeletonSet = InstanceSet<SkeletonManager>;
	export type SkeletonIterator = InstanceIterator<SkeletonManager>;
	export type SkeletonArrayView = InstanceArrayView<SkeletonManager>;


	export interface SkelAnimX {
		animation: asset.SkeletonAnimation;
		looping: boolean;
		movementScale?: number;
		speedMultiplier?: number;
	}


	export class SkeletonManager implements ComponentManager<SkeletonManager> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private jointOffsetBase_: Int32Array;
		private jointCountBase_: Int32Array;

		private jointData_: Float32Array;
		private jointDataTex_: render.Texture;

		constructor(rc: render.RenderContext, private transformMgr_: TransformManager) {
			var instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // jointOffset
				{ type: SInt32, count: 1 }, // jointCount
			];
			this.instanceData_ = new container.MultiArrayBuffer(128, instFields);
			this.rebase();

			// -- the compiled joint data texture and client copy
			this.jointData_ = new Float32Array(256 * 256 * 4);
			var td = render.makeTexDesc2D(render.PixelFormat.RGBA32F, 256, 256, render.UseMipMaps.No);
			td.pixelData = [this.jointData_];
			td.sampling.magFilter = render.TextureSizingFilter.Nearest;
			td.sampling.minFilter = render.TextureSizingFilter.Nearest;
			td.sampling.mipFilter = render.TextureMipFilter.None;
			td.sampling.repeatS = render.TextureRepeatMode.ClampToEdge;
			td.sampling.repeatT = render.TextureRepeatMode.ClampToEdge;
			this.jointDataTex_ = new render.Texture(rc, td);
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.jointOffsetBase_ = <Int32Array>this.instanceData_.indexedFieldView(2);
			this.jointCountBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
		}


		create(rootEntity: Entity) {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>rootEntity;
			this.transformBase_[ix] = <number>this.transformMgr_.forEntity(rootEntity);

		}


		destroy(_inst: SkeletonInstance) {
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

		/*

		TODO: implement all this stuff

		private updateJointData(skel: world.TransformInstance[]) {
			var count = skel.length;
			var txm = this.transformMgr_;
			var gl = this.rc.gl;
			var texData = new Float32Array(256 * 4 * 4);

			var parent = txm.parent(skel[0]);
			var originWorldTransform = txm.worldMatrix(parent);
			var invOriginWorldTransform = mat4.invert([], originWorldTransform);

			for (var ji = 0; ji < count; ++ji) {
				var j = skel[ji];
				var texelBaseIndex = ji * 8;

				var xform = txm.copyWorldMatrix(j);
				mat4.multiply(xform, invOriginWorldTransform, xform);

				// container.setIndexedVec4(texData, texelBaseIndex, [0,0,0,1]);
				container.setIndexedVec4(texData, texelBaseIndex, quat.invert([], txm.localRotation(j)));
				container.setIndexedMat4(texData, (ji * 2) + 1, xform);
			}

			// FIXME: need to add this to Texture
			this.jointDataTex_.bind();
			gl.texSubImage2D(this.jointDataTex_.target, 0, 0, 0, 256, 4, gl.RGBA, gl.FLOAT, texData);
			this.jointDataTex_.unbind();
		}


		startAnimation(skel: SkeletonInstance, anim: asset.SkeletonAnimation) {
		}


		update(dt: number) {
			TODO: TBD

			minJoint = Infinity, maxJoint = 0
			for each animatingJoint
				update minJoint, maxJoint from animatingJoint
				for each animation on animatingJoint
					init totalPos, totalRot, totalScale
					totalPos += animation.blendFactor * joint.calculatedPos
					totalRot += animation.blendFactor * joint.calculatedRot
					totalScale += animation.blendFactor * joint.calculatedScale
				end
				set pos, rot, scale of animatingJoint
			end

			updateJointData(minJoint, maxJoint)
		}

		*/
	}

} // ns sd.world
