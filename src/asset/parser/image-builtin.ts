// asset/parser/image-builtin - Browser built-in image parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset.parser {

	export class HTMLImageDataProvider implements image.PixelDataProvider {
		readonly colourSpace: image.ColourSpace;
		readonly pixelFormat: image.PixelFormat;
		readonly dim: image.PixelDimensions;
		readonly mipMapCount = 1;

		constructor(private image_: HTMLImageElement, colourSpace: image.ColourSpace) {
			this.colourSpace = colourSpace;
			this.pixelFormat = (colourSpace === image.ColourSpace.sRGB) ? image.PixelFormat.SRGB8_Alpha8 : image.PixelFormat.RGBA8;
			this.dim = image.makePixelDimensions(image_.width, image_.height);
		}

		pixelBufferForLevel(level: number): image.PixelBuffer | undefined {
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

} // ns sd.asset.parser
