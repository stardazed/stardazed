// asset/importer - import assets from other asset containers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./identifier.ts" />

namespace sd.asset {

	/**
	 * Import (external) asset resources.
	 */
	export const importerx: AssetProcessor = async (asset: Asset) => {
		if (asset.kind === "import") {
			if (!(asset.blob instanceof Blob)) {
				throw new Error("Importer: asset data was not loaded");
			}

			return importer.importAssets(asset)
				.then(dependencies => {
					// FIXME: this is just a quick hack, need a formal name/id gen system
					if (asset.name && propertyCount(dependencies) === 1) {
						container.mapObject(dependencies, (subAsset) => {
							if (subAsset) {
								subAsset.name = asset.name;
							}
							return subAsset;
						});
					}
					asset.dependencies = dependencies;
					asset.item = null;
				});
		}
	};

	/**
	 * Flatten an imported asset's dependencies into its containing asset's dependencies.
	 */
	export const importFlattener: AssetProcessor = async (asset: Asset) => {
		if (asset.dependencies) {
			let assetsToMerge: AssetDependencies = {};
			for (const depName in asset.dependencies) {
				if (asset.dependencies.hasOwnProperty(depName)) {
					const dependency = asset.dependencies[depName];
					if (dependency && dependency.kind === "import") {
						const importedAssets = dependency.dependencies;
						if (importedAssets) {
							// Re-key default exports to parent key.
							// This allows an asset to be keyed as the import asset's key.
							// This is useful for single-item imports such as sounds or images
							// that can be mapped to the keys that they were imported as.
							if (importedAssets[importer.DEFAULT_EXPORT]) {
								importedAssets[depName] = importedAssets[importer.DEFAULT_EXPORT];
								delete importedAssets[importer.DEFAULT_EXPORT];
							}

							assetsToMerge = {
								...assetsToMerge,
								...importedAssets
							};
							delete dependency.dependencies;
						}
						delete asset.dependencies[depName];
					}
				}
			}
			asset.dependencies = {
				...asset.dependencies,
				...assetsToMerge
			};
		}
	};


	export namespace importer {

		export const DEFAULT_EXPORT = Symbol("default_export");

		export type AssetImporter = <Metadata extends object>(data: Blob, uri: string, metadata: Partial<Metadata>) => Promise<AssetDependencies>;
		const importers = new Map<string, AssetImporter>();
		
		export function registerImporter(importer: AssetImporter, mimeType: string, extensions: string | string[]) {
			assert(! importers.has(mimeType), `Trying to register more than 1 importer for mime-type: ${mimeType}`);
			importers.set(mimeType, importer);

			if (! Array.isArray(extensions)) {
				extensions = [extensions];
			}
			for (const extension of extensions) {
				registerFileExtension(extension, mimeType);
			}
			mapMimeTypeToAssetKind(mimeType, "import");
		}
		
		export function importAssets(asset: Asset) {
			return new Promise<AssetDependencies>((resolve, reject) => {
				const data = asset.blob!;
				const mimeType = data.type;
				const dataImporter = importers.get(mimeType);
				if (! dataImporter) {
					return reject(`Importer: cannot load asset files of type: ${mimeType}`);
				}
				resolve(dataImporter(data, asset.uri || "", asset.metadata || {}));
			});
		}

		/**
		 * Helper that returns the contents of a Blob as an ArrayBuffer.
		 */
		export const getArrayBuffer = (blob: Blob) =>
			io.BlobReader.readAsArrayBuffer(blob);

	} // ns importer

} // ns sd.asset
