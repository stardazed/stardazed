// texture-desc - texture descriptors
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pixelformat.ts"/>

namespace sd.render {

	export const enum TextureClass {
		Tex2D,
		TexCube
	}


	export const enum TextureUsageHint {
		Normal,
		RenderTargetOnly
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


	export interface SamplerDescriptor {
		repeatS: TextureRepeatMode;
		repeatT: TextureRepeatMode;

		minFilter: TextureSizingFilter;
		magFilter: TextureSizingFilter;
		mipFilter: TextureMipFilter;

		maxAnisotropy: number;
	}
	

	export type TextureImageSource = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
	export type TextureImageData = ArrayBufferView | TextureImageSource;


	export interface TextureDescriptor {
		textureClass: TextureClass;
		pixelFormat: PixelFormat;
		usageHint: TextureUsageHint;
		sampling: SamplerDescriptor;
		dim: PixelDimensions;
		mipmaps: number;

		// If omitted, new textures will be created with zeroed data.
		// If included, the number of entries MUST equal 1 for Tex2D and 6 for TexCube classes.
		pixelData?: TextureImageData[];
	}


	export function makeMipMapRange(baseLevel: number, numLevels: number): MipMapRange {
		return { baseLevel: baseLevel, numLevels: numLevels };
	}


	export function makeSamplerDescriptor(): SamplerDescriptor {
		return {
			repeatS: TextureRepeatMode.Repeat,
			repeatT: TextureRepeatMode.Repeat,

			minFilter: TextureSizingFilter.Linear,
			magFilter: TextureSizingFilter.Linear,
			mipFilter: TextureMipFilter.Nearest,

			maxAnisotropy: 1
		}
	}


	export function maxMipLevelsForDimension(dim: number) {
		return 1 + Math.floor(Math.log(dim | 0) / Math.LOG2E);
	}


	export function makeTexDesc2D(pixelFormat: PixelFormat, width: number, height: number, mipmapped: UseMipMaps): TextureDescriptor {
		var maxDim = Math.max(width, height);

		return {
			textureClass: TextureClass.Tex2D,
			pixelFormat: pixelFormat,
			usageHint: TextureUsageHint.Normal,
			sampling: makeSamplerDescriptor(),
			dim: makePixelDimensions(width, height),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(maxDim) : 1
		}
	}


	export function makeTexDescCube(pixelFormat: PixelFormat, dimension: number, mipmapped: UseMipMaps): TextureDescriptor {
		return {
			textureClass: TextureClass.TexCube,
			pixelFormat: pixelFormat,
			usageHint: TextureUsageHint.Normal,
			sampling: makeSamplerDescriptor(),
			dim: makePixelDimensions(dimension, dimension),
			mipmaps: (mipmapped == UseMipMaps.Yes) ? maxMipLevelsForDimension(dimension) : 1
		};
	}

} // ns sd.render
