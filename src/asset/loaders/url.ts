// asset/loaders/url - actual url loaders
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../loader.ts" />

namespace sd.asset.load {
	
	export interface URLLoaderConfig {
		rootURL?: string;
		disableCache?: boolean;
	}

	/**
	 * A loader that takes a root URL and will load assets relative to this
	 * root. This loader will generally be the final loader in a chain.
	 * @param config Configuration for the Loader to create
	 */
	export function URLLoader(config: URLLoaderConfig) {
		let rootURL: URL;
		try {
			rootURL = new URL(config.rootURL || "");
		}
		catch {
			throw new Error(`URLLoader: a valid, absolute rootURL must be provided.`);
		}
		if (config.disableCache !== true && config.disableCache !== false) {
			if (config.disableCache !== void 0) {
				console.warn(`URLLoader: disableCache must be a boolean property, got:`, config.disableCache);
			}
			config.disableCache = false;
		}

		return (uri: string, mimeType?: string) => {
			const fullURL = new URL(uri, rootURL.href);

			return io.loadFile<Blob>(
				fullURL, {
					mimeType,
					responseType: io.FileLoadType.Blob,
					tryBreakCache: config.disableCache
				}
			);
		};
	}

	registerLoaderClass("url", URLLoader);

	// --------------------------------------------------------------------

	export interface DocRelativeURLLoaderConfig {
		relPath?: string;
		disableCache?: boolean;
	}

	/**
	 * Meta-loader that creates an {{URLLoader}} with the root URL being a path relative to the
	 * current document's base URL.
	 * @param config Configuration taking mainly the site-relative path that will be the root URL
	 */
	export function DocRelativeURLLoader(config: DocRelativeURLLoaderConfig) {
		return URLLoader({
			rootURL: new URL(config.relPath || "", document.baseURI!).href,
			disableCache: config.disableCache
		});
	}

	registerLoaderClass("doc-relative-url", DocRelativeURLLoader);

} // ns sd.asset.loader
