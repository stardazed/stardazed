// asset/types - main asset types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.asset {

	export interface Asset {
		name: string;
		userRef?: any;
	}


	export interface Texture2D extends Asset {
		url?: URL;

		useMipMaps?: render.UseMipMaps;
		descriptor?: render.TextureDescriptor;
		texture?: render.Texture;
	}


	export interface TextureCube extends Asset {
		filePathPosX?: string;
		filePathNegX?: string;
		filePathPosY?: string;
		filePathNegY?: string;
		filePathPosZ?: string;
		filePathNegZ?: string;

		useMipMaps: render.UseMipMaps;
		descriptor?: render.TextureDescriptor;
		texture?: render.Texture;
	}


	export const enum MaterialFlags {
		usesSpecular               = 0x00000001,
		usesEmissive               = 0x00000002,
		isTranslucent              = 0x00000004,

		diffuseAlphaIsTransparency = 0x00000100,
		diffuseAlphaIsOpacity      = 0x00000200,

		normalAlphaIsHeight        = 0x00000800,

		isSkinned                  = 0x00001000   // FIXME: hmm
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


	export interface Mesh extends Asset {
		readonly meshData: meshdata.MeshData;
		readonly indexMap?: meshdata.VertexIndexMapping;
	}


	export interface Transform {
		position: Float3;
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
		bindPoseLocalMatrix: Float4x4 | null;
	}

	export interface Skin extends Asset {
		groups: WeightedVertexGroup[];
	}


	// -- DEPRECATED?
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
	// -- /DEPRECATED?



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


	export const enum LightType {
		None,
		Directional,
		Point,
		Spot
	}

	export const enum ShadowType {
		None,
		Hard,
		Soft
	}

	export const enum ShadowQuality {
		Auto
	}

	export interface Light extends Asset {
		type: LightType;

		colour: Float3;
		intensity: number;

		range?: number;  // m   (point/spot only)
		cutoff?: number; // rad (spot only)

		shadowType?: ShadowType;
		shadowQuality?: ShadowQuality;
		shadowStrength?: number;  // 0..1
		shadowBias?: number;      // 0.001..0.1
	}


	export interface FogDescriptor {
		colour: Float3;
		offset: number;        // 0+
		depth: number;         // 0+,
		density: number;       // 0..1
	}


	export interface Model extends Asset {
		transform: Transform;
		children: Model[];
		parent?: Model;

		// components
		mesh?: Mesh;
		materials?: Material[];
		light?: Light;

		// DEPRECATED?
		joint?: Joint; // FBX and MD5
		vertexGroup?: WeightedVertexGroup; // FBX
		animations?: AnimationTrack[]; // FBX
		// /DEPRECATED?
	}

	export function makeModel(name: string, ref?: any): Model {
		return {
			name: name,
			userRef: ref,
			transform: makeTransform(),
			children: []
		};
	}


	export class AssetGroup {
		meshes: Mesh[] = [];
		textures: (Texture2D | null)[] = []; // FIXME: handling of optional textures
		materials: Material[] = [];
		models: Model[] = [];
		anims: SkeletonAnimation[] = [];

		addMesh(mesh: Mesh): number {
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

		addSkeletonAnimation(anim: SkeletonAnimation) {
			this.anims.push(anim);
			return this.anims.length;
		}
	}

} // ns sd.asset
