// light - Light component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export const enum LightType {
		None,
		Directional,
		Point,
		Spot
	}


	export const enum ShadowType {
		None,
		Hard,
		Soft
	}


	export const enum ShadowQuality {
		Auto
	}


	export type LightInstance = Instance<LightManager>;

	export interface LightDescriptor {
		colour: ArrayOfNumber;
		ambientIntensity: number;
		diffuseIntensity: number;

		range?: number;  // m   (point/spot only)
		cutoff?: number; // rad (spot only)

		shadowType?: ShadowType;
		shadowQuality?: ShadowQuality;
		shadowStrength?: number;  // 0..1
		shadowBias?: number;      // 0.001..0.1
	}


	export interface LightData {
		type: number;
		colourData: ArrayOfNumber;    // vec4, colour[3], amplitude
		parameterData: ArrayOfNumber; // vec4, ambIntensity, diffIntensity, range, cutoff
		position: ArrayOfNumber;      // vec4, position[3], shadowStrength
		direction: ArrayOfNumber;     // vec4, direction[3], shadowBias
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


	export class LightManager {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: TypedArray;
		private transformBase_: TypedArray;
		private typeBase_: TypedArray;
		private colourBase_: TypedArray;
		private parameterBase_: TypedArray;
		private shadowTypeBase_: TypedArray;
		private shadowQualityBase_: TypedArray;
		private shadowParamBase_: TypedArray;

		private tempVec4_ = new Float32Array(4);
		private nullVec3_ = new Float32Array(3); // used to convert directions to rotations


		constructor(private transformMgr_: TransformManager) {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transformInstance
				{ type: UInt8,  count: 1 }, // type
				{ type: Float,  count: 4 }, // colour[3], amplitude(0..1)
				{ type: Float,  count: 4 }, // ambientIntensity, diffuseIntensity, range(spot/point), cos(cutoff)(spot)
				{ type: UInt8,  count: 1 }, // shadowType
				{ type: UInt8,  count: 1 }, // shadowQuality
				{ type: Float,  count: 2 }, // shadowStrength, shadowBias
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();

			vec3.set(this.nullVec3_, 1, 0, 0);
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.typeBase_ = this.instanceData_.indexedFieldView(2);
			this.colourBase_ = this.instanceData_.indexedFieldView(3);
			this.parameterBase_ = this.instanceData_.indexedFieldView(4);
			this.shadowTypeBase_ = this.instanceData_.indexedFieldView(5);
			this.shadowQualityBase_ = this.instanceData_.indexedFieldView(6);
			this.shadowParamBase_ = this.instanceData_.indexedFieldView(7);
		}


		create(entity: Entity, type: LightType, desc: LightDescriptor): LightInstance {
			// -- validate parameters
			assert(type != LightType.None);
			if (type == LightType.Point) {
				assert((desc.range != undefined) && (desc.range >= 0), "Point lights require a valid range");
			}
			else if (type == LightType.Spot) {
				assert((desc.range != undefined) && (desc.range >= 0), "Spot lights require a valid range (0+)");
				assert((desc.cutoff != undefined) && (desc.cutoff >= 0), "Spot lights require a valid cutoff arc (0+)");
			}

			// -- create instance
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var instanceIx = this.instanceData_.count;

			// -- entity and transform links
			this.entityBase_[instanceIx] = <number>entity;
			this.transformBase_[instanceIx] = <number>this.transformMgr_.forEntity(entity);

			// -- colour and amp
			this.typeBase_[instanceIx] = type;
			vec4.set(this.tempVec4_, desc.colour[0], desc.colour[1], desc.colour[2], 1.0);
			math.vectorArrayItem(this.colourBase_, math.Vec4, instanceIx).set(this.tempVec4_);

			// -- parameters, force 0 for unused fields for specified type
			var range = (type == LightType.Directional) ? 0 : desc.range;
			var cutoff = (type != LightType.Spot) ? 0 : desc.cutoff;
			vec4.set(this.tempVec4_, desc.ambientIntensity, desc.diffuseIntensity, range, Math.cos(cutoff));
			math.vectorArrayItem(this.parameterBase_, math.Vec4, instanceIx).set(this.tempVec4_);

			// -- shadow info
			if ((desc.shadowType != undefined) && (desc.shadowType != ShadowType.None)) {
				this.shadowTypeBase_[instanceIx] = desc.shadowType;
				this.shadowQualityBase_[instanceIx] = desc.shadowQuality || ShadowQuality.Auto;

				var paramData = math.vectorArrayItem(this.shadowParamBase_, math.Vec2, instanceIx);
				paramData[ShadowParam.Strength] = (desc.shadowStrength != undefined) ? math.clamp01(desc.shadowStrength) : 1.0;
				paramData[ShadowParam.Bias] = (desc.shadowBias != undefined) ? math.clamp01(desc.shadowBias) : 0.05;
			}

			return instanceIx;
		}


		// -- linked objects

		entity(inst: LightInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: LightInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}


		// -- indirect properties (in Transform)

		position(inst: LightInstance): ArrayOfNumber {
			return vec3.clone(this.transformMgr_.worldPosition(this.transformBase_[<number>inst]));
		}

		setPosition(inst: LightInstance, newPosition: ArrayOfNumber) {
			this.transformMgr_.setPosition(this.transformBase_[<number>inst], newPosition);
		}


		direction(inst: LightInstance): ArrayOfNumber {
			var rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(this.transformBase_[<number>inst]));
			return vec3.normalize([], vec3.transformMat3([], this.nullVec3_, rotMat));
		}

		setDirection(inst: LightInstance, newDirection: ArrayOfNumber) {
			var normalizedDir = vec3.normalize([], newDirection);
			this.transformMgr_.setRotation(this.transformBase_[<number>inst], quat.rotationTo([], this.nullVec3_, normalizedDir));
		}


		// -- internal properties

		colour(inst: LightInstance) {
			return math.vectorArrayItem(this.colourBase_, math.Vec4, <number>inst).subarray(0, 3);
		}


		amplitude(inst: LightInstance) {
			return math.vectorArrayItem(this.colourBase_, math.Vec4, <number>inst)[3];
		}

		setAmplitude(inst: LightInstance, newAmplitude: number) {
			math.vectorArrayItem(this.colourBase_, math.Vec4, <number>inst)[3] = newAmplitude;
		}


		ambientIntensity(inst: LightInstance) {
			return math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.AmbIntensity];
		}

		setAmbientIntensity(inst: LightInstance, newIntensity: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.AmbIntensity] = newIntensity;
		}


		diffuseIntensity(inst: LightInstance) {
			return math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.DiffIntensity];
		}

		setDiffuseIntensity(inst: LightInstance, newIntensity: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.DiffIntensity] = newIntensity;
		}


		range(inst: LightInstance) {
			return math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.Range];
		}

		setRange(inst: LightInstance, newRange: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.Range] = newRange;
		}


		// cutoff is stored as the cosine of the angle for quick usage in the shader
		cutoff(inst: LightInstance) {
			return Math.acos(math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.Cutoff]);
		}

		setCutoff(inst: LightInstance, newCutoff: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[LightParam.Cutoff] = Math.cos(newCutoff);
		}


		shadowType(inst: LightInstance): ShadowType {
			return this.shadowTypeBase_[<number>inst];
		}

		setShadowType(inst: LightInstance, newType: ShadowType) {
			this.shadowTypeBase_[<number>inst] = newType;
		}


		shadowQuality(inst: LightInstance): ShadowQuality {
			return this.shadowQualityBase_[<number>inst];
		}

		setShadowQuality(inst: LightInstance, newQuality: ShadowQuality) {
			this.shadowQualityBase_[<number>inst] = newQuality;
		}


		shadowStrength(inst: LightInstance): number {
			return math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Strength];
		}

		setShadowStrength(inst: LightInstance, newStrength: number) {
			math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Strength] = newStrength;
		}


		shadowBias(inst: LightInstance): number {
			return math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Bias];
		}

		setShadowBias(inst: LightInstance, newBias: number) {
			math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Bias] = newBias;
		}


		// -- shader data

		getData(inst: LightInstance): LightData {
			var transform = this.transformBase_[<number>inst];

			var paramData = math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst);
			var posAndStrength = new Float32Array(4);
			var dirAndBias = new Float32Array(4);
			var rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(transform));

			posAndStrength.set(this.transformMgr_.worldPosition(transform), 0);
			posAndStrength[3] = paramData[ShadowParam.Strength];
			dirAndBias.set(vec3.normalize([], vec3.transformMat3([], this.nullVec3_, rotMat)), 0);
			dirAndBias[3] = paramData[ShadowParam.Bias];

			return {
				type: this.typeBase_[<number>inst],
				colourData: math.vectorArrayItem(this.colourBase_, math.Vec4, <number>inst),
				parameterData: math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst),
				position: posAndStrength,
				direction: dirAndBias
			};
		}
	}

} // ns sd.world
