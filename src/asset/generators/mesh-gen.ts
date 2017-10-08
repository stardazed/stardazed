// asset/generators/mesh - Mesh asset generator
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../generator.ts" />

namespace sd.asset.generate {

	interface MeshGenConfig {
		shape: string;
	}

	export const meshGenerator: AssetGenerator = (config: Partial<MeshGenConfig>) =>
		new Promise<Asset>((resolve, reject) => {
			let md: Promise<meshdata.MeshData>;
			switch (config.shape) {
				case "box":
					md = boxMeshGenerator(config);
					break;
				default:
					return reject(`Mesh generator: unknown or missing shape "${config.shape}"`);
			}

			resolve(md.then(meshData => ({
				kind: "mesh",
				item: meshData
			})));
		});

	registerGenerator("mesh", meshGenerator);

	// ----

	interface BoxMeshGenConfig extends MeshGenConfig {
		extents: number[];
	}

	/**
	 * @internal
	 * @param config box mesh configuration
	 */
	const boxMeshGenerator = (config: Partial<BoxMeshGenConfig>) =>
		new Promise<meshdata.MeshData>((resolve, reject) => {
			const { extents } = config;
			if (Array.isArray(extents) && extents.length === 3 && extents.every(v => typeof v === "number")) {
				resolve(meshdata.gen.generate(new meshdata.gen.Box({
					width: extents[0],
					height: extents[1],
					depth: extents[2]
				})));
			}
			else {
				reject(`Box mesh generator: config.extents must be an array of numbers of length 3`);
			}
		});

} // ns sd.asset.generate
