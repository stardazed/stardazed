// asset/cache - in-memory caching of named assets
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Cache {
		[kind: string]: { [name: string]: any; };
	}

	/**
	 * Extend an AssetPipeline with the capacity to cache named assets in memory
	 */
	export const cacheFeederStage = (cache: Cache) => (pipeline: AssetPipeline) => {
		const feeder: AssetProcessor = (asset: Asset) => {
			if (asset.kind && asset.kind.length && asset.name && asset.name.length && asset.item) {
				if (cache[asset.kind] === void 0) {
					cache[asset.kind] = {};
				}
				cache[asset.kind][asset.name] = asset.item;
			}
			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(feeder);
	};

	export interface CacheAccess {
		(kind: string, name: string): any; // tslint:disable-line:callable-types
	}

	export const cacheAccessor = (cache: Cache): CacheAccess => (kind: string, name: string) => {
		if (cache[kind]) {
			return cache[kind][name];
		}
		return undefined;
	};

	export const compoundCacheAccessor = (accessors: CacheAccess[]): CacheAccess => (kind: string, name: string) => {
		for (const acc of accessors) {
			const item = acc(kind, name);
			if (item !== void 0) {
				return item;
			}
		}
		return undefined;
	};

} // ns sd.asset
