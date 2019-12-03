/*
geometry/allocate - efficiently allocate geometry data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

function bytesNeededForGeometry(options: GeometryAllocOptions) {
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
