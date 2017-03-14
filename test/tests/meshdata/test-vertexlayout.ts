// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("meshdata.VertexLayout", () => {
	const { VertexField, AttrList, VertexLayout } = sd.meshdata;

	test("construct-with-empty-array", () => {
		const vl = new VertexLayout([]);
		check.equal(vl.attributeCount, 0);
		check.equal(vl.vertexSizeBytes, 0);
	});
	test("construct-with-std-attrs", () => {
		let vl = new VertexLayout(AttrList.Pos3Norm3Colour3());
		check.equal(vl.attributeCount, 3);
		check.equal(vl.vertexSizeBytes, 12 + 12 + 12);

		vl = new VertexLayout(AttrList.Pos3Norm3UV2Tan3());
		check.equal(vl.attributeCount, 4);
		check.equal(vl.vertexSizeBytes, 12 + 12 + 8 + 12);
	});

	test("bytesRequiredForVertexCount", () => {
		const vl = new VertexLayout(AttrList.Pos3Norm3Colour3());
		check.equal(vl.bytesRequiredForVertexCount(0), 0);
		check.equal(vl.bytesRequiredForVertexCount(1), vl.vertexSizeBytes);
		check.equal(vl.bytesRequiredForVertexCount(1000), vl.vertexSizeBytes * 1000);
		check.equal(vl.bytesRequiredForVertexCount(1024 * 1024), vl.vertexSizeBytes * 1024 * 1024);

		// does not check for negative counts yet
		check.equal(vl.bytesRequiredForVertexCount(-1), -vl.vertexSizeBytes);
	});

	test("attrByRole", () => {
		const { VertexAttributeRole } = sd.meshdata;
		const vl = new VertexLayout(AttrList.Pos3Norm3Colour3());

		const ap = vl.attrByRole(VertexAttributeRole.Position);
		check.present(ap);
		check.equal(ap!.role, VertexAttributeRole.Position);

		const an = vl.attrByRole(VertexAttributeRole.Normal);
		check.present(an);
		check.equal(an!.role, VertexAttributeRole.Normal);

		const ac = vl.attrByRole(VertexAttributeRole.Colour);
		check.present(ac);
		check.equal(ac!.role, VertexAttributeRole.Colour);

		check.notPresent(vl.attrByRole(VertexAttributeRole.None));
		check.notPresent(vl.attrByRole(VertexAttributeRole.UV));
		check.notPresent(vl.attrByRole(VertexAttributeRole.JointIndexes));
	});

	test("attrByIndex", () => {
		const vl = new VertexLayout(AttrList.Pos3Norm3UV2());
		check.present(vl.attrByIndex(0));
		check.present(vl.attrByIndex(1));
		check.present(vl.attrByIndex(2));

		check.notPresent(vl.attrByIndex(-1));
		check.notPresent(vl.attrByIndex(3));
		check.notPresent(vl.attrByIndex(1.5));
	});

	test("hasAttributeWithRole", () => {
		const { VertexAttributeRole } = sd.meshdata;
		const vl = new VertexLayout(AttrList.Pos3Norm3UV2());

		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Position), true);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Normal), true);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.UV), true);

		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Tangent), false);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Colour), false);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.UV1), false);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.WeightedPos0), false);
	});

	test("hasAttributeWithRole-implies-attrByRole-non-null", () => {
		const { VertexAttributeRole, attrWeightedPos, attrJointIndexes, attrColour3 } = sd.meshdata;
		const vl = new VertexLayout([
			attrWeightedPos(0),
			attrWeightedPos(2),
			attrJointIndexes(),
			attrColour3()
		]);

		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.WeightedPos0), true);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.WeightedPos2), true);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.JointIndexes), true);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Colour), true);

		check.present(vl.attrByRole(VertexAttributeRole.WeightedPos0));
		check.present(vl.attrByRole(VertexAttributeRole.WeightedPos2));
		check.present(vl.attrByRole(VertexAttributeRole.JointIndexes));
		check.present(vl.attrByRole(VertexAttributeRole.Colour));

		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.WeightedPos1), false);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.WeightedPos3), false);
		check.notPresent(vl.attrByRole(VertexAttributeRole.WeightedPos1));
		check.notPresent(vl.attrByRole(VertexAttributeRole.WeightedPos3));
	});

	test("no-implicit-position-or-normal", () => {
		const { VertexAttributeRole, attrWeightedPos, attrJointIndexes } = sd.meshdata;
		const vl = new VertexLayout([
			attrWeightedPos(0),
			attrWeightedPos(1),
			attrJointIndexes()
		]);

		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Position), false);
		check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Normal), false);

		check.notPresent(vl.attrByRole(VertexAttributeRole.Position));
		check.notPresent(vl.attrByRole(VertexAttributeRole.Normal));
	});

	test("ordered-and-aligned-layout", () => {
		const { VertexAttributeRole, vertexFieldSizeBytes } = sd.meshdata;
		const vl = new VertexLayout([
			{ field: VertexField.Norm_SInt8x3, role: VertexAttributeRole.Position },
			{ field: VertexField.SInt16x2, role: VertexAttributeRole.UV },
			{ field: VertexField.Floatx2, role: VertexAttributeRole.Colour },
			{ field: VertexField.Float, role: VertexAttributeRole.UV1 }
		]);
		check.equal(vl.attributeCount, 4);

		let prevOffset = 0;
		let prevSize = 0;
		const pattr0 = vl.attrByIndex(0)!;
		check.equal(pattr0.offset, 0, "expect first attr to be at offset 0");

		for (let ai = 1; ai < 4; ++ai) {
			const pattr = vl.attrByIndex(ai)!;
			check.greater(pattr.offset, prevOffset);
			check.greaterEqual(pattr.offset - prevOffset, prevSize, "expect minimum distance to be field size");

			prevSize = vertexFieldSizeBytes(pattr.field);
			prevOffset = pattr.offset;
		}

		check.greaterEqual(vl.vertexSizeBytes, prevOffset + prevSize, "full vertex minimum size of all aligned field");
	});
});
