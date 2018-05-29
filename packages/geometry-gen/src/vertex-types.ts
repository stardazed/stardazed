import { assert } from "@stardazed/core";
import { VertexAttribute, VertexField, VertexAttributeRole } from "@stardazed/geometry";

// -- VertexAttribute shortcuts for common types

export function attrPosition2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.Position }; }
export function attrPosition3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Position }; }
export function attrNormal3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Normal }; }
export function attrColour3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Colour }; }
export function attrUV2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.UV }; }
export function attrTangent3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Tangent }; }

export function attrJointIndexes(): VertexAttribute { return { field: VertexField.SInt32x4, role: VertexAttributeRole.JointIndexes }; }
export function attrWeightedPos(index: number) {
	assert(index >= 0 && index < 4);
	return { field: VertexField.Floatx4, role: VertexAttributeRole.WeightedPos0 + index };
}


// -- Common AttributeList shortcuts

export namespace AttrList {
	export function Pos3Norm3(): VertexAttribute[] {
		return [attrPosition3(), attrNormal3()];
	}
	export function Pos3Norm3Colour3() {
		return [attrPosition3(), attrNormal3(), attrColour3()];
	}
	export function Pos3Norm3UV2(): VertexAttribute[] {
		return [attrPosition3(), attrNormal3(), attrUV2()];
	}
	export function Pos3Norm3Colour3UV2() {
		return [attrPosition3(), attrNormal3(), attrColour3(), attrUV2()];
	}
	export function Pos3Norm3UV2Tan3(): VertexAttribute[] {
		return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent3()];
	}
}
