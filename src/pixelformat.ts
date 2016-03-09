// pixelformat - pixel formats and traits
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.render {

	export const enum PixelFormat {
		None,
	
		// 8-bit component
		Alpha,
		RGB8,
		RGBA8,

		// 16-bit component
		RGB_5_6_5,
		RGBA_4_4_4_4,
		RGBA_5_5_5_1,
		RGBA16F,

		// 32-bit component
		RGBA32F,

		// S3TC (desktop only)
		DXT1,
		DXT3,
		DXT5,

		// Depth / Stencil
		Depth16I,
		Depth24I,

		Stencil8,

		Depth24_Stencil8
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


	export function pixelFormatIsCompressed(format: PixelFormat) {
		return format == PixelFormat.DXT1 ||
			   format == PixelFormat.DXT3 ||
			   format == PixelFormat.DXT5;
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
				return 3;

			case PixelFormat.RGBA8:
			case PixelFormat.Depth24I:
			case PixelFormat.Depth24_Stencil8:
				return 4;

			case PixelFormat.RGBA16F:
				return 8;

			case PixelFormat.RGBA32F:
				return 16;

			// -- compressed formats
			case PixelFormat.DXT1:
				return 8;

			case PixelFormat.DXT3:
			case PixelFormat.DXT5:
				return 16;

			default:
				assert(false, "unhandled pixel buffer format");
				return 0;
		}
	}


	export function makePixelCoordinate(x: number, y: number): PixelCoordinate {
		return { x: x, y: y };
	}


	export function makePixelDimensions(width: number, height: number) {
		return { width: width, height: height };
	}

} // ns sd.render
