/**
 * structured-array/struct-field - structure field layout
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { NumericType } from "@stardazed/numeric";
import { roundUpPowerOf2 } from "@stardazed/math";

export interface StructField {
	type: NumericType;
	count: number;
}

export interface PositionedStructField extends StructField {
	byteOffset: number;
	sizeBytes: number;
}

export interface PositioningResult {
	posFields: PositionedStructField[];
	totalSizeBytes: number;
}

export function structFieldSizeBytes(field: StructField) {
	return field.type.byteSize * field.count;
}

export function packStructFields(fields: StructField[]): PositioningResult {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		const sizeBytes = structFieldSizeBytes(field);
		totalOffset += sizeBytes;

		return {
			type: field.type,
			count: field.count,
			byteOffset: curOffset,
			sizeBytes
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}

function alignStructField(field: StructField, offset: number) {
	const sizeBytes = structFieldSizeBytes(field);
	const mask = roundUpPowerOf2(sizeBytes) - 1;
	return (offset + mask) & ~mask;
}

export function alignStructFields(fields: StructField[]): PositioningResult {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		totalOffset = alignStructField(field, totalOffset);

		return {
			type: field.type,
			count: field.count,
			byteOffset: curOffset,
			sizeBytes: structFieldSizeBytes(field)
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}
