/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";

export class VertexBuffer {
	readonly storage: Uint8ClampedArray;
	readonly vertexCount: number;
	readonly stride: number;

	get sizeBytes() {
		return this.vertexCount * this.stride;
	}

	constructor(vertexCount: number, stride: number, usingStorage?: Uint8ClampedArray) {
		vertexCount = vertexCount | 0;
		stride = stride | 0;
		assert(vertexCount > 0);
		assert(stride > 0);
		this.vertexCount = vertexCount;
		this.stride = stride;

		if (usingStorage) {
			assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
			this.storage = usingStorage;
		}
		else {
			this.storage = new Uint8ClampedArray(this.sizeBytes);
		}
	}
}
