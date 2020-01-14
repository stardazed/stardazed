/*
geometry/geometry - efficient, contiguous storage for geometry data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { alignUp } from "stardazed/core";
import { IndexBuffer, minimumIndexElementTypeForVertexCount } from "./index-buffer";
import { VertexBuffer, VertexBufferDescriptor } from "./vertex-buffer";

/** A numerical "name" of a primitive type */
export const enum PrimitiveName {
	Point = 1,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}

/** Traits and calculations related to a primitive type */
export interface PrimitiveType {
	readonly name: PrimitiveName;
	elementOffsetForCount(count: number): number;
	elementsForCount(count: number): number;
	countForElements(elements: number): number;
}

/**
 * Traits of Point primitives
 */
export const PointPrimitive: PrimitiveType = {
	name: PrimitiveName.Point,
	elementOffsetForCount(count: number) { return count; },
	elementsForCount(count: number) { return count; },
	countForElements(elements: number) { return elements; }
};

/** Traits of Line primitives */
export const LinePrimitive: PrimitiveType = {
	name: PrimitiveName.Line,
	elementOffsetForCount(count: number) { return count * 2; },
	elementsForCount(count: number) { return count * 2; },
	countForElements(elements: number) { return (elements / 2) | 0; }
};

/** Traits of LineStrip primitives */
export const LineStripPrimitive: PrimitiveType = {
	name: PrimitiveName.LineStrip,
	elementOffsetForCount(count: number) { return count; },
	elementsForCount(count: number) { return count > 0 ? count + 1 : 0; },
	countForElements(elements: number) { return elements > 0 ? elements - 1 : 0; }
};

/** Traits of Triangle primitives */
export const TrianglePrimitive: PrimitiveType = {
	name: PrimitiveName.Triangle,
	elementOffsetForCount(count: number) { return count * 3; },
	elementsForCount(count: number) { return count * 3; },
	countForElements(elements: number) { return (elements / 3) | 0; }
};

/** Traits of TriangleStrip primitives */
export const TriangleStripPrimitive: PrimitiveType = {
	name: PrimitiveName.TriangleStrip,
	elementOffsetForCount(count: number) { return count; },
	elementsForCount(count: number) { return count > 0 ? count + 2 : 0; },
	countForElements(elements: number) { return elements > 1 ? elements - 2 : 0; }
};

/** Layout and properties of a group of primitives inside a geometry */
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

/** A Geometry is a grouping of one or more vertex buffers, an optional index buffer and one or more primitive groups */
export interface Geometry {
	vertexBuffers: VertexBuffer[];
	indexBuffer?: IndexBuffer;
	groups: PrimitiveGroup[];
}

const enum BufferAlignment {
	SubBuffer = 8
}

/** Properties of a new geometry to allocate */
export interface GeometryAllocDescriptor {
	vertexDescs: VertexBufferDescriptor[];
	indexCount: number;
}

export function bytesNeededForGeometry(desc: GeometryAllocDescriptor) {
	let totalBytes = 0;
	for (const vbDesc of desc.vertexDescs) {
		totalBytes += VertexBuffer.sizeBytesRequired(vbDesc.attrs, vbDesc.valueCount);
		totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
	}
	if (desc.indexCount > 0) {
		const elementType = minimumIndexElementTypeForVertexCount(desc.vertexDescs[0].valueCount);
		totalBytes += IndexBuffer.sizeBytesRequired(elementType, desc.indexCount);
		totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
	}
	return totalBytes;
}

/**
 * @expects bytesNeededForGeometry(desc) > 0
 */
export function allocateGeometry(desc: GeometryAllocDescriptor): Geometry {
	const totalBytes = bytesNeededForGeometry(desc);

	const geom: Geometry = {
		vertexBuffers: [],
		groups: [],
	};
	const storage = new ArrayBuffer(totalBytes);

	let byteOffset = 0;
	let vertexCount = 0;
	for (const vbDesc of desc.vertexDescs) {
		const subSize = VertexBuffer.sizeBytesRequired(vbDesc.attrs, vbDesc.valueCount);
		const subStorage = new Uint8Array(storage, byteOffset, subSize);
		const vb = new VertexBuffer(vbDesc, subStorage);
		geom.vertexBuffers.push(vb);

		byteOffset += subSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
		if (vertexCount === 0) {
			// first VB is assumed to have the non-instanced full vertex data
			vertexCount = vbDesc.valueCount;
		}
	}
	if (desc.indexCount) {
		const elementType = minimumIndexElementTypeForVertexCount(vertexCount);
		const indexSize = IndexBuffer.sizeBytesRequired(elementType, desc.indexCount);
		const subStorage = new Uint8Array(storage, byteOffset, indexSize);

		geom.indexBuffer = new IndexBuffer(elementType, desc.indexCount, subStorage);
		byteOffset += indexSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
	}
	// assert(totalBytes === byteOffset, "Geometry: mismatch of precalculated and actual buffer sizes");

	return geom;
}
