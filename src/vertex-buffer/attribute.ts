/*
vertex-buffer/attribute - vertex attribute roles, fields and utils
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { VertexField } from "./field";

/**
 * The role of a vertex attribute indicates usage purpose
 * and is used for shader attribute mapping.
 */
export const enum VertexAttributeRole {
	None,

	// standard attributes
	Position,
	Normal,
	Tangent,
	Colour,
	Material,

	// UV sets
	UV,
	UV0 = UV,
	UV1,
	UV2,
	UV3,

	// skinned geometry
	WeightedPos0, WeightedPos1, WeightedPos2, WeightedPos3,
	JointIndexes
}

/**
 * A VertexAttribute is a Field with a certain Role inside a VertexBuffer
 */
export interface VertexAttribute {
	field: VertexField;
	role: VertexAttributeRole;
}

export function isVertexAttribute(va: any): va is VertexAttribute {
	return typeof va === "object" && va !== null &&
		typeof va.field === "number" && typeof va.role === "number";
}

// -- VertexAttribute shortcuts for common types

export function makeAttrPos2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.Position }; }
export function makeAttrPos3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Position }; }
export function makeAttrNormal3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Normal }; }
export function makeAttrColour3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Colour }; }
export function makeAttrUV2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.UV }; }
export function makeAttrTangent3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Tangent }; }
export function makeAttrJointIndexes(): VertexAttribute { return { field: VertexField.SInt32x4, role: VertexAttributeRole.JointIndexes }; }

/**
 * @expects index >= 0 && index < 4
 */
export function attrWeightedPos(index: number) {
	return { field: VertexField.Floatx4, role: VertexAttributeRole.WeightedPos0 + index };
}

/**
 * Common AttributeList shortcuts
 */
export namespace AttrList {
	export function Pos3Norm3() {
		return [makeAttrPos3(), makeAttrNormal3()];
	}
	export function Pos3Norm3Colour3() {
		return [makeAttrPos3(), makeAttrNormal3(), makeAttrColour3()];
	}
	export function Pos3Norm3UV2() {
		return [makeAttrPos3(), makeAttrNormal3(), makeAttrUV2()];
	}
	export function Pos3Norm3Colour3UV2() {
		return [makeAttrPos3(), makeAttrNormal3(), makeAttrColour3(), makeAttrUV2()];
	}
	export function Pos3Norm3UV2Tan3() {
		return [makeAttrPos3(), makeAttrNormal3(), makeAttrUV2(), makeAttrTangent3()];
	}
}
