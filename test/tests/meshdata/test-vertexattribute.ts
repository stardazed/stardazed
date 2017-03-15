// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("meshdata.VertexAttribute", () => {
	group("attr-helpers", () => {
		test("attrPosition2", () => {
			const { VertexField, VertexAttributeRole, attrPosition2 } = sd.meshdata;
			const attr = attrPosition2();
			check.equal(attr.field, VertexField.Floatx2);
			check.equal(attr.role, VertexAttributeRole.Position);
		});
		test("attrPosition3", () => {
			const { VertexField, VertexAttributeRole, attrPosition3 } = sd.meshdata;
			const attr = attrPosition3();
			check.equal(attr.field, VertexField.Floatx3);
			check.equal(attr.role, VertexAttributeRole.Position);
		});
		test("attrNormal3", () => {
			const { VertexField, VertexAttributeRole, attrNormal3 } = sd.meshdata;
			const attr = attrNormal3();
			check.equal(attr.field, VertexField.Floatx3);
			check.equal(attr.role, VertexAttributeRole.Normal);
		});
		test("attrColour3", () => {
			const { VertexField, VertexAttributeRole, attrColour3 } = sd.meshdata;
			const attr = attrColour3();
			check.equal(attr.field, VertexField.Floatx3);
			check.equal(attr.role, VertexAttributeRole.Colour);
		});
		test("attrUV2", () => {
			const { VertexField, VertexAttributeRole, attrUV2 } = sd.meshdata;
			const attr = attrUV2();
			check.equal(attr.field, VertexField.Floatx2);
			check.equal(attr.role, VertexAttributeRole.UV);
			check.equal(attr.role, VertexAttributeRole.UV0); // UV0 must eq UV
		});
		test("attrTangent3", () => {
			const { VertexField, VertexAttributeRole, attrTangent3 } = sd.meshdata;
			const attr = attrTangent3();
			check.equal(attr.field, VertexField.Floatx3);
			check.equal(attr.role, VertexAttributeRole.Tangent);
		});
		test("attrJointIndexes", () => {
			const { VertexField, VertexAttributeRole, attrJointIndexes } = sd.meshdata;
			const attr = attrJointIndexes();
			check.equal(attr.field, VertexField.SInt32x4);
			check.equal(attr.role, VertexAttributeRole.JointIndexes);
		});
		test("attrWeightedPos-good", () => {
			const { VertexField, VertexAttributeRole, attrWeightedPos } = sd.meshdata;
			const attr0 = attrWeightedPos(0);
			check.equal(attr0.field, VertexField.Floatx4);
			check.equal(attr0.role, VertexAttributeRole.WeightedPos0);
			const attr1 = attrWeightedPos(1);
			check.equal(attr1.field, VertexField.Floatx4);
			check.equal(attr1.role, VertexAttributeRole.WeightedPos1);
			const attr2 = attrWeightedPos(2);
			check.equal(attr2.field, VertexField.Floatx4);
			check.equal(attr2.role, VertexAttributeRole.WeightedPos2);
			const attr3 = attrWeightedPos(3);
			check.equal(attr3.field, VertexField.Floatx4);
			check.equal(attr3.role, VertexAttributeRole.WeightedPos3);
		});
		test("attrWeightedPos-outOfRange", () => {
			const { attrWeightedPos } = sd.meshdata;
			check.throws(Error, () => {
				attrWeightedPos(-1);
			});
			check.throws(Error, () => {
				attrWeightedPos(4);
			});
		});
	});

	group("AttrList", () => {
		test("Pos3Norm3", () => {
			const { VertexField, VertexAttributeRole } = sd.meshdata;
			const { Pos3Norm3 } = sd.meshdata.AttrList;
			const attrs = Pos3Norm3();
			check.truthy(Array.isArray(attrs));
			check.equal(attrs.length, 2);

			check.structuralEqual(attrs[0], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Position
			});
			check.structuralEqual(attrs[1], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Normal
			});
		});
		test("Pos3Norm3Colour3", () => {
			const { VertexField, VertexAttributeRole } = sd.meshdata;
			const { Pos3Norm3Colour3 } = sd.meshdata.AttrList;
			const attrs = Pos3Norm3Colour3();
			check.truthy(Array.isArray(attrs));
			check.equal(attrs.length, 3);

			check.structuralEqual(attrs[0], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Position
			});
			check.structuralEqual(attrs[1], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Normal
			});
			check.structuralEqual(attrs[2], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Colour
			});
		});
		test("Pos3Norm3UV2", () => {
			const { Pos3Norm3UV2 } = sd.meshdata.AttrList;
			const attrs = Pos3Norm3UV2();
			check.truthy(Array.isArray(attrs));
			check.equal(attrs.length, 3);

			check.structuralEqual(attrs[0], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Position
			});
			check.structuralEqual(attrs[1], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Normal
			});
			check.structuralEqual(attrs[2], {
				field: VertexField.Floatx2,
				role: VertexAttributeRole.UV
			});
		});
		test("Pos3Norm3Colour3UV2", () => {
			const { VertexField, VertexAttributeRole } = sd.meshdata;
			const { Pos3Norm3Colour3UV2 } = sd.meshdata.AttrList;
			const attrs = Pos3Norm3Colour3UV2();
			check.truthy(Array.isArray(attrs));
			check.equal(attrs.length, 4);

			check.structuralEqual(attrs[0], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Position
			});
			check.structuralEqual(attrs[1], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Normal
			});
			check.structuralEqual(attrs[2], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Colour
			});
			check.structuralEqual(attrs[3], {
				field: VertexField.Floatx2,
				role: VertexAttributeRole.UV
			});
		});
		test("Pos3Norm3UV2Tan3", () => {
			const { VertexField, VertexAttributeRole } = sd.meshdata;
			const { Pos3Norm3UV2Tan3 } = sd.meshdata.AttrList;
			const attrs = Pos3Norm3UV2Tan3();
			check.truthy(Array.isArray(attrs));
			check.equal(attrs.length, 4);

			check.structuralEqual(attrs[0], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Position
			});
			check.structuralEqual(attrs[1], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Normal
			});
			check.structuralEqual(attrs[2], {
				field: VertexField.Floatx2,
				role: VertexAttributeRole.UV
			});
			check.structuralEqual(attrs[3], {
				field: VertexField.Floatx3,
				role: VertexAttributeRole.Tangent
			});
		});
	});
});
			const { VertexField, VertexAttributeRole } = sd.meshdata;
