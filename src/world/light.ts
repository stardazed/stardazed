// world/light - Light component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { UInt8, SInt32, Float } from "core/numeric";
import { TypedArray } from "core/array";
import { vec3, vec4, mat3, mat4, quat, va } from "math/veclib";
import { clamp01 } from "math/util";
import { ProjectionSetup } from "math/projection";
import { MABField, MultiArrayBuffer, InvalidatePointers } from  "container/multiarraybuffer";
import { RenderContext } from "render/rendercontext";
import { FrameBuffer } from "render/framebuffer";
import { makeShadowMapFrameBuffer } from "render/framebuffer-util";
import { Light, LightType, ShadowType, ShadowQuality } from "asset/types";
import { Instance, InstanceRange, InstanceLinearRange, InstanceSet, InstanceArrayView, InstanceIterator, ComponentManager } from "world/instance";
import { TransformManager, TransformInstance } from "world/transform";
import { Entity } from "world/entity";

export type LightInstance = Instance<LightManager>;
export type LightRange = InstanceRange<LightManager>;
export type LightSet = InstanceSet<LightManager>;
export type LightIterator = InstanceIterator<LightManager>;
export type LightArrayView = InstanceArrayView<LightManager>;


export interface LightData {
	type: number;
	colourData: va.Float4;     // colour[3], amplitude
	parameterData: va.Float4;  // ambIntensity, diffIntensity, range, cutoff
	position_cam: va.Float4;   // position[3], shadowStrength
	position_world: va.Float4; // position[3], 0
	direction: va.Float4;      // direction[3], shadowBias
}


export interface ShadowView {
	light: LightInstance;
	lightProjection: ProjectionSetup;
	shadowFBO: FrameBuffer;
}


export interface FogDescriptor {
	colour: va.Float3;
	offset: number;        // 0+
	depth: number;         // 0+,
	density: number;       // 0..1
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


export class LightManager implements ComponentManager<LightManager> {
	private instanceData_: MultiArrayBuffer;

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

	private shadowFBO_: FrameBuffer | null = null;

