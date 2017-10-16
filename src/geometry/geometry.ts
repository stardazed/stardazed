// geometry/geometry - geometry data access
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.geometry {

	export interface PrimitiveGroup {
		type: geometry.PrimitiveType;
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

	export interface Geometry extends render.RenderResourceBase {
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
			totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
		}
		if (options.indexCount > 0) {
			const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
			totalBytes += bytesRequiredForIndexCount(elementType, options.indexCount);
			totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
		}

		assert(totalBytes > 0, "Nothing to allocate!");

		const geom: Geometry = {
			renderResourceType: render.ResourceType.Mesh,
			renderResourceHandle: 0,
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
			byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
		}
		if (options.indexCount) {
			const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
			const indexSize = bytesRequiredForIndexCount(elementType, options.indexCount);
			const subSize = bytesRequiredForIndexCount(elementType, options.indexCount);
			const subStorage = new Uint8ClampedArray(storage, byteOffset, subSize);

			geom.indexBuffer = new IndexBuffer(elementType, options.indexCount, subStorage);
			byteOffset += indexSize;
			byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
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

	// derived vertex data generation
	export function genVertexNormals(geom: Geometry) {
		geom.vertexBuffers.forEach((vertexBuffer, ix) => {
			if (geom.indexBuffer) {
				calcVertexNormals(geom.layout.layouts[ix], vertexBuffer, geom.indexBuffer);
			}
		});
	}

} // ns sd.geometry
