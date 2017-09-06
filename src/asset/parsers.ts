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


	// --------------------------------------------------------------------
	// library-wide generic parser registry
	

	const allParsers = new Map<string, AssetParser<any, any>>();

	/**
	 * Associates an asset parser with one or more mime-types.
	 * This is the most generic registry and has no types for the parsers' outputs.
	 * @param parser Parser to use
	 * @param mimeTypes Mime-type to associate
	 */
	export function registerParser(parser: AssetParser<any, any>, mimeType: string) {
		const mime = mimeType.toLowerCase();
		assert(! allParsers.has(mime), `Trying to register more than 1 parser for mime-type: ${mime}`);
		allParsers.set(mime, parser);
	}
	export type AssetParser<Resource, Options extends object> = (blob: Blob, path: string, options: Partial<Options>) => Promise<Resource>;


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
	 * @param mimeType List of mime-types to mark as generic binary
	 */
	export function useGenericBinaryAssetParserForMimeType(mimeType: string) {
		registerParser(GenericBinaryAssetParser, mimeType);
	}

	/**
	 * A parser that just returns the contents of an asset as a a string.
	 * @internal
	 */
	const GenericTextAssetParser = (blob: Blob, _path: string, _options: {}) =>
		io.BlobReader.readAsText(blob);

	/**
	 * Mark a mime-type as generic text data.
	 * @param mimeType Mime-type to mark as generic text
	 */
	export function useGenericTextAssetParserForMimeTypes(mimeType: string) {
		registerParser(GenericTextAssetParser, mimeType);
	}

} // ns sd.asset.parser
