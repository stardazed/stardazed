/*
geometry/vertex-buffer - geometry vertex buffer data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { struct } from "stardazed/container";
import { Float, NumericType, roundUpPowerOf2, SInt16, SInt32, SInt8, UInt16, UInt32, UInt8 } from "stardazed/core";

/**
 * A single field in a vertex buffer with three properties:
 * element type, count and normalization
 */
export const enum VertexField {
	Undefined,

	// integer
	UInt8,
	UInt8x2,
	UInt8x3,
	UInt8x4,

	SInt8,
	SInt8x2,
	SInt8x3,
	SInt8x4,

	UInt16,
	UInt16x2,
	UInt16x3,
	UInt16x4,

	SInt16,
	SInt16x2,
	SInt16x3,
	SInt16x4,

	UInt32,
	UInt32x2,
	UInt32x3,
	UInt32x4,

	SInt32,
	SInt32x2,
	SInt32x3,
	SInt32x4,

	// floating point
	Float,
	Floatx2,
	Floatx3,
	Floatx4,

	// normalized
	Norm_UInt8 = 0x81,	// normalized fields have high bit set
	Norm_UInt8x2,
	Norm_UInt8x3,
	Norm_UInt8x4,

	Norm_SInt8,
	Norm_SInt8x2,
	Norm_SInt8x3,
	Norm_SInt8x4,

	Norm_UInt16,
	Norm_UInt16x2,
	Norm_UInt16x3,
	Norm_UInt16x4,

	Norm_SInt16,
	Norm_SInt16x2,
	Norm_SInt16x3,
	Norm_SInt16x4
}

export function isValidVertexField(vf: any): vf is VertexField {
	return (typeof vf === "number") && (
		(vf >= VertexField.UInt8 && vf <= VertexField.Floatx4) ||
		(vf >= VertexField.Norm_UInt8 && vf <= VertexField.Norm_SInt16x4)
	);
}

/**
 * @expects isValidVertexField(vf)
 */
export function vertexFieldElementCount(vf: VertexField) {
	switch (vf) {
		case VertexField.UInt32:
		case VertexField.SInt32:
		case VertexField.Float:
			return 1;

		case VertexField.UInt8x2:
		case VertexField.Norm_UInt8x2:
		case VertexField.SInt8x2:
		case VertexField.Norm_SInt8x2:
		case VertexField.UInt16x2:
		case VertexField.Norm_UInt16x2:
		case VertexField.SInt16x2:
		case VertexField.Norm_SInt16x2:
		case VertexField.UInt32x2:
		case VertexField.SInt32x2:
		case VertexField.Floatx2:
			return 2;

		case VertexField.UInt8x3:
		case VertexField.Norm_UInt8x3:
		case VertexField.SInt8x3:
		case VertexField.Norm_SInt8x3:
		case VertexField.UInt16x3:
		case VertexField.Norm_UInt16x3:
		case VertexField.SInt16x3:
		case VertexField.Norm_SInt16x3:
		case VertexField.UInt32x3:
		case VertexField.SInt32x3:
		case VertexField.Floatx3:
			return 3;

		case VertexField.UInt8x4:
		case VertexField.Norm_UInt8x4:
		case VertexField.SInt8x4:
		case VertexField.Norm_SInt8x4:
		case VertexField.UInt16x4:
		case VertexField.Norm_UInt16x4:
		case VertexField.SInt16x4:
		case VertexField.Norm_SInt16x4:
		case VertexField.UInt32x4:
		case VertexField.SInt32x4:
		case VertexField.Floatx4:
			return 4;

		case VertexField.Undefined:
		default:
			return 0;
	}
}

export function vertexFieldNumericType(vf: VertexField): NumericType | undefined {
	switch (vf) {
		case VertexField.Float:
		case VertexField.Floatx2:
		case VertexField.Floatx3:
		case VertexField.Floatx4:
			return Float;

		case VertexField.UInt32:
		case VertexField.UInt32x2:
		case VertexField.UInt32x3:
		case VertexField.UInt32x4:
			return UInt32;

		case VertexField.SInt32:
		case VertexField.SInt32x2:
		case VertexField.SInt32x3:
		case VertexField.SInt32x4:
			return SInt32;

		case VertexField.UInt16x2:
		case VertexField.Norm_UInt16x2:
		case VertexField.UInt16x3:
		case VertexField.Norm_UInt16x3:
		case VertexField.UInt16x4:
		case VertexField.Norm_UInt16x4:
			return UInt16;

		case VertexField.SInt16x2:
		case VertexField.Norm_SInt16x2:
		case VertexField.SInt16x3:
		case VertexField.Norm_SInt16x3:
		case VertexField.SInt16x4:
		case VertexField.Norm_SInt16x4:
			return SInt16;

		case VertexField.UInt8x2:
		case VertexField.Norm_UInt8x2:
		case VertexField.UInt8x3:
		case VertexField.Norm_UInt8x3:
		case VertexField.UInt8x4:
		case VertexField.Norm_UInt8x4:
			return UInt8;

		case VertexField.SInt8x2:
		case VertexField.Norm_SInt8x2:
		case VertexField.SInt8x3:
		case VertexField.Norm_SInt8x3:
		case VertexField.SInt8x4:
		case VertexField.Norm_SInt8x4:
			return SInt8;

		case VertexField.Undefined:
		default:
			return undefined;
	}
}

