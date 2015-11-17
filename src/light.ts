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


	export type LightInstance = Instance<LightManager>;

	export interface LightDescriptor {
		colour: ArrayOfNumber;
		ambientIntensity: number;
		diffuseIntensity: number;

		range?: number;  // m
		cutoff?: number; // rad
	}


	export interface LightData {
		type: number;
		colourData: ArrayOfNumber;
		parameterData: ArrayOfNumber;
		position: ArrayOfNumber;
		direction: ArrayOfNumber;
	}


	export class LightManager {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: TypedArray;
		private transformBase_: TypedArray;
		private typeBase_: TypedArray;
		private colourBase_: TypedArray;
		private parameterBase_: TypedArray;

		private tempVec4_ = new Float32Array(4);


		constructor(private transformMgr_: TransformManager) {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transformInstance
				{ type: UInt8, count: 1 },  // type
				{ type: Float, count: 4 },  // colour[3], amplitude(0..1)
				{ type: Float, count: 4 },  // ambientIntensity, diffuseIntensity, range(spot/point), cutoff(spot)
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.typeBase_ = this.instanceData_.indexedFieldView(2);
			this.colourBase_ = this.instanceData_.indexedFieldView(3);
			this.parameterBase_ = this.instanceData_.indexedFieldView(4);
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
			this.transformMgr_.setPositionAndRotation(transform, position, quat.rotationTo([], [0, 0, 1], direction));
			this.transformBase_[instanceIx] = <number>transform;

			// -- colour and amp
			this.typeBase_[instanceIx] = type;
			vec4.set(this.tempVec4_, desc.colour[0], desc.colour[1], desc.colour[2], 1.0);
			math.vectorArrayItem(this.colourBase_, math.Vec4, instanceIx).set(this.tempVec4_);

			// -- parameters, force 0 for unused fields for specified type
			var range = (type == LightType.Directional) ? 0 : desc.range;
			var cutoff = (type != LightType.Spot) ? 0 : desc.cutoff;
			vec4.set(this.tempVec4_, desc.ambientIntensity, desc.diffuseIntensity, range, cutoff);
			math.vectorArrayItem(this.parameterBase_, math.Vec4, instanceIx).set(this.tempVec4_);

			return instanceIx;
		}


		createDirectionalLight(entity: Entity, desc: LightDescriptor, direction: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Directional, desc, [0, 0, 0], direction);
		}


		createPointLight(entity: Entity, desc: LightDescriptor, position: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Point, desc, position, [0, 0, 1]); // arbitrary direction
		}


		createSpotLight(entity: Entity, desc: LightDescriptor, position: ArrayOfNumber, direction: ArrayOfNumber): LightInstance {
			return this.createLight(entity, LightType.Spot, desc, position, direction);
		}


		entity(inst: LightInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: LightInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}


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


		getData(inst: LightInstance): LightData {
			var transform = this.transformBase_[<number>inst];
			return {
				type: this.typeBase_[<number>inst],
				colourData: math.vectorArrayItem(this.colourBase_, math.Vec4, <number>inst),
				parameterData: math.vectorArrayItem(this.parameterBase_, math.Vec4, <number>inst),
				position: this.transformMgr_.position(transform),
				direction: vec3.transformQuat([], [0, 0, 1], this.transformMgr_.rotation(transform))
			};
		}
	}

} // ns sd.world
