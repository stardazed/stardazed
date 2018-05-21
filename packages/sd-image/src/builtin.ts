/**
 * image/builtin - browser built-in images
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { ColourSpace, PixelFormat } from "./pixelformat";
import { PixelDimensions, makePixelDimensions, PixelDataProvider, ImageBuffer } from "./provider";

export class HTMLImageDataProvider implements PixelDataProvider {
	colourSpace: ColourSpace;
	readonly dim: PixelDimensions;
	readonly mipMapCount = 1;

	constructor(private image_: HTMLImageElement) {
		this.colourSpace = ColourSpace.sRGB;
		this.dim = makePixelDimensions(image_.width, image_.height);
	}

	get pixelFormat() {
		return (this.colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
	}

	pixelBufferForLevel(level: number): ImageBuffer | undefined {
		if (level !== 0) {
			return undefined;
		}

		return {
			colourSpace: this.colourSpace,
			pixelFormat: this.pixelFormat,
			dim: { ...this.dim },
			data: this.image_
		};
	}
}
