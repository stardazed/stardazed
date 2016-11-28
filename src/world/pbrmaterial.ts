// world/pbrmaterial - PBR model material data
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { SInt32, Float } from "core/numeric";
import { ConstEnumArrayView } from "core/array";
import { clamp01 } from "math/util";
import { vec4, va } from "math/veclib";
import { MABField, MultiArrayBuffer, InvalidatePointers } from  "container/multiarraybuffer";
import { Texture } from "render/texture";
import { Material } from "asset/types";
import { Instance, InstanceRange, InstanceLinearRange, InstanceSet, InstanceArrayView, InstanceIterator, ComponentManager } from "world/instance";

export const enum PBRMaterialFlags {
	SpecularSetup = 1 << 0,  // Metallic/Roughness if clear, Specular/Smoothness if set

	// RMA components
	RoughnessMap = 1 << 1,
	MetallicMap = 1 << 2,
	AmbientOcclusionMap = 1 << 3,

	// NormalHeight components
	NormalMap = 1 << 4,
	HeightMap = 1 << 5
}


export interface PBRMaterialData {
	colourData: Float32Array;     // baseColour(rgb), opacity
	materialParam: Float32Array;  // roughness, metallic, 0, 0 | specular(rgb), roughness
	texScaleOffsetData: Float32Array; // scale(xy), offset(xy)
	albedoMap: Texture | null;
	materialMap: Texture | null;
	normalHeightMap: Texture | null;
	flags: PBRMaterialFlags;
}


const enum PBRMaterialParam {
	Roughness = 0,
	Metallic = 1,
	// AmbientOcclusion = 2 // only in a texture
}


export type PBRMaterialInstance = Instance<PBRMaterialManager>;
export type PBRMaterialRange = InstanceRange<PBRMaterialManager>;
export type PBRMaterialSet = InstanceSet<PBRMaterialManager>;
export type PBRMaterialIterator = InstanceIterator<PBRMaterialManager>;
export type PBRMaterialArrayView = InstanceArrayView<PBRMaterialManager>;


export class PBRMaterialManager implements ComponentManager<PBRMaterialManager> {
	private instanceData_: MultiArrayBuffer;
	private albedoMaps_: (Texture | null)[] = [];
	private materialMaps_: (Texture | null)[] = [];
	private normalHeightMaps_: (Texture | null)[] = [];

	private baseColourBase_: Float32Array;
	private materialBase_: Float32Array;
	private texScaleOffsetBase_: Float32Array;
	private opacityBase_: Float32Array;
	private flagsBase_: ConstEnumArrayView<PBRMaterialFlags>;

	private tempVec4 = new Float32Array(4);

	constructor() {
		const initialCapacity = 256;

		const fields: MABField[] = [
			{ type: Float, count: 4 },  // baseColour[3], 0
			{ type: Float, count: 4 },  // roughness, metallic, 0, 0
			{ type: Float, count: 4 },  // textureScale[2], textureOffset[2]
			{ type: Float, count: 1 },  // opacity
			{ type: SInt32, count: 1 }, // flags
		];

		this.instanceData_ = new MultiArrayBuffer(initialCapacity, fields);
		this.rebase();
	}


	private rebase() {
		this.baseColourBase_ = this.instanceData_.indexedFieldView(0);
		this.materialBase_ = this.instanceData_.indexedFieldView(1);
		this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(2);
		this.opacityBase_ = this.instanceData_.indexedFieldView(3);
		this.flagsBase_ = this.instanceData_.indexedFieldView(4);
	}


	create(desc: Material): PBRMaterialInstance {
		if (this.instanceData_.extend() == InvalidatePointers.Yes) {
			this.rebase();
		}
		const matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

		// compile baseColour and RMA fixed vars
		vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
		va.setIndexedVec4(this.baseColourBase_, matIndex, this.tempVec4);
		vec4.set(this.tempVec4, clamp01(desc.roughness), clamp01(desc.metallic), 0, 0);
		va.setIndexedVec4(this.materialBase_, matIndex, this.tempVec4);

		// pack texture scale and offset into 4-comp float
		vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
		va.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);

		let flags: PBRMaterialFlags = 0;
		if (desc.roughnessTexture) { flags |= PBRMaterialFlags.RoughnessMap; }
		if (desc.metallicTexture) { flags |= PBRMaterialFlags.MetallicMap; }
		if (desc.ambientOcclusionTexture) { flags |= PBRMaterialFlags.AmbientOcclusionMap; }
		if (desc.normalTexture) { flags |= PBRMaterialFlags.NormalMap; }
		if (desc.heightTexture) { flags |= PBRMaterialFlags.HeightMap; }
		this.flagsBase_[matIndex] = flags;

		// FIXME: these need to have been already allocated and packed together (RMA, NormHeight)

		this.albedoMaps_[matIndex] = desc.albedoTexture ? desc.albedoTexture.texture! : null;
		this.materialMaps_[matIndex] = desc.roughnessTexture ? desc.roughnessTexture.texture! : null;
		this.normalHeightMaps_[matIndex] = desc.normalTexture ? desc.normalTexture.texture! : null;

		this.opacityBase_[matIndex] = 1.0;

