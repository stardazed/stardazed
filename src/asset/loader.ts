// asset/loader - composable loader functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface Asset {
		mimeType?: string;
		uri?: string;
		blob?: Blob;
	}

	/**
	 * Load external resources from a configurable set of sources.
	 * @param root the loader to use to retrieve asset data
	 */
	export const loader = (root: load.Loader | load.LoaderInfo): AssetProcessor => {
		const rootLoader = load.makeLoader(root);

		return async (asset: Asset) => {
			if (asset.uri !== void 0 && asset.blob === void 0) {
				return rootLoader(asset.uri, asset.mimeType)
					.then(blob => {
						asset.blob = blob;
						// update asset's identification if empty
						if (blob.type.length && asset.mimeType === void 0) {
							setAssetMimeType(asset, blob.type);
						}
					});
			}
		};
	};


	export namespace load {
		/**
		 * A Loader is a function provided with a URI to load.
		 * The resulting data must always be provided as a typed Blob.
		 */
		export type Loader = (uri: string, mimeType?: string) => Promise<Blob>;

		/**
		 * A function that, when called with a set of configuration options,
		 * will return a {{Loader}} function.
		 */
		export type LoaderClass = (config: any) => Loader;

		const loaderClasses = new Map<string, LoaderClass>();

		/**
		 * @internal
		 */
		export function registerLoaderClass(type: string, loca: LoaderClass) {
			assert(! loaderClasses.has(type), `Tried to register duplicate LoaderClass of type "${type}"`);
			loaderClasses.set(type, loca);
		}

		/**
		 * A structure identifying a Loader optionally with configuration key-values.
		 */
		export interface LoaderInfo {
			type: string;
			[key: string]: any;
		}

		/**
		 * Resolve and instantiate an instance of a Loader using LoaderInfo or
		 * just resolve to a directly passed Loader for convenience.
		 * @param info A LoaderInfo or a Loader
		 */
		export function makeLoader(info: LoaderInfo | Loader) {
			if (typeof info === "function") {
				return info;
			}
			const loader = loaderClasses.get(info.type);
			if (! loader) {
				throw new Error(`There is no asset loader of type "${info.type}"`);
			}
			return loader(info);
		}

	} // ns loader

} // ns sd.asset
