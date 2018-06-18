/**
 * geometry-gen/vertex-types - shortcuts to define vertex attributes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { VertexAttribute, VertexField } from "@stardazed/geometry";
export declare function attrPosition2(): VertexAttribute;
export declare function attrPosition3(): VertexAttribute;
export declare function attrNormal3(): VertexAttribute;
export declare function attrColour3(): VertexAttribute;
export declare function attrUV2(): VertexAttribute;
export declare function attrTangent3(): VertexAttribute;
export declare function attrJointIndexes(): VertexAttribute;
export declare function attrWeightedPos(index: number): {
    field: VertexField;
    role: number;
};
export declare namespace AttrList {
    function Pos3Norm3(): VertexAttribute[];
    function Pos3Norm3Colour3(): VertexAttribute[];
    function Pos3Norm3UV2(): VertexAttribute[];
    function Pos3Norm3Colour3UV2(): VertexAttribute[];
    function Pos3Norm3UV2Tan3(): VertexAttribute[];
}
