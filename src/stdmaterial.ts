// stdmaterial - standard model material data
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	//  ___ _      _ __  __      _           _      _ __  __                             
	// / __| |_ __| |  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// \__ \  _/ _` | |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |___/\__\__,_|_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                     |___/         

	export interface StdMaterialData {
		colourData: Float32Array;
		specularData: Float32Array;
		emissiveData: Float32Array;
		texScaleOffsetData: Float32Array;
		diffuseMap: render.Texture | null;
		specularMap: render.Texture | null;
		normalMap: render.Texture | null;
		flags: asset.MaterialFlags;
	}


	const enum SpecularElem {
		Intensity = 0,
		Exponent = 1,
	}


	export type StdMaterialInstance = Instance<StdMaterialManager>;
	export type StdMaterialRange = InstanceRange<StdMaterialManager>;
	export type StdMaterialSet = InstanceSet<StdMaterialManager>;
	export type StdMaterialIterator = InstanceIterator<StdMaterialManager>;
	export type StdMaterialArrayView = InstanceArrayView<StdMaterialManager>;


	export class StdMaterialManager implements ComponentManager<StdMaterialManager> {
		private instanceData_: container.MultiArrayBuffer;
		private diffuseMaps_: (render.Texture | null)[] = [];
		private specularMaps_: (render.Texture | null)[] = [];
		private normalMaps_: (render.Texture | null)[] = [];

		private mainColourBase_: Float32Array;
		private specularBase_: Float32Array;
		private emissiveBase_: Float32Array;
		private texScaleOffsetBase_: Float32Array;
		private opacityBase_: Float32Array;
		private flagsBase_: ConstEnumArrayView<asset.MaterialFlags>;

		private tempVec4 = new Float32Array(4);

		constructor() {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: Float, count: 4 },  // mainColour[3], 0
				{ type: Float, count: 4 },  // specularIntensity, specularExponent, specularColourMix, 0
				{ type: Float, count: 4 },  // emissiveColour[3], emissiveIntensity
				{ type: Float, count: 4 },  // textureScale[2], textureOffset[2]
				{ type: Float, count: 1 },  // opacity
				{ type: SInt32, count: 1 }, // flags
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();
		}


		private rebase() {
			this.mainColourBase_ = this.instanceData_.indexedFieldView(0);
			this.specularBase_ = this.instanceData_.indexedFieldView(1);
			this.emissiveBase_ = this.instanceData_.indexedFieldView(2);
			this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(3);
			this.opacityBase_ = this.instanceData_.indexedFieldView(4);
			this.flagsBase_ = this.instanceData_.indexedFieldView(5);
		}


		create(desc: asset.Material): StdMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
			container.setIndexedVec4(this.mainColourBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.specularIntensity, desc.specularExponent, 0, 0);
			container.setIndexedVec4(this.specularBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.emissiveColour[0], desc.emissiveColour[1], desc.emissiveColour[2], desc.emissiveIntensity);
			container.setIndexedVec4(this.emissiveBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);

			if ((desc.flags & asset.MaterialFlags.diffuseAlphaIsOpacity) && (desc.flags & asset.MaterialFlags.diffuseAlphaIsTransparency)) {
				assert(false, "Diffuse Alpha can't be both opacity and transparency");
			}
			this.flagsBase_[matIndex] = desc.flags;


			// FIXME: these are asserted to have render textures pre-created for now


			this.diffuseMaps_[matIndex] = desc.albedoTexture ? desc.albedoTexture.texture! : null;
			this.specularMaps_[matIndex] = desc.specularTexture ? desc.specularTexture.texture! : null;
			this.normalMaps_[matIndex] = desc.normalTexture ? desc.normalTexture.texture! : null;

			this.opacityBase_[matIndex] = desc.opacity;

			return matIndex;
		}


		destroy(inst: StdMaterialInstance) {
			var matIndex = <number>inst;

			container.setIndexedVec4(this.mainColourBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.specularBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.emissiveBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, math.Vec4.zero);
			this.flagsBase_[matIndex] = 0;
			this.opacityBase_[matIndex] = 0;

			this.diffuseMaps_[matIndex] = null;
			this.specularMaps_[matIndex] = null;
			this.normalMaps_[matIndex] = null;

			// TODO: track/reuse freed instances etc.
		}


		destroyRange(range: StdMaterialRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}



		get count() { return this.instanceData_.count; }

		valid(inst: StdMaterialInstance) {
			return <number>inst <= this.count;
		}

		all(): StdMaterialRange {
			return new InstanceLinearRange<StdMaterialManager>(1, this.count);
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


		// -- individual element field accessors
		emissiveColour(inst: StdMaterialInstance): Float3 {
			var offset = <number>inst * 4;
			return [
				this.emissiveBase_[offset],
				this.emissiveBase_[offset + 1],
				this.emissiveBase_[offset + 2]
			];
		}

		setEmissiveColour(inst: StdMaterialInstance, newColour: Float3) {
			var offset = <number>inst * 4;
			this.emissiveBase_[offset]     = newColour[0];
			this.emissiveBase_[offset + 1] = newColour[1];
			this.emissiveBase_[offset + 2] = newColour[2];
		}


		emissiveIntensity(inst: StdMaterialInstance): number {
			return this.emissiveBase_[(<number>inst * 4) + 3];
		}

		setEmissiveIntensity(inst: StdMaterialInstance, newIntensity: number) {
			this.emissiveBase_[(<number>inst * 4) + 3] = newIntensity;
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


		diffuseMap(inst: StdMaterialInstance): render.Texture | null {
			return this.diffuseMaps_[<number>inst];
		}

		setDiffuseMap(inst: StdMaterialInstance, newTex: render.Texture) {
			this.diffuseMaps_[<number>inst] = newTex;
		}


		specularMap(inst: StdMaterialInstance): render.Texture | null {
			return this.specularMaps_[<number>inst];
		}

		setSpecularMap(inst: StdMaterialInstance, newTex: render.Texture) {
			this.specularMaps_[<number>inst] = newTex;
		}


		normalMap(inst: StdMaterialInstance): render.Texture | null {
			return this.normalMaps_[<number>inst];
		}

		setNormalMap(inst: StdMaterialInstance, newTex: render.Texture) {
			this.normalMaps_[<number>inst] = newTex;
		}


		opacity(inst: StdMaterialInstance): number {
			return this.opacityBase_[<number>inst];
		}

		setOpacity(inst: StdMaterialInstance, newOpacity: number) {
			this.opacityBase_[<number>inst] = newOpacity;
		}


		flags(inst: StdMaterialInstance): asset.MaterialFlags {
			return this.flagsBase_[<number>inst];
		}

		// TODO: this will affect the pipeline required for this material, do we need this?
		// setFlags(index: StdMaterialIndex, newFlags: asset.MaterialFlags) {
		// 	this.flagsBase_[index] = newFlags;
		// }


		// direct data views to set uniforms with in StdModelMgr
		getData(inst: StdMaterialInstance): StdMaterialData {
			var matIndex = <number>inst;

			var colourOpacity = new Float32Array(container.copyIndexedVec4(this.mainColourBase_, matIndex));
			colourOpacity[3] = this.opacityBase_[matIndex];

			return {
				colourData: colourOpacity,
				specularData: <Float32Array>container.refIndexedVec4(this.specularBase_, matIndex),
				emissiveData: <Float32Array>container.refIndexedVec4(this.emissiveBase_, matIndex),
				texScaleOffsetData: <Float32Array>container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),

				diffuseMap: this.diffuseMaps_[matIndex],
				specularMap: this.specularMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}
	}

} // ns sd.world
