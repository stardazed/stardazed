// render/framebuffer - descriptors and enums related to FrameBuffer objects
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	/**
	 * A render resource referencing a frame buffer aka render target.
	 * A FrameBuffer can have multiple colour attachment, an optional
	 * depth attachments and an optional stencil attachment.
	 */
	export interface FrameBuffer extends RenderResourceBase {
		/**
		 * Width in pixels for all attachments
		 * @readonly
		 */
		readonly width: number;
		/**
		 * Height in pixels for all attachments
		 * @readonly
		 */
		readonly height: number;

		/**
		 * Array of colour attachments, may be empty.
		 * @readonly
		 */
		readonly colourAttachments: ReadonlyArray<AttachmentDescriptor>;
		/**
		 * Optional depth attachment.
		 * @readonly
		 */
		readonly depthAttachment?: AttachmentDescriptor;
		/**
		 * Optional stencil attachment.
		 * @readonly
		 */
		readonly stencilAttachment?: AttachmentDescriptor;
	}

	// ----

	/**
	 * Describes the properties of a [[FrameBuffer]] attachment.
	 */
	export interface AttachmentDescriptor {
		/**
		 * The texture resource that will act as the attachment buffer.
		 */
		texture: Texture;
		/**
		 * The mipmap level of [[texture]] to use.
		 * Not supported when using the WebGL 1 renderer.
		 */
		level: number;
		/**
		 * Either the [[CubeMapFace]] in case of a cube texture or the layer in case of a 2D Array texture. 0 otherwise.
		 * Not supported when using the WebGL 1 renderer.
		 */
		layer: number | CubeMapFace;
	}

	/**
	 * Utility function to create an [[AttachmentDescriptor]] object.
	 * @param texture The [[Texture]] to bind.
	 * @param level Optional: mipmap level of texture to bind.
	 * @param layer Optional: cube map face or array layer to bind.
	 */
	export function makeAttachmentDescriptor(texture: Texture, level?: number, layer?: number | CubeMapFace): AttachmentDescriptor {
		return {
			texture,
			level: level! | 0,
			layer: layer! | 0
		};
	}

	/**
	 * Object describing a [[FrameBuffer]]. Used by the [[makeFrameBuffer]] function.
	 */
	export interface FrameBufferDescriptor {
		colourAttachments: AttachmentDescriptor[];
		depthAttachment?: AttachmentDescriptor;
		stencilAttachment?: AttachmentDescriptor;
	}

	/**
	 * Makes a [[FrameBuffer]] render resource using a descriptor.
	 * @param desc A [[FrameBufferDescriptor]] describing the [[FrameBuffer]] resource to make.
	 */
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

	/**
	 * This structure facilitates easy creation of all required
	 * textures for a FrameBuffer in case they need to be allocated anyway.
	 * The implementation is free to allocate the textures as fit for the
	 * platform (2D array, multiple 2D textures, etc.) so no assumptions should
	 * be made about the type or organization of the textures.
	 */
	export interface FrameBufferAllocationDescriptor {
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
		colours: image.PixelFormat[];

		/**
		 * Optional depth attachment [[PixelFormat]], None means no attachment.
		 * The implementation may create a combined depth/stencil texture if it
		 * fits the profile of the provided texture formats, or you can make it
		 * explicit by setting both to the same DepthStencil PixelFormat.
		 */
		depth: image.PixelFormat.None | image.PixelFormat.Depth16I | image.PixelFormat.Depth24I | image.PixelFormat.Depth24_Stencil8;
		/**
		 * Optional stencil attachment [[PixelFormat]], None means no attachment.
		 * The implementation may create a combined depth/stencil texture if it
		 * fits the profile of the provided texture formats, or you can make it
		 * explicit by setting both to the same DepthStencil PixelFormat.
		 */
		stencil: image.PixelFormat.None | image.PixelFormat.Stencil8 | image.PixelFormat.Depth24_Stencil8;
	}

	/**
	 * Utility function to make an empty [[FrameBufferAllocationDescriptor]] object.
	 * @param width Required width of the frame buffer.
	 * @param height Required height of the frame buffer.
	 */
	export function makeFrameBufferAllocationDescriptor(width: number, height: number): FrameBufferAllocationDescriptor {
		return {
			width, height,
			colours: [],
			depth: image.PixelFormat.None,
			stencil: image.PixelFormat.None
		};
	}

	/**
	 * Make a full [[FrameBufferDescriptor]] by allocating the required attachments
	 * 
	 * @param desc Descriptor of required resources for the frame buffer.
	 */
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

	/**
	 * Using a [[FrameBufferAllocationDescriptor]], allocate all needed attachments and create a [[FrameBuffer]].
	 * @param fbad The descriptor of the [[FrameBuffer]] to allocate
	 * @returns The fully allocated [[FrameBuffer]]
	 */
	export function allocateFrameBuffer(fbad: FrameBufferAllocationDescriptor): FrameBuffer {
		const fbd = allocateTexturesForFrameBuffer(fbad);
		return makeFrameBuffer(fbd);
	}

} // ns sd.render
