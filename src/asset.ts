// asset.ts - asset loading, caching, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="core.ts" />

namespace sd.asset {

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
	// app-wide asset loader functions

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


	// standard image loaders
	export function loadBuiltInImageFromFile(url: URL) {
		return new Promise<HTMLImageElement>(function(resolve, reject) {
			const image = new Image();
			image.onload = () => { resolve(image); };
			image.onerror = () => { reject(url.href + " doesn't exist or is not supported"); };

			// when requesting cross-domain media, always try the CORS route
			// the GL methods will not allow tainted data to be loaded so if it fails, we can't use the image
			if (url.origin !== location.origin) {
				image.crossOrigin = "anonymous";
			}
			image.src = url.href;
		});
	}

	export function loadBuiltInImageFromBuffer(buffer: ArrayBuffer, mimeType: string) {
		return new Promise<HTMLImageElement>(function(resolve, reject) {
			const blob = new Blob([buffer], { type: mimeType });

			BlobReader.readAsDataURL(blob).then(
				dataURL => {
					const img = new Image();
					img.onload = () => { resolve(img); };
					img.onerror = () => { reject("Bad or unsupported image data."); };
					img.src = dataURL;
				},
				error => {
					reject(error);
				}
			);
		});
	}

	function builtInImageLoader(source: URL | ArrayBuffer, mimeType: string) {
		const imagePromise = (source instanceof URL) ? loadBuiltInImageFromFile(source) : loadBuiltInImageFromBuffer(source, mimeType);
		return imagePromise.then(_img => {
			return new AssetGroup();
		});
	}

	registerFileExtension("bm", "image/bmp");
	registerFileExtension("bmp", "image/bmp");
	registerFileExtension("png", "image/png");
	registerFileExtension("jpg", "image/jpeg");
	registerFileExtension("jpeg", "image/jpeg");
	registerFileExtension("gif", "image/gif");

	registerURLLoaderForMIMEType("image/bmp", builtInImageLoader);
	registerURLLoaderForMIMEType("image/png", builtInImageLoader);
	registerURLLoaderForMIMEType("image/jpeg", builtInImageLoader);
	registerURLLoaderForMIMEType("image/gif", builtInImageLoader);

	registerBufferLoaderForMIMEType("image/bmp", builtInImageLoader);
	registerBufferLoaderForMIMEType("image/png", builtInImageLoader);
	registerBufferLoaderForMIMEType("image/jpeg", builtInImageLoader);
	registerBufferLoaderForMIMEType("image/gif", builtInImageLoader);


	// --------------------------------------------------------------------

	export interface AssetRoot {
		baseURL: URL;
		corsMode: CORSMode;
	}

	export class AssetManager {
		private roots_ = new Map<string, AssetRoot>();

		constructor() {
		}

		addRoot(name: string, options: AssetRoot) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, options);
		}

		addLocalRoot(name: string, relativePath: string) {
			assert(! this.roots_.has(name), `An asset root named '${name}' already exists.`);
			this.roots_.set(name, {
				baseURL: new URL(relativePath, location.href),
				corsMode: CORSMode.Disabled
			});
		}

		deleteRoot(name: string) {
			assert(this.roots_.has(name), `No asset root named '${name}' exists.`);
			this.roots_.delete(name);
		}
	}

} // ns sd.asset
