/**
 * image/builtin - browser built-in images
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { PixelFormat } from "./pixelformat";
import { PixelDimensions, makePixelDimensions, PixelDataProvider, ImageFrame } from "./provider";

export class HTMLImageDataProvider implements PixelDataProvider {
	readonly dim: PixelDimensions;
	readonly mipMapCount = 1;

	constructor(private image_: HTMLImageElement) {
		this.dim = makePixelDimensions(image_.width, image_.height);
	}

	get pixelFormat() {
		// return (this.colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
		return PixelFormat.RGBA8;
	}

	imageFrameAtLevel(level: number): ImageFrame | undefined {
		if (level !== 0) {
			return undefined;
		}

		return {
			pixelFormat: this.pixelFormat,
			dim: { ...this.dim },
			data: this.image_
		};
	}
}
