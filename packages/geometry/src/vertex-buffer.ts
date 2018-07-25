/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export class VertexBuffer {
	readonly storage: Uint8ClampedArray;
	readonly vertexCount: number;
	readonly stride: number;

	get sizeBytes() {
		return this.vertexCount * this.stride;
	}

	/**
	 * @expects isPositiveNonZeroInteger(vertexCount)
	 * @expects isPositiveNonZeroInteger(stride)
	 * @expects usingStorage === undefined || usingStorage.byteLength >= vertexCount * stride
	 */
	constructor(vertexCount: number, stride: number, usingStorage?: Uint8ClampedArray) {
		this.vertexCount = vertexCount;
		this.stride = stride;

		if (usingStorage) {
			this.storage = usingStorage;
		}
		else {
			this.storage = new Uint8ClampedArray(this.sizeBytes);
		}
	}
}
