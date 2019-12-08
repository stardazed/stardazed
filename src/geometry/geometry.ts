/*
geometry/geometry - efficient, contiguous storage for geometry data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/


import { alignUp } from "stardazed/core";
import { PrimitiveType, IndexBuffer, isIndexBuffer, minimumIndexElementTypeForVertexCount, bytesRequiredForIndexCount, createIndexBufferWithStorage } from "./index-buffer";
import { VertexBuffer, VertexBufferLayout, VertexAttribute, isVertexAttribute, createVertexBufferWithStorage, makeStandardVertexBufferLayout } from "stardazed/vertex-buffer";

export interface GeometryLayout {
	readonly layouts: ReadonlyArray<VertexBufferLayout>;
}

export const isGeometryLayout = (vl: any): vl is GeometryLayout =>
	(typeof vl === "object") && vl !== null &&
	Array.isArray(vl.layouts);

export interface PrimitiveGroup {
	type: PrimitiveType;
	fromElement: number;
	elementCount: number;
	/** arbitrary material index or reference; representation of Materials is external to Geometry */
	materialIx: number;
}

export interface Geometry {
	layout: GeometryLayout;
	vertexBuffers: VertexBuffer[];
	indexBuffer?: IndexBuffer;
	subMeshes: PrimitiveGroup[];
}

export const isGeometry = (geom: any): geom is Geometry =>
	(typeof geom === "object") && geom !== null &&
	isGeometryLayout(geom.layout) &&
	Array.isArray(geom.vertexBuffers) &&
	(geom.indexBuffer === undefined || isIndexBuffer(geom.indexBuffer)) &&
	Array.isArray(geom.subMeshes);

export function makeStandardGeometryLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): GeometryLayout {
	const layouts: VertexBufferLayout[] = [];

	if (attrLists.length > 0) {
		if (isVertexAttribute(attrLists[0])) {
			layouts.push(makeStandardVertexBufferLayout(attrLists as VertexAttribute[]));
		}
		else {
			for (const list of attrLists) {
				layouts.push(makeStandardVertexBufferLayout(list as VertexAttribute[]));
			}
		}
	}

	return {
		layouts
	};
}

export const enum BufferAlignment {
	SubBuffer = 8
}

export interface GeometryAllocOptions {
	layout: GeometryLayout;
	vertexCount: number;
	indexCount: number;
}

export function bytesNeededForGeometry(options: GeometryAllocOptions) {
	let totalBytes = 0;
	for (const layout of options.layout.layouts) {
		totalBytes += layout.bytesRequiredForVertexCount(options.vertexCount);
		totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
	}
	if (options.indexCount > 0) {
		const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
		totalBytes += bytesRequiredForIndexCount(elementType, options.indexCount);
		totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
	}
	return totalBytes;
}

/**
 * @expects bytesNeededForGeometry(options) > 0
 */
export function allocateGeometry(options: GeometryAllocOptions): Geometry {
	const totalBytes = bytesNeededForGeometry(options);

	const geom: Geometry = {
		layout: options.layout,
		vertexBuffers: [],
		subMeshes: [],
	};
	const storage = new ArrayBuffer(totalBytes);

	let byteOffset = 0;
	for (const layout of options.layout.layouts) {
		const subSize = layout.bytesRequiredForVertexCount(options.vertexCount);
		const subStorage = new Uint8Array(storage, byteOffset, subSize);
		const vb = createVertexBufferWithStorage(options.vertexCount, layout.stride, subStorage);
		geom.vertexBuffers.push(vb);

		byteOffset += subSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
	}
	if (options.indexCount) {
		const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
		const indexSize = bytesRequiredForIndexCount(elementType, options.indexCount);
		const subSize = bytesRequiredForIndexCount(elementType, options.indexCount);
		const subStorage = new Uint8Array(storage, byteOffset, subSize);

		geom.indexBuffer = createIndexBufferWithStorage(elementType, options.indexCount, subStorage);
		byteOffset += indexSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
	}
	// assert(totalBytes === byteOffset, "Geometry: mismatch of precalculated and actual buffer sizes");

	return geom;
}
