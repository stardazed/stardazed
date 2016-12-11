// world/pbrmaterial - PBR model material data
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	//  ___ ___ ___ __  __      _           _      _ __  __                             
	// | _ \ _ ) _ \  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | _ / _ \   / |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_| |___/_|_\_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                    |___/         

	export const enum PBRMaterialFlags {
		SpecularSetup = 1 << 0,  // Metallic/Roughness if clear, Specular/Smoothness if set
		Emissive = 1 << 1,

		// RMA components
		RoughnessMap = 1 << 2,
		MetallicMap = 1 << 3,
		AmbientOcclusionMap = 1 << 4,

		// NormalHeight components
		NormalMap = 1 << 5,
		HeightMap = 1 << 6
	}


	export interface PBRMaterialData {
		colourData: Float32Array;     // baseColour(rgb), opacity
		materialParam: Float32Array;  // roughness, metallic, 0, 0 | specular(rgb), roughness
		emissiveData: Float32Array;   // emissive(rgb), emissiveIntensity
		texScaleOffsetData: Float32Array; // scale(xy), offset(xy)
		albedoMap: render.Texture | null;
		materialMap: render.Texture | null;
		normalHeightMap: render.Texture | null;
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
		private instanceData_: container.MultiArrayBuffer;
		private albedoMaps_: (render.Texture | null)[] = [];
		private materialMaps_: (render.Texture | null)[] = [];
		private normalHeightMaps_: (render.Texture | null)[] = [];

		private baseColourBase_: Float32Array;
		private materialBase_: Float32Array;
		private emissiveBase_: Float32Array;
		private texScaleOffsetBase_: Float32Array;
		private opacityBase_: Float32Array;
		private flagsBase_: ConstEnumArrayView<PBRMaterialFlags>;

		private tempVec4 = new Float32Array(4);

		constructor() {
			const initialCapacity = 256;

			const fields: container.MABField[] = [
				{ type: Float, count: 4 },  // baseColour[3], 0
				{ type: Float, count: 4 },  // roughness, metallic, 0, 0
				{ type: Float, count: 4 },  // emissiveColour[3], emissiveIntensity
				{ type: Float, count: 4 },  // textureScale[2], textureOffset[2]
				{ type: Float, count: 1 },  // opacity
				{ type: SInt32, count: 1 }, // flags
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();
		}


		private rebase() {
			this.baseColourBase_ = this.instanceData_.indexedFieldView(0);
			this.materialBase_ = this.instanceData_.indexedFieldView(1);
			this.emissiveBase_ = this.instanceData_.indexedFieldView(2);
			this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(3);
			this.opacityBase_ = this.instanceData_.indexedFieldView(4);
			this.flagsBase_ = this.instanceData_.indexedFieldView(5);
		}


		create(desc: asset.Material): PBRMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			// compile baseColour and RMA fixed vars
			vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
			container.setIndexedVec4(this.baseColourBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, math.clamp01(desc.roughness), math.clamp01(desc.metallic), 0, 0);
			container.setIndexedVec4(this.materialBase_, matIndex, this.tempVec4);

			// emissive
			vec4.set(this.tempVec4, desc.emissiveColour[0], desc.emissiveColour[1], desc.emissiveColour[2], desc.emissiveIntensity);
			container.setIndexedVec4(this.emissiveBase_, matIndex, this.tempVec4);

			// pack texture scale and offset into 4-comp float
			vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);

			let flags: PBRMaterialFlags = 0;
			if (desc.flags & asset.MaterialFlags.usesEmissive) { flags |= PBRMaterialFlags.Emissive; }
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

			const zero4 = vec4.zero();
			container.setIndexedVec4(this.baseColourBase_, matIndex, zero4);
			container.setIndexedVec4(this.materialBase_, matIndex, zero4);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, zero4);
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
		baseColour(inst: PBRMaterialInstance): Float3 {
			const offset = <number>inst * 4;
			return [
				this.baseColourBase_[offset],
				this.baseColourBase_[offset + 1],
				this.baseColourBase_[offset + 2]
			];
		}

		setBaseColour(inst: PBRMaterialInstance, newColour: Float3) {
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
			this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Metallic] = math.clamp01(newMetallic);
		}


		roughness(inst: PBRMaterialInstance): number {
			return this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness];
		}

		setRoughness(inst: PBRMaterialInstance, newRoughness: number) {
			this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness] = math.clamp01(newRoughness);
		}

		smoothness(inst: PBRMaterialInstance): number {
			return 1.0 - this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness];
		}

		setSmoothness(inst: PBRMaterialInstance, newSmoothness: number) {
			this.materialBase_[(<number>inst * 4) + PBRMaterialParam.Roughness] = 1.0 - math.clamp01(newSmoothness);
		}


		opacity(inst: PBRMaterialInstance): number {
			return this.opacityBase_[<number>inst];
		}

		setOpacity(inst: PBRMaterialInstance, newOpacity: number) {
			this.opacityBase_[<number>inst] = newOpacity;
		}


		textureScale(inst: PBRMaterialInstance): Float2 {
			const offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
		}

		setTextureScale(inst: PBRMaterialInstance, newScale: Float2) {
			const offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset] = newScale[0];
			this.texScaleOffsetBase_[offset + 1] = newScale[1];
		}


		textureOffset(inst: PBRMaterialInstance): Float2 {
			const offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
		}

		setTextureOffset(inst: PBRMaterialInstance, newOffset: Float2) {
			const offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset + 2] = newOffset[0];
			this.texScaleOffsetBase_[offset + 3] = newOffset[1];
		}


		albedoMap(inst: PBRMaterialInstance): render.Texture | null {
			return this.albedoMaps_[<number>inst];
		}

		setAlbedoMap(inst: PBRMaterialInstance, newTex: render.Texture | null) {
			this.albedoMaps_[<number>inst] = newTex;
		}

		materialMap(inst: PBRMaterialInstance): render.Texture | null {
			return this.materialMaps_[<number>inst];
		}

		normalHeightMap(inst: PBRMaterialInstance): render.Texture | null {
			return this.normalHeightMaps_[<number>inst];
		}


		flags(inst: PBRMaterialInstance): PBRMaterialFlags {
			return this.flagsBase_[<number>inst];
		}


		// direct data views to set uniforms with in PBRModelMgr
		getData(inst: PBRMaterialInstance): PBRMaterialData {
			const matIndex = <number>inst;

			const colourOpacity = new Float32Array(container.copyIndexedVec4(this.baseColourBase_, matIndex));
			colourOpacity[3] = this.opacityBase_[matIndex];

			return {
				colourData: colourOpacity,
				materialParam: <Float32Array>container.refIndexedVec4(this.materialBase_, matIndex),
				emissiveData: <Float32Array>container.refIndexedVec4(this.emissiveBase_, matIndex),
				texScaleOffsetData: <Float32Array>container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),

				albedoMap: this.albedoMaps_[matIndex],
				materialMap: this.materialMaps_[matIndex],
				normalHeightMap: this.normalHeightMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}
	}

} // ns sd.world
