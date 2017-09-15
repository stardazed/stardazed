// asset/library - extensible asset loader and caching class
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./parsers.ts" />

namespace sd.asset {

	export type LoaderParser = (sa: parser.RawAsset) => Promise<any> | Iterator<any>;

	export class LibraryBase {
		private loader_: loader.Loader;
		private loaderParserFuncs_: { [kind: string]: LoaderParser | undefined; } = {};

		constructor(roots: loader.AssetRootSpec[]) {
			this.loader_ = loader.AssetLoader(roots);
		}

		protected registerLoaderParser(forKind: string, lp: LoaderParser) {
			this.loaderParserFuncs_[forKind] = lp.bind(this);
		}

		protected loadData<Metadata extends object>(ra: parser.RawAsset<Metadata>): Promise<parser.RawAsset<Metadata>> {
			if (ra.dataPath !== void 0 && ra.dataBlob === void 0) {
				if (ra.mimeType === undefined) {
					ra.mimeType = parser.mimeTypeForFileExtension(io.fileExtensionOfURL(ra.dataPath));
				}
	
				return this.loader_(ra.dataPath, ra.mimeType).then(
					blob => {
						ra.dataBlob = blob;
						return ra;
					}
				);
			}
			else {
				return Promise.resolve(ra);
			}
		}

		protected async processLoaderParser(res: Promise<any> | Iterator<any>): Promise<any> {
			if (res instanceof Promise) {
				return res.then(internal => {
					if (isIterator(internal)) {
						return this.processLoaderParser(internal);
					}
					else {
						return internal;
					}
				});
			}
			else {
				let subAssets: any[] | any | undefined; // evals to just "any", but explicitly specified here for doc-purposes
				do {
					const itr = res.next(subAssets);
					if (itr.done) {
						return itr.value;
					}
					else {
						const ras: parser.RawAsset | parser.RawAsset[] = itr.value;
						if (Array.isArray(ras)) {
							assert(ras.every(sa => parser.isRawAsset(sa)), "Library: Iterator AssetParser must yield only (arrays of) RawAssets");
							subAssets = await this.loadAssetFile(ras);
						}
						else {
							assert(parser.isRawAsset(ras), "Library: Iterator AssetParser must yield only (arrays of) RawAssets");
							subAssets = await this.loadAny(ras);
						}
						
					}
				} while (true);
			}
		}

		loadAny(sa: parser.RawAsset) {
			const loaderParser = this.loaderParserFuncs_[sa.kind];
			if (loaderParser) {
				return this.processLoaderParser(loaderParser(sa));
			}
			return Promise.reject(new Error(`No registered parser for asset kind: ${sa.kind}, requested path: ${sa.dataPath}`));
		}

		loadAssetFile(assets: parser.RawAsset[]) {
			return Promise.all(assets.map(sa => this.loadAny(sa)));
		}
	}

	export type LibraryExtension = (Base: Constructor<LibraryBase>) => Constructor<LibraryBase>;
	const mixins: LibraryExtension[] = [];

	export const addLibraryExtension = (mixin: LibraryExtension) => {
		mixins.push(mixin);
	};

	export const registerAssetLoaderParser = <A, M extends object>(kind: string, assetParser: parser.AssetParser<A, M>) => {
		const cacheArrayName = `${kind}s_`;
		const loadFuncName = `load${capitalize(kind)}`;
		const lookupFuncName = `${kind}ByName`;

		const LoaderMixin = <T extends Constructor<LibraryBase>>(Lib: T) =>
			class extends Lib {
				constructor(...args: any[]) {
					super(...args);
					(this as any)[cacheArrayName] = new Map<string, A>();
					this.registerLoaderParser(kind, (this as any)[loadFuncName]);
				}

				[loadFuncName](ra: parser.RawAsset) {
					return this.loadData(ra)
						.then(resource => this.processLoaderParser(assetParser(resource)))
						.then(tex => {
							(this as any)[cacheArrayName].set(ra.name, tex);
							return tex;
						});
				}

				[lookupFuncName](name: string) {
					return (this as any)[cacheArrayName].get(name);
				}
			};

		addLibraryExtension(LoaderMixin);
	};

	export interface Library {
		// generic load-parse methods
		loadAny(sa: parser.RawAsset): Promise<any>;
		loadAssetFile(assets: parser.RawAsset[]): Promise<any[]>;
	}

	export const makeLibrary = (roots: loader.AssetRootSpec[]): Library => {
		let Lib = LibraryBase;
		for (const m of mixins) {
			Lib = m(Lib);
		}
		return (new Lib(roots)) as any as Library;				
	};

} // ns sd.asset
