/*
index-buffer/primitive - index primitive traits
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

export const enum PrimitiveType {
	None,

	Point,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}

export function isPrimitiveType(val: any): val is PrimitiveType {
	if (typeof val !== "number") {
		return false;
	}
	return val >= PrimitiveType.None && val <= PrimitiveType.TriangleStrip;
}

/**
 * Calculate the element offset of the Nth typed primitive in an element array.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(primitiveCount)
 */
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
			return NaN;
	}
}

/**
 * Calculate the number of elements required for N typed primitives.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(primitiveCount)
 */
export function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
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
			return NaN;
	}
}

/**
 * Calculate the number of typed primitives that can be stored using N elements.
 * @expects isPrimitiveType(primitiveType)
 * @expects isPositiveInteger(elementCount)
 */
export function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number) {
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
			return NaN;
	}
}
