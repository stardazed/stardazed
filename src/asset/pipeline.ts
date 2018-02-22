// asset/pipeline - extensible asset processing chain
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset<AssetItem = any, Metadata extends object = any> {
		kind?: string;
		id?: string;
		name?: string;
		metadata?: Partial<Metadata>;
		item?: AssetItem;
	}
	
	export type AssetNext = () => Promise<void>;
	export type AssetProcessor = (asset: Asset, next: AssetNext) => Promise<void>;
	export type AssetPipeline = (asset: Asset) => Promise<Asset>;

	export const makePipeline = (pa: AssetProcessor[]): AssetPipeline => async (asset: Asset) => {
		const paCount = pa.length;
		let index = 0;
	
		const process = async (): Promise<void> => {
			while (index < paCount) {
				await pa[index](asset, async () => {
					index += 1;
					await process();
				});
				index += 1;
			}
		};
		await process();
	
		return asset;
	};
	
} // ns sd.asset
