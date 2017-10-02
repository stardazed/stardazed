// asset/pipeline - extensible asset processing chain
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset<AssetItem = any, Metadata extends object = any> {
		kind?: string;
		id?: string;
		name?: string;
		metadata?: Partial<Metadata>;
		item?: AssetItem;
	}
	
	export type AssetProcessor = (asset: Asset) => Promise<Asset>;
	export type AssetPipelineStage = (pipeline: AssetPipeline) => void;
	
	export interface AssetPipeline {
		process: AssetProcessor;
	}

	export const makePipeline = (stages: AssetPipelineStage[]) => {
		const pipeline: AssetPipeline = {
			// initial processor simply resolves to the input
			process: (asset: Asset) => Promise.resolve(asset)
		};

		// create a processing chain out of the provided stages
		for (const stage of stages) {
			stage(pipeline);
		}
		return pipeline;
	};

} // ns sd.asset
