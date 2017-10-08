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

namespace sd.asset.parse {

	export interface ImageAssetMetadata {
		colourSpace: string;
	}

	export type ImageDataParser = (data: Blob, colourSpace: image.ColourSpace) => Promise<image.PixelDataProvider>;
	const imageParsers = new Map<string, ImageDataParser>();

	export const registerImageParser = (imgParser: ImageDataParser, mimeType: string) => {
		assert(! imageParsers.has(mimeType), `Trying to register more than 1 image parser for mime-type: ${mimeType}`);
		imageParsers.set(mimeType, imgParser);
	};

	export const parseImage = async (asset: Asset<image.PixelDataProvider, ImageAssetMetadata>) => {
		const blob = asset.blob;
		const metadata = asset.metadata || {};

		if (! blob) {
			throw new Error("parseImage: No image data was loaded, cannot parse.");
		}
		const mimeType = blob.type;
		const imgParser = imageParsers.get(mimeType);
		if (! imgParser) {
			throw new Error(`Cannot load images of type: ${mimeType}`);
		}

		const colourSpace = parseColourSpace(metadata.colourSpace);

		await imgParser(blob, colourSpace).then(pdp => {
			asset.item = pdp;
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

} // ns sd.asset.parse
