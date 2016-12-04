// world/light - Light component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export type LightInstance = Instance<LightManager>;
	export type LightArrayView = InstanceArrayView<LightManager>;

	export interface ShadowView {
		light: LightInstance;
		lightProjection: ProjectionSetup;
		shadowFBO: render.FrameBuffer;
	}


	// this setup allows for a renderbuffer up to 4K (3840 * 2160)
	// and a global list of up to 32768 active lights 
	const LUT_DIMENSION = 512;
	const LUT_LIGHTDATA_ROWS = 256;
	const LUT_INDEXLIST_ROWS = 240;
	const LUT_GRID_ROWS = 16;

	// const TILE_DIMENSION = 32;

	const MAX_LIGHTS = ((LUT_DIMENSION * LUT_LIGHTDATA_ROWS) / 4) | 0;


	export class LightManager {
		private instanceData_: container.FixedMultiArray;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private shadowTypeBase_: ConstEnumArrayView<asset.ShadowType>;
		private shadowQualityBase_: ConstEnumArrayView<asset.ShadowQuality>;
		private shadowStrengthBase_: Float32Array;
		private shadowBiasBase_: Float32Array;

		private lightData_: container.FixedMultiArray;
		private globalLightData_: Float32Array;
		private tileLightIndexes_: Float32Array;
		private lightGrid_: Float32Array;
		private lutTexture_: render.Texture;
		private count_: number;

		private nullVec3_ = new Float32Array(3); // used to convert directions to rotations

		private shadowFBO_: render.FrameBuffer | null = null;


		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager) {
			this.count_ = 0;

			// linking info
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transformInstance
				{ type: SInt32, count: 1 }, // shadowType
				{ type: SInt32, count: 1 }, // shadowQuality
				{ type: SInt32, count: 1 }, // shadowStrength
				{ type: SInt32, count: 1 }, // shadowBias
			];
			this.instanceData_ = new container.FixedMultiArray(MAX_LIGHTS, instFields);
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.shadowTypeBase_ = this.instanceData_.indexedFieldView(2);
			this.shadowQualityBase_ = this.instanceData_.indexedFieldView(3);
			this.shadowStrengthBase_ = this.instanceData_.indexedFieldView(4);
			this.shadowBiasBase_ = this.instanceData_.indexedFieldView(5);

			// light data texture
			const lutFields: container.MABField[] = [
				{ type: Float, count: 4 * LUT_LIGHTDATA_ROWS }, //
				{ type: Float, count: 4 * LUT_INDEXLIST_ROWS },
				{ type: Float, count: 4 * LUT_GRID_ROWS },
			];
			this.lightData_ = new container.FixedMultiArray(LUT_DIMENSION, lutFields);
			this.globalLightData_ = this.lightData_.indexedFieldView(0);
			this.tileLightIndexes_ = this.lightData_.indexedFieldView(1);
			this.lightGrid_ = this.lightData_.indexedFieldView(2);

			const lutDesc = render.makeTexDesc2DFloatLUT(new Float32Array(this.lightData_.data), LUT_DIMENSION, LUT_DIMENSION);
			this.lutTexture_ = new render.Texture(rc, lutDesc);

			vec3.set(this.nullVec3_, 1, 0, 0);
		}


		create(entity: Entity, desc: asset.Light): LightInstance {
			// do we have any room left?
			assert(this.count_ < MAX_LIGHTS, "light storage exhausted");
			this.count_ += 1;
			const instance = this.count_;

			// validate parameters
			assert(desc.type != asset.LightType.None);

			// linking
			this.entityBase_[instance] = entity;
			this.transformBase_[instance] = this.transformMgr_.forEntity(entity);

			// shadow data (all optional)
			this.shadowTypeBase_[instance] = desc.shadowType || asset.ShadowType.None;
			this.shadowQualityBase_[instance] = desc.shadowQuality || asset.ShadowQuality.Auto;
			this.shadowStrengthBase_[instance] = desc.shadowStrength || 1.0;
			this.shadowBiasBase_[instance] = desc.shadowBias || 0.002;

			// light data
			const gldData = new Float32Array(16);

			// pixel0: colour[3], type
			container.setIndexedVec4(gldData, 0, [desc.colour[0], desc.colour[1], desc.colour[2], desc.type]);
			// pixel1: position_cam[3], intensity
			container.setIndexedVec4(gldData, 1, [0, 0, 0, Math.max(0, desc.intensity)]);
			// pixel2: position_world[3], range
			container.setIndexedVec4(gldData, 2, [0, 0, 0, desc.range || 0]);
			// pixel3: direction[3], cutoff
			container.setIndexedVec4(gldData, 3, [0, 0, 0, Math.cos(desc.cutoff || 0)]);
			container.setIndexedMat4(this.globalLightData_, instance, gldData);

			return instance;
		}

		destroy(_inst: LightInstance) {
			// TBI
		}


		get count() { return this.count_; }


		// -- actions

		updateLightData(proj: ProjectionSetup) {
			const viewNormalMatrix = mat3.normalFromMat4([], proj.viewMatrix);

			const count = this.count_;
			for (let lix = 1; lix <= count; ++lix) {
				const type = this.type(lix);
				const transform = this.transformBase_[lix];

				if (type != asset.LightType.Directional) {
					const lightPos_world = this.transformMgr_.worldPosition(transform);
					const lightPos_cam = vec3.transformMat4([], lightPos_world, proj.viewMatrix);

					const posCamOffset = (lix * 16) + 4;
					this.globalLightData_[posCamOffset] = lightPos_cam[0];
					this.globalLightData_[posCamOffset + 1] = lightPos_cam[1];
					this.globalLightData_[posCamOffset + 2] = lightPos_cam[2];

					const posWorldOffset = (lix * 16) + 8;
					this.globalLightData_[posWorldOffset] = lightPos_world[0];
					this.globalLightData_[posWorldOffset + 1] = lightPos_world[1];
					this.globalLightData_[posWorldOffset + 2] = lightPos_world[2];
				}
				if (type != asset.LightType.Point) {
					const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(transform));
					const lightDir_world = vec3.transformMat3([], this.nullVec3_, rotMat);
					const lightDir_cam = vec3.transformMat3([], lightDir_world, viewNormalMatrix);

					const dirOffset = (lix * 16) + 12;
					this.globalLightData_[dirOffset] = lightDir_cam[0];
					this.globalLightData_[dirOffset + 1] = lightDir_cam[1];
					this.globalLightData_[dirOffset + 2] = lightDir_cam[2];
				}
			}

			// update rows
			const rowsUsed = Math.ceil((count + 1) / LUT_DIMENSION);
			this.lutTexture_.bind();
			this.rc.gl.texSubImage2D(this.lutTexture_.target, 0, 0, 0, LUT_DIMENSION, rowsUsed, this.rc.gl.RGBA, this.rc.gl.FLOAT, this.globalLightData_);
			this.lutTexture_.unbind();
		}

		get lutTexture() {
			return this.lutTexture_;
		}


		// -- linked objects

		entity(inst: LightInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: LightInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}


		// -- indirect properties (in Transform)

		localPosition(inst: LightInstance): number[] {
			return this.transformMgr_.localPosition(this.transformBase_[<number>inst]);
		}

		setLocalPosition(inst: LightInstance, newPosition: Float3) {
			this.transformMgr_.setPosition(this.transformBase_[<number>inst], newPosition);
		}


		direction(inst: LightInstance) {
			const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(this.transformBase_[<number>inst]));
			return vec3.normalize([], vec3.transformMat3([], this.nullVec3_, rotMat));
		}

		setDirection(inst: LightInstance, newDirection: Float3) {
			const normalizedDir = vec3.normalize([], newDirection);
			this.transformMgr_.setRotation(this.transformBase_[<number>inst], quat.rotationTo([], this.nullVec3_, normalizedDir));
		}


		// -- derived properties

		positionCameraSpace(inst: LightInstance) {
			const posCamOffset = ((inst as number) * 16) + 4;
			return this.globalLightData_.slice(posCamOffset, posCamOffset + 3);
		}

		projectionSetupForLight(inst: LightInstance, viewportWidth: number, viewportHeight: number, nearZ: number): ProjectionSetup | null {
			const transform = this.transformBase_[<number>inst];
			const worldPos = this.transformMgr_.worldPosition(transform);
			const worldDirection = this.direction(inst);
			const worldTarget = vec3.add([], worldPos, worldDirection);

			let viewMatrix: Float4x4;
			let projectionMatrix: Float4x4;

			const type = this.type(inst);
			if (type == asset.LightType.Spot) {
				const farZ = this.range(inst);
				const fov = this.cutoff(inst) * 2; // cutoff is half-angle
				viewMatrix = mat4.lookAt([], worldPos, worldTarget, [0, 1, 0]); // FIXME: this can likely be done cheaper
				projectionMatrix = mat4.perspective([], fov, viewportWidth / viewportHeight, nearZ, farZ);
				// TODO: cache this matrix?
			}
			else if (type == asset.LightType.Directional) {
				viewMatrix = mat4.lookAt([], [0, 0, 0], worldDirection, [0, 1, 0]); // FIXME: this can likely be done cheaper
				projectionMatrix = mat4.ortho([], -40, 40, -40, 40, -40, 40);
			}
			else {
				return null;
			}

			return {
				projectionMatrix: projectionMatrix,
				viewMatrix: viewMatrix
			};
		}


		private shadowFrameBufferOfQuality(rc: render.RenderContext, _quality: asset.ShadowQuality) {
			// TODO: each shadow quality level of shadows will have a dedicated, reusable FBO
			if (! this.shadowFBO_) {
				this.shadowFBO_ = render.makeShadowMapFrameBuffer(rc, 1024);
			}

			return this.shadowFBO_;
		}


		shadowViewForLight(rc: render.RenderContext, inst: LightInstance, nearZ: number): ShadowView | null {
			const fbo = this.shadowFrameBufferOfQuality(rc, this.shadowQualityBase_[<number>inst]);
			const projection = this.projectionSetupForLight(inst, fbo.width, fbo.height, nearZ);

			return projection && {
				light: inst,
				lightProjection: projection,
				shadowFBO: fbo
			};
		}


		// -- internal properties
		type(inst: LightInstance): asset.LightType {
			const offset = ((inst as number) * 16) + 3;
			return this.globalLightData_[offset];
		}


		colour(inst: LightInstance): number[] {
			const v4Index = ((inst as number) * 4) + 0;
			return container.copyIndexedVec4(this.globalLightData_, v4Index).slice(0, 3);
		}

		setColour(inst: LightInstance, newColour: Float3) {
			const offset = (inst as number) * 16;
			this.globalLightData_[offset] = newColour[0];
			this.globalLightData_[offset + 1] = newColour[1];
			this.globalLightData_[offset + 2] = newColour[2];
		}


		intensity(inst: LightInstance) {
			const offset = ((inst as number) * 16) + 7;
			return this.globalLightData_[offset];
		}

		setIntensity(inst: LightInstance, newIntensity: number) {
			const offset = ((inst as number) * 16) + 7;
			this.globalLightData_[offset] = newIntensity;
		}


		range(inst: LightInstance) {
			const offset = ((inst as number) * 16) + 11;
			return this.globalLightData_[offset];
		}

		setRange(inst: LightInstance, newRange: number) {
			const offset = ((inst as number) * 16) + 11;
			this.globalLightData_[offset] = newRange;
		}


		// cutoff is stored as the cosine of the angle for quick usage in the shader
		cutoff(inst: LightInstance) {
			const offset = ((inst as number) * 16) + 15;
			return Math.acos(this.globalLightData_[offset]);
		}

		setCutoff(inst: LightInstance, newCutoff: number) {
			const offset = ((inst as number) * 16) + 11;
			this.globalLightData_[offset] = Math.cos(newCutoff);
		}


		// -- shadow data

		shadowType(inst: LightInstance): asset.ShadowType {
			return this.shadowTypeBase_[<number>inst];
		}

		setShadowType(inst: LightInstance, newType: asset.ShadowType) {
			this.shadowTypeBase_[<number>inst] = newType;
		}


		shadowQuality(inst: LightInstance): asset.ShadowQuality {
			return this.shadowQualityBase_[<number>inst];
		}

		setShadowQuality(inst: LightInstance, newQuality: asset.ShadowQuality) {
			this.shadowQualityBase_[<number>inst] = newQuality;
		}


		shadowStrength(inst: LightInstance): number {
			return this.shadowStrengthBase_[inst as number];
		}

		setShadowStrength(inst: LightInstance, newStrength: number) {
			this.shadowStrengthBase_[inst as number] = newStrength;
		}


		shadowBias(inst: LightInstance): number {
			return this.shadowBiasBase_[inst as number];
		}

		setShadowBias(inst: LightInstance, newBias: number) {
			this.shadowBiasBase_[inst as number] = newBias;
		}
	}

} // ns sd.world
