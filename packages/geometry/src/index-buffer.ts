/**
 * geometry/index-buffer - index primitive storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { IndexElementType, indexElementTypeSizeBytes, TypedIndexArray, typedIndexArrayClassForIndexElement } from "./index-element";

export class IndexBuffer {
	readonly indexElementType: IndexElementType;
	readonly indexCount: number;
	readonly storage: Uint8ClampedArray;
	private readonly indexElementSizeBytes_: number;

	/**
	 * @expects elementType > IndexElementType.None && elementType <= IndexElementType.Uint32
	 * @expects isPositiveNonZeroInteger(indexCount)
	 * @expects usingStorage === undefined || usingStorage.byteLength >= indexElementTypeSizeBytes[elementType] * indexCount
	 */
	constructor(elementType: IndexElementType, indexCount: number, usingStorage?: Uint8ClampedArray) {
		this.indexElementType = elementType;
		this.indexElementSizeBytes_ = indexElementTypeSizeBytes[elementType];
		this.indexCount = indexCount;

		if (usingStorage) {
			this.storage = usingStorage;
		}
		else {
			this.storage = new Uint8ClampedArray(this.sizeBytes);
		}
	}

	get sizeBytes() { return this.indexCount * this.indexElementSizeBytes_; }

	/**
	 * Direct (sub-)array access
	 * @expects baseIndexNr < this.indexCount
	 * @expects baseIndexNr + indexCount <= this.indexCount
	 */
	typedBasePtr(baseIndexNr: number, indexCount: number): TypedIndexArray {
		const offsetBytes = this.storage.byteOffset + this.indexElementSizeBytes_ * baseIndexNr;
		const arrayClass = typedIndexArrayClassForIndexElement(this.indexElementType);
		return new arrayClass(this.storage.buffer, offsetBytes, indexCount) as TypedIndexArray;
	}
}
