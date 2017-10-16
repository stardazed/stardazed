// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("geometry.VertexField", () => {
	test("elementCount", () => {
		const { VertexField, vertexFieldElementCount } = sd.geometry;

		check.equal(vertexFieldElementCount(VertexField.Undefined), 0);

		check.equal(vertexFieldElementCount(VertexField.UInt8x2), 2);
		check.equal(vertexFieldElementCount(VertexField.UInt8x3), 3);
		check.equal(vertexFieldElementCount(VertexField.UInt8x4), 4);

		check.equal(vertexFieldElementCount(VertexField.SInt8x2), 2);
		check.equal(vertexFieldElementCount(VertexField.SInt8x3), 3);
		check.equal(vertexFieldElementCount(VertexField.SInt8x4), 4);

		check.equal(vertexFieldElementCount(VertexField.UInt16x2), 2);
		check.equal(vertexFieldElementCount(VertexField.UInt16x3), 3);
		check.equal(vertexFieldElementCount(VertexField.UInt16x4), 4);

		check.equal(vertexFieldElementCount(VertexField.SInt16x2), 2);
		check.equal(vertexFieldElementCount(VertexField.SInt16x3), 3);
		check.equal(vertexFieldElementCount(VertexField.SInt16x4), 4);

		check.equal(vertexFieldElementCount(VertexField.UInt32), 1);
		check.equal(vertexFieldElementCount(VertexField.UInt32x2), 2);
		check.equal(vertexFieldElementCount(VertexField.UInt32x3), 3);
		check.equal(vertexFieldElementCount(VertexField.UInt32x4), 4);

		check.equal(vertexFieldElementCount(VertexField.SInt32), 1);
		check.equal(vertexFieldElementCount(VertexField.SInt32x2), 2);
		check.equal(vertexFieldElementCount(VertexField.SInt32x3), 3);
		check.equal(vertexFieldElementCount(VertexField.SInt32x4), 4);

		check.equal(vertexFieldElementCount(VertexField.Float), 1);
		check.equal(vertexFieldElementCount(VertexField.Floatx2), 2);
		check.equal(vertexFieldElementCount(VertexField.Floatx3), 3);
		check.equal(vertexFieldElementCount(VertexField.Floatx4), 4);

		check.equal(vertexFieldElementCount(VertexField.Norm_UInt8x2), 2);
		check.equal(vertexFieldElementCount(VertexField.Norm_UInt8x3), 3);
		check.equal(vertexFieldElementCount(VertexField.Norm_UInt8x4), 4);

		check.equal(vertexFieldElementCount(VertexField.Norm_SInt8x2), 2);
		check.equal(vertexFieldElementCount(VertexField.Norm_SInt8x3), 3);
		check.equal(vertexFieldElementCount(VertexField.Norm_SInt8x4), 4);

		check.equal(vertexFieldElementCount(VertexField.Norm_UInt16x2), 2);
		check.equal(vertexFieldElementCount(VertexField.Norm_UInt16x3), 3);
		check.equal(vertexFieldElementCount(VertexField.Norm_UInt16x4), 4);

		check.equal(vertexFieldElementCount(VertexField.Norm_SInt16x2), 2);
		check.equal(vertexFieldElementCount(VertexField.Norm_SInt16x3), 3);
		check.equal(vertexFieldElementCount(VertexField.Norm_SInt16x4), 4);
	});

	test("numericType", () => {
		const { VertexField, vertexFieldNumericType } = sd.geometry;
		const { Float, UInt32, UInt16, UInt8, SInt32, SInt16, SInt8 } = sd;

		check.equal(vertexFieldNumericType(VertexField.Undefined), null);

		check.equal(vertexFieldNumericType(VertexField.UInt8x2), UInt8);
		check.equal(vertexFieldNumericType(VertexField.UInt8x3), UInt8);
		check.equal(vertexFieldNumericType(VertexField.UInt8x4), UInt8);

		check.equal(vertexFieldNumericType(VertexField.SInt8x2), SInt8);
		check.equal(vertexFieldNumericType(VertexField.SInt8x3), SInt8);
		check.equal(vertexFieldNumericType(VertexField.SInt8x4), SInt8);

		check.equal(vertexFieldNumericType(VertexField.UInt16x2), UInt16);
		check.equal(vertexFieldNumericType(VertexField.UInt16x3), UInt16);
		check.equal(vertexFieldNumericType(VertexField.UInt16x4), UInt16);

		check.equal(vertexFieldNumericType(VertexField.SInt16x2), SInt16);
		check.equal(vertexFieldNumericType(VertexField.SInt16x3), SInt16);
		check.equal(vertexFieldNumericType(VertexField.SInt16x4), SInt16);

		check.equal(vertexFieldNumericType(VertexField.UInt32), UInt32);
		check.equal(vertexFieldNumericType(VertexField.UInt32x2), UInt32);
		check.equal(vertexFieldNumericType(VertexField.UInt32x3), UInt32);
		check.equal(vertexFieldNumericType(VertexField.UInt32x4), UInt32);

		check.equal(vertexFieldNumericType(VertexField.SInt32), SInt32);
		check.equal(vertexFieldNumericType(VertexField.SInt32x2), SInt32);
		check.equal(vertexFieldNumericType(VertexField.SInt32x3), SInt32);
		check.equal(vertexFieldNumericType(VertexField.SInt32x4), SInt32);

		check.equal(vertexFieldNumericType(VertexField.Float), Float);
		check.equal(vertexFieldNumericType(VertexField.Floatx2), Float);
		check.equal(vertexFieldNumericType(VertexField.Floatx3), Float);
		check.equal(vertexFieldNumericType(VertexField.Floatx4), Float);

		check.equal(vertexFieldNumericType(VertexField.Norm_UInt8x2), UInt8);
		check.equal(vertexFieldNumericType(VertexField.Norm_UInt8x3), UInt8);
		check.equal(vertexFieldNumericType(VertexField.Norm_UInt8x4), UInt8);

		check.equal(vertexFieldNumericType(VertexField.Norm_SInt8x2), SInt8);
		check.equal(vertexFieldNumericType(VertexField.Norm_SInt8x3), SInt8);
		check.equal(vertexFieldNumericType(VertexField.Norm_SInt8x4), SInt8);

		check.equal(vertexFieldNumericType(VertexField.Norm_UInt16x2), UInt16);
		check.equal(vertexFieldNumericType(VertexField.Norm_UInt16x3), UInt16);
		check.equal(vertexFieldNumericType(VertexField.Norm_UInt16x4), UInt16);

		check.equal(vertexFieldNumericType(VertexField.Norm_SInt16x2), SInt16);
		check.equal(vertexFieldNumericType(VertexField.Norm_SInt16x3), SInt16);
		check.equal(vertexFieldNumericType(VertexField.Norm_SInt16x4), SInt16);
	});

	test("elementSizeBytes", () => {
		const { VertexField, vertexFieldElementSizeBytes } = sd.geometry;

		check.equal(vertexFieldElementSizeBytes(VertexField.Undefined), 0);

		check.equal(vertexFieldElementSizeBytes(VertexField.UInt8x2), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt8x3), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt8x4), 1);

		check.equal(vertexFieldElementSizeBytes(VertexField.SInt8x2), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt8x3), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt8x4), 1);

		check.equal(vertexFieldElementSizeBytes(VertexField.UInt16x2), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt16x3), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt16x4), 2);

		check.equal(vertexFieldElementSizeBytes(VertexField.SInt16x2), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt16x3), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt16x4), 2);

		check.equal(vertexFieldElementSizeBytes(VertexField.UInt32), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt32x2), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt32x3), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.UInt32x4), 4);

		check.equal(vertexFieldElementSizeBytes(VertexField.SInt32), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt32x2), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt32x3), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.SInt32x4), 4);

		check.equal(vertexFieldElementSizeBytes(VertexField.Float), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.Floatx2), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.Floatx3), 4);
		check.equal(vertexFieldElementSizeBytes(VertexField.Floatx4), 4);

		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt8x2), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt8x3), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt8x4), 1);

		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt8x2), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt8x3), 1);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt8x4), 1);

		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt16x2), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt16x3), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_UInt16x4), 2);

		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt16x2), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt16x3), 2);
		check.equal(vertexFieldElementSizeBytes(VertexField.Norm_SInt16x4), 2);
	});

	test("sizeBytes", () => {
		const { VertexField, vertexFieldSizeBytes } = sd.geometry;

		check.equal(vertexFieldSizeBytes(VertexField.Undefined), 0);

		check.equal(vertexFieldSizeBytes(VertexField.UInt8x2), 2);
		check.equal(vertexFieldSizeBytes(VertexField.UInt8x3), 3);
		check.equal(vertexFieldSizeBytes(VertexField.UInt8x4), 4);

		check.equal(vertexFieldSizeBytes(VertexField.SInt8x2), 2);
		check.equal(vertexFieldSizeBytes(VertexField.SInt8x3), 3);
		check.equal(vertexFieldSizeBytes(VertexField.SInt8x4), 4);

		check.equal(vertexFieldSizeBytes(VertexField.UInt16x2), 4);
		check.equal(vertexFieldSizeBytes(VertexField.UInt16x3), 6);
		check.equal(vertexFieldSizeBytes(VertexField.UInt16x4), 8);

		check.equal(vertexFieldSizeBytes(VertexField.SInt16x2), 4);
		check.equal(vertexFieldSizeBytes(VertexField.SInt16x3), 6);
		check.equal(vertexFieldSizeBytes(VertexField.SInt16x4), 8);

		check.equal(vertexFieldSizeBytes(VertexField.UInt32), 4);
		check.equal(vertexFieldSizeBytes(VertexField.UInt32x2), 8);
		check.equal(vertexFieldSizeBytes(VertexField.UInt32x3), 12);
		check.equal(vertexFieldSizeBytes(VertexField.UInt32x4), 16);

		check.equal(vertexFieldSizeBytes(VertexField.SInt32), 4);
		check.equal(vertexFieldSizeBytes(VertexField.SInt32x2), 8);
		check.equal(vertexFieldSizeBytes(VertexField.SInt32x3), 12);
		check.equal(vertexFieldSizeBytes(VertexField.SInt32x4), 16);

		check.equal(vertexFieldSizeBytes(VertexField.Float), 4);
		check.equal(vertexFieldSizeBytes(VertexField.Floatx2), 8);
		check.equal(vertexFieldSizeBytes(VertexField.Floatx3), 12);
		check.equal(vertexFieldSizeBytes(VertexField.Floatx4), 16);

		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt8x2), 2);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt8x3), 3);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt8x4), 4);

		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt8x2), 2);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt8x3), 3);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt8x4), 4);

		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt16x2), 4);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt16x3), 6);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_UInt16x4), 8);

		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt16x2), 4);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt16x3), 6);
		check.equal(vertexFieldSizeBytes(VertexField.Norm_SInt16x4), 8);
	});

	test("isNormalized", () => {
		const { VertexField, vertexFieldIsNormalized } = sd.geometry;

		check.equal(vertexFieldIsNormalized(VertexField.Undefined), false);

		check.equal(vertexFieldIsNormalized(VertexField.UInt8x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt8x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt8x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.SInt8x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt8x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt8x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.UInt16x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt16x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt16x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.SInt16x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt16x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt16x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.UInt32), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt32x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt32x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.UInt32x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.SInt32), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt32x2), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt32x3), false);
		check.equal(vertexFieldIsNormalized(VertexField.SInt32x4), false);

		check.equal(vertexFieldIsNormalized(VertexField.Float), false);
		check.equal(vertexFieldIsNormalized(VertexField.Floatx2), false);
		check.equal(vertexFieldIsNormalized(VertexField.Floatx3), false);
		check.equal(vertexFieldIsNormalized(VertexField.Floatx4), false);

		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt8x2), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt8x3), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt8x4), true);

		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt8x2), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt8x3), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt8x4), true);

		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt16x2), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt16x3), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_UInt16x4), true);

		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt16x2), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt16x3), true);
		check.equal(vertexFieldIsNormalized(VertexField.Norm_SInt16x4), true);
	});
});
