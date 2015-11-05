// rendercontext - gl interfaces
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pixelformat.ts"/>
/// <reference path="../defs/webgl-ext.d.ts"/>

namespace sd.render {

	class RenderContext {
		gl: WebGLRenderingContext;
		extDepthTexture: WebGLDepthTexture;
		extS3TC: WebGLCompressedTextureS3TC;
		extMinMax: EXTBlendMinMax;

		constructor(public canvas: HTMLCanvasElement) {
			try {
				this.gl = canvas.getContext("webgl");
				if (! this.gl)
					this.gl = canvas.getContext("experimental-webgl");
			} catch (e) {
				this.gl = null;
			}

			if (! this.gl) {
				assert(!"Could not initialise WebGL");
				return;
			}

			// enable extended depth textures
			var dte = this.gl.getExtension("WEBGL_depth_texture");
			dte = dte || this.gl.getExtension("WEBKIT_WEBGL_depth_texture");
			dte = dte || this.gl.getExtension("MOZ_WEBGL_depth_texture");
			this.extDepthTexture = dte;

			// enable S3TC (desktop only)
			var s3tc = this.gl.getExtension("WEBGL_compressed_texture_s3tc");
			s3tc = s3tc || this.gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
			s3tc = s3tc || this.gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
			this.extS3TC = s3tc;

			// enable MIN and MAX blend modes
			this.extMinMax = this.gl.getExtension("EXT_blend_minmax");

			// -- FIXME: Temporary setup
			this.gl.clearColor(0.0, 0.0, 0.3, 1.0);
			this.gl.enable(this.gl.DEPTH_TEST);
		}


		// -- The functions below may be moved to texture or pixelbuffer or eqv.

		glImageFormatForPixelFormat(format: PixelFormat) {
			var gl = this.gl;

			switch (format) {
				case PixelFormat.Alpha: return gl.ALPHA;

				case PixelFormat.RGB8: return gl.RGB;
				case PixelFormat.RGBA8: return gl.RGBA;

				case PixelFormat.RGB32F: return gl.RGB;
				case PixelFormat.RGBA32F: return gl.RGBA;

				case PixelFormat.DXT1: return this.extS3TC ? this.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
				case PixelFormat.DXT3: return this.extS3TC ? this.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
				case PixelFormat.DXT5: return this.extS3TC ? this.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;

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


		glPixelDataTypeForPixelFormat(format: PixelFormat) {
			assert(!pixelFormatIsCompressed(format));
			var gl = this.gl;

			switch (format) {
				case PixelFormat.Alpha:
				case PixelFormat.RGB8:
				case PixelFormat.Stencil8:
				case PixelFormat.RGBA8:
					return gl.UNSIGNED_BYTE;

				case PixelFormat.RGB32F:
				case PixelFormat.RGBA32F:
				case PixelFormat.Depth32F:
					return gl.FLOAT;

				case PixelFormat.Depth16I:
					return gl.UNSIGNED_SHORT;
				case PixelFormat.Depth32I:
					return gl.UNSIGNED_INT;

				case PixelFormat.Depth24_Stencil8:
					return this.extDepthTexture ? this.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;

				default:
					assert(!"unhandled pixel format");
					return gl.NONE;
			}
		}
	}

} // ns sd.render
