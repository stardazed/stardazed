// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("geometry", () => {
	group("makeStandardVertexBufferLayout", () => {
		test("throws-on-empty-args-list", () => {
			const { makeStandardVertexBufferLayout } = sd.geometry;
			check.throws(Error, () => {
				makeStandardVertexBufferLayout([]);
			});
		});

		test("retains-arg-order", () => {
			const { VertexField, VertexAttributeRole, makeStandardVertexBufferLayout } = sd.geometry;

			const attrs: sd.geometry.VertexAttribute[] = [
				{
					field: VertexField.Float,
					role: VertexAttributeRole.Position
				},
				{
					field: VertexField.Floatx2,
					role: VertexAttributeRole.Material
				}
			];

			const vbl = makeStandardVertexBufferLayout(attrs, 8);
			check.equal(vbl.attributes.length, 2);
			check.structuralEqual(vbl.attributes[0], attrs[0]);
			check.structuralEqual(vbl.attributes[1], attrs[1]);
		});

		test("basics", () => {
			const { makeStandardVertexBufferLayout, AttrList } = sd.geometry;
			const vbl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3());
			check.equal(vbl.attributes.length, 2);
			check.greater(vbl.stride, 0);
		});

		test("clones-attribute-data", () => {
			const { makeStandardVertexBufferLayout, AttrList, VertexField, VertexAttributeRole } = sd.geometry;
			const attrs = AttrList.Pos3Norm3();
			const vbl = makeStandardVertexBufferLayout(attrs);

			attrs[0].field = VertexField.Norm_SInt16x2;
			attrs[1].role = VertexAttributeRole.JointIndexes;

			check.equal(vbl.attributes[0].field, VertexField.Floatx3);
			check.equal(vbl.attributes[1].role, VertexAttributeRole.Normal);
		});

		test("expected-aligned-layout", () => {
			const { makeStandardVertexBufferLayout, VertexAttributeRole, VertexField } = sd.geometry;

			const vl = makeStandardVertexBufferLayout([
				{ field: VertexField.Norm_SInt8x3, role: VertexAttributeRole.Position },
				{ field: VertexField.SInt16x2, role: VertexAttributeRole.UV },
				{ field: VertexField.Floatx2, role: VertexAttributeRole.Colour },
				{ field: VertexField.Float, role: VertexAttributeRole.UV1 }
			]);
			check.equal(vl.attributes.length, 4, "should have 4 attrs");

			check.equal(vl.attributes[0].offset, 0, "attr 0 at offset 0");
			check.equal(vl.attributes[1].offset, 4, "attr 1 at offset 4");
			check.equal(vl.attributes[2].offset, 8, "attr 2 at offset 8");
			check.equal(vl.attributes[3].offset, 16, "attr 3 at offset 16");
			check.equal(vl.stride, 20, "20-byte stride");
		});

		test("sets-bufferIndex-on-all-attrs", () => {
			const { makeStandardVertexBufferLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3Colour3UV2(), 3);
			check.equal(vl.attributes.length, 4);
			check.equal(vl.attributes[0].bufferIndex, 3);
			check.equal(vl.attributes[1].bufferIndex, 3);
			check.equal(vl.attributes[2].bufferIndex, 3);
			check.equal(vl.attributes[3].bufferIndex, 3);
		});

		test("default-bufferIndex-is-0", () => {
			const { makeStandardVertexBufferLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3UV2Tan3());
			check.equal(vl.attributes.length, 4);
			check.equal(vl.attributes[0].bufferIndex, 0);
			check.equal(vl.attributes[1].bufferIndex, 0);
			check.equal(vl.attributes[2].bufferIndex, 0);
			check.equal(vl.attributes[3].bufferIndex, 0);
		});

		test("layout-of-float-aligned-attrs", () => {
			const { AttrList, makeStandardVertexBufferLayout } = sd.geometry;

			const vl1 = makeStandardVertexBufferLayout(AttrList.Pos3Norm3Colour3());
			check.equal(vl1.attributes.length, 3);
			check.equal(vl1.stride, 12 + 12 + 12);

			const vl2 = makeStandardVertexBufferLayout(AttrList.Pos3Norm3UV2Tan3(), 1);
			check.equal(vl2.attributes.length, 4);
			check.equal(vl2.stride, 12 + 12 + 8 + 12);
		});

		test("no-implicit-position-or-normal", () => {
			const { makeStandardVertexBufferLayout, VertexAttributeRole, attrWeightedPos, attrJointIndexes } = sd.geometry;
			const vl = makeStandardVertexBufferLayout([
				attrWeightedPos(0),
				attrWeightedPos(1),
				attrJointIndexes()
			]);

			check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Position), false);
			check.equal(vl.hasAttributeWithRole(VertexAttributeRole.Normal), false);

			check.notPresent(vl.attrByRole(VertexAttributeRole.Position));
			check.notPresent(vl.attrByRole(VertexAttributeRole.Normal));
		});
	});

	group("VertexBufferLayout", () => {
		let vbl: sd.geometry.VertexBufferLayout;

		before(() => {
			vbl = sd.geometry.makeStandardVertexBufferLayout(sd.geometry.AttrList.Pos3Norm3Colour3UV2());
		});

		test("bytesRequiredForVertexCount", () => {
			check.equal(vbl.bytesRequiredForVertexCount(0), 0);
			check.equal(vbl.bytesRequiredForVertexCount(1), vbl.stride);
			check.equal(vbl.bytesRequiredForVertexCount(1000), vbl.stride * 1000);
			check.equal(vbl.bytesRequiredForVertexCount(1024 * 1024), vbl.stride * 1024 * 1024);

			// does not check for negative counts yet
			check.equal(vbl.bytesRequiredForVertexCount(-1), -vbl.stride);
		});

		test("attrByRole", () => {
			const { VertexAttributeRole } = sd.geometry;
			const ap = vbl.attrByRole(VertexAttributeRole.Position);
			check.present(ap, "should have position");
			check.equal(ap!.role, VertexAttributeRole.Position);

			const an = vbl.attrByRole(VertexAttributeRole.Normal);
			check.present(an, "should have normal");
			check.equal(an!.role, VertexAttributeRole.Normal);

			const ac = vbl.attrByRole(VertexAttributeRole.Colour);
			check.present(ac, "should have colour");
			check.equal(ac!.role, VertexAttributeRole.Colour);

			const au = vbl.attrByRole(VertexAttributeRole.UV);
			check.present(au, "should have uv");
			check.equal(au!.role, VertexAttributeRole.UV);

			check.notPresent(vbl.attrByRole(VertexAttributeRole.None));
			check.notPresent(vbl.attrByRole(VertexAttributeRole.JointIndexes));
			check.notPresent(vbl.attrByRole(VertexAttributeRole.Material));
		});

		test("attrByIndex", () => {
			check.present(vbl.attrByIndex(0), "should have attr 0");
			check.present(vbl.attrByIndex(1), "should have attr 1");
			check.present(vbl.attrByIndex(2), "should have attr 2");
			check.present(vbl.attrByIndex(3), "should have attr 3");

			check.notPresent(vbl.attrByIndex(-1), "should not have attr -1");
			check.notPresent(vbl.attrByIndex(4), "should have attr 4");
			check.notPresent(vbl.attrByIndex(1.5), "should have react to non-integer indexes");
		});

		test("hasAttributeWithRole", () => {
			const { VertexAttributeRole } = sd.geometry;

			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.Position), true);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.Normal), true);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.Colour), true);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.UV), true);

			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.None), false);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.Tangent), false);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.UV1), false);
			check.equal(vbl.hasAttributeWithRole(VertexAttributeRole.WeightedPos0), false);
		});

		test("hasAttributeWithRole-implies-attrByRole-non-null", () => {
			// use different layout for this test
			const { makeStandardVertexBufferLayout } = sd.geometry;
			const { VertexAttributeRole, attrWeightedPos, attrJointIndexes, attrColour3 } = sd.geometry;
			const vl = makeStandardVertexBufferLayout([
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
	});

	group("VertexLayout", () => {
		test("empty-list-allowed", () => {
			const { VertexLayout } = sd.geometry;
			const vl = new VertexLayout([]);
			check.equal(vl.layouts.length, 0);
		});
		test("clones-layouts-array", () => {
			const { VertexLayout, makeStandardVertexBufferLayout, AttrList } = sd.geometry;
			const vbl = makeStandardVertexBufferLayout(AttrList.Pos3Norm3());
			const layouts = [vbl];
			const vl = new VertexLayout(layouts);
			layouts.push(makeStandardVertexBufferLayout(AttrList.Pos3Norm3Colour3()));

			check.equal(vl.layouts.length, 1);
		});
		test("has-correct-render-resource-type", () => {
			const { VertexLayout } = sd.geometry;
			const vl = new VertexLayout([]);
			check.equal(vl.renderResourceType, sd.render.ResourceType.VertexLayout);
		});
	});

	group("makeStandardVertexLayout", () => {
		test("empty-list-yields-empty-layout", () => {
			const { makeStandardVertexLayout } = sd.geometry;

			const vl = makeStandardVertexLayout([]);
			check.equal(vl.layouts.length, 0);
		});

		test("single-array-yields-1-layout", () => {
			const { makeStandardVertexLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexLayout(AttrList.Pos3Norm3());
			check.equal(vl.layouts.length, 1);
			check.equal(vl.layouts[0].attributes.length, 2);
		});

		test("single-array-is-at-bufferIndex-0", () => {
			const { makeStandardVertexLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexLayout(AttrList.Pos3Norm3Colour3());
			check.equal(vl.layouts.length, 1);
			check.equal(vl.layouts[0].attributes.length, 3);
			check.equal(vl.layouts[0].attributes[0].bufferIndex, 0, "l0a0 buffer 0");
			check.equal(vl.layouts[0].attributes[1].bufferIndex, 0, "l0a1 buffer 0");
			check.equal(vl.layouts[0].attributes[2].bufferIndex, 0, "l0a2 buffer 0");
		});

		test("multiple-arrays-yield-multi-layout", () => {
			const { makeStandardVertexLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexLayout([AttrList.Pos3Norm3(), AttrList.Pos3Norm3UV2Tan3()]);
			check.equal(vl.layouts.length, 2, "2 layouts");
			check.equal(vl.layouts[0].attributes.length, 2, "layout0 2 attrs");
			check.equal(vl.layouts[1].attributes.length, 4, "layout1 4 attrs");
		});

		test("bufferIndexes-line-up-with-layout-array-order", () => {
			const { makeStandardVertexLayout, AttrList } = sd.geometry;

			const vl = makeStandardVertexLayout([
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
