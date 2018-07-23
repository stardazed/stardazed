/**
 * render-helpers/framebuffer-traits - make FrameBuffers based on the traits of its contents
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";
import { PixelFormat, pixelFormatIsDepthFormat, pixelFormatIsDepthStencilFormat, pixelFormatIsStencilFormat } from "@stardazed/image";
import { FrameBuffer, FrameBufferDescriptor, makeAttachmentDescriptor, makeFrameBuffer, makeTex2D } from "@stardazed/render";

/**
 * This structure facilitates easy creation of all required
 * textures for a FrameBuffer in case they need to be made new anyway.
 * The implementation is free to allocate the textures as fit for the
 * platform (2D array, multiple 2D textures, etc.) so no assumptions should
 * be made about the type or organization of the textures.
 */
export interface FrameBufferTraits {
	/**
	 * Width in pixels for all attachments
	 */
	width: number;
	/**
	 * Height in pixels for all attachments
	 */
	height: number;

	/**
	 * [[PixelFormat]] of all the colour attachments
	 */
	colours: PixelFormat[];

	/**
	 * Optional depth attachment [[PixelFormat]], None means no attachment.
	 * The implementation may create a combined depth/stencil texture if it
	 * fits the profile of the provided texture formats, or you can make it
	 * explicit by setting both to the same DepthStencil PixelFormat.
	 */
	depth: PixelFormat.None | PixelFormat.Depth16I | PixelFormat.Depth24I | PixelFormat.Depth24_Stencil8;
	/**
	 * Optional stencil attachment [[PixelFormat]], None means no attachment.
	 * The implementation may create a combined depth/stencil texture if it
	 * fits the profile of the provided texture formats, or you can make it
	 * explicit by setting both to the same DepthStencil PixelFormat.
	 */
	stencil: PixelFormat.None | PixelFormat.Stencil8 | PixelFormat.Depth24_Stencil8;
}

/**
 * Utility function to make an empty [[FrameBufferTraits]] object.
 * @param width Required width of the frame buffer.
 * @param height Required height of the frame buffer.
 */
export function makeFrameBufferTraits(width: number, height: number): FrameBufferTraits {
	return {
		width, height,
		colours: [],
		depth: PixelFormat.None,
		stencil: PixelFormat.None
	};
}

/**
 * Make a full [[FrameBufferDescriptor]] by making the required attachments,
 * i.e. not reusing existing textures.
 * @param desc Traits of the new contents of the framebuffer
 */
export function makeFrameBufferDescriptorFromTraits(desc: FrameBufferTraits): FrameBufferDescriptor {
	const { width, height } = desc;

	// -- colours
	const fbDesc: FrameBufferDescriptor = {
		colourAttachments: desc.colours.map(colourFormat => 
			makeAttachmentDescriptor(makeTex2D(colourFormat, width, height))
		)
	};

	// -- depth & stencil
	let combinedFormat = PixelFormat.None;

	assert(desc.depth === PixelFormat.None ||
		pixelFormatIsDepthFormat(desc.depth) ||
		pixelFormatIsDepthStencilFormat(desc.depth));
	assert(desc.stencil === PixelFormat.None ||
		pixelFormatIsStencilFormat(desc.stencil) ||
		pixelFormatIsDepthStencilFormat(desc.stencil));

	// -- check if we can use a combined depth/stencil format
	if (pixelFormatIsDepthStencilFormat(desc.depth)) {
		// explicit combined format
		assert(desc.depth === desc.stencil);
		combinedFormat = desc.depth;
	}
	else {
		// if depth is not a DS format, then stencil cannot be a DS format either
		assert(! pixelFormatIsDepthStencilFormat(desc.stencil));

		// check for available depth/stencil format combinations
		if (desc.stencil === PixelFormat.Stencil8) {
			if (desc.depth === PixelFormat.Depth24I) {
				combinedFormat = PixelFormat.Depth24_Stencil8;
			}
		}
	}

	// -- create the texture(s)
	if (combinedFormat !== PixelFormat.None) {
		const depthStencilTex = makeTex2D(combinedFormat, width, height);
		const attachment = makeAttachmentDescriptor(depthStencilTex);
		fbDesc.depthAttachment = attachment;
		fbDesc.stencilAttachment = attachment;
	}
	else {
		if (desc.depth !== PixelFormat.None) {
			const depthTex = makeTex2D(desc.depth, width, height);
			fbDesc.depthAttachment = makeAttachmentDescriptor(depthTex);
		}
		if (desc.stencil !== PixelFormat.None) {
			const stencilTex = makeTex2D(desc.stencil, width, height);
			fbDesc.stencilAttachment = makeAttachmentDescriptor(stencilTex);
		}
	}

	return fbDesc;
}

/**
 * Using [[FrameBufferTraits]], make all needed attachments and create a [[FrameBuffer]].
 * @param fbt The descriptor of the [[FrameBuffer]] to allocate
 */
export function makeFrameBufferFromTraits(fbt: FrameBufferTraits): FrameBuffer {
	const fbd = makeFrameBufferDescriptorFromTraits(fbt);
	return makeFrameBuffer(fbd);
}