	constructor(private transformMgr_: TransformManager) {
		const initialCapacity = 256;

		const fields: MABField[] = [
			{ type: SInt32, count: 1 }, // entity
			{ type: SInt32, count: 1 }, // transformInstance
			{ type: UInt8, count: 1 }, // type
			{ type: Float, count: 4 }, // colour[3], amplitude(0..1)
			{ type: Float, count: 4 }, // ambientIntensity, diffuseIntensity, range(spot/point), cos(cutoff)(spot)
			{ type: UInt8, count: 1 }, // shadowType
			{ type: UInt8, count: 1 }, // shadowQuality
			{ type: Float, count: 2 }, // shadowStrength, shadowBias
		];

		this.instanceData_ = new MultiArrayBuffer(initialCapacity, fields);
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


	create(entity: Entity, desc: Light): LightInstance {
		// -- validate parameters
		assert(desc.type != LightType.None);
		if (desc.type == LightType.Point) {
			assert((desc.range !== undefined) && (desc.range >= 0), "Point lights require a valid range");
		}
		else if (desc.type == LightType.Spot) {
			assert((desc.range !== undefined) && (desc.range >= 0), "Spot lights require a valid range (0+)");
			assert((desc.cutoff !== undefined) && (desc.cutoff >= 0), "Spot lights require a valid cutoff arc (0+)");
		}

		// -- create instance
		if (this.instanceData_.extend() == InvalidatePointers.Yes) {
			this.rebase();
		}
		const instanceIx = this.instanceData_.count;

		// -- entity and transform links
		this.entityBase_[instanceIx] = <number>entity;
		this.transformBase_[instanceIx] = <number>this.transformMgr_.forEntity(entity);

		// -- colour and amplitude
		this.typeBase_[instanceIx] = desc.type;
		vec4.set(this.tempVec4_, desc.colour[0], desc.colour[1], desc.colour[2], 1.0);
		va.setIndexedVec4(this.colourBase_, instanceIx, this.tempVec4_);

		// -- parameters, force 0 for unused fields for specified type
		const range = (desc.range === undefined || desc.type == LightType.Directional) ? 0 : desc.range;
		const cutoff = (desc.cutoff === undefined || desc.type != LightType.Spot) ? 0 : desc.cutoff;
		vec4.set(this.tempVec4_, desc.ambientIntensity || 0, desc.diffuseIntensity, range, Math.cos(cutoff));
		va.setIndexedVec4(this.parameterBase_, instanceIx, this.tempVec4_);

		// -- shadow info
		if ((desc.shadowType != undefined) && (desc.shadowType != ShadowType.None)) {
			this.shadowTypeBase_[instanceIx] = desc.shadowType;
			this.shadowQualityBase_[instanceIx] = desc.shadowQuality || ShadowQuality.Auto;

			const paramData = va.refIndexedVec2(this.shadowParamBase_, instanceIx);
			paramData[ShadowParam.Strength] = (desc.shadowStrength != undefined) ? clamp01(desc.shadowStrength) : 1.0;
			paramData[ShadowParam.Bias] = (desc.shadowBias != undefined) ? clamp01(desc.shadowBias) : 0.05;
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

	setLocalPosition(inst: LightInstance, newPosition: va.Float3) {
		this.transformMgr_.setPosition(this.transformBase_[<number>inst], newPosition);
	}


	direction(inst: LightInstance) {
		const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(this.transformBase_[<number>inst]));
		return vec3.normalize([], vec3.transformMat3([], this.nullVec3_, rotMat));
	}

	setDirection(inst: LightInstance, newDirection: va.Float3) {
		const normalizedDir = vec3.normalize([], newDirection);
		this.transformMgr_.setRotation(this.transformBase_[<number>inst], quat.rotationTo([], this.nullVec3_, normalizedDir));
	}


	// -- derived properties

	projectionSetupForLight(inst: LightInstance, viewportWidth: number, viewportHeight: number, nearZ: number): ProjectionSetup | null {
		const transform = this.transformBase_[<number>inst];
		const worldPos = this.transformMgr_.worldPosition(transform);
		const worldDirection = this.direction(inst);
		const worldTarget = vec3.add([], worldPos, worldDirection);

		let viewMatrix: va.Float4x4;
		let projectionMatrix: va.Float4x4;

		const type = this.typeBase_[<number>inst];
		if (type == LightType.Spot) {
			const farZ = this.range(inst);
			const fov = this.cutoff(inst) * 2; // cutoff is half-angle
			viewMatrix = mat4.lookAt([], worldPos, worldTarget, [0, 1, 0]); // FIXME: this can likely be done cheaper
			projectionMatrix = mat4.perspective([], fov, viewportWidth / viewportHeight, nearZ, farZ);
			// TODO: cache this matrix?
		}
		else if (type == LightType.Directional) {
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


	private shadowFrameBufferOfQuality(rc: RenderContext, _quality: ShadowQuality) {
		// TODO: each shadow quality level of shadows will have a dedicated, reusable FBO
		if (! this.shadowFBO_) {
			this.shadowFBO_ = makeShadowMapFrameBuffer(rc, 1024);
		}

		return this.shadowFBO_;
	}


	shadowViewForLight(rc: RenderContext, inst: LightInstance, nearZ: number): ShadowView | null {
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
		return va.copyIndexedVec4(this.colourBase_, <number>inst).slice(0, 3);
	}

	setColour(inst: LightInstance, newColour: va.Float3) {
		const offset = <number>inst * 4;
		this.colourBase_[offset] = newColour[0];
		this.colourBase_[offset + 1] = newColour[1];
		this.colourBase_[offset + 2] = newColour[2];
	}


	amplitude(inst: LightInstance) {
		return this.colourBase_[(<number>inst * 4) + ColourParam.Amplitude];
	}

	setAmplitude(inst: LightInstance, newAmplitude: number) {
		return this.colourBase_[(<number>inst * 4) + ColourParam.Amplitude] = newAmplitude;
	}


	ambientIntensity(inst: LightInstance) {
		return this.parameterBase_[(<number>inst * 4) + LightParam.AmbIntensity];
	}

	setAmbientIntensity(inst: LightInstance, newIntensity: number) {
		this.parameterBase_[(<number>inst * 4) + LightParam.AmbIntensity] = newIntensity;
	}


	diffuseIntensity(inst: LightInstance) {
		return this.parameterBase_[(<number>inst * 4) + LightParam.DiffIntensity];
	}

	setDiffuseIntensity(inst: LightInstance, newIntensity: number) {
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


	// -- shader data

	getData(inst: LightInstance, viewMatrix: va.Float4x4, viewNormalMatrix: va.Float3x3): LightData {
		const transform = this.transformBase_[<number>inst];

		const paramData = va.copyIndexedVec2(this.shadowParamBase_, <number>inst);
		const posAndStrength = new Float32Array(4);
		const dirAndBias = new Float32Array(4);
		const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(transform));

		const lightPosWorld = this.transformMgr_.worldPosition(transform);
		const lightPosCam = vec3.transformMat4([], lightPosWorld, viewMatrix);
		const lightDirWorld = vec3.transformMat3([], this.nullVec3_, rotMat);
		const lightDirCam = vec3.transformMat3([], lightDirWorld, viewNormalMatrix);

		posAndStrength.set(lightPosCam, 0);
		posAndStrength[3] = paramData[ShadowParam.Strength];
		dirAndBias.set(vec3.normalize([], lightDirCam), 0);
		dirAndBias[3] = paramData[ShadowParam.Bias];

		return {
			type: this.typeBase_[<number>inst],
			colourData: va.refIndexedVec4(this.colourBase_, <number>inst),
			parameterData: va.refIndexedVec4(this.parameterBase_, <number>inst),
			position_cam: posAndStrength,
			position_world: lightPosWorld.concat(0),
			direction: dirAndBias
		};
	}
}
