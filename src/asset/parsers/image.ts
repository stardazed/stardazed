// asset/parsers/image - image asset metadata handling
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

	export async function parseImage(asset: Asset<image.PixelDataProvider, ImageAssetMetadata>) {
		const item = asset.item;
		const metadata = asset.metadata || {};

		if (! item) {
			throw new Error("Image parser: no image was loaded.");
		}

		const colourSpace = parseColourSpace(metadata.colourSpace);
		item.colourSpace = colourSpace;
	}

	registerParser("image", parseImage);

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

} // ns sd.asset.parse
