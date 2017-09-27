// asset/parser/image - image asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export interface CacheAccess {
		(kind: "image", name: string): image.PixelDataProvider;
	}

} // ns sd.asset

namespace sd.asset.parser {

	export interface ImageAssetMetadata {
		colourSpace: string;
	}

	export type ImageDataParser = (data: Blob, colourSpace: image.ColourSpace) => Promise<image.PixelDataProvider>;
	const imageParsers = new Map<string, ImageDataParser>();

	export const registerImageParser = (imgParser: ImageDataParser, mimeType: string) => {
		assert(! imageParsers.has(mimeType), `Trying to register more than 1 image parser for mime-type: ${mimeType}`);
		imageParsers.set(mimeType, imgParser);
	};

	export const parseImage = (asset: Asset<image.PixelDataProvider, ImageAssetMetadata>) => {
		return new Promise<Asset>((resolve, reject) => {
			const blob = asset.blob;
			const metadata = asset.metadata || {};

			if (! blob) {
				return reject("parseImage: No image data was loaded, cannot parse.");
			}
			const mimeType = blob.type;
			const imgParser = imageParsers.get(mimeType);
			if (! imgParser) {
				return reject(`Cannot load images of type: ${mimeType}`);
			}

			const colourSpace = parseColourSpace(metadata.colourSpace);

			resolve(imgParser(blob, colourSpace).then(pdp => {
				asset.item = pdp;
				return asset;
			}));
		});
	};

	registerParser("image", parseImage);

	const parseColourSpace = (cs: string | undefined) => {
		if (cs === "linear") {
			return image.ColourSpace.Linear;
		}
		if (cs === "srgb") {
			return image.ColourSpace.sRGB;
		}
		if (cs !== void 0) {
			console.warn(`Image parser: ignoring invalid colourSpace`, cs);
		}
		return image.ColourSpace.sRGB;
	};

} // ns sd.asset.parser
