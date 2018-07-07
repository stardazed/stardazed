/**
 * render-helpers/framebuffer-traits - make FrameBuffers based on the traits of its contents
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";
import { PixelFormat } from "@stardazed/image";
import { RenderDevice } from "@stardazed/render";

import { makeFrameBufferTraits, makeFrameBufferFromTraits } from "./framebuffer-traits";

// FIXME: up for discussion, these used to be more useful but may be too rigid now

// Util functions to create a Framebuffer with standard configuration:
// RGBA8/16F/32F colour attachments and default depth and stencil formats when requested.
// Width/Height, Square and Screen dimension versions are available.

export const enum FBPixelComponent {
	Integer,
	HalfFloat,
	Float
}


export function pixelFormatForFBPixelComponent(fbpc: FBPixelComponent) {
	if (fbpc === FBPixelComponent.Integer) {
		return PixelFormat.RGBA8;
	}
	if (fbpc === FBPixelComponent.Float) {
		return PixelFormat.RGBA32F;
	}
	if (fbpc === FBPixelComponent.HalfFloat) {
		return PixelFormat.RGBA16F;
	}

	assert(false, `Unknown framebuffer pixel component: ${fbpc}`);
	return PixelFormat.None;
}


export interface DefaultFBODesc {
	colourCount: number;
	pixelComponent?: FBPixelComponent;
	useDepth?: boolean;
	useStencil?: boolean;
}


export function makeDefaultFrameBuffer(width: number, height: number, desc: DefaultFBODesc) {
	const fbt = makeFrameBufferTraits(width, height);
	const pixFmt = pixelFormatForFBPixelComponent(desc.pixelComponent || FBPixelComponent.Integer);

	fbt.colours = Array.from({ length: desc.colourCount }, _ => pixFmt);

	if (desc.useDepth) {
		fbt.depth = PixelFormat.Depth24I;
	}
	if (desc.useStencil) {
		fbt.stencil = PixelFormat.Stencil8;
	}

	return makeFrameBufferFromTraits(fbt);
}

export function makeSquareFrameBuffer(dimension: number, desc: DefaultFBODesc) {
	return makeDefaultFrameBuffer(dimension, dimension, desc);
}

export function makeScreenFrameBuffer(rd: RenderDevice, desc: DefaultFBODesc) {
	return makeDefaultFrameBuffer(rd.drawableWidth, rd.drawableHeight, desc);
}
