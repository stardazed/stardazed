// world/light - Light component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export type LightInstance = Instance<LightManager>;
	export type LightRange = InstanceRange<LightManager>;
	export type LightSet = InstanceSet<LightManager>;
	export type LightIterator = InstanceIterator<LightManager>;
	export type LightArrayView = InstanceArrayView<LightManager>;

	export interface LightData {
		type: number;
		colourData: Float4;    // colour[3], amplitude
		parameterData: Float4; // ambIntensity, diffIntensity, range, cutoff
		position_cam: Float4;      // position[3], shadowStrength
		position_world: Float4;      // position[3], 0
		direction: Float4;     // direction[3], shadowBias
	}


	export interface LightDataEx {
		colourData: Float4;     // colour[3], type
		position_cam: Float4;   // position_cam[3], intensity
		position_world: Float4; // position_world[3], range
		direction: Float4;      // direction[3], cutoff
	}


	export interface ShadowView {
		light: LightInstance;
		lightProjection: ProjectionSetup;
		shadowFBO: render.FrameBuffer;
	}


	// -- internal enums

	const enum ColourParam {
		Amplitude = 3
	}

	const enum LightParam {
		AmbIntensity,
		DiffIntensity,
		Range,
		Cutoff
	}

	const enum ShadowParam {
		Strength = 0,
		Bias = 1
	}


	// this setup allows for a renderbuffer up to 4K (3840 * 2160)
	// and a global list of up to 32768 active lights 
	const LUT_DIMENSION = 512;
	const LUT_LIGHTDATA_ROWS = 256;
	const LUT_INDEXLIST_ROWS = 240;
	const LUT_GRID_ROWS = 16;
	const TILE_DIMENSION = 32;

	const MAX_LIGHTS = ((LUT_DIMENSION * LUT_LIGHTDATA_ROWS) / 4) | 0;
	const MAX_SHADOWS = 256;


	export class LightManager implements ComponentManager<LightManager> {
		private instanceData_: container.FixedMultiArray;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;

		private lightData_: container.FixedMultiArray;
		private globalLightData_: Float32Array;
		private tileLightIndexes_: Float32Array;
		private lightGrid_: Float32Array;
		private lutTexture_: render.Texture;

		private shadowData_: container.FixedMultiArray;
		private shadowLightIndexBase_: LightArrayView;
		private shadowTypeBase_: ConstEnumArrayView<asset.ShadowType>;
		private shadowQualityBase_: ConstEnumArrayView<asset.ShadowQuality>;
		private shadowStrengthBase_: Float32Array;
		private shadowBiasBase_: Float32Array;

		private tempVec4_ = new Float32Array(4);
		private nullVec3_ = new Float32Array(3); // used to convert directions to rotations

		private shadowFBO_: render.FrameBuffer | null = null;

		constructor(rc: render.RenderContext, private transformMgr_: TransformManager) {
			// linking info
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transformInstance
			];
			this.instanceData_ = new container.FixedMultiArray(MAX_LIGHTS, instFields);
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);

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

			// shadow data
			const shadowFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // lightIndex
				{ type: SInt32, count: 1 }, // shadowType
				{ type: SInt32, count: 1 }, // shadowQuality
				{ type: SInt32, count: 1 }, // shadowStrength
				{ type: SInt32, count: 1 }, // shadowBias
			];
			this.shadowData_ = new container.FixedMultiArray(MAX_SHADOWS, shadowFields);
			this.shadowLightIndexBase_ = this.shadowData_.indexedFieldView(0);
			this.shadowTypeBase_ = this.shadowData_.indexedFieldView(1);
			this.shadowQualityBase_ = this.shadowData_.indexedFieldView(2);
			this.shadowStrengthBase_ = this.shadowData_.indexedFieldView(3);
			this.shadowBiasBase_ = this.shadowData_.indexedFieldView(4);

			vec3.set(this.nullVec3_, 1, 0, 0);
		}


		create(entity: Entity, desc: asset.Light): LightInstance {
			// -- validate parameters
			assert(desc.type != asset.LightType.None);
			if (desc.type == asset.LightType.Point) {
				assert((desc.range !== undefined) && (desc.range >= 0), "Point lights require a valid range");
			}
			else if (desc.type == asset.LightType.Spot) {
				assert((desc.range !== undefined) && (desc.range >= 0), "Spot lights require a valid range (0+)");
				assert((desc.cutoff !== undefined) && (desc.cutoff >= 0), "Spot lights require a valid cutoff arc (0+)");
			}

			// -- create instance
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const instanceIx = this.instanceData_.count;

			// -- entity and transform links
			this.entityBase_[instanceIx] = <number>entity;
			this.transformBase_[instanceIx] = <number>this.transformMgr_.forEntity(entity);

			// -- colour and amplitude
			this.typeBase_[instanceIx] = desc.type;
			vec4.set(this.tempVec4_, desc.colour[0], desc.colour[1], desc.colour[2], 1.0);
			container.setIndexedVec4(this.colourBase_, instanceIx, this.tempVec4_);

			// -- parameters, force 0 for unused fields for specified type
			const range = (desc.range === undefined || desc.type == asset.LightType.Directional) ? 0 : desc.range;
			const cutoff = (desc.cutoff === undefined || desc.type != asset.LightType.Spot) ? 0 : desc.cutoff;
			vec4.set(this.tempVec4_, desc.ambientIntensity || 0, desc.diffuseIntensity, range, Math.cos(cutoff));
			container.setIndexedVec4(this.parameterBase_, instanceIx, this.tempVec4_);

			// -- shadow info
			if ((desc.shadowType != undefined) && (desc.shadowType != asset.ShadowType.None)) {
				this.shadowTypeBase_[instanceIx] = desc.shadowType;
				this.shadowQualityBase_[instanceIx] = desc.shadowQuality || asset.ShadowQuality.Auto;

				const paramData = container.refIndexedVec2(this.shadowParamBase_, instanceIx);
				paramData[ShadowParam.Strength] = (desc.shadowStrength != undefined) ? math.clamp01(desc.shadowStrength) : 1.0;
				paramData[ShadowParam.Bias] = (desc.shadowBias != undefined) ? math.clamp01(desc.shadowBias) : 0.05;
			}

			return instanceIx;
		}


		destroy(_inst: LightInstance) {
			// TBI
		}


		destroyRange(range: LightRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() { return this.instanceData_.count; }


		valid(inst: LightInstance) {
			return <number>inst <= this.count;
		}


		all(): LightRange {
			return new InstanceLinearRange<LightManager>(1, this.count);
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

		projectionSetupForLight(inst: LightInstance, viewportWidth: number, viewportHeight: number, nearZ: number): ProjectionSetup | null {
			const transform = this.transformBase_[<number>inst];
			const worldPos = this.transformMgr_.worldPosition(transform);
			const worldDirection = this.direction(inst);
			const worldTarget = vec3.add([], worldPos, worldDirection);

			let viewMatrix: Float4x4;
			let projectionMatrix: Float4x4;

			const type = this.typeBase_[<number>inst];
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

		colour(inst: LightInstance): number[] {
			return container.copyIndexedVec4(this.colourBase_, <number>inst).slice(0, 3);
		}

		setColour(inst: LightInstance, newColour: Float3) {
			const offset = <number>inst * 4;
			this.colourBase_[offset] = newColour[0];
			this.colourBase_[offset + 1] = newColour[1];
			this.colourBase_[offset + 2] = newColour[2];
		}


		intensity(inst: LightInstance) {
			return this.parameterBase_[(<number>inst * 4) + LightParam.DiffIntensity];
		}

		setIntensity(inst: LightInstance, newIntensity: number) {
			this.parameterBase_[(<number>inst * 4) + LightParam.DiffIntensity] = newIntensity;
		}


		range(inst: LightInstance) {
			return this.parameterBase_[(<number>inst * 4) + LightParam.Range];
		}

		setRange(inst: LightInstance, newRange: number) {
			this.parameterBase_[(<number>inst * 4) + LightParam.Range] = newRange;
		}


		// cutoff is stored as the cosine of the angle for quick usage in the shader
		cutoff(inst: LightInstance) {
			const cosCutoff = this.parameterBase_[(<number>inst * 4) + LightParam.Cutoff];
			return Math.acos(cosCutoff);
		}

		setCutoff(inst: LightInstance, newCutoff: number) {
			this.parameterBase_[(<number>inst * 4) + LightParam.Cutoff] = Math.cos(newCutoff);
		}


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
			return this.shadowParamBase_[(<number>inst * 2) + ShadowParam.Strength];
		}

		setShadowStrength(inst: LightInstance, newStrength: number) {
			this.shadowParamBase_[(<number>inst * 2) + ShadowParam.Strength] = newStrength;
		}


		shadowBias(inst: LightInstance): number {
			return this.shadowParamBase_[(<number>inst * 2) + ShadowParam.Bias];
		}

		setShadowBias(inst: LightInstance, newBias: number) {
			this.shadowParamBase_[(<number>inst * 2) + ShadowParam.Bias] = newBias;
		}
	}

} // ns sd.world
