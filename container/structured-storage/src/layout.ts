/**
 * structured-storage/layout - structure field layout
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { DeepReadonly } from "@stardazed/deep-readonly";
import { NumericType } from "@stardazed/numeric";
import { roundUpPowerOf2 } from "@stardazed/math";

export interface StructField<UD = unknown> {
	type: NumericType;
	count: number;
	userData: UD;
}

export interface PositionedStructField<UD> extends DeepReadonly<StructField<UD>> {
	readonly byteOffset: number;
	readonly sizeBytes: number;
}

export type PositionedStructFieldArray<UD> = ReadonlyArray<PositionedStructField<UD>>;

export interface StructLayout<UD> {
	readonly posFields: PositionedStructFieldArray<UD>;
	readonly totalSizeBytes: number;
}

export type StructAlignmentFn = <UD>(fields: StructField<UD>[]) => StructLayout<UD>;

export function structFieldSizeBytes(field: StructField) {
	return field.type.byteSize * field.count;
}

export function structLayoutSizeBytesForCount(layout: StructLayout<any>, structCount: number) {
	return layout.totalSizeBytes * structCount;
}

export function packStructFields<UD>(fields: StructField<UD>[]): StructLayout<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		const sizeBytes = structFieldSizeBytes(field);
		totalOffset += sizeBytes;

		return {
			type: field.type,
			count: field.count,
			userData: field.userData as DeepReadonly<UD>,
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

export function alignStructFields<UD>(fields: StructField<UD>[]): StructLayout<UD> {
	let totalOffset = 0;
	const posFields = fields.map(field => {
		const curOffset = totalOffset;
		totalOffset = alignStructField(field, totalOffset);

		return {
			type: field.type,
			count: field.count,
			userData: field.userData as DeepReadonly<UD>,
			byteOffset: curOffset,
			sizeBytes: structFieldSizeBytes(field)
		};
	});

	return { posFields, totalSizeBytes: totalOffset };
}
