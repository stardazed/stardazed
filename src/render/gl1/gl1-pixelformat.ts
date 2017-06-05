// render/gl1/pixelformat - WebGL1 pixel format conversions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	import PixelFormat = image.PixelFormat;

	export function gl1ImageFormatForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		switch (format) {
			case PixelFormat.R8:
			case PixelFormat.R16F:
			case PixelFormat.R32F:
				return GLConst.LUMINANCE;

			case PixelFormat.RG8:
			case PixelFormat.RG16F:
			case PixelFormat.RG32F:
				return GLConst.LUMINANCE_ALPHA;

			case PixelFormat.RGB8:
				return GLConst.RGB;
			case PixelFormat.RGBA8:
				return GLConst.RGBA;

			// sRGB -- silently fall back to standard RGB if not available (availability in browsers is ~100%)
			case PixelFormat.SRGB8:
				return rd.extSRGB ? GLConst.SRGB_EXT : GLConst.RGB;
			case PixelFormat.SRGB8_Alpha8:
				return rd.extSRGB ? GLConst.SRGB_ALPHA_EXT : GLConst.RGBA;

			// Float
			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? GLConst.RGBA : GLConst.NONE;
			case PixelFormat.RGBA32F:
				return GLConst.RGBA;

			// Packed
			case PixelFormat.RGB_5_6_5:
				return GLConst.RGB;
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
				return GLConst.RGBA;

			// Depth / Stencil
			case PixelFormat.Depth16I:
			case PixelFormat.Depth24I:
				return GLConst.DEPTH_COMPONENT;

			case PixelFormat.Stencil8:
				return GLConst.STENCIL_INDEX;

			case PixelFormat.Depth24_Stencil8:
				return GLConst.DEPTH_STENCIL;

			// S3TC
			case PixelFormat.RGB_DXT1:
				return rd.extS3TC ? GLConst.COMPRESSED_RGB_S3TC_DXT1_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT1:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT1_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT3:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT3_EXT : GLConst.NONE;
			case PixelFormat.RGBA_DXT5:
				return rd.extS3TC ? GLConst.COMPRESSED_RGBA_S3TC_DXT5_EXT : GLConst.NONE;

			default:
				assert(false, "GL1: unhandled pixel format");
				return GLConst.NONE;
		}
	}


	export function gl1PixelDataTypeForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		if (image.pixelFormatIsCompressed(format)) {
			return GLConst.NONE;
		}

		switch (format) {
			case PixelFormat.R8:
			case PixelFormat.RG8:
			case PixelFormat.RGB8:
			case PixelFormat.RGBA8:
			case PixelFormat.Stencil8:
				return GLConst.UNSIGNED_BYTE;

			case PixelFormat.SRGB8:
			case PixelFormat.SRGB8_Alpha8:
				return GLConst.UNSIGNED_BYTE;

			case PixelFormat.RGB_5_6_5:
				return GLConst.UNSIGNED_SHORT_5_6_5;
			case PixelFormat.RGBA_4_4_4_4:
				return GLConst.UNSIGNED_SHORT_4_4_4_4;
			case PixelFormat.RGBA_5_5_5_1:
				return GLConst.UNSIGNED_SHORT_5_5_5_1;

			case PixelFormat.R16F:
			case PixelFormat.RG16F:
			case PixelFormat.RGB16F:
			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? GLConst.HALF_FLOAT_OES : GLConst.NONE;

			case PixelFormat.R32F:
			case PixelFormat.RG32F:
			case PixelFormat.RGB32F:
			case PixelFormat.RGBA32F:
				return GLConst.FLOAT;

			case PixelFormat.Depth16I:
				return GLConst.UNSIGNED_SHORT;
			case PixelFormat.Depth24I:
				return GLConst.UNSIGNED_INT;

			case PixelFormat.Depth24_Stencil8:
				return rd.extDepthTexture ? GLConst.UNSIGNED_INT_24_8_WEBGL : GLConst.NONE;

			default:
				assert(false, "GL1: unsupported pixel format");
				return GLConst.NONE;
		}
	}

} // ns sd.render.gl1
