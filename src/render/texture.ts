// render/texture - engine-side textures and samplers
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


	export interface Sampler {
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
			repeatS: TextureRepeatMode.Repeat,
			repeatT: TextureRepeatMode.Repeat,
			repeatR: TextureRepeatMode.Repeat,

			minFilter: TextureSizingFilter.Linear,
			magFilter: TextureSizingFilter.Linear,
			mipFilter: TextureMipFilter.Nearest,

			lodMinClamp: -1000,
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
		None,

		Tex2D,
		Tex3D,
		TexCube
	}


	export const enum UseMipMaps {
		No = 0,
		Yes = 1
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
		return { baseLevel: baseLevel, numLevels: numLevels };
	}


	export type TextureImageSource = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
	export type TextureImageData = ArrayBufferView | TextureImageSource;


	export interface Texture {
		textureClass: TextureClass;
		pixelFormat: image.PixelFormat;
		dim: image.PixelDimensions;
		mipmaps: number;
		layers: number;

		// If omitted, new textures will be created with zeroed data.
		// If included, the number of entries MUST equal `layers` for Tex2D, `dim.depth` for Tex3D and 6 * `layers` for TexCube classes.
		pixelData?: TextureImageData[];
	}


	export function maxMipLevelsForDimension(dim: number) {
		return 1 + Math.floor(Math.log(dim | 0) / Math.LN2);
	}


	export function makeTexture(): Texture {
		return {
			textureClass: TextureClass.Tex2D,
			pixelFormat: image.PixelFormat.None,
			dim: image.makePixelDimensions(0, 0),
			mipmaps: 1,
			layers: 1
		};
	}


	export function makeTex2D(pixelFormat: image.PixelFormat, width: number, height: number, mipmapped: UseMipMaps = UseMipMaps.No): Texture {
		const maxDim = Math.max(width, height);

		return {
			textureClass: TextureClass.Tex2D,
			pixelFormat: pixelFormat,
			dim: image.makePixelDimensions(width, height),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(maxDim) : 1,
			layers: 1
		};
	}


	export function makeTex2DFromImageSource(source: TextureImageSource, colourSpace: image.ColourSpace, mipmapped: UseMipMaps = UseMipMaps.No): Texture {
		const maxDim = Math.max(source.width, source.height);

		return {
			textureClass: TextureClass.Tex2D,
			pixelFormat: colourSpace === image.ColourSpace.sRGB ? image.PixelFormat.SRGB8_Alpha8 : image.PixelFormat.RGBA8,
			dim: image.makePixelDimensions(source.width, source.height),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(maxDim) : 1,
			layers: 1,
			pixelData: [source]
		};
	}


	export function makeTex2DFloatLUT(sourceData: Float32Array, width: number, height: number): Texture {
		return {
			textureClass: TextureClass.Tex2D,
			pixelFormat: image.PixelFormat.RGBA32F,
			dim: image.makePixelDimensions(width, height),
			mipmaps: 1,
			layers: 1,
			pixelData: [sourceData]
		};
	}


	export function makeTexCube(pixelFormat: image.PixelFormat, dimension: number, mipmapped: UseMipMaps = UseMipMaps.No): Texture {
		const sampler = makeSampler();
		sampler.mipFilter = mipmapped == UseMipMaps.Yes ? TextureMipFilter.Linear : TextureMipFilter.None;
		sampler.repeatS = TextureRepeatMode.ClampToEdge;
		sampler.repeatT = TextureRepeatMode.ClampToEdge;

		return {
			textureClass: TextureClass.TexCube,
			pixelFormat: pixelFormat,
			dim: image.makePixelDimensions(dimension, dimension),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(dimension) : 1,
			layers: 1
		};
	}


	export function makeTexCubeFromImageSources(sources: TextureImageSource[], colourSpace: image.ColourSpace, mipmapped: UseMipMaps = UseMipMaps.No): Texture {
		const sampler = makeSampler();
		sampler.mipFilter = mipmapped == UseMipMaps.Yes ? TextureMipFilter.Linear : TextureMipFilter.None;
		sampler.repeatS = TextureRepeatMode.ClampToEdge;
		sampler.repeatT = TextureRepeatMode.ClampToEdge;

		return {
			textureClass: TextureClass.TexCube,
			pixelFormat: colourSpace === image.ColourSpace.sRGB ? image.PixelFormat.SRGB8_Alpha8 : image.PixelFormat.RGBA8,
			dim: image.makePixelDimensions(sources[0].width, sources[0].height),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(sources[0].width) : 1,
			layers: 1,
			pixelData: sources
		};
	}

} // ns sd.render
