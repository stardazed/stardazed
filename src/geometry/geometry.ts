/*
geometry/geometry - efficient, contiguous storage for geometry data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { alignUp } from "stardazed/core";
import { IndexBuffer, minimumIndexElementTypeForVertexCount } from "./index-buffer";
import { VertexBuffer, VertexBufferDescriptor } from "./vertex-buffer";

export const enum PrimitiveType {
	Point = 1,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}

export interface PrimitiveTraits {
	readonly type: PrimitiveType;
	elementOffsetForCount(count: number): number;
	elementsForCount(count: number): number;
	countForElements(elements: number): number;
}

export const Primitive: Readonly<Record<string, PrimitiveTraits>> = {
	Point: {
		type: PrimitiveType.Point,
		elementOffsetForCount(count: number) { return count; },
		elementsForCount(count: number) { return count; },
		countForElements(elements: number) { return elements; }
	},
	Line: {
		type: PrimitiveType.Line,
		elementOffsetForCount(count: number) { return count * 2; },
		elementsForCount(count: number) { return count * 2; },
		countForElements(elements: number) { return (elements / 2) | 0; }
	},
	LineStrip: {
		type: PrimitiveType.LineStrip,
		elementOffsetForCount(count: number) { return count; },
		elementsForCount(count: number) { return count > 0 ? count + 1 : 0; },
		countForElements(elements: number) { return elements > 0 ? elements - 1 : 0; }
	},
	Triangle: {
		type: PrimitiveType.Triangle,
		elementOffsetForCount(count: number) { return count * 3; },
		elementsForCount(count: number) { return count * 3; },
		countForElements(elements: number) { return (elements / 3) | 0; }
	},
	TriangleStrip: {
		type: PrimitiveType.TriangleStrip,
		elementOffsetForCount(count: number) { return count; },
		elementsForCount(count: number) { return count > 0 ? count + 2 : 0; },
		countForElements(elements: number) { return elements > 1 ? elements - 2 : 0; }
	},
};

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

export const enum BufferAlignment {
	SubBuffer = 8
}

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
		subMeshes: [],
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
