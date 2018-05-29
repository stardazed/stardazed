/**
 * geometry/vertex-attribute - vertex buffer attributes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { VertexField } from "./vertex-field";

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

export function isVertexAttribute(va: object): va is VertexAttribute {
	return typeof (va as any).field === "number" && typeof (va as any).role === "number";
}