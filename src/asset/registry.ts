// asset/registry - library-wide registry of asset loaders
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { AssetGroup } from "asset/types";
import { fileExtensionOfURL } from "asset/util";

export { fileExtensionOfURL } from "asset/util";

// --------------------------------------------------------------------
// library-wide file extension to mime type registry

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
	const extension = fileExtensionOfURL(url);
	return mimeTypeForFileExtension(extension);
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

const urlAssetLoaders = new Map<string, URLAssetLoader>();
const bufferAssetLoaders = new Map<string, BufferAssetLoader>();

export function registerURLLoaderForMIMEType(mimeType: string, loader: URLAssetLoader) {
	const mime = mimeType.toLowerCase().trim();
	assert(! urlAssetLoaders.has(mime), `Tried to override file loader for MIME type '${mime}'`);
	urlAssetLoaders.set(mime, loader);
}

export function registerBufferLoaderForMIMEType(mimeType: string, loader: BufferAssetLoader) {
	const mime = mimeType.toLowerCase().trim();
	assert(! bufferAssetLoaders.has(mime), `Tried to override buffer loader for MIME type '${mime}'`);
	bufferAssetLoaders.set(mime, loader);
}

export function registerLoadersForMIMEType(mimeType: string, urlLoader: URLAssetLoader, bufferLoader: BufferAssetLoader) {
	registerURLLoaderForMIMEType(mimeType, urlLoader);
	registerBufferLoaderForMIMEType(mimeType, bufferLoader);
}

export function urlLoaderForMIMEType(mimeType: string) {
	const mime = mimeType.toLowerCase().trim();
	return urlAssetLoaders.get(mime);
}

export function bufferLoaderForMIMEType(mimeType: string) {
	const mime = mimeType.toLowerCase().trim();
	return bufferAssetLoaders.get(mime);
}
