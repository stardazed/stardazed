// asset/registry - library-wide registry of asset loaders
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

/*
	// --------------------------------------------------------------------
	// library-wide asset loader registry

	export type URLAssetLoader = (url: URL, mimeType: string) => Promise<AssetGroup>;
	export type BufferViewAssetLoader = (bufferView: ArrayBufferView, mimeType: string) => Promise<AssetGroup>;

	const urlAssetLoaders = new Map<string, URLAssetLoader>();
	const bufferAssetLoaders = new Map<string, BufferViewAssetLoader>();

	export function registerURLLoaderForMIMEType(mimeType: string, loader: URLAssetLoader) {
		const mime = mimeType.toLowerCase().trim();
		assert(! urlAssetLoaders.has(mime), `Tried to override file loader for MIME type '${mime}'`);
		urlAssetLoaders.set(mime, loader);
	}

	export function registerBufferViewLoaderForMIMEType(mimeType: string, loader: BufferViewAssetLoader) {
		const mime = mimeType.toLowerCase().trim();
		assert(! bufferAssetLoaders.has(mime), `Tried to override buffer loader for MIME type '${mime}'`);
		bufferAssetLoaders.set(mime, loader);
	}

	export function registerLoadersForMIMEType(mimeType: string, urlLoader: URLAssetLoader, bufferViewLoader: BufferViewAssetLoader) {
		registerURLLoaderForMIMEType(mimeType, urlLoader);
		registerBufferViewLoaderForMIMEType(mimeType, bufferViewLoader);
	}

	export function urlLoaderForMIMEType(mimeType: string) {
		const mime = mimeType.toLowerCase().trim();
		return urlAssetLoaders.get(mime);
	}

	export function bufferLoaderForMIMEType(mimeType: string) {
		const mime = mimeType.toLowerCase().trim();
		return bufferAssetLoaders.get(mime);
	}
*/
} // ns sd.asset
