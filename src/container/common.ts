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

export interface FieldView extends Iterable<TypedArray> {
	/** Get a mutable reference to a single field value */
	refItem(index: number): TypedArray;
	/** Get a copy of a single field value */
	copyItem(index: number): number[];
	/** Update the elements of a single field value */
	setItem(index: number, value: NumArray): void;

	/**
	 * Copy values from a source array into the attribute for consecutive records
	 *
	 * @param source an array of numeric values
	 * @param valueCount the number of values to copy from source into attributes
	 * @param atOffset (optional) the first index to start writing values into attributes
	 */
	copyValuesFrom(source: NumArray, valueCount: number, atOffset?: number): void;
}
