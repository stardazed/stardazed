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

	export interface Library {
		loadGroup(ra: parser.RawAsset): Promise<AssetGroup>;
		groupByName(name: string): AssetGroup | undefined;
	}
	registerAssetLoaderParser("group", parser.parseGroup);

} // ns sd.asset
