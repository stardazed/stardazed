// asset.ts - Main asset types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export interface Texture2D {
		name: string;
		userRef?: any;
		
		filePath?: string;
		useMipMaps: render.UseMipMaps;
		descriptor?: render.TextureDescriptor;
	}


	export interface Material {
		name: string;
		userRef?: any;

		diffuseColour: Float3;
		diffuseTexture: Texture2D;
		textureScale: Float2;
		textureOffset: Float2;

		specularColour: Float3;
		specularIntensity: number;
		specularExponent: number;
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(): Material {
		return {
			name: "",

			diffuseColour: [0, 0, 0],
			diffuseTexture: null,
			textureScale: [1, 1],
			textureOffset: [0, 0],

			specularColour: [0, 0, 0], // this field is ignored by StdModels
			specularIntensity: 0,
			specularExponent: 0,
		};
	}


	export interface Mesh {
		name: string;
		userRef?: any;

		positions?: Float64Array;
		streams?: mesh.VertexAttributeStream[];

		meshData?: mesh.MeshData;
	}


	export interface Transform {
		translation: Float3;	// m
		rotationAngles: Float3; // rad
		scale: Float3;
	}


	export interface Model {
		name: string;
		userRef?: any;
		
		mesh: Mesh;
		materialIndexes: number[];
		transform: Transform;
	}


	export class AssetGroup {
		meshes: Mesh[] = [];
		textures: Texture2D[] = [];
		materials: Material[] = [];
		models: Model[] = [];

		addMesh(mesh: Mesh): number {
			this.meshes.push(mesh);
			return this.meshes.length - 1;
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
