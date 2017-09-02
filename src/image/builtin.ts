// image/builtin - Browser built-in image provider
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export class HTMLImageDataProvider implements PixelDataProvider {
		readonly colourSpace: image.ColourSpace;
		readonly pixelFormat: image.PixelFormat;
		readonly dim: PixelDimensions;
		readonly mipMapCount = 1;

		constructor(private image_: HTMLImageElement, colourSpace: ColourSpace) {
			this.colourSpace = colourSpace;
			this.pixelFormat = (colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
			this.dim = makePixelDimensions(image_.width, image_.height);
		}

		pixelBufferForLevel(level: number): PixelBuffer | undefined {
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

} // ns sd.image
