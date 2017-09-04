// asset/parser/group - group asset parser front-end
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parsers.ts" />

namespace sd.asset.parser {

	export interface GroupAssetOptions {
		loader: loader.Loader;
	}

	export type GroupAssetParser = AssetParser<AssetGroup, GroupAssetOptions>;
	const groupParsers = new Map<string, GroupAssetParser>();

	export function registerGroupParser(parser: GroupAssetParser, mimeType: string) {
		assert(! groupParsers.has(mimeType), `Trying to register more than 1 group parser for mime-type: ${mimeType}`);
		groupParsers.set(mimeType, parser);
		registerParser(parser, mimeType);
	}

	/**
	 * Create an AssetGroup for an asset blob
	 * @param blob Group data to parse
	 * @param path The asset path
	 * @param options Group-specific options
	 */
	export function parseGroup(blob: Blob, path: string, options: GroupAssetOptions) {
		return new Promise<AssetGroup>((resolve, reject) => {
			const mimeType = blob.type;
			const parser = groupParsers.get(mimeType);
			if (! parser) {
				return reject(`Cannot load groups of type: ${mimeType}`);
			}
			resolve(parser(blob, path, options));
		});
	}

} // ns sd.asset.parser
