// asset/library - extensible asset processor
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
	
	export type AssetProcessor = (ra: Asset) => Promise<Asset>;
	export type LibraryPlugin = (lib: AssetLibrary) => void;
	
	export interface AssetLibrary {
		process: AssetProcessor;
	}

	export const makeLibrary = (plugins: LibraryPlugin[]) => {
		const library: AssetLibrary = {
			// initial processor simply resolves to the input
			process: (asset: Asset) => Promise.resolve(asset)
		};

		// allow plugins to extend the processor
		for (const plugin of plugins) {
			plugin(library);
		}
		return library;
	};

	// plugins = [generator, loader, importer, dependencies, parser]
	export const makeDefaultLibrary = (loader: loader.LoaderInfo | loader.Loader) =>
		makeLibrary([
			loaderPlugin(loader),
			parserPlugin
		]);
	
} // ns sd.asset
