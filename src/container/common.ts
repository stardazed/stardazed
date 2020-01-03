/*
container/common -
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { NumericType } from "stardazed/core";

export type StructField<C = unknown> = C & {
	name: string;
	type: NumericType;
	count: number;
};


export type PositionedStructField<C> = {
	readonly [P in keyof StructField<C>]: StructField<C>[P];
} & {
	byteOffset: number;
	sizeBytes: number;
};
