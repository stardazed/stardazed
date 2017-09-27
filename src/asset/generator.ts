// asset/identifier - complete missing asset identification based on minimal info
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset {
		generator?: string;
	}		
	
	/**
	 * Extend an AssetPipeline with the capacity to generate assets on the fly.
	 */
	export const generatorStage: AssetPipelineStage = (pipeline: AssetPipeline) => {
		const generatorProcessor: AssetProcessor = (asset: Asset) => {
			if (typeof asset.generator === "string") {
			}

			return Promise.resolve(asset);
		};

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(generatorProcessor);
	};

} // ns sd.asset
