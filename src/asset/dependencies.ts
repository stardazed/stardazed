// asset/dependencies - asset dependency resolver
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {
	
	export interface Asset {
		dependencies?: Asset[];
	}

	/**
	 * Extend an AssetLibrary with the capacity to load an asset's dependencies.
	 */
	export const dependenciesPlugin = (lib: AssetLibrary) => {
		const dependenciesProcessor: AssetProcessor = (asset: Asset) => {
			if (Array.isArray(asset.dependencies)) {
				return Promise.all(asset.dependencies.map(dep => lib.process(dep)))
					.then(() => asset);
			}
			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = lib.process;
		lib.process = (asset: Asset) => process(asset).then(dependenciesProcessor);
	};

} // sd.asset
