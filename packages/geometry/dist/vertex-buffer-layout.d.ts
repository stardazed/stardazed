import { VertexAttribute, VertexAttributeRole } from "./vertex-attribute";
export interface PositionedAttribute extends VertexAttribute {
    bufferIndex: number;
    offset: number;
}
export interface VertexBufferLayout {
    readonly attributes: Readonly<PositionedAttribute>[];
    readonly stride: number;
    bytesRequiredForVertexCount(vertexCount: number): number;
    attrByRole(role: VertexAttributeRole): PositionedAttribute | undefined;
    attrByIndex(index: number): PositionedAttribute | undefined;
    hasAttributeWithRole(role: VertexAttributeRole): boolean;
}
export declare function makeStandardVertexBufferLayout(attrList: VertexAttribute[], bufferIndex?: number): VertexBufferLayout;
