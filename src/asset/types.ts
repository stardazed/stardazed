// asset/types - WIP - main asset types and functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface AssetOld {
		name: string;
		userRef?: any;
	}


	export interface Texture2D extends AssetOld {
		texture: render.Texture;
		uvScale: Float2;
		uvOffset: Float2;
		anisotropy: number; // 1..16
	}


	export const enum AlphaCoverage {
		Ignore,
		Mask,
		Transparent
	}

	export interface DiffuseColourResponse {
		type: "diffuse";
		baseColour: Float3;
		colourTexture?: Texture2D;
	}

	export interface DiffuseSpecularColourResponse {
		type: "diffusespecular";
		baseColour: Float3;
		colourTexture?: Texture2D;

		specularColour: Float3;
		specularIntensity: number;
		specularExponent: number;
		specularTexture?: Texture2D;
	}

	export interface PBRMetallicColourResponse {
		type: "pbrmetallic";
		baseColour: Float3;
		colourTexture?: Texture2D;

		metallic: number; // 0: fully di-electric, 1: fully metallic
		metallicTexture?: Texture2D;

		roughness: number; // 0: fully smooth, 1: fully rough
		roughnessTexture?: Texture2D;
	}

	export interface PBRSpecularColourResponse {
		type: "pbrspecular";
		baseColour: Float3;
		colourTexture?: Texture2D;

		specularColour: Float3;
		specularTexture?: Texture2D;
		
		roughness: number; // 0: fully smooth (default), 1: fully rough
		roughnessTexture?: Texture2D;
	}

	export type ColourResponse = DiffuseColourResponse | DiffuseSpecularColourResponse | PBRMetallicColourResponse | PBRSpecularColourResponse;
	export type AnyColourResponse = DiffuseColourResponse & DiffuseSpecularColourResponse & PBRMetallicColourResponse & PBRSpecularColourResponse;

	export const makeDiffuseResponse = (): DiffuseColourResponse => ({
		type: "diffuse",
		baseColour: [1, 1, 1]
	});

	export const makeDiffuseSpecularResponse = (source?: DiffuseColourResponse): DiffuseSpecularColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "diffusespecular",

		specularColour: [0, 0, 0],
		specularIntensity: 0,
		specularExponent: 0,
	});

	export const makePBRMetallicResponse = (source?: DiffuseColourResponse): PBRMetallicColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "pbrmetallic",

		metallic: 1,
		roughness: 1,
	});

	export const makePBRSpecularResponse = (source?: DiffuseColourResponse): PBRSpecularColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "pbrspecular",

		specularColour: [1, 1, 1],
		roughness: 1,
	});


	export interface Material extends AssetOld {
		colour: ColourResponse;
		
		alphaCoverage: AlphaCoverage;
		opacity: number; // 0: fully transparent, 1: fully opaque (default)
		alphaTexture?: Texture2D;

		normalTexture?: Texture2D;
		ambientOcclusionTexture?: Texture2D;

		heightRange: number;
		heightTexture?: Texture2D;

		emissiveColour: Float3;
		emissiveIntensity: number;
		emissiveTexture?: Texture2D;
	}

	export const makeMaterial = (name: string): Material => ({
		name,
		colour: {
			type: "diffuse",
			baseColour: [1, 1, 1]
		},

		alphaCoverage: AlphaCoverage.Ignore,
		opacity: 1,

		heightRange: 0,

		emissiveColour: [0, 0, 0],
		emissiveIntensity: 0,
	});


	export function makeTransform(): entity.Transform {
		return {
			position: [0, 0, 0],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		};
	}

	export interface Model extends AssetOld {
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
