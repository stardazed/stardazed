/*
asset/gltf2 - glTF v2 parser and importer
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

// import { Geometry } from "stardazed/geometry";

interface GLTFBase<X = Record<string, any>> {
	extensions?: X;
	extras?: Record<string, any>;
}

interface GLTFNamed {
	name?: string;
}

const enum GLTFComponentType {
	BYTE = 5120,
	UNSIGNED_BYTE = 5121,
	SHORT = 5122,
	UNSIGNED_SHORT = 5123,
	UNSIGNED_INT = 5125,
	FLOAT = 5126
}

const enum GLTFPrimitiveMode {
	POINTS = 0,
	LINES,
	LINE_LOOP,
	LINE_STRIP,
	TRIANGLES,
	TRIANGLE_STRIP,
	TRIANGLE_FAN
}

const enum GLTFBufferTarget {
	ARRAY_BUFFER = 34962,
	ELEMENT_ARRAY_BUFFER = 34963
}

const enum GLTFMinFilter {
	NEAREST = 9728,
	LINEAR = 9729
}

const enum GLTFMagFilter {
	NEAREST = 9728,
	LINEAR = 9729,
	NEAREST_MIPMAP_NEAREST = 9984,
	LINEAR_MIPMAP_NEAREST = 9985,
	NEAREST_MIPMAP_LINEAR = 9986,
	LINEAR_MIPMAP_LINEAR = 9987
}

const enum GLTFWrappingMode {
	CLAMP_TO_EDGE = 33071,
	MIRRORED_REPEAT = 33648,
	REPEAT = 10497
}


// KHR_lights_punctual

interface KHRPointLight {
	type: "point";
	range?: number;
}

interface KHRSpotLight {
	type: "spot";
	range?: number;
	innerConeAngle?: number;
	outerConeAngle?: number;
}

interface KHRDirectionalLight {
	type: "directional";
}

type KHRPunctualLightData = KHRPointLight | KHRSpotLight | KHRDirectionalLight;

type KHRPunctualLight = GLTFNamed & KHRPunctualLightData & {
	color?: number[];
	intensity?: number;
};

interface KHRLightsPunctualLights {
	lights: KHRPunctualLight[];
}

interface KHRLightsPunctualLightInfo {
	light: number;
}


// KHR_materials_clearcoat

interface KHRMaterialsClearcoat {
	clearcoatFactor?: number;
	clearcoatTexture?: GLTFTextureInfo;
	clearcoatRoughnessFactor?: number;
	clearcoatRoughnessTexture?: GLTFTextureInfo;
	clearcoatNormalTexture?: GLTFNormalTextureInfo;
}


// KHR_materials_pbrSpecularGlossiness

interface KHRMaterialsPBRSpecularGlossiness {
	diffuseFactor?: number[];
	diffuseTexture?: GLTFTextureInfo;
	specularFactor?: number[];
	glossinessFactor?: number;
	specularGlossinessTexture?: GLTFTextureInfo;
}


// KHR_texture_transform

interface KHRTextureTransform {
	offset?: number[];
	rotation?: number;
	scale?: number;
	texCoord?: number;
}


// EXT_texture_webp & MSFT_texture_dds

interface TextureAlternateSource {
	source: number;
}


// MSFT_lod

interface MSFTLODRootNode {
	ids: number[];
}


// Main spec

interface GLTFAsset extends GLTFBase {
	copyright?: string;
	generator?: string;
	version: string;
	minVersion?: string;
}

interface GLTFScene extends GLTFBase, GLTFNamed {
	nodes?: number[];
	name?: string;
}

interface GLTFNodeExtensions {
	KHR_lights_punctual?: KHRLightsPunctualLightInfo;
	MSFT_lod?: MSFTLODRootNode;
}

interface GLTFNode extends GLTFBase<GLTFNodeExtensions>, GLTFNamed {
	camera?: number;
	children?: number[];
	skin?: number;
	matrix?: number[];
	mesh?: number;
	rotation?: number[];
	scale?: number[];
	translation?: number[];
	weights?: number;
}

interface GLTFBuffer extends GLTFBase, GLTFNamed {
	uri?: string;
	byteLength: number;
}

interface GLTFBufferView extends GLTFBase, GLTFNamed {
	buffer: number;
	byteOffset?: number;
	byteLength: number;
	byteStride?: number;
	target?: GLTFBufferTarget;
}

interface GLTFSparseIndices extends GLTFBase {
	bufferView: number;
	byteOffset?: number;
	componentType: GLTFComponentType;
}

interface GLTFSparseValues extends GLTFBase {
	bufferView: number;
	byteOffset?: number;
}

interface GLTFSparse extends GLTFBase {
	count: number;
	indices: GLTFSparseIndices;
	values: GLTFSparseValues;
}

interface GLTFAccessor extends GLTFBase, GLTFNamed {
	bufferView: number;
	byteOffset?: number;
	componentType: GLTFComponentType;
	normalized?: boolean;
	count: number;
	type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
	max?: number[];
	min?: number[];
	sparse?: GLTFSparse;
}

interface GLTFPrimitive extends GLTFBase {
	attributes: Record<string, number>;
	indices?: number;
	material?: number;
	mode?: GLTFPrimitiveMode;
	targets?: Record<string, number>; // TODO: verify
}

interface GLTFMesh extends GLTFBase, GLTFNamed {
	primitives: GLTFPrimitive[];
	weights?: number[];
}

interface GLTFSkin extends GLTFBase, GLTFNamed {
	inverseBindMatrices?: number;
	skeleton?: number;
	joints: number[];
}

interface GLTFAnimationSampler extends GLTFBase {
	input: number;
	interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE";
	output: number;
}

interface GLTFChannelTarget extends GLTFBase {
	node?: number;
	path: "translation" | "rotation" | "scale" | "weights";
}

interface GLTFChannel extends GLTFBase {
	sampler: number;
	target: GLTFChannelTarget;
}

interface GLTFAnimation extends GLTFBase, GLTFNamed {
	channels: GLTFChannel[];
	samplers: GLTFAnimationSampler[];
}

interface GLTFSampler extends GLTFBase, GLTFNamed {
	magFilter?: GLTFMagFilter;
	minFilter?: GLTFMinFilter;
	wrapS?: GLTFWrappingMode;
	wrapT?: GLTFWrappingMode;
}

interface GLTFURIImage {
	uri: string;
}

interface GLTFBufferImage {
	bufferView: number;
}

type GLTFImageData = GLTFURIImage | GLTFBufferImage;

type GLTFImage = GLTFBase & GLTFNamed & GLTFImageData & {
	mimeType?: string;
};

interface GLTFTextureExtensions {
	EXT_texture_webp?: TextureAlternateSource;
	MSFT_texture_dds?: TextureAlternateSource;
}

interface GLTFTexture extends GLTFBase<GLTFTextureExtensions>, GLTFNamed {
	sampler?: number;
	source?: number;
}

interface GLTFTextureInfoExtensions {
	KHR_texture_transform?: KHRTextureTransform;
}

interface GLTFTextureInfo extends GLTFBase<GLTFTextureInfoExtensions> {
	index: number;
	texCoord?: number;
}

interface GLTFNormalTextureInfo extends GLTFTextureInfo {
	scale?: number;
}

interface GLTFOcclusionTextureInfo extends GLTFTextureInfo {
	strength?: number;
}

interface GLTFPBRMetallicRoughness extends GLTFBase {
	baseColorFactor?: number[];
	baseColorTexture?: GLTFNormalTextureInfo;
	metallicFactor?: number;
	metallicRoughnessTexture?: GLTFNormalTextureInfo;
}

interface GLTFMaterialExtensions {
	KHR_materials_unlit?: {};
	KHR_materials_clearcoat?: KHRMaterialsClearcoat;
	KHR_materials_pbrSpecularGlossiness: KHRMaterialsPBRSpecularGlossiness;
	MSFT_lod?: MSFTLODRootNode;
}

interface GLTFMaterial extends GLTFBase<GLTFMaterialExtensions>, GLTFNamed {
	pbrMetallicRoughness?: GLTFPBRMetallicRoughness;
	normalTexture?: GLTFNormalTextureInfo;
	occlusionTexture?: GLTFOcclusionTextureInfo;
	emissiveTexture?: GLTFNormalTextureInfo;
	emissiveFactor?: number[];
	alphaMode?: "OPAQUE" | "MASK" | "BLEND";
	alphaCutoff?: number;
	doubleSided?: boolean;
}

interface GLTFOrthographicProjection extends GLTFBase {
	xmag: number;
	ymag: number;
	zfar: number;
	znear: number;
}

interface GLTFOrthographicCamera {
	type: "orthographic";
	orthographic: GLTFOrthographicProjection;
}

interface GLTFPerspectiveProjection extends GLTFBase {
	aspectRatio?: number;
	yfov: number;
	zfar?: number;
	znear: number;
}

interface GLTFPerspectiveCamera {
	type: "perspective";
	perspective: GLTFPerspectiveProjection;
}

type GLTFCamera = GLTFBase & GLTFNamed & (GLTFOrthographicCamera | GLTFPerspectiveCamera);

interface GLTFDocumentExtensions {
	KHR_lights_punctual?: KHRLightsPunctualLights;
}

interface GLTFDocument extends GLTFBase<GLTFDocumentExtensions> {
	asset: GLTFAsset;

	extensionsUsed?: string[];
	extensionsRequired?: string[];

	scene?: number;
	scenes?: GLTFScene[];
	nodes?: GLTFNode[];

	buffers?: GLTFBuffer[];
	bufferViews?: GLTFBufferView[];
	accessors?: GLTFAccessor;

	meshes?: GLTFMesh[];
	skins?: GLTFSkin[];
	animations?: GLTFAnimation[];

	samplers?: GLTFSampler[];
	images?: GLTFImage[];
	textures?: GLTFTexture[];
	materials?: GLTFMaterial[];

	cameras?: GLTFCamera[];
}

export async function loadGLTFGeometry(baseDir: string, fileName: string) {
	const r = await (await fetch(`${baseDir}/${fileName}`)).json() as GLTFDocument;
	const buffers = await Promise.all(r.buffers?.map(async (bd) => {
		return (await fetch(`${baseDir}/${bd.uri!}`)).arrayBuffer();
	}) ?? []);

	// create buffers
	const views: Uint8Array[] = [];
	let indexOffset = 0;
	for (const b of r.bufferViews!) {
		const offset = b.byteOffset ?? 0;
		if (b.target === GLTFBufferTarget.ELEMENT_ARRAY_BUFFER) {
			indexOffset = offset;
		}
	}
	views.push(new Uint8Array(buffers[0], 0, indexOffset));
	views.push(new Uint8Array(buffers[0], indexOffset));

	// // construct geometries
	// const geoms: Geometry[] = [];
	// for (const g of r.meshes!) {
	// 	for (const p of g.primitives) {
			
	// 	}
	// }

	return views;
}
