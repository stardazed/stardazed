// asset/parser/binary - generic binary files parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {
	
	export namespace parser {

		export const parseBinary: AssetParser<Binary, {}> = (resource: RawAsset<{}>) =>
			getArrayBuffer(resource).then(buffer => ({
				...makeAsset("binary", resource.name),
				buffer
			}));

		registerFileExtension("bin", "application/octet-stream");

	} // ns parser

	export interface Binary extends Asset {
		buffer: ArrayBuffer;
	}

	export interface Library {
		loadBinary(sa: parser.RawAsset): Promise<Binary>;
		binaryByName(name: string): Binary | undefined;
	}
	registerAssetLoaderParser("binary", parser.parseBinary);

} // ns sd.asset
