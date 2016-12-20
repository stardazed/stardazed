// render/framebuffer-util - higher-level FBO APIs
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	// Util functions to create a Framebuffer object with standard configuration:
	// RGBA8/16F/32F colour attachments and default depth and stencil formats when requested.
	// Width/Height, Square and Screen dimension versions are available.

	export const enum FBOPixelComponent {
		Integer,
		HalfFloat,
		Float
	}


	export function pixelFormatForFBOPixelComponent(fbopc: FBOPixelComponent) {
		if (fbopc == FBOPixelComponent.Integer) {
			return PixelFormat.RGB8;
		}
		if (fbopc == FBOPixelComponent.Float) {
			return PixelFormat.RGBA32F;
		}
		if (fbopc == FBOPixelComponent.HalfFloat) {
			return PixelFormat.RGBA16F;
		}

		assert(false, `Unknown FBO pixel component: ${fbopc}`);
		return PixelFormat.None;
	}


	export interface DefaultFBODesc {
		colourCount: number;
		pixelComponent?: FBOPixelComponent;
		useDepth?: boolean;
		useStencil?: boolean;
		depthReadback?: boolean;
	}


	export function makeDefaultFrameBuffer(rc: RenderContext, width: number, height: number, desc: DefaultFBODesc) {
		const fbad = render.makeFrameBufferAllocationDescriptor(desc.colourCount);
		fbad.width = width;
		fbad.height = height;

		const pixFmt = pixelFormatForFBOPixelComponent(desc.pixelComponent || FBOPixelComponent.Integer);

		container.fill(fbad.colourPixelFormats, pixFmt, desc.colourCount);
		if (desc.useDepth) {
			if (rc.extDepthTexture) {
				fbad.depthPixelFormat = render.PixelFormat.Depth24I;
				fbad.depthUsageHint = render.TextureUsageHint.Normal;
			}
			else {
				assert(! desc.depthReadback, "depth textures not supported on this device");
				fbad.depthPixelFormat = render.PixelFormat.Depth16I;
				fbad.depthUsageHint = render.TextureUsageHint.RenderTargetOnly;
			}
		}
		if (desc.useStencil) {
			fbad.stencilPixelFormat = render.PixelFormat.Stencil8;
			// always mirror the depth usage hint to allow for depth/stencil combinations using tex and rb
			fbad.stencilUsageHint = fbad.depthUsageHint;
		}

		const fbd = render.allocateTexturesForFrameBuffer(rc, fbad);
		return new render.FrameBuffer(rc, fbd);
	}


	export function makeSquareFrameBuffer(rc: RenderContext, dimension: number, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(rc, dimension, dimension, desc);
	}


	export function makeScreenFrameBuffer(rc: RenderContext, desc: DefaultFBODesc) {
		return makeDefaultFrameBuffer(rc, 0, 0, desc);
	}


	export function canUseShadowMaps(rc: RenderContext) {
		return (rc.extTextureFloat && rc.extDerivatives);
	}


	export function makeShadowMapFrameBuffer(rc: RenderContext, dimension: number) {
		return makeSquareFrameBuffer(rc, dimension, {
			colourCount: 1,
			useDepth: true,
			depthReadback: false
		});
	}

} // ns sd.render
