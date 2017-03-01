// image/pixelformat - pixel formats and traits
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export const enum ColourSpace {
		sRGB,
		Linear
	}

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
		return	format == PixelFormat.Depth16I ||
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
} // ns sd.image
