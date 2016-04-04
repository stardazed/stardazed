// pbrmaterial - PBR model material data
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	//  ___ ___ ___ __  __      _           _      _ __  __                             
	// | _ \ _ ) _ \  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | _ / _ \   / |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_| |___/_|_\_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                    |___/         

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

	
	export interface PBRMaterialDescriptor {
		baseColour: Float3;
		metallic: number;               // 0..1
		roughness: number;              // 0..1

		textureScale: Float2;           // [0..1, 0..1], scale and offset apply to all textures, u and v clamped to 0..1
		textureOffset: Float2;

		albedoMap: render.Texture;
		rmaMap: render.Texture;
		normalHeightMap: render.Texture;

		flags: PBRMaterialFlags;
	}


	export function makePBRMaterialDescriptor(): PBRMaterialDescriptor {
		return {
			baseColour: vec3.copy([], math.Vec3.one),
			metallic: 0,
			roughness: 0,

			textureScale: vec2.copy([], math.Vec2.one),
			textureOffset: vec2.copy([], math.Vec2.zero),

			albedoMap: null,
			rmaMap: null,
			normalHeightMap: null,

			flags: 0
		};
	}


	export interface PBRMaterialData {
		colourData: Float32Array;     // baseColour(rgb), opacity
		materialParam: Float32Array;  // roughness, metallic, 0, 0 | specular(rgb), roughness
		texScaleOffsetData: Float32Array; // scale(xy), offset(xy)
		albedoMap: render.Texture;
		materialMap: render.Texture;
		normalHeightMap: render.Texture;
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
		private albedoMaps_: render.Texture[] = [];
		private materialMaps_: render.Texture[] = [];
		private normalHeightMaps_: render.Texture[] = [];

		private baseColourBase_: TypedArray;
		private materialBase_: TypedArray;
		private texScaleOffsetBase_: TypedArray;
		private opacityBase_: TypedArray;
		private flagsBase_: TypedArray;

		private tempVec4 = new Float32Array(4);

		constructor() {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: Float, count: 4 },  // baseColour[3], 0
				{ type: Float, count: 4 },  // roughness, metallic, 0, 0
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
			this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(2);
			this.opacityBase_ = this.instanceData_.indexedFieldView(3);
			this.flagsBase_ = this.instanceData_.indexedFieldView(4);
		}


		create(desc: PBRMaterialDescriptor): PBRMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			// compile baseColour and RMA fixed vars
			vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
			container.setIndexedVec4(this.baseColourBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, math.clamp01(desc.roughness), math.clamp01(desc.metallic), 0, 0);
			container.setIndexedVec4(this.materialBase_, matIndex, this.tempVec4);

			// pack texture scale and offset into 4-comp float
			vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);

			this.flagsBase_[matIndex] = desc.flags;

			this.albedoMaps_[matIndex] = desc.albedoMap;
			this.materialMaps_[matIndex] = desc.rmaMap;
			this.normalHeightMaps_[matIndex] = desc.normalHeightMap;

			this.opacityBase_[matIndex] = 1.0;

			return matIndex;
		}


		destroy(inst: PBRMaterialInstance) {
			var matIndex = <number>inst;

			container.setIndexedVec4(this.baseColourBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.materialBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, math.Vec4.zero);
			this.flagsBase_[matIndex] = 0;
			this.opacityBase_[matIndex] = 0;

			this.albedoMaps_[matIndex] = null;
			this.materialMaps_[matIndex] = null;
			this.normalHeightMaps_[matIndex] = null;

			// TODO: track/reuse freed instances etc.
		}


		destroyRange(range: PBRMaterialRange) {
			var iter = range.makeIterator();
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
			var offset = <number>inst * 4;
			return [
				this.baseColourBase_[offset],
				this.baseColourBase_[offset + 1],
				this.baseColourBase_[offset + 2]
			];
		}

		setBaseColour(inst: PBRMaterialInstance, newColour: Float3) {
			var offset = <number>inst * 4;
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
			var offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
		}

		setTextureScale(inst: PBRMaterialInstance, newScale: Float2) {
			var offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset] = newScale[0];
			this.texScaleOffsetBase_[offset + 1] = newScale[1];
		}


		textureOffset(inst: PBRMaterialInstance): Float2 {
			var offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
		}

		setTextureOffset(inst: PBRMaterialInstance, newOffset: Float2) {
			var offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset + 2] = newOffset[0];
			this.texScaleOffsetBase_[offset + 3] = newOffset[1];
		}


		albedoMap(inst: PBRMaterialInstance): render.Texture {
			return this.albedoMaps_[<number>inst];
		}

		setAlbedoMap(inst: PBRMaterialInstance, newTex: render.Texture) {
			this.albedoMaps_[<number>inst] = newTex;
		}

		materialMap(inst: PBRMaterialInstance): render.Texture {
			return this.materialMaps_[<number>inst];
		}

		normalHeightMap(inst: PBRMaterialInstance): render.Texture {
			return this.normalHeightMaps_[<number>inst];
		}


		flags(inst: PBRMaterialInstance): PBRMaterialFlags {
			return this.flagsBase_[<number>inst];
		}


		// direct data views to set uniforms with in PBRModelMgr
		getData(inst: PBRMaterialInstance): PBRMaterialData {
			var matIndex = <number>inst;

			var colourOpacity = new Float32Array(container.copyIndexedVec4(this.baseColourBase_, matIndex));
			colourOpacity[3] = this.opacityBase_[matIndex];

			return {
				colourData: colourOpacity,
				materialParam: <Float32Array>container.refIndexedVec4(this.materialBase_, matIndex),
				texScaleOffsetData: <Float32Array>container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),

				albedoMap: this.albedoMaps_[matIndex],
				materialMap: this.materialMaps_[matIndex],
				normalHeightMap: this.normalHeightMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}
	}

} // ns sd.world
