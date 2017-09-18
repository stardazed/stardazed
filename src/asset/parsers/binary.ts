// asset/parser/binary - generic binary files parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset.parser {

	export const parseBinary: AssetProcessor = (asset: Asset<ArrayBuffer, {}>) =>
		getArrayBuffer(asset).then(buffer => {
			asset.item = buffer;
			return asset;
		});

	registerFileExtension("bin", "application/octet-stream");

	mapMimeTypeToAssetKind("application/octet-stream", "binary");

	registerParser("binary", parser.parseBinary);

} // ns sd.asset.parser
