// asset/parsers - parsing final content based on kind, mimeType or data path extension
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.asset {

	/**
	 * Extend an AssetLibrary with the capacity to parse asset data and metadata.
	 */
	export const parserPlugin: LibraryPlugin = (lib: AssetLibrary) => {
		const assetParser: AssetProcessor = (asset: Asset) =>
			new Promise<Asset>((resolve, reject) => {
				if (asset.item !== void 0) {
					return resolve(asset);
				}
				if (asset.kind !== void 0) {
					const kp = parser.parserForAssetKind(asset.kind);
					if (kp !== void 0) {
						return resolve(kp(asset));
					}
					return reject(`No parser registered for asset kind "${asset.kind}"`);
				}
				return reject("Empty asset kind, cannot parse.");
			});

		// place next processor at end of chain
		const process = lib.process;
		lib.process = (asset: Asset) => process(asset).then(assetParser);
	};

	export namespace parser {

		const parsersByKind: { [kind: string]: AssetProcessor | undefined; } = {};

		export const registerParser = (kind: string, parser: AssetProcessor) => {
			parsersByKind[kind] = parser;
		};

		export const parserForAssetKind = (kind: string) =>
			parsersByKind[kind];
		
		/**
		 * Helper that returns the external data of an asset as an ArrayBuffer.
		 */
		export const getArrayBuffer = (asset: Asset) =>
			asset.blob ? io.BlobReader.readAsArrayBuffer(asset.blob) : Promise.reject("getArrayBuffer: no blob present in Asset");

		/**
		 * Helper that returns the external data of an asset as a string.
		 */
		export const getText = (asset: Asset) =>
			asset.blob ? io.BlobReader.readAsText(asset.blob) : Promise.reject("getText: no blob present in Asset");

		/**
		 * Helper that returns the external data of an asset as a JSON object.
		 */
		export const getJSON = (asset: Asset) =>
			getText(asset).then(
				text => JSON.parse(text)
			);

	} // ns parser

} // ns sd.asset
