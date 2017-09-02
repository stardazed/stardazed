// render/core/texture - engine-side textures and samplers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum TextureRepeatMode {
		Repeat,
		MirroredRepeat,
		ClampToEdge
	}


	export const enum TextureSizingFilter {
		Nearest,
		Linear
	}


	export const enum TextureMipFilter {
		None,
		Nearest,
		Linear
	}


	export interface Sampler extends RenderResourceBase {
		repeatS: TextureRepeatMode;
		repeatT: TextureRepeatMode;
		repeatR: TextureRepeatMode;

		minFilter: TextureSizingFilter;
		magFilter: TextureSizingFilter;
		mipFilter: TextureMipFilter;

		lodMinClamp: number;
		lodMaxClamp: number;

		maxAnisotropy: number;
	}


	export function makeSampler(): Sampler {
		return {
			renderResourceType: ResourceType.Sampler,
			renderResourceHandle: 0,

			repeatS: TextureRepeatMode.Repeat,
			repeatT: TextureRepeatMode.Repeat,
			repeatR: TextureRepeatMode.Repeat,

			minFilter: TextureSizingFilter.Linear,
			magFilter: TextureSizingFilter.Linear,
			mipFilter: TextureMipFilter.Nearest,

			lodMinClamp: 0,
			lodMaxClamp: 1000,

			maxAnisotropy: 1
		};
	}


	export function makeCubemapSampler(mipmapped: boolean): Sampler {
		return {
			...makeSampler(),

			repeatS: TextureRepeatMode.ClampToEdge,
			repeatT: TextureRepeatMode.ClampToEdge,
			repeatR: TextureRepeatMode.ClampToEdge,

			mipFilter: mipmapped ? TextureMipFilter.Linear : TextureMipFilter.None,
		};
	}

	export function makeLookupTableSampler(): Sampler {
		return {
			...makeSampler(),

			repeatS: TextureRepeatMode.ClampToEdge,
			repeatT: TextureRepeatMode.ClampToEdge,
			repeatR: TextureRepeatMode.ClampToEdge,

			minFilter: TextureSizingFilter.Nearest,
			magFilter: TextureSizingFilter.Nearest,
			mipFilter: TextureMipFilter.None
		};
	}


	// --------


	export const enum TextureClass {
		Plain,
		CubeMap
	}


	export const enum MipMapMode {
		Source,
		Strip,
		Regenerate
	}


	// the numerical constant for each face is also the layer index in the cubemap
	export const enum CubeMapFace {
		PosX,
		NegX,
		PosY,
		NegY,
		PosZ,
		NegZ
	}


	export interface MipMapRange {
		baseLevel: number;
		numLevels: number;
	}

	export function makeMipMapRange(baseLevel: number, numLevels: number): MipMapRange {
		return { baseLevel, numLevels };
	}


	export type TextureImageSource = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
	export type TextureImageData = ArrayBufferView | TextureImageSource;


	export interface Texture extends RenderResourceBase {
		textureClass: TextureClass;
		pixelFormat: image.PixelFormat;
		dim: image.PixelDimensions;
		mipmapMode: MipMapMode;
		maxMipLevel?: number;
		layers?: number;

		// If omitted, new textures will be created with zeroed data.
		// If included, the number of entries MUST equal `layers` * `dim.depth` for plain and 6 * `layers` for cubemap textures.
		pixelData?: image.PixelDataProvider[];
	}


	export function maxMipLevelsForDimension(dim: number) {
		return 1 + Math.floor(Math.log(dim | 0) / Math.LN2);
	}


	export function makeTexture(): Texture {
		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.Plain,
			pixelFormat: image.PixelFormat.None,
			dim: image.makePixelDimensions(0, 0),
			mipmapMode: MipMapMode.Source
		};
	}


	export function makeTex2D(pixelFormat: image.PixelFormat, width: number, height: number, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.Plain,
			pixelFormat,
			dim: image.makePixelDimensions(width, height),
			mipmapMode
		};
	}


	export function makeTex2DFromProvider(provider: image.PixelDataProvider, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.Plain,
			pixelFormat: provider.pixelFormat,
			dim: image.makePixelDimensions(provider.dim.width, provider.dim.height),
			mipmapMode,
			pixelData: [provider]
		};
	}


	export function makeTex2DFloatLUT(sourceData: Float32Array, width: number, height: number): Texture {
		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.Plain,
			pixelFormat: image.PixelFormat.RGBA32F,
			dim: image.makePixelDimensions(width, height),
			mipmapMode: MipMapMode.Source,
			pixelData: [image.providerForSingleBuffer({
				data: sourceData,
				dim: image.makePixelDimensions(width, height),
				colourSpace: image.ColourSpace.Linear,
				pixelFormat: image.PixelFormat.RGBA32F
			})]
		};
	}


	export function makeTexCube(pixelFormat: image.PixelFormat, dimension: number, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.CubeMap,
			pixelFormat,
			dim: image.makePixelDimensions(dimension, dimension),
			mipmapMode
		};
	}


	export function makeTexCubeFromProviders(sources: image.PixelDataProvider[], mipmapMode: MipMapMode = MipMapMode.Source): Texture {
		assert(sources.length === 6, "Must pass 6 providers for CubeMap texture.");

		return {
			renderResourceType: ResourceType.Texture,
			renderResourceHandle: 0,

			textureClass: TextureClass.CubeMap,
			pixelFormat: sources[0].pixelFormat,
			dim: image.makePixelDimensions(sources[0].dim.width, sources[0].dim.height),
			mipmapMode,
			pixelData: sources
		};
	}

} // ns sd.render
