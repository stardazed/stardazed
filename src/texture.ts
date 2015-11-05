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
	

	class Texture {

	}

} // ns sd.render
