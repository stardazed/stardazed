// asset.ts - Main asset types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export interface Asset {
		name: string;
		userRef?: any;
	}

	export interface Texture2D extends Asset {
		filePath?: string;
		useMipMaps: render.UseMipMaps;
		descriptor?: render.TextureDescriptor;
	}


	export interface Material extends Asset {
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
		jointDataTexture: Texture2D;
		
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
			jointDataTexture: null,
			
			transparency: 0
		};
	}


	export interface Mesh extends Asset {
		positions?: Float64Array;
		streams?: mesh.VertexAttributeStream[];

		meshData?: mesh.MeshData;
		indexMap?: mesh.VertexIndexMapping;
	}


	export interface Transform {
		position: Float3; // m
		rotation: Float4; // quat
		scale: Float3;
	}

	export function makeTransform(): Transform {
		return {
			position: [0, 0, 0],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		};
	}


	export interface Skin extends Asset {
		groups: WeightedVertexGroup[];
	}


	export interface WeightedVertexGroup extends Asset {
		indexes: Int32Array;
		weights: Float64Array;

		bindPoseLocalTranslation: Float3;
		bindPoseLocalRotation: Float4;
		bindPoseLocalMatrix: ArrayOfNumber;
	}


	export interface Joint {
		root: boolean;
		size?: number;

		// Direct link to WVG, later on this should be done indirectly
		// so a single skeleton can link against many Meshes
		vertexGroup?: WeightedVertexGroup;
	}


	export const enum AnimationProperty {
		None,

		TranslationX,
		TranslationY,
		TranslationZ,
		RotationX,
		RotationY,
		RotationZ,
		ScaleX,
		ScaleY,
		ScaleZ
	}


	export interface AnimationKeyData {
		times: ArrayOfNumber;
		values: ArrayOfNumber;
	}


	export interface AnimationTrack {
		animationName: string;
		property: AnimationProperty;
		key: AnimationKeyData;
	}


	export const enum TransformAnimationField {
		None,
		Translation,
		Rotation,
		Scale
	}

	export interface TransformAnimationTrack {
		field: TransformAnimationField;
		key: Float32Array;
	}

	export interface TransformAnimation {
		tracks: TransformAnimationTrack[];
	}

	export interface JointAnimation extends TransformAnimation {
		jointIndex: number;
		jointName?: string;
	}

	export interface SkeletonAnimation extends Asset {
		frameTime: number;
		frameCount: number;
		jointAnims: JointAnimation[];
	}


	export interface Model extends Asset {
		transform: Transform;
		children: Model[];
		parent: Model;

		// components		
		mesh?: Mesh;
		materials?: Material[];
		joint?: Joint;
		animations?: AnimationTrack[];
		jointAnims?: JointAnimation;
	}


	export function makeModel(name: string, ref?: any): Model {
		return {
			name: name,
			userRef: ref,
			transform: makeTransform(),
			children: [],
			parent: null
		};
	}


	export class AssetGroup {
		meshes: Mesh[] = [];
		textures: Texture2D[] = [];
		materials: Material[] = [];
		models: Model[] = [];
		skins: Skin[] = [];
		anims: SkeletonAnimation[] = [];

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

		addSkin(skin: Skin): number {
			this.skins.push(skin);
			return this.skins.length - 1;
		}

		addSkeletonAnimation(anim: SkeletonAnimation) {
			this.anims.push(anim);
			return this.anims.length;
		}
	}

} // ns sd.asset
