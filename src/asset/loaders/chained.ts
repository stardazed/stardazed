// asset/loaders/chained - array of fallback loaders
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../loader.ts" />

namespace sd.asset.loader {

	/**
	 * The list of loaders to try, in order, to load an asset's data.
	 */
	export interface ChainedLoaderConfig {
		loaders?: (LoaderInfo | Loader)[];
	}

	/**
	 * Creates a chain of {{FallbackLoader}}s, with the first loader being the outermost and
	 * the last being the innermost. Loads start at the outer loader and go down sequentially.
	 * @param config An array of loaders that will be called last to first until one succeeds
	 */
	export const ChainedLoader = (config: ChainedLoaderConfig) => {
		const loaders = (Array.isArray(config.loaders) ? config.loaders : []).reverse();
		assert(loaders.length > 0, "ChainedLoader: an array of loaders must be provided (min. 1)");

		let prev: LoaderInfo | Loader | undefined, cur: LoaderInfo | Loader | undefined;
		return loaders.map(
			loader => {
				prev = cur;
				cur = FallbackLoader({ loader, fallback: prev });
				return cur;
			}
		).pop()!;
	};

	registerLoaderClass("chain", ChainedLoader);

} // ns sd.asset.loader
