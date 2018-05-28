/**
 * geometry/index-buffer - index primitive storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert } from "@stardazed/core";
import { IndexElementType, indexElementTypeSizeBytes, TypedIndexArray, typedIndexArrayClassForIndexElement } from "./index-element";

export class IndexBuffer {
	readonly indexElementType: IndexElementType;
	readonly indexCount: number;
	readonly storage: Uint8ClampedArray;
	private indexElementSizeBytes_: number;

	constructor(elementType: IndexElementType, indexCount: number, usingStorage?: Uint8ClampedArray) {
		assert(indexCount > 0, "Invalid indexCount, must be > 0");
		assert(elementType !== IndexElementType.None);

		this.indexElementType = elementType;
		this.indexElementSizeBytes_ = indexElementTypeSizeBytes[elementType];
		this.indexCount = indexCount;
		
		assert(this.indexElementSizeBytes_ !== undefined);

		if (usingStorage) {
			assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
			this.storage = usingStorage;
		}
		else {
			this.storage = new Uint8ClampedArray(this.sizeBytes);
		}
	}

	get sizeBytes() { return this.indexCount * this.indexElementSizeBytes_; }

	/**
	 *  Direct (sub-)array access
	 */
	typedBasePtr(baseIndexNr: number, indexCount: number): TypedIndexArray {
		assert(baseIndexNr < this.indexCount);
		assert(baseIndexNr + indexCount <= this.indexCount);

		const offsetBytes = this.storage.byteOffset + this.indexElementSizeBytes_ * baseIndexNr;
		const arrayClass = typedIndexArrayClassForIndexElement(this.indexElementType);
		return new arrayClass(this.storage.buffer, offsetBytes, indexCount) as TypedIndexArray;
	}
}
