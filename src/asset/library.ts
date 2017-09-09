// asset/library - it's-a back!
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface SerializedAsset {
		name: string;
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

		protected loadData<Metadata extends object>(sa: SerializedAsset): Promise<parser.RawAsset<Metadata>> {
			return this.loader_(sa.path, sa.mimeType).then(
				blob => ({
					blob,
					name: sa.name,
					kind: sa.kind,
					path: sa.path,
					metadata: { ...sa as any }
				})
			);
		}

		loadAny(sa: SerializedAsset) {
			const loaderParser = this.loadParseFuncs[sa.kind];
			if (loaderParser) {
				return loaderParser(sa);
			}
			return Promise.reject(new Error(`No registered parser for asset kind: ${sa.kind}, requested path: ${sa.path}`));
		}

		loadAssetFile(assets: SerializedAsset[]) {
			return Promise.all(assets.map(sa => this.loadAny(sa)));
		}
	}

} // ns sd.asset
