/*
container/common -
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumericType } from "stardazed/core";

export type StructField<C = unknown> = {
	name: string;
	type: NumericType;
	count: number;
} & C;


export type PositionedStructField<C> = {
	byteOffset: number;
	sizeBytes: number;
} & {
	readonly [P in keyof StructField<C>]: StructField<C>[P];
};

export function totalSizeOfFields(fields: ReadonlyArray<StructField>) {
	let size = 0;
	for (const field of fields) {
		size += field.type.byteSize * field.count;
	}
	return size;
}
