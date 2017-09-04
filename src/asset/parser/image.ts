// asset/parser/image - image asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset.parser {

	export interface ImageAssetOptions {
		colourSpace: image.ColourSpace;
	}

	/**
	 * Create a PixelDataProvider for an asset blob
	 * @implements AssetParser
	 * @param blob Image data to parse
	 * @param path The asset path
	 * @param options Image-specific options
	 */
	export function parseImage(blob: Blob, path: string, options: ImageAssetOptions) {
		const mimeType = blob.type;
		if (mimeType === "image/dds") {
			return io.BlobReader.readAsArrayBuffer(blob)
				.then(buf => {
					return new parser.DDSDataProvider(new Uint8ClampedArray(buf));
				});
		}
		if (mimeType === "image/tga") {
			return io.BlobReader.readAsArrayBuffer(blob)
				.then(buf => {
					return new parser.TGADataProvider(new Uint8ClampedArray(buf));
				});
		}

		return parseBuiltInImage(blob, path, options);
	}

	function parseBuiltInImage(blob: Blob, path: string, options: ImageAssetOptions) {
		const blobURL = URL.createObjectURL(blob);

		return new Promise<image.PixelDataProvider>((resolve, reject) => {
			const builtin = new Image();
			builtin.onload = () => {
				resolve(new parser.HTMLImageDataProvider(builtin, options.colourSpace));
			};
			builtin.onerror = () => {
				reject(`The image at '${path}' is not supported`);
			};

			// Always enable CORS as GL will not allow tainted data to be loaded so if it fails, we can't use the image
			// and enabling it for local resources does no harm.
			builtin.crossOrigin = "anonymous";
			builtin.src = blobURL;
		}).then(provider => {
			URL.revokeObjectURL(blobURL);				
			return provider;
		});
	}

} // ns sd.image
