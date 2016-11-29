// world/skeleton - skeletons and skins, oh my
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export type SkeletonInstance = Instance<SkeletonManager>;
	export type SkeletonRange = InstanceRange<SkeletonManager>;
	export type SkeletonSet = InstanceSet<SkeletonManager>;
	export type SkeletonIterator = InstanceIterator<SkeletonManager>;
	export type SkeletonArrayView = InstanceArrayView<SkeletonManager>;

	// prototype manager - very much not finished

	export class SkeletonManager {
		private nextSkelID_ = 1;
		private nextAnimID_ = 1;
		private skels_ = new Map<SkeletonInstance, TransformInstance[]>();
		private baseRotations_ = new Map<SkeletonInstance, sd.Float4[]>();
		private anims_ = new Map<number, asset.SkeletonAnimation>();

		private jointData_: Float32Array;
		private jointDataTex_: render.Texture;


		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager) {
			// -- the compiled joint data texture and client copy
			this.jointData_ = new Float32Array(256 * 256 * 4);
			this.jointDataTex_ = new render.Texture(rc, render.makeTexDesc2DFloatLUT(this.jointData_, 256, 256));
		}


		createSkeleton(jointTransforms: TransformInstance[]): SkeletonInstance {
			const txm = this.transformMgr_;
			this.skels_.set(this.nextSkelID_, jointTransforms.slice(0));
			const baseRots: sd.Float4[] = [];

			const parent = txm.parent(jointTransforms[0]);
			const originWorldTransform = txm.worldMatrix(parent);
			const invOriginWorldTransform = mat4.invert([], originWorldTransform);

			for (const tx of jointTransforms) {
				const jmm = txm.copyWorldMatrix(tx);
				mat4.multiply(jmm, invOriginWorldTransform, jmm);
				const modelSpaceRotQuat = quat.fromMat3([], mat3.fromMat4([], jmm));
				baseRots.push(modelSpaceRotQuat);
			}
			this.baseRotations_.set(this.nextSkelID_, baseRots);
			this.updateJointData(this.nextSkelID_, jointTransforms);

			return this.nextSkelID_++;
		}


		createAnimation(skelAnim: asset.SkeletonAnimation): number {
			this.anims_.set(this.nextAnimID_, skelAnim);
			return this.nextAnimID_++;
		}


		private updateJointData(_inst: SkeletonInstance, skel: TransformInstance[]) {
			const count = skel.length;
			const txm = this.transformMgr_;
			const texData = new Float32Array(256 * 16 * 4);

			const parent = txm.parent(skel[0]);
			const originWorldTransform = txm.worldMatrix(parent);
			const invOriginWorldTransform = mat4.invert([], originWorldTransform);

			for (let ji = 0; ji < count; ++ji) {
				const j = skel[ji];
				const texelBaseIndex = ji * 8;

				const xform = txm.copyWorldMatrix(j);
				mat4.multiply(xform, invOriginWorldTransform, xform);

				// container.setIndexedVec4(texData, texelBaseIndex, [0,0,0,1]);
				// container.setIndexedVec4(texData, texelBaseIndex, quat.invert([], txm.localRotation(j)));
				container.setIndexedVec4(texData, texelBaseIndex, txm.localRotation(j));
				container.setIndexedMat4(texData, (ji * 2) + 1, xform);
			}

			this.jointDataTex_.bind();
			this.rc.gl.texSubImage2D(this.jointDataTex_.target, 0, 0, 0, 256, 16, this.rc.gl.RGBA, this.rc.gl.FLOAT, texData);
			this.jointDataTex_.unbind();
		}


		applyAnimFrameToSkeleton(inst: SkeletonInstance, animIndex: number, frameIndex: number) {
			this.applyInterpFramesToSkeleton(inst, animIndex, frameIndex, frameIndex + 1, 0);
		}


		applyInterpFramesToSkeleton(inst: SkeletonInstance, animIndex: number, frameIndexA: number, frameIndexB: number, ratio: number) {
			const anim = this.anims_.get(animIndex);
			const skel = this.skels_.get(<number>inst);
			const txm = this.transformMgr_;

			if (!(anim && skel)) {
				return;
			}
			frameIndexA %= anim.frameCount;
			frameIndexB %= anim.frameCount;
			ratio = math.clamp01(ratio);

			let posA: sd.Float3 | null, posB: sd.Float3 | null, posI: sd.Float3 = [];
			let rotA: sd.Float4 | null, rotB: sd.Float4 | null, rotI: sd.Float4 = [];
			for (const j of anim.jointAnims) {
				posA = posB = null;
				rotA = rotB = null;

				for (const t of j.tracks) {
					if (t.field == asset.TransformAnimationField.Translation) {
						posA = container.copyIndexedVec3(t.key, frameIndexA);
						posB = container.copyIndexedVec3(t.key, frameIndexB);
						vec3.lerp(posI, posA, posB, ratio);
					}
					else if (t.field == asset.TransformAnimationField.Rotation) {
						rotA = container.copyIndexedVec4(t.key, frameIndexA);
						rotB = container.copyIndexedVec4(t.key, frameIndexB);
						quat.slerp(rotI, rotA, rotB, ratio);
					}
				}

				if (posA && rotA) {
					txm.setPositionAndRotation(skel[j.jointIndex], posI, rotI);
				}
				else if (posA) {
					txm.setPosition(skel[j.jointIndex], posI);
				}
				else if (rotA) {
					txm.setRotation(skel[j.jointIndex], rotI);
				}
			}

			this.updateJointData(inst, skel);
		}

		get jointDataTexture() { return this.jointDataTex_; }
	}

} // ns sd.world
