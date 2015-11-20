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


		private createLight(entity: Entity, type: LightType, desc: LightDescriptor, position: ArrayOfNumber, direction: ArrayOfNumber): LightInstance {
			// -- validate parameters
			assert(type != LightType.None);
			if (type == LightType.Directional) {
				assert(vec3.length(direction) > 0, "Directional lights require a valid direction vector");
			}
			else if (type == LightType.Point) {
				assert((desc.range != undefined) && (desc.range >= 0), "Point lights require a valid range");
			}
			else if (type == LightType.Spot) {
				assert(vec3.length(direction) > 0, "Spot lights require a valid direction vector");
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

			var transform = this.transformMgr_.forEntity(entity);
			vec3.normalize(direction, direction);
			this.transformMgr_.setPositionAndRotation(transform, position, quat.rotationTo([], this.nullVec3_, direction));
			this.transformBase_[instanceIx] = <number>transform;

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


		createDirectionalLight(entity: Entity, desc: LightDescriptor, direction: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Directional, desc, [0, 0, 0], direction);
		}


		createPointLight(entity: Entity, desc: LightDescriptor, position: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Point, desc, position, this.nullVec3_);
		}


		createSpotLight(entity: Entity, desc: LightDescriptor, position: ArrayOfNumber, direction: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Spot, desc, position, direction);
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
			return vec3.clone(this.transformMgr_.position(this.transformBase_[<number>inst]));
		}

		setPosition(inst: LightInstance, newPosition: ArrayOfNumber) {
			this.transformMgr_.setPosition(this.transformBase_[<number>inst], newPosition);
		}


		direction(inst: LightInstance): ArrayOfNumber {
			return vec3.transformQuat([], this.nullVec3_, this.transformMgr_.rotation(this.transformBase_[<number>inst]));
		}

		setDirection(inst: LightInstance, newDirection: ArrayOfNumber) {
			this.transformMgr_.setRotation(this.transformBase_[<number>inst], quat.rotationTo([], this.nullVec3_, newDirection));
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
			return math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[0];
		}

		setAmbientIntensity(inst: LightInstance, newIntensity: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[0] = newIntensity;
		}


		diffuseIntensity(inst: LightInstance) {
			return math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[1];
		}

		setDiffuseIntensity(inst: LightInstance, newIntensity: number) {
			math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst)[1] = newIntensity;
		}


		shadowType(inst: LightInstance): ShadowType {
			return this.shadowTypeBase_[<number>inst];
		}

		shadowQuality(inst: LightInstance): ShadowQuality {
			return this.shadowQualityBase_[<number>inst];
		}

		shadowStrength(inst: LightInstance): number {
			return math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Strength];
		}

		shadowBias(inst: LightInstance): number {
			return math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst)[ShadowParam.Bias];
		}


		// -- shader data

		getData(inst: LightInstance): LightData {
			var transform = this.transformBase_[<number>inst];

			var paramData = math.vectorArrayItem(this.shadowParamBase_, math.Vec2, <number>inst);
			var posAndStrength = new Float32Array(4);
			var dirAndBias = new Float32Array(4);

			posAndStrength.set(this.transformMgr_.position(transform), 0);
			posAndStrength[3] = paramData[ShadowParam.Strength];
			dirAndBias.set(vec3.transformQuat([], this.nullVec3_, this.transformMgr_.rotation(transform)), 0);
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
