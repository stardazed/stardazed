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
		texture?: render.Texture;
	}


	// This is a PNG that is a purple-black chessboard pattern
	// to be used when resolving textures and a texture is missing.
	// Dimensions: 48x48. Placement in this file is temporary until
	// standardised asset texture resolving is implemented.
	const missingTexture = "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAABlBMVEX/AN8AAAA/lLvMAAAAFElEQVR4AWMAgv///w96Csoc9BQAKFKPcQjw3h8AAAAASUVORK5CYII=";


	export interface Material extends Asset {
		emissiveColour: Float3;
		emissiveIntensity: number;

		diffuseColour: Float3;

		specularColour: Float3;
		specularIntensity: number;
		specularExponent: number;

		opacity: number; // 0: fully transparent, 1: fully opaque (default)

		textureScale: Float2;
		textureOffset: Float2;
		diffuseTexture?: Texture2D;	// TODO: change this to array of textures with typed channels
		specularTexture?: Texture2D;
		normalTexture?: Texture2D;
		heightTexture?: Texture2D;
		transparencyTexture?: Texture2D;

		// DEPRECATED: this will be removed as this obvs does not belong here
		jointDataTexture?: Texture2D;
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(name?: string): Material {
		return {
			name: name || "",

			emissiveColour: [0, 0, 0],
			emissiveIntensity: 0,

			diffuseColour: [0, 0, 0],

			specularColour: [0, 0, 0],
			specularIntensity: 1,
			specularExponent: 0,

			textureScale: [1, 1],
			textureOffset: [0, 0],

			opacity: 1
		};
	}


	export interface Mesh extends Asset {
		positions?: Float64Array;
		streams: mesh.VertexAttributeStream[];

		meshData?: mesh.MeshData;
		indexMap?: mesh.VertexIndexMapping;

		mesh?: render.Mesh;
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


	export interface WeightedVertexGroup extends Asset {
		indexes: Int32Array | null;
		weights: Float64Array | null;

		bindPoseLocalTranslation: Float3 | null;
		bindPoseLocalRotation: Float4 | null;
		bindPoseLocalMatrix: ArrayOfNumber | null;
	}

	export interface Skin extends Asset {
		groups: WeightedVertexGroup[];
	}


	// -- DEPRECATED
	export interface Joint {
		root: boolean;
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
	// -- /DEPRECATED



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


	// TODO: models, lights, cameras and generic nodes do not belong in Asset
	// Full scene formats like FBX, OpenGEX, etc. export assets and scene data together
	// but in SD these are handled separately

	export interface Light {
		descriptor: world.LightDescriptor;
	}


	export interface Model extends Asset {
		transform: Transform;
		children: Model[];
		parent: Model | null;

		// components
		mesh?: Mesh;
		materials?: Material[];
		light?: Light;

		// DEPRECATED (FBX)
		joint?: Joint;
		vertexGroup?: WeightedVertexGroup;
		animations?: AnimationTrack[];
		// /DEPRECATED
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

} // ns sd.asset
