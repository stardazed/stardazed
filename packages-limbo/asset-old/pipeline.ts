// asset/pipeline - extensible asset processing chain
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	/**
	 * The base Asset interface. This is extended by other processing steps
	 * to allow for more features in asset generation.
	 */
	export interface Asset<AssetItem = any, Metadata extends object = any> {
		/**
		 * A string indicating the type of the asset.
		 * Should be a single, lowercase word, e.g.: mesh, model, texture
		 */
		kind?: string;
		/**
		 * A unique ID for this asset. [EXACT USAGE STILL UNDER EVALUATION]
		 */
		id?: string;
		/**
		 * A non-unique label for this asset.
		 */
		name?: string;
		/**
		 * Optional set of key-value pairs that are used by any of the
		 * processing steps to correctly create the asset item.
		 */
		metadata?: Partial<Metadata>;
		/**
		 * The generated or fully processed asset data.
		 */
		item?: AssetItem;
	}
	
	export type AssetNext = () => Promise<void>;
	export type AssetProcessor = (asset: Asset, next: AssetNext) => Promise<void>;
	export type AssetPipeline = (asset: Asset) => Promise<Asset>;

	/**
	 * Returns a function that asynchronously passes a given Asset
	 * through a series of processing steps, each modifying the asset
	 * in place.
	 * @param pa An array of asset processors to compile
	 * @returns The compiled asset pipeline function
	 */
	export const makePipeline = (pa: AssetProcessor[]): AssetPipeline => async (asset: Asset) => {
		const paCount = pa.length;
		let index = 0;

		/**
		 * The way this works is by having process call itself recursively,
		 * keeping track of which AssetProcessor to apply via the index
		 * closure variable. Makes generous use of await to avoid a tangled
		 * web of functions in functions and state management.
		 */
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
