// texture - texture objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="texture-desc.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	function glImageFormatForPixelFormat(rc: RenderContext, format: PixelFormat) {
		var gl = rc.gl;

		switch (format) {
			case PixelFormat.Alpha: return gl.ALPHA;

			case PixelFormat.RGB8: return gl.RGB;
			case PixelFormat.RGBA8: return gl.RGBA;

			case PixelFormat.RGB_5_6_5:
				return gl.RGB;
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
				return gl.RGBA;

			case PixelFormat.RGB32F: return gl.RGB;
			case PixelFormat.RGBA32F: return gl.RGBA;

			case PixelFormat.DXT1: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
			case PixelFormat.DXT3: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
			case PixelFormat.DXT5: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;

			case PixelFormat.Depth16I:
			case PixelFormat.Depth32I:
			case PixelFormat.Depth32F:
				return gl.DEPTH_COMPONENT;

			case PixelFormat.Stencil8:
				return gl.STENCIL_INDEX;

			case PixelFormat.Depth24_Stencil8:
				return gl.DEPTH_STENCIL;

			default:
				assert(!"unhandled pixel format");
				return gl.NONE;
		}
	}


	function glPixelDataTypeForPixelFormat(rc: RenderContext, format: PixelFormat) {
		assert(!pixelFormatIsCompressed(format));
		var gl = rc.gl;

		switch (format) {
			case PixelFormat.Alpha:
			case PixelFormat.RGB8:
			case PixelFormat.Stencil8:
			case PixelFormat.RGBA8:
				return gl.UNSIGNED_BYTE;

			case PixelFormat.RGB_5_6_5:
				return gl.UNSIGNED_SHORT_5_6_5;
			case PixelFormat.RGBA_4_4_4_4:
				return gl.UNSIGNED_SHORT_4_4_4_4;
			case PixelFormat.RGBA_5_5_5_1:
				return gl.UNSIGNED_SHORT_5_5_5_1;

			case PixelFormat.RGB32F:
			case PixelFormat.RGBA32F:
			case PixelFormat.Depth32F:
				return gl.FLOAT;

			case PixelFormat.Depth16I:
				return gl.UNSIGNED_SHORT;
			case PixelFormat.Depth32I:
				return gl.UNSIGNED_INT;

			case PixelFormat.Depth24_Stencil8:
				return rc.extDepthTexture ? rc.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;

			default:
				assert(!"unhandled pixel format");
				return gl.NONE;
		}
	}


	function glRenderBufferInternalFormatForPixelFormat(rc: RenderContext, format: PixelFormat) {
		var gl = rc.gl;

		switch (format) {
			case PixelFormat.RGB_5_6_5:
				return gl.RGB565;
			case PixelFormat.RGBA_4_4_4_4:
				return gl.RGBA4;
			case PixelFormat.RGBA_5_5_5_1:
				return gl.RGB5_A1;

			case PixelFormat.Depth16I:
				return gl.DEPTH_COMPONENT16;
			case PixelFormat.Stencil8:
				return gl.STENCIL_INDEX8;

			default:
				assert(!"Unsupported RenderBuffer pixel format");
				return gl.NONE;
		}
	}


	var textureLimits = {
		maxDimension: 0,
		maxDimensionCube: 0
	};

	function maxTextureDimension(rc: RenderContext, texClass: TextureClass) {
		if (textureLimits.maxDimension == 0) {
			textureLimits.maxDimension = rc.gl.getParameter(rc.gl.MAX_TEXTURE_SIZE);
			textureLimits.maxDimensionCube = rc.gl.getParameter(rc.gl.MAX_CUBE_MAP_TEXTURE_SIZE);
		}

		if (texClass == TextureClass.TexCube)
			return textureLimits.maxDimensionCube;
		return textureLimits.maxDimension;
	}


	export class Texture {
		private textureClass_: TextureClass;
		private dim_: PixelDimensions;
		private mipmaps_: number;
		private pixelFormat_: PixelFormat;
		private resource_: WebGLTexture | WebGLRenderbuffer;
		private glTarget_: number;

		constructor(private rc: RenderContext, desc: TextureDescriptor) {
			this.textureClass_ = desc.textureClass;
			this.dim_ = { width: desc.dim.width, height: desc.dim.height };
			this.mipmaps_ = desc.mipmaps;
			this.pixelFormat_ = desc.pixelFormat;

			assert(this.mipmaps_ > 0);
			assert(this.width() > 0);
			assert(this.height() > 0);

			assert(this.width() <= maxTextureDimension(rc, this.textureClass_));
			assert(this.height() <= maxTextureDimension(rc, this.textureClass_));

			// -- special case for RenderBuffer, all other paths gen a texture
			if (desc.textureClass == TextureClass.Tex2D) {
				if (desc.usageHint == TextureUsageHint.RenderTargetOnly) {
					// use a RenderBuffer
					this.glTarget_ = rc.gl.RENDERBUFFER;

					// RenderBuffers in WebGL are restricted to 16-bit colour, 16-bit depth or 8-bit stencil formats
					assert(this.mipmaps() == 1);
					var sizedFormat = glRenderBufferInternalFormatForPixelFormat(rc, this.pixelFormat_);

					var rb = rc.gl.createRenderbuffer();
					rc.gl.bindRenderbuffer(this.glTarget_, rb);
					rc.gl.renderbufferStorage(this.glTarget_, sizedFormat, this.width(), this.height());
					rc.gl.bindRenderbuffer(this.glTarget_, null);
					this.resource_ = rb;

					return;
				}
			}

			// -- nomal texture
			var glFormat = glImageFormatForPixelFormat(rc, this.pixelFormat_);
			var tex = rc.gl.createTexture();

			if (desc.textureClass == TextureClass.Tex2D) {
				// -- 2D textures
				this.glTarget_ = rc.gl.TEXTURE_2D;
				rc.gl.bindTexture(this.glTarget_, tex);

				let w = this.width();
				let h = this.height();

				for (var mip = 0; mip < this.mipmaps_; ++mip) {
//					rc.gl.texImage2D(this.glTarget_, mip, glFormat, w, h, 0, glFormat, type, null);
					w = Math.max(1, (w >> 1));
					h = Math.max(1, (h >> 1));
				}
			}
			else {
				// -- Cube-map textures
				this.glTarget_ = rc.gl.TEXTURE_CUBE_MAP;
				rc.gl.bindTexture(this.glTarget_, tex);

			}

			// -- apply sampling parameters

			rc.gl.bindTexture(this.glTarget_, null);
			this.resource_ = tex;
		}


		// -- observers
		dim() { return makePixelDimensions(this.dim_.width, this.dim_.height); }
		width() { return this.dim_.width; }
		height() { return this.dim_.height; }

		mipmaps() { return this.mipmaps_; }
		isMipMapped() { return this.mipmaps_ > 1; }

		pixelFormat() { return this.pixelFormat_; }
			
		textureClass() { return this.textureClass_; };
		clientWritable() {
		}
		renderTargetOnly() {
		}	
			
		// -- gl-specific observers
		resource() { return this.resource_; }
		target() { return this.glTarget_; }
	}

} // ns sd.render
