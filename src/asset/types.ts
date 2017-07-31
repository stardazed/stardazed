// asset/types - main asset types and functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset {
		name: string;
		userRef?: any;
	}


	export interface Texture2D extends Asset {
		url?: URL;
		mipMapMode: render.MipMapMode;
		colourSpace: image.ColourSpace;
		texture?: render.Texture;
	}


	export interface TextureCube extends Asset {
		filePathPosX?: string;
		filePathNegX?: string;
		filePathPosY?: string;
		filePathNegY?: string;
		filePathPosZ?: string;
		filePathNegZ?: string;
		texture: render.Texture;
	}


	export const enum MaterialFlags {
		usesSpecular               = 0x00000001,
		usesEmissive               = 0x00000002,
		isTranslucent              = 0x00000004,

		diffuseAlphaIsTransparency = 0x00000100,
		diffuseAlphaIsOpacity      = 0x00000200,

		normalAlphaIsHeight        = 0x00000800,
	}


	export interface Material extends Asset {
		flags: MaterialFlags;

		baseColour: Float3;

		specularColour: Float3;
		specularIntensity: number;
		specularExponent: number;

		emissiveColour: Float3;
		emissiveIntensity: number;

		opacity: number; // 0: fully transparent, 1: fully opaque (default)
		metallic: number; // 0: fully di-electric (default), 1: fully metallic
		roughness: number; // 0: fully smooth (default), 1: fully rough
		anisotropy: number; // 1..16

		textureScale: Float2;
		textureOffset: Float2;

		albedoTexture?: Texture2D;	// TODO: change this to array of textures with typed channels
		specularTexture?: Texture2D;
		normalTexture?: Texture2D;
		heightTexture?: Texture2D;
		transparencyTexture?: Texture2D;
		emissiveTexture?: Texture2D;

		roughnessTexture?: Texture2D;
		metallicTexture?: Texture2D;
		ambientOcclusionTexture?: Texture2D;
	}


	export function makeMaterial(name?: string): Material {
		return {
			name: name || "",
			flags: 0,

			baseColour: [1, 1, 1],

			specularColour: [0, 0, 0],
			specularIntensity: 0,
			specularExponent: 0,

			emissiveColour: [0, 0, 0],
			emissiveIntensity: 0,

			textureScale: [1, 1],
			textureOffset: [0, 0],

			opacity: 1,
			anisotropy: 1,
			metallic: 0,
			roughness: 0
		};
	}


	export function makeTransform(): entity.Transform {
		return {
			position: [0, 0, 0],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		};
	}

	export interface Model extends Asset {
		transform: entity.Transform;
		children: Model[];
		parent?: Model;

		// components
		mesh?: meshdata.MeshData;
		materials?: Material[];
		light?: entity.Light;
	}

	export function makeModel(name: string, ref?: any): Model {
		return {
			name,
			userRef: ref,
			transform: makeTransform(),
			children: []
		};
	}


	export class AssetGroup {
		meshes: meshdata.MeshData[] = [];
		textures: (Texture2D | null)[] = []; // FIXME: handling of optional textures
		materials: Material[] = [];
		models: Model[] = [];

		addMesh(mesh: meshdata.MeshData): number {
			this.meshes.push(mesh);
			return this.meshes.length - 1;
		}

		addTexture(tex: Texture2D | null): number { // FIXME: handling of optional textures
			this.textures.push(tex);
			return this.textures.length - 1;
		}

		addMaterial(mat: Material): number {
			this.materials.push(mat);
			return this.materials.length - 1;
		}

		addModel(model: Model): number {
			this.models.push(model);
			return this.models.length - 1;
		}
	}

} // ns sd.asset
