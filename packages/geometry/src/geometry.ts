/**
 * geometry/geometry - geometry compound type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";
import { alignUp } from "@stardazed/math";
import { PrimitiveType } from "./index-primitive";
import { minimumIndexElementTypeForVertexCount, bytesRequiredForIndexCount } from "./index-element";
import { IndexBuffer } from "./index-buffer";
import { VertexAttributeRole, VertexAttribute, isVertexAttribute } from "./vertex-attribute";
import { VertexBufferLayout, PositionedAttribute, makeStandardVertexBufferLayout } from "./vertex-buffer-layout";
import { VertexBuffer } from "./vertex-buffer";


export interface VertexLayout {
	readonly layouts: ReadonlyArray<VertexBufferLayout>;
}

export const isVertexLayout = (vl: any): vl is VertexLayout =>
	(typeof vl === "object") && vl !== null &&
	Array.isArray(vl.layouts);

export function findAttributeOfRoleInLayout(vl: VertexLayout, role: VertexAttributeRole) {
	for (const layout of vl.layouts) {
		const pa = layout.attrByRole(role);
		if (pa) {
			return pa;
		}
	}
	return undefined;
}

export function makeStandardVertexLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): VertexLayout {
	const layouts: VertexBufferLayout[] = [];
	
	if (attrLists.length > 0) {
		if (isVertexAttribute(attrLists[0])) {
			layouts.push(makeStandardVertexBufferLayout(attrLists as VertexAttribute[]));
		}
		else {
			for (let bufferIndex = 0; bufferIndex < attrLists.length; ++bufferIndex) {
				const list = attrLists[bufferIndex] as VertexAttribute[];
				layouts.push(makeStandardVertexBufferLayout(list, bufferIndex));
			}
		}
	}

	return {
		layouts
	};
}


export interface PrimitiveGroup {
	type: PrimitiveType;
	fromElement: number;
	elementCount: number;
}

export interface SubMesh extends PrimitiveGroup {
	materialIx: number; // arbitrary material index or reference; representation of Materials is external to Geometry
}

const enum BufferAlignment {
	SubBuffer = 8
}

export interface GeometryAllocOptions {
	layout: VertexLayout;
	vertexCount: number;
	indexCount: number;
}

export interface Geometry {
	layout: VertexLayout;
	vertexBuffers: VertexBuffer[];
	indexBuffer?: IndexBuffer;
	subMeshes: SubMesh[];
}

export const isGeometry = (geom: any): geom is Geometry =>
	(typeof geom === "object") && geom !== null &&
	isVertexLayout(geom.layout) &&
	Array.isArray(geom.vertexBuffers) &&
	(geom.indexBuffer === void 0 || geom.indexBuffer instanceof IndexBuffer) &&
	Array.isArray(geom.subMeshes);

export function allocateGeometry(options: GeometryAllocOptions): Geometry {
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

	assert(totalBytes > 0, "Nothing to allocate!");

	const geom: Geometry = {
		layout: options.layout,
		vertexBuffers: [],
		subMeshes: [],
	};
	const storage = new ArrayBuffer(totalBytes);

	let byteOffset = 0;
	for (const layout of options.layout.layouts) {
		const subSize = layout.bytesRequiredForVertexCount(options.vertexCount);
		const subStorage = new Uint8ClampedArray(storage, byteOffset, subSize);
		const vb = new VertexBuffer(options.vertexCount, layout.stride, subStorage);
		geom.vertexBuffers.push(vb);

		byteOffset += subSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
	}
	if (options.indexCount) {
		const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
		const indexSize = bytesRequiredForIndexCount(elementType, options.indexCount);
		const subSize = bytesRequiredForIndexCount(elementType, options.indexCount);
		const subStorage = new Uint8ClampedArray(storage, byteOffset, subSize);

		geom.indexBuffer = new IndexBuffer(elementType, options.indexCount, subStorage);
		byteOffset += indexSize;
		byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
	}

	assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
	return geom;
}

export function findAttributeOfRoleInGeometry(geom: Geometry, role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | undefined {
	const pa = findAttributeOfRoleInLayout(geom.layout, role);
	const avb = pa ? geom.vertexBuffers[pa.bufferIndex] : undefined;

	if (pa && avb) {
		return { vertexBuffer: avb, attr: pa };
	}
	return undefined;
}
