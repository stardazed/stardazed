// framebuffer-util - higher-level FBO APIs
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.render {

	// Util functions to create a Framebuffer object with standard configuration:
	// RGBA8/16F/32F colour attachments and default depth and stencil formats when requested.
	// Width/Height, Square and Screen dimension versions are available.
	
	export const enum FBOPixelComponent {
		Integer,
		HalfFloat,
		Float
	}


	export interface DefaultFBODesc {
		colourCount: number;
		pixelComponent?: FBOPixelComponent;
		useDepth?: boolean;
		useStencil?: boolean;
		depthReadback?: boolean;
	}


	export function makeDefaultFrameBuffer(rc: RenderContext, width: number, height: number, desc: DefaultFBODesc) {
		var fbad = render.makeFrameBufferAllocationDescriptor(desc.colourCount);
		fbad.width = width;
		fbad.height = height;

		var pixFmt: PixelFormat;
		if (desc.pixelComponent == FBOPixelComponent.HalfFloat) {
			pixFmt = PixelFormat.RGBA16F;
		}
		else if (desc.pixelComponent == FBOPixelComponent.Float) {
			pixFmt = PixelFormat.RGBA32F;
		}
		else {
			pixFmt = PixelFormat.RGB8;
		}

		container.fill(fbad.colourPixelFormats, pixFmt, desc.colourCount);
		if (desc.useDepth) {
			if (rc.extDepthTexture) {
				fbad.depthPixelFormat = render.PixelFormat.Depth24I;
				fbad.depthUsageHint = render.TextureUsageHint.Normal;
			}
			else {
				assert(!desc.depthReadback, "depth textures not supported on this device");
				fbad.depthPixelFormat = render.PixelFormat.Depth16I;
				fbad.depthUsageHint = render.TextureUsageHint.RenderTargetOnly;
			}
		}
		if (desc.useStencil) {
			fbad.stencilPixelFormat = render.PixelFormat.Stencil8;
			// always mirror the depth usage hint to allow for depth/stencil combinations using tex and rb
			fbad.stencilUsageHint = fbad.depthUsageHint;
		}

		var fbd = render.allocateTexturesForFrameBuffer(rc, fbad);

		return new render.FrameBuffer(rc, fbd);
	}


	export function makeSquareFrameBuffer(rc: RenderContext, dimension: number, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(rc, dimension, dimension, desc);
	}


	export function makeScreenFrameBuffer(rc: RenderContext, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(rc, 0, 0, desc);
	}


	export function canUseShadowMaps(rc: RenderContext) {
		return !!rc.extDepthTexture;
	}


	export function makeShadowMapFrameBuffer(rc: RenderContext, dimension: number) {
		return makeSquareFrameBuffer(rc, dimension, {
			colourCount: 0,
			useDepth: true,
			depthReadback: true
		});
	}

} // ns sd.render
