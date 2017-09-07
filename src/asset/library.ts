// asset/library - it's-a back!
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface SerializedAsset {
		kind: string;
		path: string;
		mimeType?: string;
		// metadata
		[key: string]: string | number | boolean | undefined;
	}

	export class Library {
		private loader_: loader.Loader;
		protected loadParseFuncs: { [kind: string]: ((sa: SerializedAsset) => Promise<any>) | undefined; } = {};

		constructor(roots: loader.AssetRootSpec[]) {
			this.loader_ = loader.AssetLoader(roots);
		}

		protected loadData(sa: SerializedAsset) {
			return this.loader_(sa.path, sa.mimeType);
		}

		loadAny(sa: SerializedAsset) {
			const loadFunc = this.loadParseFuncs[sa.kind];
			if (loadFunc) {
				return loadFunc(sa);
			}
			return Promise.reject(new Error(`No registered parser for asset kind : ${sa.kind}, requested path: ${sa.path}`));
		}

		loadAssetFile(assets: SerializedAsset[]) {
			return Promise.all(assets.map(sa => this.loadAny(sa)));
		}
	}

} // ns sd.asset
