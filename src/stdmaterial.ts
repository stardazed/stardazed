// stdmaterial - standard model material data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="math.ts" />
/// <reference path="container.ts" />
/// <reference path="entity.ts" />

namespace sd.world {

	//  ___ _      _ __  __      _           _      _ __  __                             
	// / __| |_ __| |  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// \__ \  _/ _` | |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |___/\__\__,_|_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                     |___/         

	// FIXME: these flags are bad, replace with texture usage type or eqv.
	export const enum StdMaterialFlags {
		usesSpecular              = 0x00000001,

		albedoAlphaIsTranslucency = 0x00000101,
		albedoAlphaIsGloss        = 0x00000102,
		normalAlphaIsHeight       = 0x00000104,
	}


	export interface StdMaterialDescriptor {
		// colours
		mainColour: Float3;             // v3, single colour or tint for albedo

		specularIntensity: number;      // 0..1
		specularExponent: number;       // 0+
		specularColourMix: number;      // 0..1: mix between material colour and light colour for specular (0: all material, 1: all light)

		// textures
		textureScale: Float2;           // v2, scale and offset apply to all textures
		textureOffset: Float2;

		albedoMap: render.Texture;      // nullptr means use mainColour only
		normalMap: render.Texture;      // nullptr means no bump

		flags: StdMaterialFlags;
	}


	export function makeStdMaterialDescriptor(): StdMaterialDescriptor {
		var vecs = new Float32Array(7);

		return {
			mainColour: vec3.copy(vecs.subarray(0, 3), math.Vec3.one),

			specularIntensity: 0,
			specularExponent: 0,
			specularColourMix: 0.8,

			textureScale: vec2.copy(vecs.subarray(3, 5), math.Vec2.one),
			textureOffset: vec2.copy(vecs.subarray(5, 7), math.Vec2.zero),

			albedoMap: null,
			normalMap: null,

			flags: 0
		};
	}


	export interface StdMaterialData {
		colourData: Float32Array;
		specularData: Float32Array;
		texScaleOffsetData: Float32Array;
		albedoMap: render.Texture;
		normalMap: render.Texture;
		flags: StdMaterialFlags;
	}


	const enum SpecularElem {
		Intensity = 0,
		Exponent = 1,
		ColourMix = 2
	}


	export type StdMaterialInstance = world.Instance<StdMaterialManager>;

	export class StdMaterialManager implements ComponentManager<StdMaterialManager> {
		private instanceData_: container.MultiArrayBuffer;
		private albedoMaps_: render.Texture[] = [];
		private normalMaps_: render.Texture[] = [];

		private mainColourBase_: TypedArray;
		private specularBase_: TypedArray;
		private texScaleOffsetBase_: TypedArray;
		private flagsBase_: TypedArray;

		private tempVec4 = new Float32Array(4);

		constructor() {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: Float, count: 4 },  // mainColour[3], 0
				{ type: Float, count: 4 },  // specularIntensity, specularExponent, specularColourMix, 0
				{ type: Float, count: 4 },  // textureScale[2], textureOffset[2]
				{ type: SInt32, count: 1 }, // flags
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();
		}


		private rebase() {
			this.mainColourBase_ = this.instanceData_.indexedFieldView(0);
			this.specularBase_ = this.instanceData_.indexedFieldView(1);
			this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(2);
			this.flagsBase_ = this.instanceData_.indexedFieldView(3);
		}


		create(desc: StdMaterialDescriptor): StdMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			vec4.set(this.tempVec4, desc.mainColour[0], desc.mainColour[1], desc.mainColour[2], 0);
			container.setIndexedVec4(this.mainColourBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.specularIntensity, desc.specularExponent, desc.specularColourMix, 0);
			container.setIndexedVec4(this.specularBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);

			if ((desc.flags & StdMaterialFlags.albedoAlphaIsGloss) && (desc.flags & StdMaterialFlags.albedoAlphaIsTranslucency)) {
				assert(false, "invalid material flags")
			}
			this.flagsBase_[matIndex] = desc.flags;

			this.albedoMaps_[matIndex] = desc.albedoMap;
			this.normalMaps_[matIndex] = desc.normalMap;

