// asset/library - extensible asset loader and caching class
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

	export class LibraryBase {
		private loader_: loader.Loader;
		private loaderParserFuncs_: { [kind: string]: ((sa: SerializedAsset) => Promise<any>) | undefined; } = {};

		constructor(roots: loader.AssetRootSpec[]) {
			this.loader_ = loader.AssetLoader(roots);
		}

		protected registerLoaderParser(forKind: string, lp: (sa: SerializedAsset) => Promise<any>) {
			this.loaderParserFuncs_[forKind] = lp.bind(this);
		}

		protected loadData<Metadata extends object>(sa: SerializedAsset): Promise<parser.RawAsset<Metadata>> {
			if (sa.mimeType === undefined) {
				sa.mimeType = parser.mimeTypeForFileExtension(io.fileExtensionOfURL(sa.path));
			}
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
			const loaderParser = this.loaderParserFuncs_[sa.kind];
			if (loaderParser) {
				return loaderParser(sa);
			}
			return Promise.reject(new Error(`No registered parser for asset kind: ${sa.kind}, requested path: ${sa.path}`));
		}

		loadAssetFile(assets: SerializedAsset[]) {
			return Promise.all(assets.map(sa => this.loadAny(sa)));
		}
	}

	export type LibraryExtension = (Base: Constructor<LibraryBase>) => Constructor<LibraryBase>;
	const mixins: LibraryExtension[] = [];

	export const addLibraryExtension = (mixin: LibraryExtension) => {
		mixins.push(mixin);
	};

	export interface Library {
		// generic load-parse methods
		loadAny(sa: SerializedAsset): Promise<any>;
		loadAssetFile(assets: SerializedAsset[]): Promise<any[]>;
	}

	export const makeLibrary = (roots: loader.AssetRootSpec[]): Library => {
		let Lib = LibraryBase;
		for (const m of mixins) {
			Lib = m(Lib);
		}
		return (new Lib(roots)) as any as Library;				
	};

} // ns sd.asset
