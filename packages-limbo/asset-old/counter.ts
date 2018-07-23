// asset/counter - counting total and loaded assets
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface AssetCounter {
		assetStarted(): void;
		assetCompleted(): void;
	}

	/**
	 * Count total and completed assets.
	 */
	export const counter = (counter: AssetCounter): AssetProcessor => async (_asset: Asset, next: AssetNext) => {
		counter.assetStarted();
		await next();
		counter.assetCompleted();
	};

} // ns sd.asset
