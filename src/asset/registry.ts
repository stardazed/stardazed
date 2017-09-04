// asset/registry - library-wide registry of asset parsers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />

namespace sd.asset {

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


	// --------------------------------------------------------------------
	// library-wide parser registry

	export type AssetParser<Resource, Options extends object, ExtOptions extends Options = Options> = (blob: Blob, path: string, options: ExtOptions) => Promise<Resource>;
	type AssetParserMap<P, O extends object> = Map<string, AssetParser<P, O>>;

	const allMimeTypes = new Set<string>();

	/**
	 * Associate an asset parser with one or more mime-types
	 * @param parser Parser to use
	 * @param mimeTypes List of mime-types
	 */
	function registerParserForMimeTypes<P, O extends object>(parser: AssetParser<P, O>, map: AssetParserMap<P, O>, mimeTypes: string[]) {
		for (const mimeType of mimeTypes) {
			const normalized = mimeType.toLowerCase();
			assert(! allMimeTypes.has(normalized), `Trying to register more than 1 parser for mime-type: ${normalized}`);
			allMimeTypes.add(normalized);
			map.set(normalized, parser);
		}
	}


	// --------------------------------------------------------------------
	// generic assets

	/**
	 * A parser that just returns the contents of an asset as an ArrayBuffer.
	 * @internal
	 */
	const GenericBinaryAssetParser = (blob: Blob, _path: string, _options: {}) =>
		io.BlobReader.readAsArrayBuffer(blob);

	/**
	 * Mark a list of mime-types as generic binary data.
	 * @param mimeTypes List of mime-types to mark as generic binary
	 */
	export function useGenericBinaryAssetParserForMimeTypes(mimeTypes: string[]) {
		registerParserForMimeTypes(GenericBinaryAssetParser, mimeTypes);
	}

	/**
	 * A parser that just returns the contents of an asset as a a string.
	 * @internal
	 */
	const GenericTextAssetParser = (blob: Blob, _path: string, _options: {}) =>
		io.BlobReader.readAsText(blob);

	/**
	 * Mark a list of mime-types as generic text data.
	 * @param mimeTypes List of mime-types to mark as generic text
	 */
	export function useGenericTextAssetParserForMimeTypes(mimeTypes: string[]) {
		registerParserForMimeTypes(GenericTextAssetParser, mimeTypes);
	}

} // ns sd.asset
