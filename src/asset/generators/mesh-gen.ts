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
			let geom: Promise<geometry.Geometry>;
			switch (config.shape) {
				case "box":
					geom = boxMeshGenerator(config);
					break;
				default:
					return reject(`Mesh generator: unknown or missing shape "${config.shape}"`);
			}

			resolve(geom.then(geometry => ({
				kind: "mesh",
				item: geometry
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
		new Promise<geometry.Geometry>((resolve, reject) => {
			const { extents } = config;
			if (Array.isArray(extents) && extents.length === 3 && extents.every(v => typeof v === "number")) {
				resolve(geometry.gen.generate(new geometry.gen.Box({
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
