/**
 * vertex-buffer/buffer-layout - layout of attributes within a buffer
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { roundUpPowerOf2 } from "@stardazed/math";
import { VertexAttribute, VertexAttributeRole } from "./attribute";
import { VertexField, vertexFieldElementSizeBytes, vertexFieldSizeBytes } from "./field";

export interface PositionedAttribute extends VertexAttribute {
	offset: number;
}

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
		return this.attributes.find(pa => pa.role === role);
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

export function makeStandardVertexBufferLayout(attrList: VertexAttribute[]): VertexBufferLayout {
	let offset = 0, maxElemSize = 0;

	// calculate positioning of successive attributes in linear item
	const attributes = attrList.map((attr: VertexAttribute): PositionedAttribute => {
		const size = vertexFieldSizeBytes(attr.field);
		maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

		const alignedOffset = alignVertexField(attr.field, offset);
		offset = alignedOffset + size;
		return {
			field: attr.field,
			role: attr.role,
			offset: alignedOffset
		};
	});

	// align full item size on boundary of biggest element in attribute list, with min of float boundary
	maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
	const stride = alignFieldOnSize(maxElemSize, offset);

	return new VertexBufferLayoutImpl(attributes, stride);
}
