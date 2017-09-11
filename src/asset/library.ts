// asset/library - extensible asset loader and caching class
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface SerializedAsset {
		name: string;
		kind: string;
		path?: string;
		mimeType?: string;
		// metadata
		[key: string]: string | number | boolean | undefined;
	}

	export const isSerializedAsset = (sa: any): sa is SerializedAsset => {
		return typeof sa.name === "string" &&
			typeof sa.kind === "string" &&
			(typeof sa.path === "string" || typeof sa.path === "undefined");
	};

	export type LoaderParser = (sa: SerializedAsset) => Promise<any> | Iterator<SerializedAsset[] | any>;

	export class LibraryBase {
		private loader_: loader.Loader;
		private loaderParserFuncs_: { [kind: string]: LoaderParser | undefined; } = {};

		constructor(roots: loader.AssetRootSpec[]) {
			this.loader_ = loader.AssetLoader(roots);
		}

		protected registerLoaderParser(forKind: string, lp: LoaderParser) {
			this.loaderParserFuncs_[forKind] = lp.bind(this);
		}

		protected loadData<Metadata extends object>(sa: SerializedAsset): Promise<parser.RawAsset<Metadata>> {
			if (sa.mimeType === undefined && sa.path) {
				sa.mimeType = parser.mimeTypeForFileExtension(io.fileExtensionOfURL(sa.path));
			}

			const dataPromise = sa.path ? this.loader_(sa.path, sa.mimeType) : Promise.resolve(new Blob());

			return dataPromise.then(
				blob => ({
					blob,
					name: sa.name,
					kind: sa.kind,
					path: sa.path,
					metadata: { ...sa as any }
				})
			);
		}

		protected async processLoaderParser(res: Promise<any> | Iterator<any>) {
			if (res instanceof Promise) {
				return res;
			}
			else {
				let subAssets: any[] | undefined;
				do {
					const itr = res.next(subAssets);
					if (itr.done) {
						return itr.value;
					}
					else {
						const sas: SerializedAsset[] = itr.value;
						assert(Array.isArray(sas) && sas.every(sa => isSerializedAsset(sa)), "Library: Iterator AssetParser must yield only arrays of SerializedAssets");
						subAssets = await this.loadAssetFile(sas);
					}
				} while (true);
			}
		}

		loadAny(sa: SerializedAsset) {
			const loaderParser = this.loaderParserFuncs_[sa.kind];
			if (loaderParser) {
				return this.processLoaderParser(loaderParser(sa));
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
