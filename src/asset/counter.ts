// asset/counter - counting total and loaded assets
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface AssetCounter {
		assetStarted(): void;
		assetCompleted(): void;
	}

	/**
	 * Extend an AssetPipeline with the capacity to count total assets
	 */
	export const totalCounterStage = (counter: AssetCounter) => (pipeline: AssetPipeline) => {
		const loadingCounterProcessor: AssetProcessor = (asset: Asset) => {
			counter.assetStarted();
			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(loadingCounterProcessor);
	};

	/**
	 * Extend an AssetPipeline with the capacity to count completed assets
	 */
	export const loadedCounterStage = (counter: AssetCounter) => (pipeline: AssetPipeline) => {
		const completedCounterProcessor: AssetProcessor = (asset: Asset) => {
			counter.assetCompleted();
			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(completedCounterProcessor);
	};

} // ns sd.asset
