/**
 * structured-array/struct-field - structure field layout
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { NumericType } from "@stardazed/numeric";
import { roundUpPowerOf2 } from "@stardazed/math";

export interface StructField<UD = unknown> {
	type: NumericType;
	count: number;
	userData: UD;
}

export interface PositionedStructField<UD> extends StructField<UD> {
	byteOffset: number;
	sizeBytes: number;
}

export interface PositioningResult<UD> {
	posFields: PositionedStructField<UD>[];
	totalSizeBytes: number;
}

export function structFieldSizeBytes(field: StructField) {
	return field.type.byteSize * field.count;
}

export function packStructFields<UD>(fields: StructField<UD>[]): PositioningResult<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		const sizeBytes = structFieldSizeBytes(field);
		totalOffset += sizeBytes;

		return {
			type: field.type,
			count: field.count,
			userData: field.userData,
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

export function alignStructFields<UD>(fields: StructField<UD>[]): PositioningResult<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		totalOffset = alignStructField(field, totalOffset);

		return {
			type: field.type,
			count: field.count,
			userData: field.userData,
			byteOffset: curOffset,
			sizeBytes: structFieldSizeBytes(field)
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}
