// asset/cache - in-memory caching of named assets
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Cache {
		[kind: string]: { [name: string]: any; };
	}

	/**
	 * Cache named assets in a memory store.
	 */
	export const cacheFeeder = (cache: Cache): AssetProcessor => async (asset: Asset) => {
		if (asset.kind && asset.kind.length && asset.name && asset.name.length && asset.item) {
			if (cache[asset.kind] === void 0) {
				cache[asset.kind] = {};
			}
			cache[asset.kind][asset.name] = asset.item;
		}
	};

	export interface CacheAccess {
		(kind: string, name: string): any;
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
