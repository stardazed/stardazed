/**
 * asset/asset - 
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export interface Asset<AssetItem = any> {
	/**
	 * A string indicating the type of the asset.
	 * Should be a single, lowercase word, e.g.: mesh, model, texture
	 */
	kind?: string;
	/**
	 * A descriptive label for this asset.
	 */
	name?: string;
	/**
	 * The generated or fully processed asset data.
	 */
	item?: AssetItem;
}
