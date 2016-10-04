// asset.ts - asset loading, caching, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="core.ts" />

namespace sd.asset {

	// --------------------------------------------------------------------
	// url / path helpers

	export function fileExtensionOfURL(url: URL | string): string {
		const path = (url instanceof URL) ? url.href : url;
		var lastDot = path.lastIndexOf(".");
		if (lastDot > -1) {
			return path.substr(lastDot + 1).toLowerCase();
		}
		return "";
	}

	export function mimeTypeOfURL(url: URL | string): string | undefined {
		const extension = fileExtensionOfURL(url);
		return mimeTypeForFileExtension(extension);
	}


	// --------------------------------------------------------------------
	// app-wide file extension to mime type registry

	const extensionMimeTypeMap_s = new Map<string, string>();

	export function registerFileExtension(extension: string, mimeType: string) {
		const ext = extension.toLowerCase().trim();
		const mime = mimeType.toLowerCase().trim();
		assert(ext.length > 0, "empty file extension provided");
		assert(mime.length > 0, "empty mime-type provided");
		extensionMimeTypeMap_s.set(ext, mime);
	}

	export function mimeTypeForFileExtension(extension: string): string | undefined {
		const ext = extension.toLowerCase().trim();
		return extensionMimeTypeMap_s.get(ext);
	}

	// registerFileExtension("wav", "audio/wav");
	// registerFileExtension("mp3", "audio/mpeg");
	// registerFileExtension("m4a", "audio/mp4");

	// registerFileExtension("mpg", "video/mpeg");
	// registerFileExtension("mpeg", "video/mpeg");
	// registerFileExtension("m4v", "video/mp4");
	// registerFileExtension("webm", "video/webm");


	// --------------------------------------------------------------------
	// app-wide asset loader registry

	export type URLAssetLoader = (url: URL, mimeType: string) => Promise<AssetGroup>;
	export type BufferAssetLoader = (buffer: ArrayBuffer, mimeType: string) => Promise<AssetGroup>;

	const urlAssetLoaders_s = new Map<string, URLAssetLoader>();
	const bufferAssetLoaders_s = new Map<string, BufferAssetLoader>();

	export function registerURLLoaderForMIMEType(mimeType: string, loader: URLAssetLoader) {
		const mime = mimeType.toLowerCase().trim();
		assert(! urlAssetLoaders_s.has(mime), `Tried to override file loader for MIME type '${mime}'`)
		urlAssetLoaders_s.set(mime, loader);
	}

	export function registerBufferLoaderForMIMEType(mimeType: string, loader: BufferAssetLoader) {
		const mime = mimeType.toLowerCase().trim();
		assert(! bufferAssetLoaders_s.has(mime), `Tried to override buffer loader for MIME type '${mime}'`)
		bufferAssetLoaders_s.set(mime, loader);
	}

	export function registerLoadersForMIMEType(mimeType: string, urlLoader: URLAssetLoader, bufferLoader: BufferAssetLoader) {
		registerURLLoaderForMIMEType(mimeType, urlLoader);
		registerBufferLoaderForMIMEType(mimeType, bufferLoader);
	}

	export function urlLoaderForMIMEType(mimeType: string) {
		const mime = mimeType.toLowerCase().trim();
		return urlAssetLoaders_s.get(mime);
	}

	export function bufferLoaderForMIMEType(mimeType: string) {
		const mime = mimeType.toLowerCase().trim();
		return bufferAssetLoaders_s.get(mime);
	}


	// --------------------------------------------------------------------


	export class AssetManager {
		private roots_ = new Map<string, URL>();

		constructor() {
		}

		addRoot(name: string, baseURL: URL) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, baseURL);
		}

		addLocalRoot(name: string, relativePath: string) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, new URL(relativePath, location.href));
		}

		deleteRoot(name: string) {
			assert(this.roots_.has(name), `No asset root named '${name}' exists.`);
			this.roots_.delete(name);
		}
	}

} // ns sd.asset
