// asset/parser - parsing final content based on kind, mimeType or data path extension
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />
/// <reference path="./identifier.ts" />

namespace sd.asset {

	/**
	 * Parse asset data and metadata.
	 */
	export const parser: AssetProcessor = async (asset: Asset) => {
		if (asset.item !== void 0) {
			return;
		}
		if (asset.kind !== void 0) {
			const kp = parse.parserForAssetKind(asset.kind);
			if (kp !== void 0) {
				await kp(asset, async () => {});
			}
			else {
				throw new Error(`No parser registered for asset kind "${asset.kind}"`);
			}
		}
		else {
			throw new Error("Empty asset kind, cannot parse.");
		}
	};

	export namespace parse {

		const parsersByKind: { [kind: string]: AssetProcessor | undefined; } = {};

		export function registerParser(kind: string, parser: AssetProcessor) {
			parsersByKind[kind] = parser;
		}

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