		return matIndex;
	}


	destroy(inst: PBRMaterialInstance) {
		const matIndex = <number>inst;

		va.setIndexedVec4(this.baseColourBase_, matIndex, vec4.zero());
		va.setIndexedVec4(this.materialBase_, matIndex, vec4.zero());
		va.setIndexedVec4(this.texScaleOffsetBase_, matIndex, vec4.zero());
		this.flagsBase_[matIndex] = 0;
		this.opacityBase_[matIndex] = 0;

		this.albedoMaps_[matIndex] = null;
		this.materialMaps_[matIndex] = null;
		this.normalHeightMaps_[matIndex] = null;

		// TODO: track/reuse freed instances etc.
	}


	destroyRange(range: PBRMaterialRange) {
		const iter = range.makeIterator();
		while (iter.next()) {
			this.destroy(iter.current);
		}
	}


	get count() { return this.instanceData_.count; }

	valid(inst: PBRMaterialInstance) {
		return <number>inst <= this.count;
	}

	all(): PBRMaterialRange {
		return new InstanceLinearRange<PBRMaterialManager>(1, this.count);
	}


	// -- individual element field accessors
	baseColour(inst: PBRMaterialInstance): va.Float3 {
		const offset = <number>inst * 4;
		return [
			this.baseColourBase_[offset],
			this.baseColourBase_[offset + 1],
			this.baseColourBase_[offset + 2]
		];
	}

	setBaseColour(inst: PBRMaterialInstance, newColour: va.Float3) {
		const offset = <number>inst * 4;
		this.baseColourBase_[offset]     = newColour[0];
		this.baseColourBase_[offset + 1] = newColour[1];
		this.baseColourBase_[offset + 2] = newColour[2];
	}


	metallic(inst: PBRMaterialInstance): number {
		assert(0 === (this.flagsBase_[<number>inst] & PBRMaterialFlags.SpecularSetup), "Material must be in metallic setup");
		return this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Metallic];
	}

	setMetallic(inst: PBRMaterialInstance, newMetallic: number) {
		assert(0 === (this.flagsBase_[<number>inst] & PBRMaterialFlags.SpecularSetup), "Material must be in metallic setup");
		this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Metallic] = clamp01(newMetallic);
	}


	roughness(inst: PBRMaterialInstance): number {
		return this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness];
	}

	setRoughness(inst: PBRMaterialInstance, newRoughness: number) {
		this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness] = clamp01(newRoughness);
	}

	smoothness(inst: PBRMaterialInstance): number {
		return 1.0 - this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness];
	}

	setSmoothness(inst: PBRMaterialInstance, newSmoothness: number) {
		this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness] = 1.0 - clamp01(newSmoothness);
	}


	opacity(inst: PBRMaterialInstance): number {
		return this.opacityBase_[<number>inst];
	}

	setOpacity(inst: PBRMaterialInstance, newOpacity: number) {
		this.opacityBase_[<number>inst] = newOpacity;
	}


	textureScale(inst: PBRMaterialInstance): va.Float2 {
		const offset = <number>inst * 4;
		return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
	}

	setTextureScale(inst: PBRMaterialInstance, newScale: va.Float2) {
		const offset = <number>inst * 4;
		this.texScaleOffsetBase_[offset] = newScale[0];
		this.texScaleOffsetBase_[offset + 1] = newScale[1];
	}


	textureOffset(inst: PBRMaterialInstance): va.Float2 {
		const offset = <number>inst * 4;
		return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
	}

	setTextureOffset(inst: PBRMaterialInstance, newOffset: va.Float2) {
		const offset = <number>inst * 4;
		this.texScaleOffsetBase_[offset + 2] = newOffset[0];
		this.texScaleOffsetBase_[offset + 3] = newOffset[1];
	}


	albedoMap(inst: PBRMaterialInstance): Texture | null {
		return this.albedoMaps_[<number>inst];
	}

	setAlbedoMap(inst: PBRMaterialInstance, newTex: Texture | null) {
		this.albedoMaps_[<number>inst] = newTex;
	}

	materialMap(inst: PBRMaterialInstance): Texture | null {
		return this.materialMaps_[<number>inst];
	}

	normalHeightMap(inst: PBRMaterialInstance): Texture | null {
		return this.normalHeightMaps_[<number>inst];
	}


	flags(inst: PBRMaterialInstance): PBRMaterialFlags {
		return this.flagsBase_[<number>inst];
	}


	// direct data views to set uniforms with in PBRModelMgr
	getData(inst: PBRMaterialInstance): PBRMaterialData {
		const matIndex = <number>inst;

		const colourOpacity = new Float32Array(va.copyIndexedVec4(this.baseColourBase_, matIndex));
		colourOpacity[3] = this.opacityBase_[matIndex];

		return {
			colourData: colourOpacity,
			materialParam: <Float32Array>va.refIndexedVec4(this.materialBase_, matIndex),
			texScaleOffsetData: <Float32Array>va.refIndexedVec4(this.texScaleOffsetBase_, matIndex),

			albedoMap: this.albedoMaps_[matIndex],
			materialMap: this.materialMaps_[matIndex],
			normalHeightMap: this.normalHeightMaps_[matIndex],

			flags: this.flagsBase_[matIndex]
		};
	}
}
