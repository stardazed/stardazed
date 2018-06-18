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
export declare const enum VertexAttributeRole {
    None = 0,
    Position = 1,
    Normal = 2,
    Tangent = 3,
    Colour = 4,
    Material = 5,
    UV = 6,
    UV0 = 6,
    UV1 = 7,
    UV2 = 8,
    UV3 = 9,
    WeightedPos0 = 10,
    WeightedPos1 = 11,
    WeightedPos2 = 12,
    WeightedPos3 = 13,
    JointIndexes = 14
}
/**
 * A VertexAttribute is a Field with a certain Role inside a VertexBuffer
 */
export interface VertexAttribute {
    field: VertexField;
    role: VertexAttributeRole;
}
export declare function isVertexAttribute(va: object): va is VertexAttribute;
