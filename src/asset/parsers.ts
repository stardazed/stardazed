// asset/parsers - parsing final content based on kind, mimeType or data path extension
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.asset.parser {

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
	 * Unprocessed data and metadata describing an asset. The data is
	 * always provided as a Blob, the metadata is a basic key-value set.
	 * Because assets are loaded from arbitrary files, the keys in the
	 * metadata are all made optional to force AssetParsers to provide
	 * default values. Each asset has a name and it must be unique
	 * application-wide. The kind field indicates the top-level type
	 * of the asset.
	 */
	export interface RawAsset<Metadata extends object = any> {
		kind: string;
		name?: string;
		dataPath?: string;
		dataBlob?: Blob;
		mimeType?: string;
		metadata: Partial<Metadata>;
	}

	export const isRawAsset = (sa: any): sa is RawAsset<any> =>
		typeof sa.kind === "string" &&
		(sa.name === void 0 || typeof sa.name === "string") &&
		(sa.dataPath === void 0 || typeof sa.dataPath === "string") &&
		(sa.dataBlob === void 0 || sa.dataBlob instanceof Blob) &&
		(sa.mimeType === void 0 || typeof sa.mimeType === "string");


	/**
	 * Helper that returns the external data of an asset as an ArrayBuffer.
	 */
	export const getArrayBuffer = (ra: RawAsset) =>
		ra.dataBlob ? io.BlobReader.readAsArrayBuffer(ra.dataBlob) : Promise.reject("getArrayBuffer: no blobData in RawAsset");

	/**
	 * Helper that returns the external data of an asset as a string.
	 */
	export const getText = (ra: RawAsset) =>
		ra.dataBlob ? io.BlobReader.readAsText(ra.dataBlob) : Promise.reject("getText: no blobData in RawAsset");

	/**
	 * Helper that returns the external data of an asset as a JSON object.
	 */
	export const getJSON = (ra: RawAsset) =>
		getText(ra).then(
			text => JSON.parse(text)
		);

	/**
	 * A function that takes a resource and returns the parsed contents.
	 * Any data type that has to be read through the asset system needs
	 * a corresponding AssetParser. The metadata varies per asset type.
	 */
	export type AssetParser<A, Metadata extends object> = (resource: RawAsset<Metadata>) => Promise<A | Iterator<A>> | Iterator<A>;

} // ns sd.asset.parser
