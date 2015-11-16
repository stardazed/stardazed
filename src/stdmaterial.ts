// stdmaterial - standard model material data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="math.ts" />
/// <reference path="container.ts" />
/// <reference path="world.ts" />

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
		mainColour: ArrayOfNumber;      // v3, single colour or tint for albedo

		specularColour: ArrayOfNumber;  // v3
		specularExponent: number;       // 0 means no specular, 0+
		specularIntensity: number;      // 0 means no specular, 0.0-1.0

		// textures
		textureScale: ArrayOfNumber;    // v2, scale and offset apply to all textures
		textureOffset: ArrayOfNumber;

		albedoMap: render.Texture;      // nullptr means use mainColour only
		normalMap: render.Texture;      // nullptr means no bump

		flags: StdMaterialFlags;
	}


	export function makeStdMaterialDescriptor(): StdMaterialDescriptor {
		var vecs = new Float32Array(10);

		return {
			mainColour: vec3.copy(vecs.subarray(0, 3), math.Vec3.one),
			specularColour: vec3.copy(vecs.subarray(3, 6), math.Vec3.zero),
			specularExponent: 0,
			specularIntensity: 0,

			textureScale: vec2.copy(vecs.subarray(6, 8), math.Vec2.one),
			textureOffset: vec2.copy(vecs.subarray(8, 10), math.Vec2.zero),

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


	export type StdMaterialIndex = world.Instance<StdMaterialManager>;

	export class StdMaterialManager {
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
				{ type: Float, count: 4 },  // mainColour[3], specularIntensity
				{ type: Float, count: 4 },  // specularColour[3], specularExponent
				{ type: Float, count: 4 },  // textureScale[2], textureOffset[2]
				{ type: UInt32, count: 1 }, // flags
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


		create(desc: StdMaterialDescriptor): StdMaterialIndex {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			vec4.set(this.tempVec4, desc.mainColour[0], desc.mainColour[1], desc.mainColour[2], desc.specularIntensity);
			math.vectorArrayItem(this.mainColourBase_, math.Vec4, matIndex).set(this.tempVec4);
			vec4.set(this.tempVec4, desc.specularColour[0], desc.specularColour[1], desc.specularColour[2], desc.specularExponent);
			math.vectorArrayItem(this.specularBase_, math.Vec4, matIndex).set(this.tempVec4);
			vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
			math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, matIndex).set(this.tempVec4);

			if ((desc.flags & StdMaterialFlags.albedoAlphaIsGloss) && (desc.flags & StdMaterialFlags.albedoAlphaIsTranslucency)) {
				assert(false, "invalid material flags")
			}
			this.flagsBase_[matIndex] = desc.flags;

			this.albedoMaps_[matIndex] = desc.albedoMap;
			this.normalMaps_[matIndex] = desc.normalMap;

			return matIndex;
		}


		destroy(index: StdMaterialIndex) {
			var matIndex = <number>index;

			math.vectorArrayItem(this.mainColourBase_, math.Vec4, matIndex).set(math.Vec4.zero);
			math.vectorArrayItem(this.specularBase_, math.Vec4, matIndex).set(math.Vec4.zero);
			math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, matIndex).set(math.Vec4.zero);
			this.flagsBase_[matIndex] = 0;

			this.albedoMaps_[matIndex] = null;
			this.normalMaps_[matIndex] = null;

			// TODO: track/reuse freed instances etc.
		}


		// -- individual element field accessors
		mainColour(index: StdMaterialIndex): TypedArray {
			return math.vectorArrayItem(this.mainColourBase_, math.Vec4, <number>index).subarray(0, 3);
		}

		specularColourExponent(index: StdMaterialIndex): TypedArray {
			return math.vectorArrayItem(this.specularBase_, math.Vec4, <number>index);
		}

		textureScale(index: StdMaterialIndex): TypedArray {
			return math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, <number>index).subarray(0, 2);
		}

		textureOffset(index: StdMaterialIndex): TypedArray {
			return math.vectorArrayItem(this.specularBase_, math.Vec4, <number>index).subarray(2, 4);
		}

		textureScaleAndOffset(index: StdMaterialIndex): TypedArray {
			return math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, <number>index);
		}

		albedoMap(index: StdMaterialIndex): render.Texture {
			return this.albedoMaps_[<number>index];
		}

		normalMap(index: StdMaterialIndex): render.Texture {
			return this.normalMaps_[<number>index];
		}

		flags(index: StdMaterialIndex): StdMaterialFlags {
			return this.flagsBase_[<number>index];
		}

		// TODO: this will affect the pipeline required for this material, do we need this?
		// setFlags(index: StdMaterialIndex, newFlags: StdMaterialFlags) {
		// 	this.flagsBase_[index] = newFlags;
		// }

		setAlbedoMap(index: StdMaterialIndex, newTex: render.Texture) {
			// TODO: warn on changing from between null/non-null as it would affect the pipeline?
			this.albedoMaps_[<number>index] = newTex;
		}

		setNormalMap(index: StdMaterialIndex, newTex: render.Texture) {
			// TODO: warn on changing from between null/non-null as it would affect the pipeline?
			this.normalMaps_[<number>index] = newTex;
		}


		// -- reconstruct a copy of the data as a descriptor
		copyDescriptor(index: StdMaterialIndex): StdMaterialDescriptor {
			var matIndex = <number>index;
			assert(matIndex < this.instanceData_.count);

			var mainColourArr = math.vectorArrayItem(this.mainColourBase_, math.Vec4, matIndex);
			var specularArr = math.vectorArrayItem(this.specularBase_, math.Vec4, matIndex);
			var texScaleOffsetArr = math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, matIndex);

			return {
				mainColour: Array.prototype.slice.call(mainColourArr, 0, 3),

				specularColour: Array.prototype.slice.call(specularArr, 0, 3),
				specularExponent: specularArr[3],
				specularIntensity: 0,

				textureScale: Array.prototype.slice.call(texScaleOffsetArr, 0, 2),
				textureOffset: Array.prototype.slice.call(texScaleOffsetArr, 2, 4),

				albedoMap: this.albedoMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}


		// direct data views to set uniforms with in StdModelMgr
		getData(index: StdMaterialIndex): StdMaterialData {
			var matIndex = <number>index;
			return {
				colourData: <Float32Array>math.vectorArrayItem(this.mainColourBase_, math.Vec4, matIndex),
				specularData: <Float32Array>math.vectorArrayItem(this.specularBase_, math.Vec4, matIndex),
				texScaleOffsetData: <Float32Array>math.vectorArrayItem(this.texScaleOffsetBase_, math.Vec4, matIndex),

				albedoMap: this.albedoMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex],

				flags: this.flagsBase_[matIndex]
			};
		}
	}

} // ns sd.world
