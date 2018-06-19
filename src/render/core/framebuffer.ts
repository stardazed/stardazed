// render/core/framebuffer - descriptors and enums related to FrameBuffer objects
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
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

} // ns sd.render
