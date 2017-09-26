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
		children: Model[];
		parent?: Model;
	
		// renderable
		mesh?: meshdata.MeshData;
		materials: Material[];
	}
	
	export const makeModel = (): Model => ({
		transform: makeTransform(),
		children: [],
		materials: []
	});
	
	export namespace parser {

		export interface ModelAssetMetadata {
		}

		export const parseModel: AssetProcessor = (asset: Asset<Model, ModelAssetMetadata>) =>
			Promise.resolve(asset);

		registerParser("model", parseModel);

	} // ns parser

} // ns sd.asset
