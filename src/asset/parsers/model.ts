// asset/parser/model - model composite asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export const makeTransform = (): entity.Transform => ({
		position: [0, 0, 0],
		rotation: [0, 0, 0, 1],
		scale: [1, 1, 1]
	});

	export interface Model {
		transform: entity.Transform;
		// renderable
		mesh?: meshdata.MeshData;
		materials: Material[];
	}

	export const makeModel = (): Model => ({
		transform: makeTransform(),
		materials: []
	});

	export namespace parser {

		export interface ModelAssetMetadata {
			materialIndexMap: { [id: string]: number; };
		}

		export const parseModel: AssetProcessor = (asset: Asset<Model, ModelAssetMetadata>) =>
			new Promise<Asset<Model, ModelAssetMetadata>>((resolve, _reject) => {
				const model = makeModel();
				if (asset.dependencies) {
					// try and link mesh to this model
					const meshAsset = asset.dependencies["mesh"];
					if (meshAsset) {
						if (meshAsset.kind === "mesh" && meshdata.isMeshData(meshAsset.item)) {
							model.mesh = meshAsset.item;
						}
						else {
							console.warn(`Model parser: "mesh" dependency is not a MeshData or was not loaded`, meshAsset);
						}
					}

				}
				asset.item = model;
				resolve(asset);
			});

		registerParser("model", parseModel);

	} // ns parser

} // ns sd.asset
