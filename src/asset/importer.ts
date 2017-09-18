// asset/parser/group - group asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {

	export namespace parser {

		export interface GroupAssetMetadata {
		}
		
		export type GroupAssetParser = AssetParser<AssetGroup, Partial<GroupAssetMetadata>>;
		const groupParsers = new Map<string, GroupAssetParser>();
		
		export function registerGroupParser(groupParser: GroupAssetParser, mimeType: string) {
			assert(! groupParsers.has(mimeType), `Trying to register more than 1 group parser for mime-type: ${mimeType}`);
			groupParsers.set(mimeType, groupParser);
		}
		
		/**
		 * Create an AssetGroup for an asset blob
		 * @param resource The source data to be parsed
		 */
		export function parseGroup(resource: RawAsset<GroupAssetMetadata>) {
			return new Promise<AssetGroup | Iterator<AssetGroup>>((resolve, reject) => {
				const mimeType = resource.dataBlob!.type;
				const groupParser = groupParsers.get(mimeType);
				if (! groupParser) {
					return reject(`Cannot load groups of type: ${mimeType}`);
				}
				resolve(groupParser(resource));
			});
		}

	} // ns parser


	export function makeTransform(): entity.Transform {
		return {
			position: [0, 0, 0],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		};
	}

	export interface Model extends Asset {
		transform: entity.Transform;
		children: Model[];
		parent?: Model;

		// components
		materials: Material[];
		mesh?: meshdata.MeshData;
		light?: entity.Light;
	}

	export function makeModel(name?: string): Model {
		return {
			...makeAsset("model", name),
			transform: makeTransform(),
			children: [],
			materials: []
		};
	}

	export class AssetGroup implements Asset {
		guid = "FIXME";
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

	export interface Library {
		loadGroup(ra: parser.RawAsset): Promise<AssetGroup>;
		groupByName(name: string): AssetGroup | undefined;
	}
	registerAssetLoaderParser("group", parser.parseGroup);

} // ns sd.asset
