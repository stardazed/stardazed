// asset/loaders/fallback - loader with an optional fallback loader
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../loader.ts" />

namespace sd.asset.load {

	export interface FallbackLoaderConfig {
		loader?: LoaderInfo | Loader;
		fallback?: LoaderInfo | Loader;
	}

	/**
	 * Tries to load an asset with the main loader and, if that fails, will try it using
	 * the fallback loader, if provided.
	 * @param config A loader function and its optional fallback loader
	 * @internal
	 */
	export function FallbackLoader(config: FallbackLoaderConfig) {
		const loader = config.loader && makeLoader(config.loader);
		assert(loader, "FallbackLoader: a main loader must be provided");
		const fallback = config.fallback && makeLoader(config.fallback);

		return (uri: string, mimeType?: string) =>
			loader!(uri, mimeType).catch(
				err => {
					if (fallback) {
						return fallback(uri, mimeType);
					}
					throw err;
				}
			);
	}

	registerLoaderClass("fallback", FallbackLoader);

} // ns sd.asset.loader
