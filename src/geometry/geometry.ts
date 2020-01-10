/*
geometry/geometry - efficient, contiguous storage for geometry data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { alignUp } from "stardazed/core";
import { bytesRequiredForIndexCount, createIndexBufferWithStorage, IndexBuffer, isIndexBuffer, minimumIndexElementTypeForVertexCount, PrimitiveType } from "./index-buffer";
import { VertexAttribute, VertexBuffer, VertexBufferDesc } from "./vertex-buffer";

export type GeometryLayout = ReadonlyArray<VertexBufferLayout>;

export interface PrimitiveGroup {
	/** How the elements in this group should be interpreted to form primitives */
	type: PrimitiveType;
	/** Starting element number inside a geometry of this group */
	fromElement: number;
	/** Number of elements (not primitives) covered by this group */
	elementCount: number;
	/** Arbitrary material index or reference (Representation of materials is external to Geometry) */
	materialIx: number;
}

export interface Geometry {
	vertexBuffers: VertexBuffer[];
	indexBuffer?: IndexBuffer;
	subMeshes: PrimitiveGroup[];
}

export const isGeometry = (geom: any): geom is Geometry =>
	geom && (typeof geom === "object") &&
	Array.isArray(geom.layout) &&
	Array.isArray(geom.vertexBuffers) &&
	(geom.indexBuffer === undefined || isIndexBuffer(geom.indexBuffer)) &&
	Array.isArray(geom.subMeshes);

export function makeStandardGeometryLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): GeometryLayout {
	const layouts: VertexBufferLayout[] = [];

	if (attrLists.length > 0) {
		if (isVertexAttribute(attrLists[0])) {
			layouts.push(makeVertexBufferLayout(attrLists as VertexAttribute[]));
		}
		else {
			for (const list of attrLists) {
				layouts.push(makeVertexBufferLayout(list as VertexAttribute[]));
			}
		}
	}

	return layouts;
}

export const enum BufferAlignment {
	SubBuffer = 8
}

export interface GeometryAllocOptions {
	vertexDescs: VertexBufferDesc[];
	vertexCount: number;
	indexCount: number;
}

export function bytesNeededForGeometry(options: GeometryAllocOptions) {
	let totalBytes = 0;
	for (const layout of options.layout) {
		totalBytes += layout.sizeBytesForCount(options.vertexCount);
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
	for (const layout of options.layout) {
		const subSize = layout.sizeBytesForCount(options.vertexCount);
		const subStorage = new Uint8Array(storage, byteOffset, subSize);
		const vb = new VertexBuffer(layout, options.vertexCount, subStorage);
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
