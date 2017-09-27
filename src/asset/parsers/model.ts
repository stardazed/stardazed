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

	export interface CacheAccess {
		(kind: "model", name: string): Model;
	}

	export namespace parser {

		export interface ModelAssetMetadata {
			materialIndexMap: { [id: string]: number; };
		}

		const getMeshDependency = (deps: AssetDependencies) => {
			const meshAsset: Asset<meshdata.MeshData, MeshAssetMetadata> | undefined = deps["mesh"];
			if (meshAsset) {
				if (meshAsset.kind === "mesh" && meshdata.isMeshData(meshAsset.item)) {
					return meshAsset;
				}
				else {
					console.warn(`Model parser: "mesh" dependency is not a MeshData or was not loaded`, meshAsset);
				}
			}
			return undefined;
		};

		export const parseModel: AssetProcessor = (asset: Asset<Model, ModelAssetMetadata>) =>
			new Promise<Asset<Model, ModelAssetMetadata>>((resolve, _reject) => {
				const model = makeModel();

				if (asset.dependencies) {
					const meshAsset = getMeshDependency(asset.dependencies);
					if (meshAsset) {
						model.mesh = meshAsset.item;
					}

					for (const depName of Object.getOwnPropertyNames(asset.dependencies)) {
						const dep = asset.dependencies[depName];
						if (dep !== void 0) {
							if (dep.kind === "mesh") {
								if (depName !== "mesh") {
									console.warn(`Model parser: only mesh dependencies named "mesh" are considered, ignoring ${depName}`, dep);
								}
							}
							else if (dep.kind === "material") {
								if (meshAsset) {
									if (typeof dep.item === "object" && dep.item !== null) { // FIXME: add isMaterial tester fn
										if (asset.metadata && asset.metadata.materialIndexMap) {
											const meshMatIndex = asset.metadata.materialIndexMap[depName];
											if (typeof meshMatIndex === "number" && meshMatIndex >= 0) {
												model.materials[meshMatIndex] = dep.item;
											}
											else {
												console.warn(`Model parser: material named ${depName} not found in material index map, ignoring`, asset);
											}
										}
										else {
											console.warn(`Model parser: no material index map was specified, materials will be in arbitrary order`, asset);
											model.materials.push(dep.item);
										}
									}
									else {
										console.warn(`Model parser: material dependency was not loaded`, dep);
									}
								}
								else {
									console.warn(`Model parser: model with material dependencies does not have a mesh`, asset);
									model.materials.push(dep.item);
								}
							}
							else {
								console.warn(`Model parser: ignoring incompatible dependency`, dep);
							}
						}
					}
				}

				asset.item = model;
				resolve(asset);
			});

		registerParser("model", parseModel);

	} // ns parser

} // ns sd.asset
