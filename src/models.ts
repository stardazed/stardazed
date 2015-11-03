// model - renderable meshes w/ materials
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="math.ts" />
/// <reference path="container.ts" />
/// <reference path="world.ts" />

namespace sd.model {

	//  __  __      _           _      _ __  __                             
	// |  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                        |___/         

	const enum MaterialFlags {
		albedoAlphaIsTranslucency = 0x00000001,
		normalAlphaIsHeight       = 0x00000002
	}

	interface MaterialDescriptor {
		// colours
		mainColour: ArrayOfNumber;      // v3, single colour or tint for albedo
		specularColour: ArrayOfNumber;  // v3
		specularExponent: number;       // 0 means no specular

		// textures
		textureScale: ArrayOfNumber;    // v2, scale and offset apply to all textures
		textureOffset: ArrayOfNumber;
		flags: MaterialFlags;

		albedoMap: WebGLTexture;        // nullptr means use mainColour only
		normalMap: WebGLTexture;        // nullptr means no bump
	}


	type MaterialIndex = world.Instance<MaterialManager>;

	class MaterialManager {
		private instanceData_: container.MultiArrayBuffer;
		private albedoMaps_: WebGLTexture[] = [];
		private normalMaps_: WebGLTexture[] = [];

		constructor() {
			const initialCapacity = 256;
			var fields: container.MABField[] = [
				{ type: Float, count: 3 },  // mainColour
				{ type: Float, count: 3 },  // specularColour
				{ type: Float, count: 1 },  // specularExponent
				{ type: Float, count: 2 },  // textureScale
				{ type: Float, count: 2 },  // textureOffset
				{ type: UInt32, count: 1 }, // flags
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.albedoMaps_.length = initialCapacity;
			this.normalMaps_.length = initialCapacity;
		}

		append(desc: MaterialDescriptor): MaterialIndex {
			this.instanceData_.extend();
			var matIndex = this.instanceData_.count() - 1;

			math.vectorArrayItem(this.instanceData_.indexedFieldView(0), math.Vec3, matIndex).set(desc.mainColour);
			math.vectorArrayItem(this.instanceData_.indexedFieldView(1), math.Vec3, matIndex).set(desc.specularColour);
			this.instanceData_.indexedFieldView(2)[matIndex] = desc.specularExponent;
			math.vectorArrayItem(this.instanceData_.indexedFieldView(3), math.Vec2, matIndex).set(desc.textureScale);
			math.vectorArrayItem(this.instanceData_.indexedFieldView(4), math.Vec2, matIndex).set(desc.textureOffset);
			this.instanceData_.indexedFieldView(5)[matIndex] = desc.flags;

			this.albedoMaps_[matIndex] = desc.albedoMap;
			this.normalMaps_[matIndex] = desc.normalMap;

			return new world.Instance<MaterialManager>(matIndex);
		}

		destroy(index: MaterialIndex) {
			var matIndex = index.ref;

			math.vectorArrayItem(this.instanceData_.indexedFieldView(0), math.Vec3, matIndex).set(math.Vec3.zero);
			math.vectorArrayItem(this.instanceData_.indexedFieldView(1), math.Vec3, matIndex).set(math.Vec3.zero);
			this.instanceData_.indexedFieldView(2)[matIndex] = 0;
			math.vectorArrayItem(this.instanceData_.indexedFieldView(3), math.Vec2, matIndex).set(math.Vec2.zero);
			math.vectorArrayItem(this.instanceData_.indexedFieldView(4), math.Vec2, matIndex).set(math.Vec2.zero);
			this.instanceData_.indexedFieldView(5)[matIndex] = 0;

			this.albedoMaps_[matIndex] = null;
			this.normalMaps_[matIndex] = null;

			// TODO: track/reuse freed instances etc.
		}

		copyDescriptor(index: MaterialIndex): MaterialDescriptor {
			var matIndex = index.ref;
			assert(matIndex < this.instanceData_.count());

			return {
				mainColour: math.vectorArrayItem(this.instanceData_.indexedFieldView(0), math.Vec3, matIndex),
				specularColour: math.vectorArrayItem(this.instanceData_.indexedFieldView(1), math.Vec3, matIndex),
				specularExponent: this.instanceData_.indexedFieldView(2)[matIndex],
				textureScale: math.vectorArrayItem(this.instanceData_.indexedFieldView(3), math.Vec2, matIndex),
				textureOffset: math.vectorArrayItem(this.instanceData_.indexedFieldView(4), math.Vec2, matIndex),
				flags: this.instanceData_.indexedFieldView(5)[matIndex],
				albedoMap: this.albedoMaps_[matIndex],
				normalMap: this.normalMaps_[matIndex] 
			};		
		}
	}


} // ns sd.model
