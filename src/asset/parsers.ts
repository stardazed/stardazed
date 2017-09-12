// asset/parsers - library-wide registry of asset parsers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.asset.parser {

	// --------------------------------------------------------------------
	// library-wide file extension to mime-type registry

	const extensionMimeTypeMap = new Map<string, string>();

	export function registerFileExtension(extension: string, mimeType: string) {
		const ext = extension.toLowerCase().trim();
		const mime = mimeType.toLowerCase().trim();
		assert(ext.length > 0, "empty file extension provided");
		assert(mime.length > 0, "empty mime-type provided");
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

	/**
	 * Unprocessed data and metadata describing an asset. The data is
	 * always provided as a Blob, the metadata is a basic key-value set.
	 * Because assets are loaded from arbitrary files, the keys in the
	 * metadata are all made optional to force AssetParsers to provide
	 * default values. Each asset has a name and it must be unique
	 * application-wide. The kind field indicates the top-level type
	 * of the asset.
	 */
	export interface RawAsset<Metadata extends object> {
		blob: Blob;
		kind: string;
		name: string;
		path?: string;
		metadata: Partial<Metadata>;
	}

	/**
	 * A function that takes a resource and returns the parsed contents.
	 * Any data type that has to be read through the asset system needs
	 * a corresponding AssetParser. The metadata varies per asset type.
	 */
	export type AssetParser<Asset, Metadata extends object> = (resource: RawAsset<Metadata>) => Promise<Asset> | Iterator<Asset>;

} // ns sd.asset.parser
