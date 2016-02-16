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

		ambientColour: Float3;

		emissiveColour: Float3;
		emissiveIntensity: number;

		diffuseColour: Float3;

		specularColour: Float3;
		specularIntensity: number;
		specularExponent: number;

		textureScale: Float2;
		textureOffset: Float2;
		diffuseTexture: Texture2D;	// TODO: change this to array of textures with typed channels
		specularTexture: Texture2D;
		normalTexture: Texture2D;
		heightTexture: Texture2D;
		
		transparency: number; // 0: fully opaque, 1: fully transparent
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(): Material {
		return {
			name: "",

			ambientColour: [0, 0, 0],

			emissiveColour: [0, 0, 0],
			emissiveIntensity: 0,

			diffuseColour: [0, 0, 0],

			specularColour: [0, 0, 0],
			specularIntensity: 1,
			specularExponent: 0,

			textureScale: [1, 1],
			textureOffset: [0, 0],
			diffuseTexture: null,
			specularTexture: null,
			normalTexture: null,
			heightTexture: null,
			
			transparency: 0
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
		position: Float3; // m
		rotation: Float4; // quat
		scale: Float3;
	}


	export interface Model {
		name: string;
		userRef?: any;
		
		mesh: Mesh;
		materials: Material[];
		transform: Transform;

		children: Model[];
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
