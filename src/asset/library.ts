// asset/library - extensible asset loader and caching class
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./parsers.ts" />

namespace sd.asset {

	export interface SerializedAsset {
		name: string;
		kind: string;
		path?: string;
		mimeType?: string;
		// metadata
		[key: string]: any;
	}

	export const isSerializedAsset = (sa: any): sa is SerializedAsset => {
		return typeof sa.name === "string" &&
			typeof sa.kind === "string" &&
			(typeof sa.path === "string" || typeof sa.path === "undefined");
	};

	export type LoaderParser = (sa: SerializedAsset) => Promise<any> | Iterator<any>;

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

	export const registerAssetLoaderParser = <R, M extends object>(kind: string, assetParser: parser.AssetParser<R, M>) => {
		const cacheArrayName = `${kind}s_`;
		const loadFuncName = `load${capitalize(kind)}`;
		const lookupFuncName = `${kind}ByName`;

		const LoaderMixin = <T extends Constructor<LibraryBase>>(Lib: T) =>
			class extends Lib {
				constructor(...args: any[]) {
					super(...args);
					(this as any)[cacheArrayName] = new Map<string, R>();
					this.registerLoaderParser(kind, (this as any)[loadFuncName]);
				}

				[loadFuncName](sa: SerializedAsset) {
					return this.loadData(sa)
						.then(resource => this.processLoaderParser(assetParser(resource)))
						.then(tex => {
							(this as any)[cacheArrayName].set(sa.name, tex);
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
