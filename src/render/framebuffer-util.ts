// render/framebuffer-util - higher-level framebuffer APIs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

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
			return image.PixelFormat.RGBA8;
		}
		if (fbpc === FBPixelComponent.Float) {
			return image.PixelFormat.RGBA32F;
		}
		if (fbpc === FBPixelComponent.HalfFloat) {
			return image.PixelFormat.RGBA16F;
		}

		assert(false, `Unknown framebuffer pixel component: ${fbpc}`);
		return image.PixelFormat.None;
	}


	export interface DefaultFBODesc {
		colourCount: number;
		pixelComponent?: FBPixelComponent;
		useDepth?: boolean;
		useStencil?: boolean;
	}


	export function makeDefaultFrameBuffer(width: number, height: number, desc: DefaultFBODesc) {
		const fbad = render.makeFrameBufferAllocationDescriptor(width, height);
		const pixFmt = pixelFormatForFBPixelComponent(desc.pixelComponent || FBPixelComponent.Integer);

		container.fill(fbad.colours, pixFmt, desc.colourCount);
		if (desc.useDepth) {
			fbad.depth = image.PixelFormat.Depth24I;
		}
		if (desc.useStencil) {
			fbad.stencil = image.PixelFormat.Stencil8;
		}

		return allocateFrameBuffer(fbad);
	}

	export function makeSquareFrameBuffer(dimension: number, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(dimension, dimension, desc);
	}

	export function makeScreenFrameBuffer(rd: RenderDevice, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(rd.drawableWidth, rd.drawableHeight, desc);
	}

} // ns sd.render
