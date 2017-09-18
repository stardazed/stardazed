// asset/parsers - parsing final content based on kind, mimeType or data path extension
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.asset {

	const parsers: { [kind: string]: AssetProcessor; } = {};
	export const registerParser = (kind: string, parser: AssetProcessor) => {
		parsers[kind] = parser;
	};
	
	export const parserPlugin: LibraryPlugin = (lib: AssetLibrary) => {
		const assetParser: AssetProcessor = (asset: Asset) =>
			new Promise<Asset>((resolve, reject) => {
				if (asset.item !== void 0) {
					return resolve(asset);
				}
				if (asset.kind !== void 0) {
					const parser = parsers[asset.kind];
					if (parser !== void 0) {
						return resolve(parser(asset));
					}
					return reject(`No parser registered for asset kind "${asset.kind}"`);
				}
				return reject("Asset does not have a kind property, cannot parse.");
			});

		// place next processor at end of chain
		lib.process = (asset: Asset) => lib.process(asset).then(assetParser);
	};

	export namespace parser {

		const extensionMimeTypeMap = new Map<string, string>();

		export function registerFileExtension(extension: string, mimeType: string) {
			const ext = extension.toLowerCase();
			const mime = mimeType.toLowerCase();
			assert(ext.length > 0, "registerFileExtension: empty file extension provided");
			assert(mime.length > 0, "registerFileExtension: empty mime-type provided");
			extensionMimeTypeMap.set(ext, mime);
		}

		export function mimeTypeForFileExtension(extension: string): string | undefined {
			const ext = extension.toLowerCase().trim();
			return extensionMimeTypeMap.get(ext);
		}

		export function mimeTypeForURL(url: URL | string): string | undefined {
			const extension = io.fileExtensionOfURL(url);
			return mimeTypeForFileExtension(extension);
		}

		const mimeTypeAssetKindMap = new Map<string, string>();

		export const mapMimeTypeToAssetKind = (mimeType: string, assetKind: string) => {
			const mime = mimeType.toLowerCase();
			const kind = assetKind.toLowerCase();
			assert(mime.length > 0, "mapMimeTypeToAssetKind: empty mime-type provided");
			assert(kind.length > 0, "mapMimeTypeToAssetKind: empty asset kind provided");
			mimeTypeAssetKindMap.set(mime, kind);
		};

		export const assetKindForMimeType = (mimeType: string) =>
			mimeTypeAssetKindMap.get(mimeType.toLowerCase());

		/**
		 * Helper that returns the external data of an asset as an ArrayBuffer.
		 */
		export const getArrayBuffer = (a: Asset) =>
			a.dataBlob ? io.BlobReader.readAsArrayBuffer(a.dataBlob) : Promise.reject("getArrayBuffer: no blobData in RawAsset");

		/**
		 * Helper that returns the external data of an asset as a string.
		 */
		export const getText = (a: Asset) =>
			a.dataBlob ? io.BlobReader.readAsText(a.dataBlob) : Promise.reject("getText: no blobData in RawAsset");

		/**
		 * Helper that returns the external data of an asset as a JSON object.
		 */
		export const getJSON = (a: Asset) =>
			getText(a).then(
				text => JSON.parse(text)
			);

	} // ns parser

} // ns sd.asset
