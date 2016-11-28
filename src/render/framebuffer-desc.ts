// framebuffer-desc - descriptors and enums related to FrameBuffer objects
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { PixelFormat } from "render/pixelformat";
import { Texture, CubeMapFace, TextureUsageHint } from "render/texture";

export interface AttachmentDescriptor {
	texture: Texture | null;
	level: number; // mipmap
	layer: number | CubeMapFace; // TexCube only: 0..5
}


export interface FrameBufferDescriptor {
	colourAttachments: AttachmentDescriptor[];
	depthAttachment: AttachmentDescriptor;
	stencilAttachment: AttachmentDescriptor;
}


// This structure facilitates easy creation of all required
// textures for a FrameBuffer in case they need to be allocated anyway
// The implementation is free to allocate the textures as fit for the
// platform (2D array, multiple 2D textures, etc.) so no assumptions should
// be made about the type or organization of the textures.

export interface FrameBufferAllocationDescriptor {
	// properties shared by all textures for the FrameBuffer
	width: number;
	height: number;

	colourPixelFormats: PixelFormat[];
	colourUsageHints: TextureUsageHint[];

	// The implementation may create a combined depth/stencil texture if it
	// fits the profile of the provided texture formats, or you can make it
	// explicit by setting both to the same DepthStencil PixelFormat.
	depthPixelFormat: PixelFormat;
	stencilPixelFormat: PixelFormat;

	depthUsageHint: TextureUsageHint;
	stencilUsageHint: TextureUsageHint;
}


export function makeAttachmentDescriptor(texture?: Texture, level?: number, layer?: number): AttachmentDescriptor {
	return {
		texture: texture || null,
		level: level | 0,
		layer: layer | 0
	};
}


export function makeFrameBufferDescriptor(): FrameBufferDescriptor {
	const cad: AttachmentDescriptor[] = [];
	for (let k = 0; k < 8; ++k) {
		cad.push(makeAttachmentDescriptor());
	}
	Object.seal(cad); // fixed length array

	return {
		colourAttachments: cad,
		depthAttachment: makeAttachmentDescriptor(),
		stencilAttachment: makeAttachmentDescriptor()
	};
}


export function makeFrameBufferAllocationDescriptor(numColourAttachments: number): FrameBufferAllocationDescriptor {
	const apf: PixelFormat[] = [];
	const auh: TextureUsageHint[] = [];
	for (let k = 0; k < 8; ++k) {
		// set default pixelformat for requested colour attachments to RGBA8
		apf.push((k < numColourAttachments) ? PixelFormat.RGBA8 : PixelFormat.None);
		auh.push(TextureUsageHint.Normal);
	}
	Object.seal(apf); // fixed length arrays
	Object.seal(auh);

	return {
		width: 0,
		height: 0,

		colourPixelFormats: apf,
		colourUsageHints: auh,

		depthPixelFormat: PixelFormat.None,
		stencilPixelFormat: PixelFormat.None,

		// As depth and stencil buffers are almost exclusively used in
		// FBO environments, their default hint is set accordingly.
		depthUsageHint: TextureUsageHint.RenderTargetOnly,
		stencilUsageHint: TextureUsageHint.RenderTargetOnly
	};
}
