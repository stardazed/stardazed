// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("meshdata", () => {
	group("IndexElementType", () => {
		test("indexElementTypeSizeBytes", () => {
			const { IndexElementType, indexElementTypeSizeBytes } = sd.meshdata;
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt8), 1);
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt16), 2);
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt32), 4);

			check.throws(Error, () => {
				check.equal(indexElementTypeSizeBytes(IndexElementType.None), 0);
			});
		});

		test("minimumIndexElementTypeForVertexCount", () => {
			const { IndexElementType, minimumIndexElementTypeForVertexCount } = sd.meshdata;
			check.equal(minimumIndexElementTypeForVertexCount(0), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(1), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(255), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(256), IndexElementType.UInt16);
			check.equal(minimumIndexElementTypeForVertexCount(65535), IndexElementType.UInt16);
			check.equal(minimumIndexElementTypeForVertexCount(65536), IndexElementType.UInt32);
			check.equal(minimumIndexElementTypeForVertexCount(5000000), IndexElementType.UInt32);
		});

		test("bytesRequiredForIndexCount", () => {
			const { IndexElementType, bytesRequiredForIndexCount } = sd.meshdata;
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt8, 0), 0);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt8, 1), 1);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt8, 255), 255);

			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt16, 1), 2);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt16, 256), 512);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt16, 65000), 130000);

			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt32, 1), 4);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt32, 256), 1024);
			check.equal(bytesRequiredForIndexCount(IndexElementType.UInt32, 1000000), 4000000);
		});
	});

	group("PrimitiveType", () => {
		test("", () => {
			const { PrimitiveType, elementOffsetForPrimitiveCount } = sd.meshdata;

		});

		test("", () => {
			const { PrimitiveType, elementCountForPrimitiveCount } = sd.meshdata;

		});

		test("", () => {
			const { PrimitiveType, primitiveCountForElementCount } = sd.meshdata;

		});
	});

	group("IndexBuffer", () => {

	});
});
