// asset/importer/image-builtin - Browser built-in image importer
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../importer.ts" />

namespace sd.asset.importer {

	export interface ImageAssetMetadata {
		colourSpace: string;
	}

	function importBuiltInImage(data: Blob, _uri: string, metadata: Partial<ImageAssetMetadata>) {
		const blobURL = URL.createObjectURL(data);

		return new Promise<image.PixelDataProvider>((resolve, reject) => {
			const builtin = new Image();
			builtin.onload = () => {
				const provider = new HTMLImageDataProvider(builtin);
				provider.colourSpace = parseColourSpace(metadata.colourSpace);
				resolve(provider);
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
			return {
				[DEFAULT_EXPORT]: {
					kind: "image",
					item: provider
				}
			};
		});
	}

	registerImporter(importBuiltInImage, "image/bmp", ["bm", "bmp"]);
	registerImporter(importBuiltInImage, "image/jpeg", ["jpg", "jpe", "jpeg"]);
	registerImporter(importBuiltInImage, "image/png", "png");


	function parseColourSpace(cs: string | undefined) {
		if (cs === "linear") {
			return image.ColourSpace.Linear;
		}
		if (cs === "srgb") {
			return image.ColourSpace.sRGB;
		}
		if (cs !== void 0) {
			console.warn(`Image importer: ignoring invalid colourSpace`, cs);
		}
		return image.ColourSpace.sRGB;
	}


	export class HTMLImageDataProvider implements image.PixelDataProvider {
		private colourSpace_: image.ColourSpace;
		private pixelFormat_: image.PixelFormat;
		readonly dim: image.PixelDimensions;
		readonly mipMapCount = 1;

		constructor(private image_: HTMLImageElement) {
			this.colourSpace = image.ColourSpace.sRGB;
			this.dim = image.makePixelDimensions(image_.width, image_.height);
		}

		get colourSpace() {
			return this.colourSpace_;
		}

		set colourSpace(ncs: image.ColourSpace) {
			if (this.colourSpace_ !== ncs) {
				this.colourSpace_ = ncs;
				this.pixelFormat_ = (ncs === image.ColourSpace.sRGB) ? image.PixelFormat.SRGB8_Alpha8 : image.PixelFormat.RGBA8;	
			}
		}

		get pixelFormat() {
			return this.pixelFormat_;
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

} // ns sd.asset.importer
