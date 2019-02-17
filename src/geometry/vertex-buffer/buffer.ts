/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

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
 * Determine if an object is a VertexBuffer
 */
export function isVertexBuffer(vb: any): vb is VertexBuffer {
	return typeof vb === "object" && vb !== null
		&& typeof vb.vertexCount === "number"
		&& typeof vb.stride === "number"
		&& ArrayBuffer.isView(vb.storage);
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

} // ns sd
