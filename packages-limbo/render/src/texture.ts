/**
 * render/texture - engine-side textures
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";
import { PixelFormat } from "@stardazed/pixel-format";
import { PixelDimensions, makePixelDimensions, PixelDataProvider } from "@stardazed/image";
import { RenderResourceBase, ResourceType } from "./resource";

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


export interface Texture extends RenderResourceBase {
	textureClass: TextureClass;
	pixelFormat: PixelFormat;
	dim: PixelDimensions;
	mipmapMode: MipMapMode;
	maxMipLevel?: number;
	layers?: number;

	// If omitted, new textures will be created with zeroed data.
	// If included, the number of entries MUST equal `layers` * `dim.depth` for plain and 6 * `layers` for cubemap textures.
	pixelData?: PixelDataProvider[];
}


export function maxMipLevelsForDimension(dim: number) {
	return 1 + Math.floor(Math.log(dim | 0) / Math.LN2);
}


export function makeTexture(): Texture {
	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.Plain,
		pixelFormat: PixelFormat.None,
		dim: makePixelDimensions(0, 0),
		mipmapMode: MipMapMode.Source
	};
}


export function makeTex2D(pixelFormat: PixelFormat, width: number, height: number, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.Plain,
		pixelFormat,
		dim: makePixelDimensions(width, height),
		mipmapMode
	};
}


export function makeTex2DFromProvider(provider: PixelDataProvider, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.Plain,
		pixelFormat: provider.pixelFormat,
		dim: makePixelDimensions(provider.dim.width, provider.dim.height),
		mipmapMode,
		pixelData: [provider]
	};
}


/*
export function makeTex2DFloatLUT(sourceData: Float32Array, width: number, height: number): Texture {
	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.Plain,
		pixelFormat: PixelFormat.RGBA32F,
		dim: makePixelDimensions(width, height),
		mipmapMode: MipMapMode.Source,
		pixelData: [providerForSingleBuffer({
			data: sourceData,
			dim: makePixelDimensions(width, height),
			pixelFormat: PixelFormat.RGBA32F
		})]
	};
}
*/

export function makeTexCube(pixelFormat: PixelFormat, dimension: number, mipmapMode: MipMapMode = MipMapMode.Source): Texture {
	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.CubeMap,
		pixelFormat,
		dim: makePixelDimensions(dimension, dimension),
		mipmapMode
	};
}


export function makeTexCubeFromProviders(sources: PixelDataProvider[], mipmapMode: MipMapMode = MipMapMode.Source): Texture {
	assert(sources.length === 6, "Must pass 6 providers for CubeMap texture.");

	return {
		renderResourceType: ResourceType.Texture,
		renderResourceHandle: 0,

		textureClass: TextureClass.CubeMap,
		pixelFormat: sources[0].pixelFormat,
		dim: makePixelDimensions(sources[0].dim.width, sources[0].dim.height),
		mipmapMode,
		pixelData: sources
	};
}
