/**
 * structured-array/fixed-struct-array - fixed-size array of structs
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { clearArrayBuffer } from "@stardazed/array";
import { PositionedStructField, StructField, alignStructFields } from "./struct-field";

export class FixedStructArray {
	private readonly data_: ArrayBuffer;
	private readonly fields_: PositionedStructField[];
	private readonly structSize_: number;
	private readonly capacity_: number;

	/**
	 * @expects isPositiveNonZeroInteger(capacity)
	 * @expects fields.length > 0
	 */
	constructor(capacity: number, fields: StructField[]) {
		const result = alignStructFields(fields);
		this.fields_ = result.posFields;
		this.structSize_ = result.totalSizeBytes;
		this.capacity_ = capacity;

		this.data_ = new ArrayBuffer(this.structSize_ * this.capacity_);
	}

	/**
	 * @expects structIndex >= 0 && structIndex < this.capacity
	 */
	indexedStructView(structIndex: number) {
		const byteOffset = structIndex * this.structSize_;
		return new DataView(this.data_, byteOffset, this.structSize_);
	}

	/**
	 * @expects structIndex >= 0 && structIndex < this.capacity
	 * @expects fieldIndex >= 0 && fieldIndex < this.fieldCount
	 */
	indexedStructFieldView(structIndex: number, fieldIndex: number) {
		const f = this.fields_[fieldIndex];
		const byteOffset = (structIndex * this.structSize_) + f.byteOffset;
		return new (f.type.arrayType)(this.data_, byteOffset, f.count);
	}

	get structSizeBytes() { return this.structSize_; }
	get capacity() { return this.capacity_; }
	get fieldCount() { return this.fields_.length; }
	get data() { return this.data_; }

	clear() {
		clearArrayBuffer(this.data_);
	}
}
