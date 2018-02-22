// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("geometry", () => {
	group("IndexElementType", () => {
		test("indexElementTypeSizeBytes", () => {
			const { IndexElementType, indexElementTypeSizeBytes } = sd.geometry;
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt8), 1);
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt16), 2);
			check.equal(indexElementTypeSizeBytes(IndexElementType.UInt32), 4);

			check.throws(Error, () => {
				check.equal(indexElementTypeSizeBytes(IndexElementType.None), 0);
			});
		});

		test("minimumIndexElementTypeForVertexCount", () => {
			const { IndexElementType, minimumIndexElementTypeForVertexCount } = sd.geometry;
			check.equal(minimumIndexElementTypeForVertexCount(0), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(1), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(255), IndexElementType.UInt8);
			check.equal(minimumIndexElementTypeForVertexCount(256), IndexElementType.UInt16);
			check.equal(minimumIndexElementTypeForVertexCount(65535), IndexElementType.UInt16);
			check.equal(minimumIndexElementTypeForVertexCount(65536), IndexElementType.UInt32);
			check.equal(minimumIndexElementTypeForVertexCount(5000000), IndexElementType.UInt32);
		});

		test("bytesRequiredForIndexCount", () => {
			const { IndexElementType, bytesRequiredForIndexCount } = sd.geometry;
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

		test("typedIndexArrayClassForIndexElement", () => {
			const { IndexElementType, typedIndexArrayClassForIndexElement } = sd.geometry;
			check.throws(Error, () => typedIndexArrayClassForIndexElement(IndexElementType.None));
			check.equal(typedIndexArrayClassForIndexElement(IndexElementType.UInt8), Uint8ClampedArray);
			check.equal(typedIndexArrayClassForIndexElement(IndexElementType.UInt16), Uint16Array);
			check.equal(typedIndexArrayClassForIndexElement(IndexElementType.UInt32), Uint32Array);
		});
	});

	group("PrimitiveType", () => {
		test("elementOffsetForPrimitiveCount", () => {
			const { PrimitiveType, elementOffsetForPrimitiveCount } = sd.geometry;
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Point, 0), 0, "point 0");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Point, 1), 1, "point 1");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Point, 1000), 1000, "point 1000");

			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Line, 0), 0, "line 0");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Line, 1), 2, "line 1");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Line, 1000), 2000, "line 1000");

			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.LineStrip, 0), 0, "linestrip 0");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.LineStrip, 1), 1, "linestrip 1");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.LineStrip, 1000), 1000, "linestrip 1000");

			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Triangle, 0), 0, "triangle 0");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Triangle, 1), 3, "triangle 1");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.Triangle, 1000), 3000, "triangle 1000");

			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.TriangleStrip, 0), 0, "trianglestrip 0");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.TriangleStrip, 1), 1, "trianglestrip 1");
			check.equal(elementOffsetForPrimitiveCount(PrimitiveType.TriangleStrip, 1000), 1000, "trianglestrip 1000");
		});

		test("elementCountForPrimitiveCount", () => {
			const { PrimitiveType, elementCountForPrimitiveCount } = sd.geometry;
			check.throws(Error, () => elementCountForPrimitiveCount(PrimitiveType.Point, -1), "throws on negative count");

			check.equal(elementCountForPrimitiveCount(PrimitiveType.Point, 0), 0, "point 0");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Point, 1), 1, "point 1");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Point, 1000), 1000, "point 1000");

			check.equal(elementCountForPrimitiveCount(PrimitiveType.Line, 0), 0, "line 0");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Line, 1), 2, "line 1");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Line, 1000), 2000, "line 1000");

			check.equal(elementCountForPrimitiveCount(PrimitiveType.LineStrip, 0), 0, "linestrip 0");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.LineStrip, 1), 2, "linestrip 1");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.LineStrip, 1000), 1001, "linestrip 1000");

			check.equal(elementCountForPrimitiveCount(PrimitiveType.Triangle, 0), 0, "triangle 0");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Triangle, 1), 3, "triangle 1");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.Triangle, 1000), 3000, "triangle 1000");

			check.equal(elementCountForPrimitiveCount(PrimitiveType.TriangleStrip, 0), 0, "trianglestrip 0");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.TriangleStrip, 1), 3, "trianglestrip 1");
			check.equal(elementCountForPrimitiveCount(PrimitiveType.TriangleStrip, 1000), 1002, "trianglestrip 1000");
		});

		test("primitiveCountForElementCount", () => {
			const { PrimitiveType, primitiveCountForElementCount } = sd.geometry;
			check.throws(Error, () => primitiveCountForElementCount(PrimitiveType.Point, -1), "throws on negative count");

			check.equal(primitiveCountForElementCount(PrimitiveType.Point, 0), 0, "point 0");
			check.equal(primitiveCountForElementCount(PrimitiveType.Point, 1), 1, "point 1");
			check.equal(primitiveCountForElementCount(PrimitiveType.Point, 1000), 1000, "point 1000");

			check.equal(primitiveCountForElementCount(PrimitiveType.Line, 0), 0, "line 0");
			check.equal(primitiveCountForElementCount(PrimitiveType.Line, 1), 0, "line 1");
			check.equal(primitiveCountForElementCount(PrimitiveType.Line, 2), 1, "line 2");
			check.equal(primitiveCountForElementCount(PrimitiveType.Line, 2000), 1000, "line 2000");

			check.equal(primitiveCountForElementCount(PrimitiveType.LineStrip, 0), 0, "linestrip 0");
			check.equal(primitiveCountForElementCount(PrimitiveType.LineStrip, 2), 1, "linestrip 2");
			check.equal(primitiveCountForElementCount(PrimitiveType.LineStrip, 1001), 1000, "linestrip 1001");

			check.equal(primitiveCountForElementCount(PrimitiveType.Triangle, 0), 0, "triangle 0");
			check.equal(primitiveCountForElementCount(PrimitiveType.Triangle, 2), 0, "triangle 2");
			check.equal(primitiveCountForElementCount(PrimitiveType.Triangle, 3), 1, "triangle 3");
			check.equal(primitiveCountForElementCount(PrimitiveType.Triangle, 3000), 1000, "triangle 3000");

			check.equal(primitiveCountForElementCount(PrimitiveType.TriangleStrip, 0), 0, "trianglestrip 0");
			check.equal(primitiveCountForElementCount(PrimitiveType.TriangleStrip, 3), 1, "trianglestrip 3");
			check.equal(primitiveCountForElementCount(PrimitiveType.TriangleStrip, 1002), 1000, "trianglestrip 1002");
		});
	});
});
