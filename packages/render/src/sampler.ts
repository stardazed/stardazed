/**
 * render/sampler - engine-side samplers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { RenderResourceBase, ResourceType } from "./resource";

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
		mipFilter: TextureMipFilter.Linear,

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
