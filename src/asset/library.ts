// asset/library - asset loading, caching, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { AssetGroup } from "asset/types";

// --------------------------------------------------------------------
// url / path helpers

export function fileExtensionOfURL(url: URL | string): string {
	const path = (url instanceof URL) ? url.href : url;
	const lastDot = path.lastIndexOf(".");
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


// --------------------------------------------------------------------


export class AssetLibrary {
	private roots_ = new Map<string, URL>();

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

	resolvePath(path: string): URL {
		// The first slash separates the root name from the file path.
		// The root name must be at least 1 character in length.
		// The file path can be empty.
		// The slash separating the root and path is mandatory.
		// Roots are not sandboxes, you can use .., etc. to escape the root (FIXME?)

		const firstSlash = path.indexOf("/");
		assert(firstSlash > 0, "path must have a root name and separating slash");

		const rootName = path.substring(0, firstSlash);
		const rootURL = this.roots_.get(rootName);
		assert(rootURL, `root ${rootName} does not exist`);

		const resourcePath = path.substring(firstSlash + 1);
		return new URL(resourcePath, rootURL!.href);
	}


	load(_path: string) {
		/*
			- resolve path to url
			- if path is present in the cache, then serve resolved Promise to full assetgroup

			- use extension of path to determine mime-type
			- use mime-type to get a loader
			- create asset group
			- invoke loader, passing in asset group and library or some loading context

			- loader fetches file
			- any warnings or errors are logged in the loading context / library?
			- resources are added to the group, both individually and linked together where necessary
		*/
	}
}
