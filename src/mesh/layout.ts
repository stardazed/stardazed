// mesh/layout - describing the layout of mesh data
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { roundUpPowerOf2 } from "math/util";
import { VertexField, VertexAttributeRole, vertexFieldElementSizeBytes, vertexFieldSizeBytes } from "mesh/types";

// -- A VertexAttribute is a Field with a certain Role inside a VertexBuffer

export interface VertexAttribute {
	readonly field: VertexField;
	readonly role: VertexAttributeRole;
}


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


export interface PositionedAttribute extends VertexAttribute {
	readonly offset: number;
}


export function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
export function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
export function makePositionedAttr(fieldOrAttr: VertexField | VertexAttribute, roleOrOffset: VertexAttributeRole | number, offset?: number): PositionedAttribute {
	if (typeof fieldOrAttr === "number") {
		return {
			field: fieldOrAttr,
			role: roleOrOffset,
			offset: offset | 0
		};
	}
	else {
		return {
			field: fieldOrAttr.field,
			role: fieldOrAttr.role,
			offset: roleOrOffset | 0
		};
	}
}


// __   __       _           _                       _   
// \ \ / /__ _ _| |_ _____ _| |   __ _ _  _ ___ _  _| |_ 
//  \ V / -_) '_|  _/ -_) \ / |__/ _` | || / _ \ || |  _|
//   \_/\___|_|  \__\___/_\_\____\__,_|\_, \___/\_,_|\__|
//                                     |__/              

function alignFieldOnSize(size: number, offset: number) {
	const mask = roundUpPowerOf2(size) - 1;
	return (offset + mask) & ~mask;
}


function alignVertexField(field: VertexField, offset: number) {
	return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
}


export class VertexLayout {
	private attributeCount_ = 0;
	private vertexSizeBytes_ = 0;
	private attrs_: PositionedAttribute[];

	constructor(attrList: VertexAttribute[]) {
		this.attributeCount_ = attrList.length;

		let offset = 0, maxElemSize = 0;

		// calculate positioning of successive attributes in linear item
		this.attrs_ = attrList.map((attr: VertexAttribute): PositionedAttribute => {
			const size = vertexFieldSizeBytes(attr.field);
			maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

			const alignedOffset = alignVertexField(attr.field, offset);
			offset = alignedOffset + size;
			return makePositionedAttr(attr, alignedOffset);
		});

		// align full item size on boundary of biggest element in attribute list, with min of float boundary
		maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
		this.vertexSizeBytes_ = alignFieldOnSize(maxElemSize, offset);
	}

	get attributeCount() { return this.attributeCount_; }
	get vertexSizeBytes() { return this.vertexSizeBytes_; }

	bytesRequiredForVertexCount(vertexCount: number): number {
		return vertexCount * this.vertexSizeBytes_;
	}

	attrByRole(role: VertexAttributeRole): PositionedAttribute | null {
		const attr = this.attrs_.find(pa => pa.role == role);
		return attr || null;
	}

	attrByIndex(index: number): PositionedAttribute | null {
		return this.attrs_[index] || null;
	}

	hasAttributeWithRole(role: VertexAttributeRole): boolean {
		return this.attrByRole(role) != null;
	}
}
