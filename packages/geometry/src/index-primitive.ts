/**
 * geometry/index-primitive - index primitive traits
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";

export const enum PrimitiveType {
	None,

	Point,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}


export function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
	switch (primitiveType) {
		case PrimitiveType.Point:
			return primitiveCount;
		case PrimitiveType.Line:
			return primitiveCount * 2;
		case PrimitiveType.LineStrip:
			return primitiveCount;
		case PrimitiveType.Triangle:
			return primitiveCount * 3;
		case PrimitiveType.TriangleStrip:
			return primitiveCount;

		default:
			assert(false, "Unknown primitive type");
			return 0;
	}
}


export function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
	assert(primitiveCount >= 0);

	switch (primitiveType) {
		case PrimitiveType.Point:
			return primitiveCount;
		case PrimitiveType.Line:
			return primitiveCount * 2;
		case PrimitiveType.LineStrip:
			return primitiveCount > 0 ? primitiveCount + 1 : 0;
		case PrimitiveType.Triangle:
			return primitiveCount * 3;
		case PrimitiveType.TriangleStrip:
			return primitiveCount > 0 ? primitiveCount + 2 : 0;

		default:
			assert(false, "Unknown primitive type");
			return 0;
	}
}


export function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number) {
	assert(elementCount >= 0);

	switch (primitiveType) {
		case PrimitiveType.Point:
			return elementCount;
		case PrimitiveType.Line:
			return (elementCount / 2) | 0;
		case PrimitiveType.LineStrip:
			return elementCount > 0 ? elementCount - 1 : 0;
		case PrimitiveType.Triangle:
			return (elementCount / 3) | 0;
		case PrimitiveType.TriangleStrip:
			return elementCount > 0 ? elementCount - 2 : 0;

		default:
			assert(false, "Unknown primitive type");
			return 0;
	}
}
