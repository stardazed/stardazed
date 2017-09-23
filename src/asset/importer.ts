// asset/importer - import assets from other asset containers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./identifier.ts" />

namespace sd.asset {

	/**
	 * Extend an AssetPipeline with the capacity to import external asset (group) files.
	 */
	export const importerStage: AssetPipelineStage = (pipeline: AssetPipeline) => {
		const assetImporter: AssetProcessor = (asset: Asset) =>
			new Promise<Asset>((resolve, reject) => {
				if (asset.kind === "import") {
					if (typeof asset.uri !== "string") {
						return reject("Importer: import asset did not specify a uri");
					}
					if (!(asset.blob instanceof Blob)) {
						return reject("Importer: external asset data was not loaded");
					}

					importer.importAssets(asset.blob, asset.uri)
						.then(dependencies => {
							asset.dependencies = dependencies;
							resolve(asset);
						});
				}
				else {
					resolve(asset);
				}
			});

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(assetImporter);
	};

	/**
	 * Extend an AssetPipeline with the feature to flatten an imported asset's
	 * dependencies into its containing asset's dependencies.
	 */
	export const importFlatteningStage: AssetPipelineStage = (pipeline: AssetPipeline) => {
		const importFlattener: AssetProcessor = (asset: Asset) =>
			new Promise<Asset>(resolve => {
				if (asset.dependencies) {
					let assetsToMerge: AssetDependencies = {};
					for (const depName in asset.dependencies) {
						if (asset.dependencies.hasOwnProperty(depName)) {
							const dependency = asset.dependencies[depName];
							if (dependency && dependency.kind === "import") {
								const importedAssets = dependency.dependencies;
								if (importedAssets) {
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

				resolve(asset);
			});

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(importFlattener);
	};


	export namespace importer {

		export type AssetImporter = (data: Blob, uri: string) => Promise<AssetDependencies>;
		const importers = new Map<string, AssetImporter>();
		
		export const registerImporter = (importer: AssetImporter, extension: string, mimeType: string) => {
			assert(! importers.has(mimeType), `Trying to register more than 1 importer for mime-type: ${mimeType}`);
			importers.set(mimeType, importer);

			registerFileExtension(extension, mimeType);
			mapMimeTypeToAssetKind(mimeType, "import");
		};
		
		export const importAssets = (data: Blob, uri: string) =>
			new Promise<AssetDependencies>((resolve, reject) => {
				const mimeType = data.type;
				const dataImporter = importers.get(mimeType);
				if (! dataImporter) {
					return reject(`Importer: cannot load asset files of type: ${mimeType}`);
				}
				resolve(dataImporter(data, uri));
			});

	} // ns importer


	// ---- below: WIP, to be moved out

	export function makeTransform(): entity.Transform {
		return {
			position: [0, 0, 0],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		};
	}

	export interface Model {
		transform: entity.Transform;
		children: Model[];
		parent?: Model;

		// components
		materials: Material[];
		mesh?: meshdata.MeshData;
		light?: entity.Light;
	}

	export function makeModel(): Model {
		return {
			transform: makeTransform(),
			children: [],
			materials: []
		};
	}

} // ns sd.asset
