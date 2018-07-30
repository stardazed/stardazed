/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

/**
 * A VertexBuffer is a simple structure that holds storage and metatdata
 * for a specified count of vertexes with a stride. 
 */
export interface VertexBuffer {
	readonly vertexCount: number;
	readonly stride: number;
	readonly storage: Uint8Array;
}

/**
 * @expects isPositiveNonZeroInteger(vertexCount)
 * @expects isPositiveNonZeroInteger(stride)
 */
export function createVertexBuffer(vertexCount: number, stride: number): VertexBuffer {
	return {
		vertexCount,
		stride,
		storage: new Uint8Array(vertexCount * stride)
	};
}

/**
 * @expects isPositiveNonZeroInteger(vertexCount)
 * @expects isPositiveNonZeroInteger(stride)
 * @expects usingStorage.byteLength >= vertexCount * stride
 */
export function createVertexBufferWithStorage(vertexCount: number, stride: number, storage: Uint8Array): VertexBuffer {
	return {
		vertexCount,
		stride,
		storage
	};
}

export function vertexBufferSizeBytes(vb: VertexBuffer) {
	return vb.vertexCount * vb.stride;
}
