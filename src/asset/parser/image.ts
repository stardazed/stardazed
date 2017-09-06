// asset/parser/image - image asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parsers.ts" />

namespace sd.asset.parser {

	export interface ImageAssetOptions {
		colourSpace: image.ColourSpace;
	}

	export type ImageAssetParser = AssetParser<image.PixelDataProvider, Partial<ImageAssetOptions>>;
	const imageParsers = new Map<string, ImageAssetParser>();

	export function registerImageParser(parser: ImageAssetParser, mimeType: string) {
		assert(! imageParsers.has(mimeType), `Trying to register more than 1 image parser for mime-type: ${mimeType}`);
		imageParsers.set(mimeType, parser);
	}

	/**
	 * Create a PixelDataProvider for an asset blob
	 * @param blob Image data to parse
	 * @param path The asset path
	 * @param options Image-specific options
	 */
	export function parseImage(blob: Blob, path: string, options: Partial<ImageAssetOptions>) {
		return new Promise<image.PixelDataProvider>((resolve, reject) => {
			const mimeType = blob.type;
			const parser = imageParsers.get(mimeType);
			if (! parser) {
				return reject(`Cannot load images of type: ${mimeType}`);
			}
			resolve(parser(blob, path, options));
		});
	}

} // ns sd.asset.parser
