// asset.ts - Main asset types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export interface Texture2D {
		data: render.TextureImageData;
		format: render.PixelFormat;

		width: number;
		height: number;
	}


	export interface Material {
		name: string;

		diffuseColour: Float3;
		diffuseTexture: Texture2D;

		specularColour: Float3;
		specularFactor: number;
		specularExponent: number;
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(): Material {
		return {
			name: "",

			diffuseColour: [0, 0, 0],
			diffuseTexture: null,

			specularColour: [0, 0, 0], // this field is ignored by StdModels
			specularFactor: 0,
			specularExponent: 0,
		};
	}


	export interface Transform {
		translation: Float3;	// m
		rotationAngles: Float3; // rad
		scale: Float3;
	}


	export interface Model {
		meshIndex: number;
		materialIndexes: number[];
		transform: Transform;
	}


	export class AssetGroup {
		meshDatas: mesh.MeshData[] = [];
		textures: Texture2D[] = [];
		materials: Material[] = [];
		models: Model[] = [];

		addMeshData(meshData: mesh.MeshData): number {
			this.meshDatas.push(meshData);
			return this.meshDatas.length - 1;
		}

		addTexture(tex: Texture2D): number {
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
