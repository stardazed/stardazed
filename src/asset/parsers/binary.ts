// asset/parser/binary - generic binary files parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export interface CacheAccess {
		(kind: "binary", name: string): ArrayBuffer;
	}
	
	export namespace parse {

		export const parseBinary: AssetProcessor = (asset: Asset<ArrayBuffer, {}>) =>
			getArrayBuffer(asset).then(buffer => {
				asset.item = buffer;
			});

		registerFileExtension("bin", "application/octet-stream");

		mapMimeTypeToAssetKind("application/octet-stream", "binary");

		registerParser("binary", parseBinary);

	} // ns parser

} // ns sd.asset
