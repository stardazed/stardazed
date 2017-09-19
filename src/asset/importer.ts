// asset/importer - import assets from other asset containers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	/**
	 * Extend an AssetLibrary with the capacity to import non-SD asset files.
	 */
	export const importerPlugin: LibraryPlugin = (lib: AssetLibrary) => {
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
		const process = lib.process;
		lib.process = (asset: Asset) => process(asset).then(assetImporter);
	};


	export namespace importer {

		export type AssetImporter = (data: Blob, uri: string) => Promise<AssetDependencies>;
		const importers = new Map<string, AssetImporter>();
		
		export const registerImporter = (importer: AssetImporter, mimeType: string) => {
			assert(! importers.has(mimeType), `Trying to register more than 1 importer for mime-type: ${mimeType}`);
			importers.set(mimeType, importer);

			parser.mapMimeTypeToAssetKind(mimeType, "import");
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

	export class AssetGroup {
		kind = "group";

		meshes: meshdata.MeshData[] = [];
		textures: (Texture2D | null)[] = []; // FIXME: handling of optional textures
		materials: Material[] = [];
		models: Model[] = [];

		addMesh(mesh: meshdata.MeshData): number {
			this.meshes.push(mesh);
			return this.meshes.length - 1;
		}

		addTexture(tex: Texture2D | null): number { // FIXME: handling of optional textures
			this.textures.push(tex);
			return this.textures.length - 1;
		}

		addMaterial(mat: Material): number {
			this.materials.push(mat);
			return this.materials.length - 1;
		}

		addModel(model: Model): number {
			this.models.push(model);
			return this.models.length - 1;
		}
	}

} // ns sd.asset
