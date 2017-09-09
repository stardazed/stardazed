// asset/parser/image - image asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parsers.ts" />

namespace sd.asset {

	export namespace parser {
		export interface ImageAssetOptions {
			colourSpace: image.ColourSpace;
		}

		export type ImageAssetParser = AssetParser<image.PixelDataProvider, Partial<ImageAssetOptions>>;
		const imageParsers = new Map<string, ImageAssetParser>();

		export function registerImageParser(imgParser: ImageAssetParser, mimeType: string) {
			assert(! imageParsers.has(mimeType), `Trying to register more than 1 image parser for mime-type: ${mimeType}`);
			imageParsers.set(mimeType, imgParser);
		}

		/**
		 * Create a PixelDataProvider for an asset blob
		 * @param resource The source data to be parsed
		 */
		export function parseImage(resource: RawAsset<ImageAssetOptions>) {
			return new Promise<image.PixelDataProvider>((resolve, reject) => {
				const mimeType = resource.blob.type;
				const imgParser = imageParsers.get(mimeType);
				if (! imgParser) {
					return reject(`Cannot load images of type: ${mimeType}`);
				}
				resolve(imgParser(resource));
			});
		}
	}

	export interface Library {
		loadImage(sa: SerializedAsset): Promise<image.PixelDataProvider>;
	}

	const ImageLoader = <T extends Constructor<LibraryBase>>(Lib: T) =>
		class extends Lib {
			loadImage(sa: SerializedAsset) {
				return this.loadData(sa).then(resource => parser.parseImage(resource));
			}
		};

	addLibraryExtension(ImageLoader);

} // ns sd.asset
