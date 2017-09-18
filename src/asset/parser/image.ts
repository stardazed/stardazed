// asset/parser/image - image asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {

	export namespace parser {
		export interface ImageAssetMetadata {
			colourSpace: string;
		}

		export type ImageAssetParser = AssetParser<asset.Image, Partial<ImageAssetMetadata>>;
		const imageParsers = new Map<string, ImageAssetParser>();

		export function registerImageParser(imgParser: ImageAssetParser, mimeType: string) {
			assert(! imageParsers.has(mimeType), `Trying to register more than 1 image parser for mime-type: ${mimeType}`);
			imageParsers.set(mimeType, imgParser);
		}

		/**
		 * Create a PixelDataProvider for an asset blob
		 * @param resource The source data to be parsed
		 */
		export const parseImage: ImageAssetParser = (resource: RawAsset<ImageAssetMetadata>) => {
			return new Promise<asset.Image | Iterator<asset.Image>>((resolve, reject) => {
				const mimeType = resource.dataBlob!.type;
				const imgParser = imageParsers.get(mimeType);
				if (! imgParser) {
					return reject(`Cannot load images of type: ${mimeType}`);
				}
				resolve(imgParser(resource));
			});
		};
	}

	export interface Image extends Asset {
		provider: image.PixelDataProvider;
	}

	export interface Library {
		loadImage(ra: parser.RawAsset): Promise<asset.Image>;
		imageByName(name: string): asset.Image | undefined;
	}
	registerAssetLoaderParser("image", parser.parseImage);

} // ns sd.asset