export function vertexFieldElementSizeBytes(vf: VertexField) {
	const nt = vertexFieldNumericType(vf);
	return nt ? nt.byteSize : 0;
}

export function vertexFieldSizeBytes(vf: VertexField) {
	return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
}

export function vertexFieldIsNormalized(vf: VertexField) {
	return (vf & 0x80) !== 0;
}

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

export type PositionedAttribute = struct.PositionedField<VertexAttribute>;

export interface VertexBufferLayout {
	// TODO: add instancing parameters
	readonly attributes: Readonly<PositionedAttribute>[];
	readonly stride: number;

	bytesRequiredForVertexCount(vertexCount: number): number;
	attrByRole(role: VertexAttributeRole): PositionedAttribute | undefined;
	attrByIndex(index: number): PositionedAttribute | undefined;
	hasAttributeWithRole(role: VertexAttributeRole): boolean;
}

class VertexBufferLayoutImpl implements VertexBufferLayout {
	readonly attributes: Readonly<PositionedAttribute>[];
	readonly stride: number;

	/**
	 * @expects attributes.length > 0
	 * @expects isPositiveNonZeroInteger(stride)
	 */
	constructor(attributes: PositionedAttribute[], stride: number) {
		this.attributes = [...attributes];
		this.stride = stride;
	}

	/**
	 * @expects isPositiveInteger(vertexCount)
	 */
	bytesRequiredForVertexCount(vertexCount: number) {
		return vertexCount * this.stride;
	}

	attrByRole(role: VertexAttributeRole) {
		return this.attributes.find(pa => pa.userData.role === role);
	}

	attrByIndex(index: number) {
		return this.attributes[index] || null;
	}

	hasAttributeWithRole(role: VertexAttributeRole) {
		return this.attrByRole(role) !== undefined;
	}
}

// ---- default buffer layout calc func

function alignFieldOnSize(size: number, offset: number) {
	const mask = roundUpPowerOf2(size) - 1;
	return (offset + mask) & ~mask;
}

function alignVertexField(field: VertexField, offset: number) {
	return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
}

export function makeLayoutStructFields(attrList: VertexAttribute[]) {
	return attrList.map(attr => {
		const sf: struct.Field<VertexAttribute> = {
			type: vertexFieldNumericType(attr.field)!,
			count: vertexFieldElementCount(attr.field),
			userData: { ...attr }
		};
		return sf;
	});
}

export function makeStandardVertexBufferLayout(attrList: VertexAttribute[]): VertexBufferLayout {
	let offset = 0, maxElemSize = 0;

	// calculate positioning of successive attributes in linear item
	const attributes = attrList.map((attr: VertexAttribute): PositionedAttribute => {
		const sizeBytes = vertexFieldSizeBytes(attr.field);
		maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

		const alignedOffset = alignVertexField(attr.field, offset);
		offset = alignedOffset + sizeBytes;
		return {
			type: vertexFieldNumericType(attr.field)!,
			count: vertexFieldElementCount(attr.field),
			userData: {
				...attr
			},
			byteOffset: alignedOffset,
			sizeBytes
		};
	});

	// align full item size on boundary of biggest element in attribute list, with min of float boundary
	maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
	const stride = alignFieldOnSize(maxElemSize, offset);

	return new VertexBufferLayoutImpl(attributes, stride);
}

/**
 * A VertexBuffer is a simple structure that holds storage and metatdata
 * for a specified count of vertexes with a stride.
 */
export interface VertexBuffer {
	readonly vertexCount: number;
	readonly stride: number;
	readonly storage: Uint8Array;
}

/**
 * Determine if an object is a VertexBuffer
 */
export function isVertexBuffer(vb: any): vb is VertexBuffer {
	return typeof vb === "object" && vb !== null
		&& typeof vb.vertexCount === "number"
		&& typeof vb.stride === "number"
		&& ArrayBuffer.isView(vb.storage);
}

/**
 * @expects isPositiveNonZeroInteger(vertexCount)
 * @expects isPositiveNonZeroInteger(stride)
 */
export function createVertexBuffer(vertexCount: number, stride: number): VertexBuffer {
	return {
		vertexCount,
		stride,
		storage: new Uint8Array(vertexCount * stride)
	};
}

/**
 * @expects isPositiveNonZeroInteger(vertexCount)
 * @expects isPositiveNonZeroInteger(stride)
 * @expects usingStorage.byteLength >= vertexCount * stride
 */
export function createVertexBufferWithStorage(vertexCount: number, stride: number, storage: Uint8Array): VertexBuffer {
	return {
		vertexCount,
		stride,
		storage
	};
}

export function vertexBufferSizeBytes(vb: VertexBuffer) {
	return vb.vertexCount * vb.stride;
}
