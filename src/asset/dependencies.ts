// asset/dependencies - asset dependency resolver
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	export interface AssetDependencies {
		[key: string]: Asset | undefined;
	}

	export interface Asset {
		dependencies?: AssetDependencies;
	}

	/**
	 * Recursively load an asset's named dependencies.
	 */
	export const dependencies = (pipelineProvider: () => AssetPipeline): AssetProcessor => async (asset: Asset) => {
		// just-in-time pipeline access as this refers back to the pipeline that
		// this processor was used to create.
		const pipeline = pipelineProvider();
	
		const deps = parseDependencies(asset.dependencies);
		if (deps) {
			// Since the processor chain updates assets in-place, we only
			// need to kick off loading of the assets and wait for them
			// to complete. No need to track keyed assets, etc.
			await Promise.all(deps.map(dep => pipeline(dep)));
		}
	};

	const parseDependencies = (deps: any): Asset[] | undefined => {
		if (typeof deps === "object") {
			if (deps === null || Array.isArray(deps)) {
				throw new Error(`A dependencies property must be a valid, non-array object.`);
			}

			const depList: Asset[] = [];
			for (const key in deps) {
				if (deps.hasOwnProperty(key)) {
					const dep = deps[key];
					if (dep !== void 0 && dep !== null) {
						if (typeof dep === "object" && !Array.isArray(dep)) {
							depList.push(dep);
						}
						else {
							throw new Error(`Each field in a dependencies property must be a single Asset, null or undefined.`);
						}
					}
					else if (dep === null) {
						// normalize any JSON-originated null values to undefined
						deps[key] = undefined;
					}
				}
			}

			return depList;
		}
		else if (deps !== void 0) {
			throw new Error(`A dependencies property must be a valid, non-array object.`);
		}

		return undefined;
	};

} // sd.asset
