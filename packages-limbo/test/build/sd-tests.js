var check = inquisition.check;
group("geometry", function () {
    group("IndexBuffer", function () {
        test("construct-throws-on-invalid-elementType-or-indexCount", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var storage = new Uint8ClampedArray(16);
            check.throws(Error, function () { return new IndexBuffer(0, 4); });
            check.throws(Error, function () { return new IndexBuffer(1, 0); });
            check.throws(Error, function () { return new IndexBuffer(999, 4); }, "non-enum IET");
            check.throws(Error, function () { return new IndexBuffer(1, -1); });
            check.throws(Error, function () { return new IndexBuffer(0, 4, storage); });
            check.throws(Error, function () { return new IndexBuffer(1, 0, storage); });
            check.throws(Error, function () { return new IndexBuffer(-1, 4, storage); }, "non-enum IET");
            check.throws(Error, function () { return new IndexBuffer(1, -1, storage); });
        });
        test("provided-elementType-and-indexCount-stick", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var ib = new IndexBuffer(1, 300);
            check.equal(ib.indexElementType, 1);
            check.equal(ib.indexCount, 300);
            var ib2 = new IndexBuffer(2, 3);
            check.equal(ib2.indexElementType, 2);
            check.equal(ib2.indexCount, 3);
            var ib3 = new IndexBuffer(3, 1);
            check.equal(ib3.indexElementType, 3);
            check.equal(ib3.indexCount, 1);
        });
        test("construct-without-storage-creates-one-of-fitting-size", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var ib = new IndexBuffer(3, 48);
            check.present(ib.storage);
            check.equal(ib.storage.byteLength, 4 * 48);
        });
        test("construct-without-storage-creates-zeroed-buffer", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var ib = new IndexBuffer(2, 20);
            for (var a = 0; a < 2 * 20; ++a) {
                check.equal(ib.storage[a], 0, "byte at offset " + a);
            }
        });
        test("construct-with-storage-adopts-it", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var storage = new Uint8ClampedArray(4 * 128);
            var ib = new IndexBuffer(3, 128, storage);
            check.equal(ib.storage, storage);
        });
        test("construct-with-storage-throws-if-too-small", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var storage = new Uint8ClampedArray(4 * 100);
            check.throws(Error, function () {
                new IndexBuffer(3, 128, storage);
            });
        });
        test("construct-with-storage-does-not-change-data", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var storage = new Uint8ClampedArray(2 * 256);
            for (var a = 0; a < 2 * 256; ++a) {
                storage[a] = a & 255;
            }
            var ib = new IndexBuffer(2, 256, storage);
            for (var a = 0; a < 2 * 256; ++a) {
                check.equal(ib.storage[a], a & 255, "byte at offset " + a);
            }
        });
        test("sizeBytes-equals-bufferview-size", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
            var ib = new IndexBuffer(2, 257);
            check.equal(ib.storage.byteLength, ib.sizeBytes);
        });
        group("typedBasePtr", function () {
            var ib8;
            var ib16;
            var ib32;
            var compareRanges = function (a, aFrom, b, bFrom, count, prefix) {
                for (var ix = 0; ix < count; ++ix) {
                    check.equal(a[aFrom + ix], b[bFrom + ix], prefix + " byte " + ix);
                }
            };
            before(function () {
                var _a = sd.geometry, IndexElementType = _a.IndexElementType, IndexBuffer = _a.IndexBuffer;
                ib8 = new IndexBuffer(1, 384);
                ib16 = new IndexBuffer(2, 384);
                ib32 = new IndexBuffer(3, 384);
                for (var k = 0; k < ib32.storage.byteLength; ++k) {
                    if (k < ib8.storage.byteLength) {
                        ib8.storage[k] = k;
                    }
                    if (k < ib16.storage.byteLength) {
                        ib16.storage[k] = k;
                    }
                    ib32.storage[k] = k;
                }
            });
            test("throws-on-range-error", function () {
                check.throws(Error, function () { return ib8.typedBasePtr(0, 385); }, "U8 0, 385");
                check.throws(Error, function () { return ib8.typedBasePtr(200, 185); }, "U8 200, 185");
                check.throws(Error, function () { return ib8.typedBasePtr(-1, 1); }, "U8 -1, 1");
                check.throws(Error, function () { return ib8.typedBasePtr(-10, 400); }, "U8 -10, 400");
                check.throws(Error, function () { return ib16.typedBasePtr(0, 385); }, "U16 0, 257");
                check.throws(Error, function () { return ib16.typedBasePtr(200, 185); }, "U16 200, 185");
                check.throws(Error, function () { return ib16.typedBasePtr(-1, 1); }, "U16 -1, 1");
                check.throws(Error, function () { return ib16.typedBasePtr(-1, 400); }, "U16 -1, 400");
                check.throws(Error, function () { return ib32.typedBasePtr(0, 385); }, "U32 0, 257");
                check.throws(Error, function () { return ib32.typedBasePtr(200, 185); }, "U32 200, 185");
                check.throws(Error, function () { return ib32.typedBasePtr(-1, 1); }, "U32 -1, 1");
                check.throws(Error, function () { return ib32.typedBasePtr(-1, 400); }, "U32 -1, 400");
            });
            test("returns-exact-sized-section-of-proper-type-UInt8", function () {
                var view = ib8.typedBasePtr(0, 384);
                var checkView = ib8.storage.subarray(0, 384);
                check.equal(view.BYTES_PER_ELEMENT, 1, "must be Uint8 view");
                check.equal(view.byteLength, 384);
                compareRanges(view, 0, checkView, 0, 384, "full");
                var view2 = ib8.typedBasePtr(250, 33);
                var checkView2 = ib8.storage.subarray(250, 383);
                check.equal(view2.BYTES_PER_ELEMENT, 1, "must be Uint8 view");
                check.equal(view2.byteLength, 33);
                compareRanges(view2, 0, checkView2, 0, 33, "part");
            });
            test("returns-exact-sized-section-of-proper-type-UInt16", function () {
                var view = ib16.typedBasePtr(0, 384);
                var checkView = new Uint16Array(ib16.storage.buffer, 0, 384);
                check.equal(view.BYTES_PER_ELEMENT, 2, "must be Uint16 view");
                check.equal(view.byteLength, 2 * 384);
                compareRanges(view, 0, checkView, 0, 384, "full");
                var view2 = ib16.typedBasePtr(100, 33);
                var checkView2 = new Uint16Array(ib16.storage.buffer, 2 * 100, 33);
                check.equal(view2.BYTES_PER_ELEMENT, 2, "must be Uint16 view");
                check.equal(view2.byteLength, 2 * 33);
                compareRanges(view2, 0, checkView2, 0, 33, "part");
            });
            test("returns-exact-sized-section-of-proper-type-UInt32", function () {
                var view = ib32.typedBasePtr(0, 384);
                var checkView = new Uint32Array(ib32.storage.buffer, 0, 384);
                check.equal(view.BYTES_PER_ELEMENT, 4, "must be Uint32 view");
                check.equal(view.byteLength, 4 * 384);
                compareRanges(view, 0, checkView, 0, 384, "full");
                var view2 = ib32.typedBasePtr(100, 33);
                var checkView2 = new Uint32Array(ib32.storage.buffer, 4 * 100, 33);
                check.equal(view2.BYTES_PER_ELEMENT, 4, "must be Uint32 view");
                check.equal(view2.byteLength, 4 * 33);
                compareRanges(view2, 0, checkView2, 0, 33, "part");
            });
        });
    });
});
group("geometry", function () {
    group("IndexElementType", function () {
        test("indexElementTypeSizeBytes", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, indexElementTypeSizeBytes = _a.indexElementTypeSizeBytes;
            check.equal(indexElementTypeSizeBytes[1], 1);
            check.equal(indexElementTypeSizeBytes[2], 2);
            check.equal(indexElementTypeSizeBytes[3], 4);
            check.throws(Error, function () {
                check.equal(indexElementTypeSizeBytes[0], 0);
            });
        });
        test("minimumIndexElementTypeForVertexCount", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, minimumIndexElementTypeForVertexCount = _a.minimumIndexElementTypeForVertexCount;
            check.equal(minimumIndexElementTypeForVertexCount(0), 1);
            check.equal(minimumIndexElementTypeForVertexCount(1), 1);
            check.equal(minimumIndexElementTypeForVertexCount(255), 1);
            check.equal(minimumIndexElementTypeForVertexCount(256), 2);
            check.equal(minimumIndexElementTypeForVertexCount(65535), 2);
            check.equal(minimumIndexElementTypeForVertexCount(65536), 3);
            check.equal(minimumIndexElementTypeForVertexCount(5000000), 3);
        });
        test("bytesRequiredForIndexCount", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, bytesRequiredForIndexCount = _a.bytesRequiredForIndexCount;
            check.equal(bytesRequiredForIndexCount(1, 0), 0);
            check.equal(bytesRequiredForIndexCount(1, 1), 1);
            check.equal(bytesRequiredForIndexCount(1, 255), 255);
            check.equal(bytesRequiredForIndexCount(2, 1), 2);
            check.equal(bytesRequiredForIndexCount(2, 256), 512);
            check.equal(bytesRequiredForIndexCount(2, 65000), 130000);
            check.equal(bytesRequiredForIndexCount(3, 1), 4);
            check.equal(bytesRequiredForIndexCount(3, 256), 1024);
            check.equal(bytesRequiredForIndexCount(3, 1000000), 4000000);
        });
        test("typedIndexArrayClassForIndexElement", function () {
            var _a = sd.geometry, IndexElementType = _a.IndexElementType, typedIndexArrayClassForIndexElement = _a.typedIndexArrayClassForIndexElement;
            check.throws(Error, function () { return typedIndexArrayClassForIndexElement(0); });
            check.equal(typedIndexArrayClassForIndexElement(1), Uint8ClampedArray);
            check.equal(typedIndexArrayClassForIndexElement(2), Uint16Array);
            check.equal(typedIndexArrayClassForIndexElement(3), Uint32Array);
        });
    });
    group("PrimitiveType", function () {
        test("elementOffsetForPrimitiveCount", function () {
            var _a = sd.geometry, PrimitiveType = _a.PrimitiveType, elementOffsetForPrimitiveCount = _a.elementOffsetForPrimitiveCount;
            check.equal(elementOffsetForPrimitiveCount(1, 0), 0, "point 0");
            check.equal(elementOffsetForPrimitiveCount(1, 1), 1, "point 1");
            check.equal(elementOffsetForPrimitiveCount(1, 1000), 1000, "point 1000");
            check.equal(elementOffsetForPrimitiveCount(2, 0), 0, "line 0");
            check.equal(elementOffsetForPrimitiveCount(2, 1), 2, "line 1");
            check.equal(elementOffsetForPrimitiveCount(2, 1000), 2000, "line 1000");
            check.equal(elementOffsetForPrimitiveCount(3, 0), 0, "linestrip 0");
            check.equal(elementOffsetForPrimitiveCount(3, 1), 1, "linestrip 1");
            check.equal(elementOffsetForPrimitiveCount(3, 1000), 1000, "linestrip 1000");
            check.equal(elementOffsetForPrimitiveCount(4, 0), 0, "triangle 0");
            check.equal(elementOffsetForPrimitiveCount(4, 1), 3, "triangle 1");
            check.equal(elementOffsetForPrimitiveCount(4, 1000), 3000, "triangle 1000");
            check.equal(elementOffsetForPrimitiveCount(5, 0), 0, "trianglestrip 0");
            check.equal(elementOffsetForPrimitiveCount(5, 1), 1, "trianglestrip 1");
            check.equal(elementOffsetForPrimitiveCount(5, 1000), 1000, "trianglestrip 1000");
        });
        test("elementCountForPrimitiveCount", function () {
            var _a = sd.geometry, PrimitiveType = _a.PrimitiveType, elementCountForPrimitiveCount = _a.elementCountForPrimitiveCount;
            check.throws(Error, function () { return elementCountForPrimitiveCount(1, -1); }, "throws on negative count");
            check.equal(elementCountForPrimitiveCount(1, 0), 0, "point 0");
            check.equal(elementCountForPrimitiveCount(1, 1), 1, "point 1");
            check.equal(elementCountForPrimitiveCount(1, 1000), 1000, "point 1000");
            check.equal(elementCountForPrimitiveCount(2, 0), 0, "line 0");
            check.equal(elementCountForPrimitiveCount(2, 1), 2, "line 1");
            check.equal(elementCountForPrimitiveCount(2, 1000), 2000, "line 1000");
            check.equal(elementCountForPrimitiveCount(3, 0), 0, "linestrip 0");
            check.equal(elementCountForPrimitiveCount(3, 1), 2, "linestrip 1");
            check.equal(elementCountForPrimitiveCount(3, 1000), 1001, "linestrip 1000");
            check.equal(elementCountForPrimitiveCount(4, 0), 0, "triangle 0");
            check.equal(elementCountForPrimitiveCount(4, 1), 3, "triangle 1");
            check.equal(elementCountForPrimitiveCount(4, 1000), 3000, "triangle 1000");
            check.equal(elementCountForPrimitiveCount(5, 0), 0, "trianglestrip 0");
            check.equal(elementCountForPrimitiveCount(5, 1), 3, "trianglestrip 1");
            check.equal(elementCountForPrimitiveCount(5, 1000), 1002, "trianglestrip 1000");
        });
        test("primitiveCountForElementCount", function () {
            var _a = sd.geometry, PrimitiveType = _a.PrimitiveType, primitiveCountForElementCount = _a.primitiveCountForElementCount;
            check.throws(Error, function () { return primitiveCountForElementCount(1, -1); }, "throws on negative count");
            check.equal(primitiveCountForElementCount(1, 0), 0, "point 0");
            check.equal(primitiveCountForElementCount(1, 1), 1, "point 1");
            check.equal(primitiveCountForElementCount(1, 1000), 1000, "point 1000");
            check.equal(primitiveCountForElementCount(2, 0), 0, "line 0");
            check.equal(primitiveCountForElementCount(2, 1), 0, "line 1");
            check.equal(primitiveCountForElementCount(2, 2), 1, "line 2");
            check.equal(primitiveCountForElementCount(2, 2000), 1000, "line 2000");
            check.equal(primitiveCountForElementCount(3, 0), 0, "linestrip 0");
            check.equal(primitiveCountForElementCount(3, 2), 1, "linestrip 2");
            check.equal(primitiveCountForElementCount(3, 1001), 1000, "linestrip 1001");
            check.equal(primitiveCountForElementCount(4, 0), 0, "triangle 0");
            check.equal(primitiveCountForElementCount(4, 2), 0, "triangle 2");
            check.equal(primitiveCountForElementCount(4, 3), 1, "triangle 3");
            check.equal(primitiveCountForElementCount(4, 3000), 1000, "triangle 3000");
            check.equal(primitiveCountForElementCount(5, 0), 0, "trianglestrip 0");
            check.equal(primitiveCountForElementCount(5, 3), 1, "trianglestrip 3");
            check.equal(primitiveCountForElementCount(5, 1002), 1000, "trianglestrip 1002");
        });
    });
});
group("geometry.VertexAttribute", function () {
    test("isVertexAttribute", function () {
        var isVertexAttribute = sd.geometry.isVertexAttribute;
        check.equal(isVertexAttribute({ field: 0, role: 0 }), true);
        check.equal(isVertexAttribute({ field: "0", role: 0 }), false, "bad field type");
        check.equal(isVertexAttribute({ field: 0, role: true }), false, "bad role type");
        check.equal(isVertexAttribute({ field: null, role: null }), false, "nulled attributes");
        check.equal(isVertexAttribute({ role: 0 }), false, "missing field type");
        check.equal(isVertexAttribute({ field: 0 }), false, "missing role type");
        check.equal(isVertexAttribute({}), false, "empty object");
    });
    group("attr-helpers", function () {
        test("attrPosition2", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrPosition2 = _a.attrPosition2;
            var attr = attrPosition2();
            check.equal(attr.field, 26);
            check.equal(attr.role, 1);
        });
        test("attrPosition3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrPosition3 = _a.attrPosition3;
            var attr = attrPosition3();
            check.equal(attr.field, 27);
            check.equal(attr.role, 1);
        });
        test("attrNormal3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrNormal3 = _a.attrNormal3;
            var attr = attrNormal3();
            check.equal(attr.field, 27);
            check.equal(attr.role, 2);
        });
        test("attrColour3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrColour3 = _a.attrColour3;
            var attr = attrColour3();
            check.equal(attr.field, 27);
            check.equal(attr.role, 4);
        });
        test("attrUV2", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrUV2 = _a.attrUV2;
            var attr = attrUV2();
            check.equal(attr.field, 26);
            check.equal(attr.role, 6);
            check.equal(attr.role, 6);
        });
        test("attrTangent3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrTangent3 = _a.attrTangent3;
            var attr = attrTangent3();
            check.equal(attr.field, 27);
            check.equal(attr.role, 3);
        });
        test("attrJointIndexes", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrJointIndexes = _a.attrJointIndexes;
            var attr = attrJointIndexes();
            check.equal(attr.field, 24);
            check.equal(attr.role, 14);
        });
        test("attrWeightedPos-good", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, attrWeightedPos = _a.attrWeightedPos;
            var attr0 = attrWeightedPos(0);
            check.equal(attr0.field, 28);
            check.equal(attr0.role, 10);
            var attr1 = attrWeightedPos(1);
            check.equal(attr1.field, 28);
            check.equal(attr1.role, 11);
            var attr2 = attrWeightedPos(2);
            check.equal(attr2.field, 28);
            check.equal(attr2.role, 12);
            var attr3 = attrWeightedPos(3);
            check.equal(attr3.field, 28);
            check.equal(attr3.role, 13);
        });
        test("attrWeightedPos-outOfRange", function () {
            var attrWeightedPos = sd.geometry.attrWeightedPos;
            check.throws(Error, function () {
                attrWeightedPos(-1);
            });
            check.throws(Error, function () {
                attrWeightedPos(4);
            });
        });
    });
    group("AttrList", function () {
        test("Pos3Norm3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var Pos3Norm3 = sd.geometry.AttrList.Pos3Norm3;
            var attrs = Pos3Norm3();
            check.truthy(Array.isArray(attrs));
            check.equal(attrs.length, 2);
            check.structuralEqual(attrs[0], {
                field: 27,
                role: 1
            });
            check.structuralEqual(attrs[1], {
                field: 27,
                role: 2
            });
        });
        test("Pos3Norm3Colour3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var Pos3Norm3Colour3 = sd.geometry.AttrList.Pos3Norm3Colour3;
            var attrs = Pos3Norm3Colour3();
            check.truthy(Array.isArray(attrs));
            check.equal(attrs.length, 3);
            check.structuralEqual(attrs[0], {
                field: 27,
                role: 1
            });
            check.structuralEqual(attrs[1], {
                field: 27,
                role: 2
            });
            check.structuralEqual(attrs[2], {
                field: 27,
                role: 4
            });
        });
        test("Pos3Norm3UV2", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var Pos3Norm3UV2 = sd.geometry.AttrList.Pos3Norm3UV2;
            var attrs = Pos3Norm3UV2();
            check.truthy(Array.isArray(attrs));
            check.equal(attrs.length, 3);
            check.structuralEqual(attrs[0], {
                field: 27,
                role: 1
            });
            check.structuralEqual(attrs[1], {
                field: 27,
                role: 2
            });
            check.structuralEqual(attrs[2], {
                field: 26,
                role: 6
            });
        });
        test("Pos3Norm3Colour3UV2", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var Pos3Norm3Colour3UV2 = sd.geometry.AttrList.Pos3Norm3Colour3UV2;
            var attrs = Pos3Norm3Colour3UV2();
            check.truthy(Array.isArray(attrs));
            check.equal(attrs.length, 4);
            check.structuralEqual(attrs[0], {
                field: 27,
                role: 1
            });
            check.structuralEqual(attrs[1], {
                field: 27,
                role: 2
            });
            check.structuralEqual(attrs[2], {
                field: 27,
                role: 4
            });
            check.structuralEqual(attrs[3], {
                field: 26,
                role: 6
            });
        });
        test("Pos3Norm3UV2Tan3", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var Pos3Norm3UV2Tan3 = sd.geometry.AttrList.Pos3Norm3UV2Tan3;
            var attrs = Pos3Norm3UV2Tan3();
            check.truthy(Array.isArray(attrs));
            check.equal(attrs.length, 4);
            check.structuralEqual(attrs[0], {
                field: 27,
                role: 1
            });
            check.structuralEqual(attrs[1], {
                field: 27,
                role: 2
            });
            check.structuralEqual(attrs[2], {
                field: 26,
                role: 6
            });
            check.structuralEqual(attrs[3], {
                field: 27,
                role: 3
            });
        });
    });
});
group("geometry", function () {
    group("VertexBuffer", function () {
        test("construct-throws-on-invalid-count-or-stride", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var storage = new Uint8ClampedArray(16);
            check.throws(Error, function () { return new VertexBuffer(0, 4); });
            check.throws(Error, function () { return new VertexBuffer(4, 0); });
            check.throws(Error, function () { return new VertexBuffer(-1, 4); });
            check.throws(Error, function () { return new VertexBuffer(4, -1); });
            check.throws(Error, function () { return new VertexBuffer(0, 4, storage); });
            check.throws(Error, function () { return new VertexBuffer(4, 0, storage); });
            check.throws(Error, function () { return new VertexBuffer(-1, 4, storage); });
            check.throws(Error, function () { return new VertexBuffer(4, -1, storage); });
        });
        test("provided-vertexCount-and-stride-stick", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var vb = new VertexBuffer(1, 12);
            check.equal(vb.vertexCount, 1);
            check.equal(vb.stride, 12);
            var vb2 = new VertexBuffer(1025, 100);
            check.equal(vb2.vertexCount, 1025);
            check.equal(vb2.stride, 100);
        });
        test("construct-without-storage-creates-one-of-fitting-size", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var vb = new VertexBuffer(128, 12);
            check.present(vb.storage);
            check.equal(vb.storage.byteLength, 128 * 12);
        });
        test("construct-without-storage-creates-zeroed-buffer", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var vb = new VertexBuffer(128, 12);
            for (var a = 0; a < 128 * 12; ++a) {
                check.equal(vb.storage[a], 0, "byte at offset " + a);
            }
        });
        test("construct-with-storage-adopts-it", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var storage = new Uint8ClampedArray(128 * 12);
            var vb = new VertexBuffer(128, 12, storage);
            check.equal(vb.storage, storage);
        });
        test("construct-with-storage-throws-if-too-small", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var storage = new Uint8ClampedArray(16 * 12);
            check.throws(Error, function () {
                new VertexBuffer(128, 12, storage);
            });
        });
        test("construct-with-storage-does-not-change-data", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var storage = new Uint8ClampedArray(128 * 12);
            for (var a = 0; a < 128 * 12; ++a) {
                storage[a] = a & 255;
            }
            var vb = new VertexBuffer(128, 12, storage);
            for (var a = 0; a < 128 * 12; ++a) {
                check.equal(vb.storage[a], a & 255, "byte at offset " + a);
            }
        });
        test("sizeBytes-equals-bufferview-size", function () {
            var VertexBuffer = sd.geometry.VertexBuffer;
            var vb = new VertexBuffer(128, 12);
            check.equal(vb.storage.byteLength, vb.sizeBytes);
        });
    });
});
group("geometry.VertexField", function () {
    test("elementCount", function () {
        var _a = sd.geometry, VertexField = _a.VertexField, vertexFieldElementCount = _a.vertexFieldElementCount;
        check.equal(vertexFieldElementCount(0), 0);
        check.equal(vertexFieldElementCount(2), 2);
        check.equal(vertexFieldElementCount(3), 3);
        check.equal(vertexFieldElementCount(4), 4);
        check.equal(vertexFieldElementCount(6), 2);
        check.equal(vertexFieldElementCount(7), 3);
        check.equal(vertexFieldElementCount(8), 4);
        check.equal(vertexFieldElementCount(10), 2);
        check.equal(vertexFieldElementCount(11), 3);
        check.equal(vertexFieldElementCount(12), 4);
        check.equal(vertexFieldElementCount(14), 2);
        check.equal(vertexFieldElementCount(15), 3);
        check.equal(vertexFieldElementCount(16), 4);
        check.equal(vertexFieldElementCount(17), 1);
        check.equal(vertexFieldElementCount(18), 2);
        check.equal(vertexFieldElementCount(19), 3);
        check.equal(vertexFieldElementCount(20), 4);
        check.equal(vertexFieldElementCount(21), 1);
        check.equal(vertexFieldElementCount(22), 2);
        check.equal(vertexFieldElementCount(23), 3);
        check.equal(vertexFieldElementCount(24), 4);
        check.equal(vertexFieldElementCount(25), 1);
        check.equal(vertexFieldElementCount(26), 2);
        check.equal(vertexFieldElementCount(27), 3);
        check.equal(vertexFieldElementCount(28), 4);
        check.equal(vertexFieldElementCount(130), 2);
        check.equal(vertexFieldElementCount(131), 3);
        check.equal(vertexFieldElementCount(132), 4);
        check.equal(vertexFieldElementCount(134), 2);
        check.equal(vertexFieldElementCount(135), 3);
        check.equal(vertexFieldElementCount(136), 4);
        check.equal(vertexFieldElementCount(138), 2);
        check.equal(vertexFieldElementCount(139), 3);
        check.equal(vertexFieldElementCount(140), 4);
        check.equal(vertexFieldElementCount(142), 2);
        check.equal(vertexFieldElementCount(143), 3);
        check.equal(vertexFieldElementCount(144), 4);
    });
    test("numericType", function () {
        var _a = sd.geometry, VertexField = _a.VertexField, vertexFieldNumericType = _a.vertexFieldNumericType;
        var Float = sd.Float, UInt32 = sd.UInt32, UInt16 = sd.UInt16, UInt8 = sd.UInt8, SInt32 = sd.SInt32, SInt16 = sd.SInt16, SInt8 = sd.SInt8;
        check.equal(vertexFieldNumericType(0), null);
        check.equal(vertexFieldNumericType(2), UInt8);
        check.equal(vertexFieldNumericType(3), UInt8);
        check.equal(vertexFieldNumericType(4), UInt8);
        check.equal(vertexFieldNumericType(6), SInt8);
        check.equal(vertexFieldNumericType(7), SInt8);
        check.equal(vertexFieldNumericType(8), SInt8);
        check.equal(vertexFieldNumericType(10), UInt16);
        check.equal(vertexFieldNumericType(11), UInt16);
        check.equal(vertexFieldNumericType(12), UInt16);
        check.equal(vertexFieldNumericType(14), SInt16);
        check.equal(vertexFieldNumericType(15), SInt16);
        check.equal(vertexFieldNumericType(16), SInt16);
        check.equal(vertexFieldNumericType(17), UInt32);
        check.equal(vertexFieldNumericType(18), UInt32);
        check.equal(vertexFieldNumericType(19), UInt32);
        check.equal(vertexFieldNumericType(20), UInt32);
        check.equal(vertexFieldNumericType(21), SInt32);
        check.equal(vertexFieldNumericType(22), SInt32);
        check.equal(vertexFieldNumericType(23), SInt32);
        check.equal(vertexFieldNumericType(24), SInt32);
        check.equal(vertexFieldNumericType(25), Float);
        check.equal(vertexFieldNumericType(26), Float);
        check.equal(vertexFieldNumericType(27), Float);
        check.equal(vertexFieldNumericType(28), Float);
        check.equal(vertexFieldNumericType(130), UInt8);
        check.equal(vertexFieldNumericType(131), UInt8);
        check.equal(vertexFieldNumericType(132), UInt8);
        check.equal(vertexFieldNumericType(134), SInt8);
        check.equal(vertexFieldNumericType(135), SInt8);
        check.equal(vertexFieldNumericType(136), SInt8);
        check.equal(vertexFieldNumericType(138), UInt16);
        check.equal(vertexFieldNumericType(139), UInt16);
        check.equal(vertexFieldNumericType(140), UInt16);
        check.equal(vertexFieldNumericType(142), SInt16);
        check.equal(vertexFieldNumericType(143), SInt16);
        check.equal(vertexFieldNumericType(144), SInt16);
    });
    test("elementSizeBytes", function () {
        var _a = sd.geometry, VertexField = _a.VertexField, vertexFieldElementSizeBytes = _a.vertexFieldElementSizeBytes;
        check.equal(vertexFieldElementSizeBytes(0), 0);
        check.equal(vertexFieldElementSizeBytes(2), 1);
        check.equal(vertexFieldElementSizeBytes(3), 1);
        check.equal(vertexFieldElementSizeBytes(4), 1);
        check.equal(vertexFieldElementSizeBytes(6), 1);
        check.equal(vertexFieldElementSizeBytes(7), 1);
        check.equal(vertexFieldElementSizeBytes(8), 1);
        check.equal(vertexFieldElementSizeBytes(10), 2);
        check.equal(vertexFieldElementSizeBytes(11), 2);
        check.equal(vertexFieldElementSizeBytes(12), 2);
        check.equal(vertexFieldElementSizeBytes(14), 2);
        check.equal(vertexFieldElementSizeBytes(15), 2);
        check.equal(vertexFieldElementSizeBytes(16), 2);
        check.equal(vertexFieldElementSizeBytes(17), 4);
        check.equal(vertexFieldElementSizeBytes(18), 4);
        check.equal(vertexFieldElementSizeBytes(19), 4);
        check.equal(vertexFieldElementSizeBytes(20), 4);
        check.equal(vertexFieldElementSizeBytes(21), 4);
        check.equal(vertexFieldElementSizeBytes(22), 4);
        check.equal(vertexFieldElementSizeBytes(23), 4);
        check.equal(vertexFieldElementSizeBytes(24), 4);
        check.equal(vertexFieldElementSizeBytes(25), 4);
        check.equal(vertexFieldElementSizeBytes(26), 4);
        check.equal(vertexFieldElementSizeBytes(27), 4);
        check.equal(vertexFieldElementSizeBytes(28), 4);
        check.equal(vertexFieldElementSizeBytes(130), 1);
        check.equal(vertexFieldElementSizeBytes(131), 1);
        check.equal(vertexFieldElementSizeBytes(132), 1);
        check.equal(vertexFieldElementSizeBytes(134), 1);
        check.equal(vertexFieldElementSizeBytes(135), 1);
        check.equal(vertexFieldElementSizeBytes(136), 1);
        check.equal(vertexFieldElementSizeBytes(138), 2);
        check.equal(vertexFieldElementSizeBytes(139), 2);
        check.equal(vertexFieldElementSizeBytes(140), 2);
        check.equal(vertexFieldElementSizeBytes(142), 2);
        check.equal(vertexFieldElementSizeBytes(143), 2);
        check.equal(vertexFieldElementSizeBytes(144), 2);
    });
    test("sizeBytes", function () {
        var _a = sd.geometry, VertexField = _a.VertexField, vertexFieldSizeBytes = _a.vertexFieldSizeBytes;
        check.equal(vertexFieldSizeBytes(0), 0);
        check.equal(vertexFieldSizeBytes(2), 2);
        check.equal(vertexFieldSizeBytes(3), 3);
        check.equal(vertexFieldSizeBytes(4), 4);
        check.equal(vertexFieldSizeBytes(6), 2);
        check.equal(vertexFieldSizeBytes(7), 3);
        check.equal(vertexFieldSizeBytes(8), 4);
        check.equal(vertexFieldSizeBytes(10), 4);
        check.equal(vertexFieldSizeBytes(11), 6);
        check.equal(vertexFieldSizeBytes(12), 8);
        check.equal(vertexFieldSizeBytes(14), 4);
        check.equal(vertexFieldSizeBytes(15), 6);
        check.equal(vertexFieldSizeBytes(16), 8);
        check.equal(vertexFieldSizeBytes(17), 4);
        check.equal(vertexFieldSizeBytes(18), 8);
        check.equal(vertexFieldSizeBytes(19), 12);
        check.equal(vertexFieldSizeBytes(20), 16);
        check.equal(vertexFieldSizeBytes(21), 4);
        check.equal(vertexFieldSizeBytes(22), 8);
        check.equal(vertexFieldSizeBytes(23), 12);
        check.equal(vertexFieldSizeBytes(24), 16);
        check.equal(vertexFieldSizeBytes(25), 4);
        check.equal(vertexFieldSizeBytes(26), 8);
        check.equal(vertexFieldSizeBytes(27), 12);
        check.equal(vertexFieldSizeBytes(28), 16);
        check.equal(vertexFieldSizeBytes(130), 2);
        check.equal(vertexFieldSizeBytes(131), 3);
        check.equal(vertexFieldSizeBytes(132), 4);
        check.equal(vertexFieldSizeBytes(134), 2);
        check.equal(vertexFieldSizeBytes(135), 3);
        check.equal(vertexFieldSizeBytes(136), 4);
        check.equal(vertexFieldSizeBytes(138), 4);
        check.equal(vertexFieldSizeBytes(139), 6);
        check.equal(vertexFieldSizeBytes(140), 8);
        check.equal(vertexFieldSizeBytes(142), 4);
        check.equal(vertexFieldSizeBytes(143), 6);
        check.equal(vertexFieldSizeBytes(144), 8);
    });
    test("isNormalized", function () {
        var _a = sd.geometry, VertexField = _a.VertexField, vertexFieldIsNormalized = _a.vertexFieldIsNormalized;
        check.equal(vertexFieldIsNormalized(0), false);
        check.equal(vertexFieldIsNormalized(2), false);
        check.equal(vertexFieldIsNormalized(3), false);
        check.equal(vertexFieldIsNormalized(4), false);
        check.equal(vertexFieldIsNormalized(6), false);
        check.equal(vertexFieldIsNormalized(7), false);
        check.equal(vertexFieldIsNormalized(8), false);
        check.equal(vertexFieldIsNormalized(10), false);
        check.equal(vertexFieldIsNormalized(11), false);
        check.equal(vertexFieldIsNormalized(12), false);
        check.equal(vertexFieldIsNormalized(14), false);
        check.equal(vertexFieldIsNormalized(15), false);
        check.equal(vertexFieldIsNormalized(16), false);
        check.equal(vertexFieldIsNormalized(17), false);
        check.equal(vertexFieldIsNormalized(18), false);
        check.equal(vertexFieldIsNormalized(19), false);
        check.equal(vertexFieldIsNormalized(20), false);
        check.equal(vertexFieldIsNormalized(21), false);
        check.equal(vertexFieldIsNormalized(22), false);
        check.equal(vertexFieldIsNormalized(23), false);
        check.equal(vertexFieldIsNormalized(24), false);
        check.equal(vertexFieldIsNormalized(25), false);
        check.equal(vertexFieldIsNormalized(26), false);
        check.equal(vertexFieldIsNormalized(27), false);
        check.equal(vertexFieldIsNormalized(28), false);
        check.equal(vertexFieldIsNormalized(130), true);
        check.equal(vertexFieldIsNormalized(131), true);
        check.equal(vertexFieldIsNormalized(132), true);
        check.equal(vertexFieldIsNormalized(134), true);
        check.equal(vertexFieldIsNormalized(135), true);
        check.equal(vertexFieldIsNormalized(136), true);
        check.equal(vertexFieldIsNormalized(138), true);
        check.equal(vertexFieldIsNormalized(139), true);
        check.equal(vertexFieldIsNormalized(140), true);
        check.equal(vertexFieldIsNormalized(142), true);
        check.equal(vertexFieldIsNormalized(143), true);
        check.equal(vertexFieldIsNormalized(144), true);
    });
});
group("geometry", function () {
    group("makeStandardVertexBufferLayout", function () {
        test("throws-on-empty-args-list", function () {
            var makeStandardVertexBufferLayout = sd.geometry.makeStandardVertexBufferLayout;
            check.throws(Error, function () {
                makeStandardVertexBufferLayout([]);
            });
        });
        test("retains-arg-order", function () {
            var _a = sd.geometry, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout;
            var attrs = [
                {
                    field: 25,
                    role: 1
                },
                {
                    field: 26,
                    role: 5
                }
            ];
            var vbl = makeStandardVertexBufferLayout(attrs, 8);
            check.equal(vbl.attributes.length, 2);
            check.structuralEqual(vbl.attributes[0], attrs[0]);
            check.structuralEqual(vbl.attributes[1], attrs[1]);
        });
        test("basics", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, AttrList = _a.AttrList;
            var vbl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3());
            check.equal(vbl.attributes.length, 2);
            check.greater(vbl.stride, 0);
        });
        test("clones-attribute-data", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, AttrList = _a.AttrList, VertexField = _a.VertexField, VertexAttributeRole = _a.VertexAttributeRole;
            var attrs = AttrList.Pos3Norm3();
            var vbl = makeStandardVertexBufferLayout(attrs);
            attrs[0].field = 142;
            attrs[1].role = 14;
            check.equal(vbl.attributes[0].field, 27);
            check.equal(vbl.attributes[1].role, 2);
        });
        test("expected-aligned-layout", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, VertexAttributeRole = _a.VertexAttributeRole, VertexField = _a.VertexField;
            var vl = makeStandardVertexBufferLayout([
                { field: 135, role: 1 },
                { field: 14, role: 6 },
                { field: 26, role: 4 },
                { field: 25, role: 7 }
            ]);
            check.equal(vl.attributes.length, 4, "should have 4 attrs");
            check.equal(vl.attributes[0].offset, 0, "attr 0 at offset 0");
            check.equal(vl.attributes[1].offset, 4, "attr 1 at offset 4");
            check.equal(vl.attributes[2].offset, 8, "attr 2 at offset 8");
            check.equal(vl.attributes[3].offset, 16, "attr 3 at offset 16");
            check.equal(vl.stride, 20, "20-byte stride");
        });
        test("sets-bufferIndex-on-all-attrs", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3Colour3UV2(), 3);
            check.equal(vl.attributes.length, 4);
            check.equal(vl.attributes[0].bufferIndex, 3);
            check.equal(vl.attributes[1].bufferIndex, 3);
            check.equal(vl.attributes[2].bufferIndex, 3);
            check.equal(vl.attributes[3].bufferIndex, 3);
        });
        test("default-bufferIndex-is-0", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3UV2Tan3());
            check.equal(vl.attributes.length, 4);
            check.equal(vl.attributes[0].bufferIndex, 0);
            check.equal(vl.attributes[1].bufferIndex, 0);
            check.equal(vl.attributes[2].bufferIndex, 0);
            check.equal(vl.attributes[3].bufferIndex, 0);
        });
        test("layout-of-float-aligned-attrs", function () {
            var _a = sd.geometry, AttrList = _a.AttrList, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout;
            var vl1 = makeStandardVertexBufferLayout(AttrList.Pos3Norm3Colour3());
            check.equal(vl1.attributes.length, 3);
            check.equal(vl1.stride, 12 + 12 + 12);
            var vl2 = makeStandardVertexBufferLayout(AttrList.Pos3Norm3UV2Tan3(), 1);
            check.equal(vl2.attributes.length, 4);
            check.equal(vl2.stride, 12 + 12 + 8 + 12);
        });
        test("no-implicit-position-or-normal", function () {
            var _a = sd.geometry, makeStandardVertexBufferLayout = _a.makeStandardVertexBufferLayout, VertexAttributeRole = _a.VertexAttributeRole, attrWeightedPos = _a.attrWeightedPos, attrJointIndexes = _a.attrJointIndexes;
            var vl = makeStandardVertexBufferLayout([
                attrWeightedPos(0),
                attrWeightedPos(1),
                attrJointIndexes()
            ]);
            check.equal(vl.hasAttributeWithRole(1), false);
            check.equal(vl.hasAttributeWithRole(2), false);
            check.notPresent(vl.attrByRole(1));
            check.notPresent(vl.attrByRole(2));
        });
    });
    group("VertexBufferLayout", function () {
        var vbl;
        before(function () {
            vbl = sd.geometry.makeStandardVertexBufferLayout(sd.geometry.AttrList.Pos3Norm3Colour3UV2());
        });
        test("bytesRequiredForVertexCount", function () {
            check.equal(vbl.bytesRequiredForVertexCount(0), 0);
            check.equal(vbl.bytesRequiredForVertexCount(1), vbl.stride);
            check.equal(vbl.bytesRequiredForVertexCount(1000), vbl.stride * 1000);
            check.equal(vbl.bytesRequiredForVertexCount(1024 * 1024), vbl.stride * 1024 * 1024);
            check.equal(vbl.bytesRequiredForVertexCount(-1), -vbl.stride);
        });
        test("attrByRole", function () {
            var VertexAttributeRole = sd.geometry.VertexAttributeRole;
            var ap = vbl.attrByRole(1);
            check.present(ap, "should have position");
            check.equal(ap.role, 1);
            var an = vbl.attrByRole(2);
            check.present(an, "should have normal");
            check.equal(an.role, 2);
            var ac = vbl.attrByRole(4);
            check.present(ac, "should have colour");
            check.equal(ac.role, 4);
            var au = vbl.attrByRole(6);
            check.present(au, "should have uv");
            check.equal(au.role, 6);
            check.notPresent(vbl.attrByRole(0));
            check.notPresent(vbl.attrByRole(14));
            check.notPresent(vbl.attrByRole(5));
        });
        test("attrByIndex", function () {
            check.present(vbl.attrByIndex(0), "should have attr 0");
            check.present(vbl.attrByIndex(1), "should have attr 1");
            check.present(vbl.attrByIndex(2), "should have attr 2");
            check.present(vbl.attrByIndex(3), "should have attr 3");
            check.notPresent(vbl.attrByIndex(-1), "should not have attr -1");
            check.notPresent(vbl.attrByIndex(4), "should have attr 4");
            check.notPresent(vbl.attrByIndex(1.5), "should have react to non-integer indexes");
        });
        test("hasAttributeWithRole", function () {
            var VertexAttributeRole = sd.geometry.VertexAttributeRole;
            check.equal(vbl.hasAttributeWithRole(1), true);
            check.equal(vbl.hasAttributeWithRole(2), true);
            check.equal(vbl.hasAttributeWithRole(4), true);
            check.equal(vbl.hasAttributeWithRole(6), true);
            check.equal(vbl.hasAttributeWithRole(0), false);
            check.equal(vbl.hasAttributeWithRole(3), false);
            check.equal(vbl.hasAttributeWithRole(7), false);
            check.equal(vbl.hasAttributeWithRole(10), false);
        });
        test("hasAttributeWithRole-implies-attrByRole-non-null", function () {
            var makeStandardVertexBufferLayout = sd.geometry.makeStandardVertexBufferLayout;
            var _a = sd.geometry, VertexAttributeRole = _a.VertexAttributeRole, attrWeightedPos = _a.attrWeightedPos, attrJointIndexes = _a.attrJointIndexes, attrColour3 = _a.attrColour3;
            var vl = makeStandardVertexBufferLayout([
                attrWeightedPos(0),
                attrWeightedPos(2),
                attrJointIndexes(),
                attrColour3()
            ]);
            check.equal(vl.hasAttributeWithRole(10), true);
            check.equal(vl.hasAttributeWithRole(12), true);
            check.equal(vl.hasAttributeWithRole(14), true);
            check.equal(vl.hasAttributeWithRole(4), true);
            check.present(vl.attrByRole(10));
            check.present(vl.attrByRole(12));
            check.present(vl.attrByRole(14));
            check.present(vl.attrByRole(4));
            check.equal(vl.hasAttributeWithRole(11), false);
            check.equal(vl.hasAttributeWithRole(13), false);
            check.notPresent(vl.attrByRole(11));
            check.notPresent(vl.attrByRole(13));
        });
    });
    group("VertexLayout", function () {
        test("empty-list-allowed", function () {
            var makeStandardVertexLayout = sd.geometry.makeStandardVertexLayout;
            var vl = makeStandardVertexLayout([]);
            check.equal(vl.layouts.length, 0);
        });
    });
    group("makeStandardVertexLayout", function () {
        test("empty-list-yields-empty-layout", function () {
            var makeStandardVertexLayout = sd.geometry.makeStandardVertexLayout;
            var vl = makeStandardVertexLayout([]);
            check.equal(vl.layouts.length, 0);
        });
        test("single-array-yields-1-layout", function () {
            var _a = sd.geometry, makeStandardVertexLayout = _a.makeStandardVertexLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexLayout(AttrList.Pos3Norm3());
            check.equal(vl.layouts.length, 1);
            check.equal(vl.layouts[0].attributes.length, 2);
        });
        test("single-array-is-at-bufferIndex-0", function () {
            var _a = sd.geometry, makeStandardVertexLayout = _a.makeStandardVertexLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexLayout(AttrList.Pos3Norm3Colour3());
            check.equal(vl.layouts.length, 1);
            check.equal(vl.layouts[0].attributes.length, 3);
            check.equal(vl.layouts[0].attributes[0].bufferIndex, 0, "l0a0 buffer 0");
            check.equal(vl.layouts[0].attributes[1].bufferIndex, 0, "l0a1 buffer 0");
            check.equal(vl.layouts[0].attributes[2].bufferIndex, 0, "l0a2 buffer 0");
        });
        test("multiple-arrays-yield-multi-layout", function () {
            var _a = sd.geometry, makeStandardVertexLayout = _a.makeStandardVertexLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexLayout([AttrList.Pos3Norm3(), AttrList.Pos3Norm3UV2Tan3()]);
            check.equal(vl.layouts.length, 2, "2 layouts");
            check.equal(vl.layouts[0].attributes.length, 2, "layout0 2 attrs");
            check.equal(vl.layouts[1].attributes.length, 4, "layout1 4 attrs");
        });
        test("bufferIndexes-line-up-with-layout-array-order", function () {
            var _a = sd.geometry, makeStandardVertexLayout = _a.makeStandardVertexLayout, AttrList = _a.AttrList;
            var vl = makeStandardVertexLayout([
                AttrList.Pos3Norm3(),
                AttrList.Pos3Norm3UV2Tan3(),
                AttrList.Pos3Norm3()
            ]);
            check.equal(vl.layouts.length, 3, "3 layouts");
            check.equal(vl.layouts[0].attributes.length, 2, "layout0 2 attrs");
            check.equal(vl.layouts[1].attributes.length, 4, "layout1 4 attrs");
            check.equal(vl.layouts[2].attributes.length, 2, "layout2 2 attrs");
            check.equal(vl.layouts[0].attributes[0].bufferIndex, 0, "l0a0 buffer 0");
            check.equal(vl.layouts[0].attributes[1].bufferIndex, 0, "l0a1 buffer 0");
            check.equal(vl.layouts[1].attributes[0].bufferIndex, 1, "l1a0 buffer 1");
            check.equal(vl.layouts[1].attributes[1].bufferIndex, 1, "l1a1 buffer 1");
            check.equal(vl.layouts[1].attributes[2].bufferIndex, 1, "l1a2 buffer 1");
            check.equal(vl.layouts[1].attributes[3].bufferIndex, 1, "l1a3 buffer 1");
            check.equal(vl.layouts[2].attributes[0].bufferIndex, 2, "l2a0 buffer 2");
            check.equal(vl.layouts[2].attributes[1].bufferIndex, 2, "l2a1 buffer 2");
        });
    });
});
