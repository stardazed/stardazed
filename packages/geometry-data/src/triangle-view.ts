/**
 * geometry-data/triangle-view - (mutable) triangle index views
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Geometry, IndexBuffer, PrimitiveType, primitiveCountForElementCount, TypedIndexArray } from "@stardazed/geometry";

export interface Triangle {
	readonly [index: number]: number;
}

export interface MutableTriangle {
	[index: number]: number;
}

export interface TriangleProxy {
	index(index: number): number;
	a(): number;
	b(): number;
	c(): number;
}

export interface MutableTriangleProxy extends TriangleProxy {
	setIndex(index: number, newValue: number): void;
	setA(newValue: number): void;
	setB(newValue: number): void;
	setC(newValue: number): void;
}

export interface TriangleView {
	readonly count: number;
	readonly mutable: boolean;

	forEach(callback: (proxy: TriangleProxy) => void): void;
	forEachMutable?(callback: (proxy: MutableTriangleProxy) => void): void;

	refItem(triangleIndex: number): Triangle;
	refItemMutable?(triangleIndex: number): MutableTriangle;

	subView(fromTriangle: number, triangleCount: number): TriangleView;
}


}