			return matIndex;
		}


		destroy(inst: StdMaterialInstance) {
			var matIndex = <number>inst;

			container.setIndexedVec4(this.mainColourBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.specularBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, math.Vec4.zero);
			this.flagsBase_[matIndex] = 0;

			this.albedoMaps_[matIndex] = null;
			this.normalMaps_[matIndex] = null;

			// TODO: track/reuse freed instances etc.
		}


		get count() { return this.instanceData_.count; }


		valid(inst: StdMaterialInstance) {
			return <number>inst <= this.count;
		}


		// -- individual element field accessors
		mainColour(inst: StdMaterialInstance): Float3 {
			var offset = <number>inst * 4;
			return [
				this.mainColourBase_[offset],
				this.mainColourBase_[offset + 1],
				this.mainColourBase_[offset + 2]
			];
		}

		setMainColour(inst: StdMaterialInstance, newColour: Float3) {
			var offset = <number>inst * 4;
			this.mainColourBase_[offset]     = newColour[0];
			this.mainColourBase_[offset + 1] = newColour[1];
			this.mainColourBase_[offset + 2] = newColour[2];
		}


		specularIntensity(inst: StdMaterialInstance): number {
			return this.specularBase_[(<number>inst * 4) + SpecularElem.Intensity];
		}

		setSpecularIntensity(inst: StdMaterialInstance, newIntensity: number) {
			this.specularBase_[(<number>inst * 4) + SpecularElem.Intensity] = newIntensity;
		}


		specularExponent(inst: StdMaterialInstance): number {
			return this.specularBase_[(<number>inst * 4) + SpecularElem.Exponent];
		}

		setSpecularExponent(inst: StdMaterialInstance, newExponent: number) {
			this.specularBase_[(<number>inst * 4) + SpecularElem.Exponent] = newExponent;
		}


		specularColourMix(inst: StdMaterialInstance): number {
			return this.specularBase_[(<number>inst * 4) + SpecularElem.ColourMix];
		}

		setSpecularColourMix(inst: StdMaterialInstance, newMix: number) {
			this.specularBase_[(<number>inst * 4) + SpecularElem.ColourMix] = newMix;
		}


		textureScale(inst: StdMaterialInstance): Float2 {
			var offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
		}

		setTextureScale(inst: StdMaterialInstance, newScale: Float2) {
			var offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset] = newScale[0];
			this.texScaleOffsetBase_[offset + 1] = newScale[1];
		}


		textureOffset(inst: StdMaterialInstance): Float2 {
			var offset = <number>inst * 4;
			return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
		}

		setTextureOffset(inst: StdMaterialInstance, newOffset: Float2) {
			var offset = <number>inst * 4;
			this.texScaleOffsetBase_[offset + 2] = newOffset[0];
			this.texScaleOffsetBase_[offset + 3] = newOffset[1];
		}


		albedoMap(inst: StdMaterialInstance): render.Texture {
			return this.albedoMaps_[<number>inst];
		}

		setAlbedoMap(inst: StdMaterialInstance, newTex: render.Texture) {
			this.albedoMaps_[<number>inst] = newTex;
		}


		normalMap(inst: StdMaterialInstance): render.Texture {
			return this.normalMaps_[<number>inst];
		}

		setNormalMap(inst: StdMaterialInstance, newTex: render.Texture) {
			this.normalMaps_[<number>inst] = newTex;
		}


		flags(inst: StdMaterialInstance): StdMaterialFlags {
			return this.flagsBase_[<number>inst];
		}

		// TODO: this will affect the pipeline required for this material, do we need this?
		// setFlags(index: StdMaterialIndex, newFlags: StdMaterialFlags) {
		// 	this.flagsBase_[index] = newFlags;
		// }


		// -- reconstruct a copy of the data as a descriptor
		copyDescriptor(inst: StdMaterialInstance): StdMaterialDescriptor {
			var matIndex = <number>inst;
			assert(matIndex < this.instanceData_.count);

			var mainColourArr = container.copyIndexedVec4(this.mainColourBase_, matIndex);
			var specularArr = container.copyIndexedVec4(this.specularBase_, matIndex);

			return {
				mainColour: Array.prototype.slice.call(mainColourArr, 0, 3),

				specularIntensity: specularArr[0],
				specularExponent: specularArr[1],
				specularColourMix: specularArr[2],

				textureScale: this.textureScale(inst),
				textureOffset: this.textureOffset(inst),

				albedoMap: this.albedoMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}


		// direct data views to set uniforms with in StdModelMgr
		getData(inst: StdMaterialInstance): StdMaterialData {
			var matIndex = <number>inst;
			return {
				colourData: <Float32Array>container.refIndexedVec4(this.mainColourBase_, matIndex),
				specularData: <Float32Array>container.refIndexedVec4(this.specularBase_, matIndex),
				texScaleOffsetData: <Float32Array>container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),

				albedoMap: this.albedoMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}
	}

} // ns sd.world
