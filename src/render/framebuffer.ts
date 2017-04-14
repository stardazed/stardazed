// render/framebuffer - descriptors and enums related to FrameBuffer objects
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface FrameBuffer extends RenderResourceBase {
		readonly width: number;
		readonly height: number;

		readonly colourAttachments: ReadonlyArray<AttachmentDescriptor>;
		readonly depthAttachment?: AttachmentDescriptor;
		readonly stencilAttachment?: AttachmentDescriptor;
	}

	// ----

	export interface AttachmentDescriptor {
		texture: Texture;
		level: number; // mipmap
		layer: number | CubeMapFace; // TexCube only: 0..5
	}

	export function makeAttachmentDescriptor(texture: Texture, level?: number, layer?: number | CubeMapFace): AttachmentDescriptor {
		return {
			texture,
			level: level! | 0,
			layer: layer! | 0
		};
	}

	export interface FrameBufferDescriptor {
		colourAttachments: AttachmentDescriptor[];
		depthAttachment?: AttachmentDescriptor;
		stencilAttachment?: AttachmentDescriptor;
	}

	export function makeFrameBuffer(desc: FrameBufferDescriptor): FrameBuffer {
		assert(desc.colourAttachments.length > 0, "FrameBuffer must specify at least one colour attachment.");
		const { width, height } = desc.colourAttachments[0].texture.dim;
		assert(desc.colourAttachments.every(cd => cd.texture.dim.width === width && cd.texture.dim.height === height));

		return {
			renderResourceType: ResourceType.FrameBuffer,
			renderResourceHandle: 0,
			width, height,
			...desc
		};
	}

	// ----

	// This structure facilitates easy creation of all required
	// textures for a FrameBuffer in case they need to be allocated anyway
	// The implementation is free to allocate the textures as fit for the
	// platform (2D array, multiple 2D textures, etc.) so no assumptions should
	// be made about the type or organization of the textures.

	export interface FrameBufferAllocationDescriptor {
		// all textures in a FrameBuffer have the same dimensions
		width: number;
		height: number;

		// format of the colour attachments
		colours: image.PixelFormat[];

		// The implementation may create a combined depth/stencil texture if it
		// fits the profile of the provided texture formats, or you can make it
		// explicit by setting both to the same DepthStencil PixelFormat.
		depth: image.PixelFormat.None | image.PixelFormat.Depth16I | image.PixelFormat.Depth24I | image.PixelFormat.Depth24_Stencil8;
		stencil: image.PixelFormat.None | image.PixelFormat.Stencil8 | image.PixelFormat.Depth24_Stencil8;
	}

	export function makeFrameBufferAllocationDescriptor(width: number, height: number): FrameBufferAllocationDescriptor {
		return {
			width, height,
			colours: [],
			depth: image.PixelFormat.None,
			stencil: image.PixelFormat.None
		};
	}

	export function allocateTexturesForFrameBuffer(desc: FrameBufferAllocationDescriptor): FrameBufferDescriptor {
		const { width, height } = desc;

		// -- colours
		const fbDesc: FrameBufferDescriptor = {
			colourAttachments: desc.colours.map(colourFormat => 
				makeAttachmentDescriptor(makeTex2D(colourFormat, width, height))
			)
		};

		// -- depth & stencil
		let combinedFormat = image.PixelFormat.None;

		assert(desc.depth === image.PixelFormat.None ||
			image.pixelFormatIsDepthFormat(desc.depth) ||
			image.pixelFormatIsDepthStencilFormat(desc.depth));
		assert(desc.stencil === image.PixelFormat.None ||
			image.pixelFormatIsStencilFormat(desc.stencil) ||
			image.pixelFormatIsDepthStencilFormat(desc.stencil));

		// -- check if we can use a combined depth/stencil format
		if (image.pixelFormatIsDepthStencilFormat(desc.depth)) {
			// explicit combined format
			assert(desc.depth === desc.stencil);
			combinedFormat = desc.depth;
		}
		else {
			// if depth is not a DS format, then stencil cannot be a DS format either
			assert(! image.pixelFormatIsDepthStencilFormat(desc.stencil));

			// check for available depth/stencil format combinations
			if (desc.stencil === image.PixelFormat.Stencil8) {
				if (desc.depth === image.PixelFormat.Depth24I) {
					combinedFormat = image.PixelFormat.Depth24_Stencil8;
				}
			}
		}

		// -- create the texture(s)
		if (combinedFormat !== image.PixelFormat.None) {
			const depthStencilTex = makeTex2D(combinedFormat, width, height);
			const attachment = makeAttachmentDescriptor(depthStencilTex);
			fbDesc.depthAttachment = attachment;
			fbDesc.stencilAttachment = attachment;
		}
		else {
			if (desc.depth !== image.PixelFormat.None) {
				const depthTex = makeTex2D(desc.depth, width, height);
				fbDesc.depthAttachment = makeAttachmentDescriptor(depthTex);
			}
			if (desc.stencil !== image.PixelFormat.None) {
				const stencilTex = makeTex2D(desc.stencil, width, height);
				fbDesc.stencilAttachment = makeAttachmentDescriptor(stencilTex);
			}
		}

		return fbDesc;
	}

	export function allocateFrameBuffer(fbad: FrameBufferAllocationDescriptor): FrameBuffer {
		const fbd = allocateTexturesForFrameBuffer(fbad);
		return makeFrameBuffer(fbd);
	}

} // ns sd.render
