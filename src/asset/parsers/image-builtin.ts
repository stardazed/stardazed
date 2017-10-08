// asset/parser/image-builtin - Browser built-in image parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./image.ts" />

namespace sd.asset.parse {

	const parseBuiltInImage = (data: Blob, colourSpace: image.ColourSpace) => {
		const blobURL = URL.createObjectURL(data);

		return new Promise<image.PixelDataProvider>((resolve, reject) => {
			const builtin = new Image();
			builtin.onload = () => {
				resolve(new HTMLImageDataProvider(builtin, colourSpace));
			};
			builtin.onerror = () => {
				reject(`The image at '${blobURL}' is not supported`);
			};

			// Always enable CORS as GL will not allow tainted data to be loaded so if it fails
			// we can't use the image anyway and enabling it for local resources does no harm.
			builtin.crossOrigin = "anonymous";
			builtin.src = blobURL;
		}).then(provider => {
			URL.revokeObjectURL(blobURL);				
			return provider;
		});
	};

	registerFileExtension("bm", "image/bmp");
	registerFileExtension("bmp", "image/bmp");
	registerFileExtension("jpg", "image/jpeg");
	registerFileExtension("jpeg", "image/jpeg");
	registerFileExtension("png", "image/png");

	mapMimeTypeToAssetKind("image/bmp", "image");
	mapMimeTypeToAssetKind("image/jpeg", "image");
	mapMimeTypeToAssetKind("image/png", "image");

	registerImageParser(parseBuiltInImage, "image/bmp");
	registerImageParser(parseBuiltInImage, "image/jpeg");
	registerImageParser(parseBuiltInImage, "image/png");
	
	
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

} // ns sd.asset.parse
