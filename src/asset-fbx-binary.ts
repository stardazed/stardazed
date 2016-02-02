// asset-fbx-binary.ts - FBX binary file parser
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/inflate.d.ts" />

namespace sd.asset {

	export class FBXBinaryParser {

		private inflateCompressedArray(dataBlock: TypedArray, outElementType: NumericType): TypedArray {
			// the first 2 bytes are usually 0x7801, which is a DEFLATE marker
			// the final 4 bytes are likely a checksum
			assert(dataBlock.byteLength > 6, "Compressed array data size is too small");
			var compData = new Uint8Array(dataBlock.buffer, 2, dataBlock.byteLength - 6);

			var inf = new Inflater();
			var result = inf.append(compData);
			inf.flush();
			
			assert(result.byteLength % outElementType.byteSize == 0, "Invalid aligned size of output buffer");
			return new (outElementType.arrayType)(result.buffer);
		}

		constructor(data: ArrayBuffer, private delegate_: FBXParserDelegate) {
			
		}


		parse() {

		}
	}

} // sd.asset
