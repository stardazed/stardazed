// entity/light - Light component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export const enum LightType {
		None,
		Directional,
		Point,
		Spot
	}

	export interface Light {
		type: LightType;

		colour: Float3;
		intensity: number;

		range?: number;  // m   (point/spot only)
		cutoff?: number; // rad (spot only)

		castsShadows?: boolean;
		shadowStrength?: number;  // 0..1
		shadowBias?: number;      // 0.001..0.1
	}

	// ----

	export type LightInstance = Instance<LightComponent>;
	export type LightRange = InstanceRange<LightComponent>;
	export type LightSet = InstanceSet<LightComponent>;
	export type LightIterator = InstanceIterator<LightComponent>;
	export type LightArrayView = InstanceArrayView<LightComponent>;


	export class LightComponent implements Component<LightComponent> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private castsShadowsBase_: Uint8Array;

		private count_: number;
		readonly lightData: Float32Array;

		private readonly nullVec3_: Float32Array; // used to convert directions to rotations


		constructor(private transformMgr_: TransformComponent) {
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transformInstance
				{ type: UInt8,  count: 1 }, // enabled
				{ type: UInt8,  count: 1 }, // castsShadows
				{ type: SInt32, count: 1 }, // shadowType
				{ type: SInt32, count: 1 }, // shadowQuality
			];
			this.instanceData_ = new container.MultiArrayBuffer(1280, instFields);
			this.rebase();

			this.lightData = new Float32Array(4 * 5 * 1280); // 5 vec4s per light
			this.count_ = 0;

			this.nullVec3_ = vec3.fromValues(1, 0, 0);
		}

		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.enabledBase_ = this.instanceData_.indexedFieldView(2);
			this.castsShadowsBase_ = this.instanceData_.indexedFieldView(3);
		}

		create(entity: Entity, desc: Light): LightInstance {
			// do we have any room left?
			assert(this.count_ < this.instanceData_.capacity, "light storage exhausted");
			this.count_ += 1;
			const instance = this.count_;

			// validate parameters
			assert(desc.type !== LightType.None);

			// linking
			this.entityBase_[instance] = entity;
			this.transformBase_[instance] = this.transformMgr_.forEntity(entity);

			// all lights start out enabled
			this.enabledBase_[instance] = 1;

			// non-shader shadow data (all optional)
			this.castsShadowsBase_[instance] = +(desc.castsShadows || false);

			// write global light data
			const gldV4Index = instance * 5;

			// vec0: colour[3], type
			container.setIndexedVec4(this.lightData, gldV4Index + 0, [desc.colour[0], desc.colour[1], desc.colour[2], desc.type]);
			// vec1: position_cam[3], intensity
			container.setIndexedVec4(this.lightData, gldV4Index + 1, [0, 0, 0, Math.max(0, desc.intensity)]);
			// vec2: position_world[3], range
			container.setIndexedVec4(this.lightData, gldV4Index + 2, [0, 0, 0, desc.range || 0]);
			// vec3: direction[3], cutoff
			container.setIndexedVec4(this.lightData, gldV4Index + 3, [0, 0, 0, Math.cos(desc.cutoff || 0)]);
			// vec4: shadowStrength, shadowBias, 0, 0
			container.setIndexedVec4(this.lightData, gldV4Index + 4, [desc.shadowStrength || 1.0, desc.shadowBias || 0.002, 0, 0]);

			return instance;
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


		get count() { return this.count_; }

		valid(inst: LightInstance) {
			return (inst as number) > 0 && (inst as number) <= this.count_;
		}

		all(): LightRange {
			return new InstanceLinearRange<LightComponent>(1, this.count);
		}

		// [AL] temporary
		allEnabled(): LightRange {
			const on: LightInstance[] = [];
			const all = this.all().makeIterator();
			while (all.next()) {
				const l = all.current;
				if (this.enabledBase_[l as number]) {
					on.push(all.current);
				}
			}
			return new InstanceArrayRange(on);
		}


		// -- linked objects

		entity(inst: LightInstance): Entity {
			return this.entityBase_[inst as number];
		}

		transform(inst: LightInstance): TransformInstance {
			return this.transformBase_[inst as number];
		}


		// -- enabledness

		enabled(inst: LightInstance): boolean {
			return this.enabledBase_[inst as number] === 1;
		}

		setEnabled(inst: LightInstance, newEnabled: boolean) {
			const newVal = +newEnabled;
			if (this.enabledBase_[inst as number] !== newVal) {
				this.enabledBase_[inst as number] = newVal;
			}
		}


		// -- indirect properties (in Transform)

		localPosition(inst: LightInstance): number[] {
			return this.transformMgr_.localPosition(this.transformBase_[inst as number]);
		}

		setLocalPosition(inst: LightInstance, newPosition: Float3) {
			this.transformMgr_.setPosition(this.transformBase_[inst as number], newPosition);
		}

		worldPosition(inst: LightInstance): number[] {
			return this.transformMgr_.worldPosition(this.transformBase_[inst as number]);
		}


		direction(inst: LightInstance) {
			const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(this.transformBase_[inst as number]));
			return vec3.normalize([], vec3.transformMat3([], this.nullVec3_, rotMat));
		}

		setDirection(inst: LightInstance, newDirection: Float3) {
			const normalizedDir = vec3.normalize([], newDirection);
			this.transformMgr_.setRotation(this.transformBase_[inst as number], quat.rotationTo([], this.nullVec3_, normalizedDir));
		}


		// -- derived properties

		positionCameraSpace(inst: LightInstance) {
			const posCamOffset = ((inst as number) * 20) + 4;
			return this.lightData.slice(posCamOffset, posCamOffset + 3);
		}

		// -- internal properties

		type(inst: LightInstance): LightType {
			const offset = ((inst as number) * 20) + 3;
			return this.lightData[offset];
		}


		colour(inst: LightInstance): number[] {
			const v4Index = ((inst as number) * 5) + 0;
			return container.copyIndexedVec4(this.lightData, v4Index).slice(0, 3);
		}

		setColour(inst: LightInstance, newColour: Float3) {
			const offset = (inst as number) * 20;
			this.lightData[offset] = newColour[0];
			this.lightData[offset + 1] = newColour[1];
			this.lightData[offset + 2] = newColour[2];
		}


		intensity(inst: LightInstance) {
			const offset = ((inst as number) * 20) + 7;
			return this.lightData[offset];
		}

		setIntensity(inst: LightInstance, newIntensity: number) {
			const offset = ((inst as number) * 20) + 7;
			this.lightData[offset] = newIntensity;
		}


		range(inst: LightInstance) {
			const offset = ((inst as number) * 20) + 11;
			return this.lightData[offset];
		}

		setRange(inst: LightInstance, newRange: number) {
			const offset = ((inst as number) * 20) + 11;
			this.lightData[offset] = newRange;
		}


		// cutoff is stored as the cosine of the angle for quick usage in the shader
		cutoff(inst: LightInstance) {
			const offset = ((inst as number) * 20) + 15;
			return Math.acos(this.lightData[offset]);
		}

		setCutoff(inst: LightInstance, newCutoff: number) {
			const offset = ((inst as number) * 20) + 15;
			this.lightData[offset] = Math.cos(newCutoff);
		}


		// -- shadow data

		castsShadows(inst: LightInstance): boolean {
			return this.castsShadowsBase_[inst as number] === 1;
		}

		setCastsShadows(inst: LightInstance, casts: boolean) {
			this.castsShadowsBase_[inst as number] = +casts;
		}

		shadowStrength(inst: LightInstance): number {
			const offset = ((inst as number) * 20) + 16;
			return this.lightData[offset];
		}

		setShadowStrength(inst: LightInstance, newStrength: number) {
			const offset = ((inst as number) * 20) + 16;
			this.lightData[offset] = newStrength;
		}


		shadowBias(inst: LightInstance): number {
			const offset = ((inst as number) * 20) + 17;
			return this.lightData[offset];
		}

		setShadowBias(inst: LightInstance, newBias: number) {
			const offset = ((inst as number) * 20) + 17;
			this.lightData[offset] = newBias;
		}
	}

} // ns sd.world
