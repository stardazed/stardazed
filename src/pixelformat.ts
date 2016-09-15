// pixelformat - pixel formats and traits
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export const enum PixelFormat {
		None,
	
		// 8-bit component
		Alpha,
		RGB8,
		RGBA8,

		// 8-bit component sRGB
		SRGB8,
		SRGB8_Alpha8,

		// 16-bit component
		RGBA16F,

		// 32-bit component
		RGBA32F,

		// Packed 16-bits
		RGB_5_6_5,
		RGBA_4_4_4_4,
		RGBA_5_5_5_1,

		// Depth / Stencil
		Depth16I,
		Depth24I,

		Stencil8,

		Depth24_Stencil8,

		// S3TC (desktop only)
		RGB_DXT1   = 0x100, // compressed formats start at 0x100
		RGBA_DXT1,
		RGBA_DXT3,
		RGBA_DXT5,
	}


	export function pixelFormatIsCompressed(format: PixelFormat) {
		return format >= 0x100;
	}


	export function pixelFormatIsDepthFormat(format: PixelFormat) {
		return format == PixelFormat.Depth16I ||
			   format == PixelFormat.Depth24I;
		}


	export function pixelFormatIsStencilFormat(format: PixelFormat) {
		return format == PixelFormat.Stencil8;
	}


	export function pixelFormatIsDepthStencilFormat(format: PixelFormat) {
		return format == PixelFormat.Depth24_Stencil8;
	}


	export function pixelFormatBytesPerElement(format: PixelFormat) {
		// Element means a pixel for non-compressed formats
		// and a block for compressed formats
	
		switch (format) {
			case PixelFormat.Alpha:
			case PixelFormat.Stencil8:
				return 1;

			case PixelFormat.RGB_5_6_5:
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
			case PixelFormat.Depth16I:
				return 2;

			case PixelFormat.RGB8:
			case PixelFormat.SRGB8:
				return 3;

			case PixelFormat.RGBA8:
			case PixelFormat.SRGB8_Alpha8:
			case PixelFormat.Depth24I:
			case PixelFormat.Depth24_Stencil8:
				return 4;

			case PixelFormat.RGBA16F:
				return 8;

			case PixelFormat.RGBA32F:
				return 16;

			// -- compressed formats
			case PixelFormat.RGB_DXT1:
			case PixelFormat.RGBA_DXT1:
				return 8;

			case PixelFormat.RGBA_DXT3:
			case PixelFormat.RGBA_DXT5:
				return 16;

			default:
				assert(false, "unhandled pixel buffer format");
				return 0;
		}
	}


	export function glImageFormatForPixelFormat(rc: RenderContext, format: PixelFormat) {
		var gl = rc.gl;

		switch (format) {
			case PixelFormat.Alpha:
				return gl.ALPHA;

			case PixelFormat.RGB8:
				return gl.RGB;
			case PixelFormat.RGBA8:
				return gl.RGBA;

			// sRGB
			case PixelFormat.SRGB8:
				return rc.extSRGB ? rc.extSRGB.SRGB_EXT : gl.NONE;
			case PixelFormat.SRGB8_Alpha8:
				return rc.extSRGB ? rc.extSRGB.SRGB_ALPHA_EXT : gl.NONE;

			// Float
			case PixelFormat.RGBA16F:
				return rc.extTextureHalfFloat ? gl.RGBA : gl.NONE;
			case PixelFormat.RGBA32F:
				return gl.RGBA;

			// Packed
			case PixelFormat.RGB_5_6_5:
				return gl.RGB;
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
				return gl.RGBA;

			// Depth / Stencil
			case PixelFormat.Depth16I:
			case PixelFormat.Depth24I:
				return gl.DEPTH_COMPONENT;

			case PixelFormat.Stencil8:
				return gl.STENCIL_INDEX;

			case PixelFormat.Depth24_Stencil8:
				return gl.DEPTH_STENCIL;

			// S3TC
			case PixelFormat.RGB_DXT1:
				return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT1:
				return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT3:
				return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT5:
				return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;

			default:
				assert(false, "unhandled pixel format");
				return gl.NONE;
		}
	}


	export function glPixelDataTypeForPixelFormat(rc: RenderContext, format: PixelFormat) {
		var gl = rc.gl;

		if (pixelFormatIsCompressed(format))
			return gl.NONE;

		switch (format) {
			case PixelFormat.Alpha:
			case PixelFormat.RGB8:
			case PixelFormat.Stencil8:
			case PixelFormat.RGBA8:
				return gl.UNSIGNED_BYTE;

			case PixelFormat.SRGB8:
			case PixelFormat.SRGB8_Alpha8:
				return rc.extSRGB ? gl.UNSIGNED_BYTE : gl.NONE;

			case PixelFormat.RGB_5_6_5:
				return gl.UNSIGNED_SHORT_5_6_5;
			case PixelFormat.RGBA_4_4_4_4:
				return gl.UNSIGNED_SHORT_4_4_4_4;
			case PixelFormat.RGBA_5_5_5_1:
				return gl.UNSIGNED_SHORT_5_5_5_1;

			case PixelFormat.RGBA16F:
				return rc.extTextureHalfFloat ? rc.extTextureHalfFloat.HALF_FLOAT_OES : gl.NONE;

			case PixelFormat.RGBA32F:
				return gl.FLOAT;

			case PixelFormat.Depth16I:
				return gl.UNSIGNED_SHORT;
			case PixelFormat.Depth24I:
				return gl.UNSIGNED_INT;

			case PixelFormat.Depth24_Stencil8:
				return rc.extDepthTexture ? rc.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;

			default:
				assert(false, "unhandled pixel format");
				return gl.NONE;
		}
	}


	// In SD, PixelCoordinate and PixelDimensions are defined in PixelBuffer, not present yet in SDTX
	
	export interface PixelCoordinate {
		x: number;
		y: number;
	}


	export interface PixelDimensions {
		width: number;
		height: number;
	}


	export function makePixelCoordinate(x: number, y: number): PixelCoordinate {
		return { x: x, y: y };
	}


	export function makePixelDimensions(width: number, height: number): PixelDimensions {
		return { width: width, height: height };
	}

} // ns sd.render
