/**
 * structured-array/fixed-struct-array - fixed-size array of numeric structs
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { clearArrayBuffer } from "@stardazed/array";
import { PositionedStructField, StructField, StructAlignmentFn, alignStructFields } from "./struct-field";

export class FixedStructArray<UD = unknown> {
	private readonly data_: ArrayBuffer;
	private readonly fields_: PositionedStructField<UD>[];
	private readonly structSize_: number;
	private readonly capacity_: number;

	/**
	 * @expects isPositiveNonZeroInteger(capacity)
	 * @expects fields.length > 0
	 */
	constructor(capacity: number, fields: StructField<UD>[], alignmentFn: StructAlignmentFn = alignStructFields) {
		const result = alignmentFn(fields);
		this.fields_ = result.posFields;
		this.structSize_ = result.totalSizeBytes;
		this.capacity_ = capacity;

		this.data_ = new ArrayBuffer(this.structSize_ * this.capacity_);
	}

	/**
	 * @expects structIndex >= 0 && structIndex < this.capacity
	 */
	indexedStructByteOffset(structIndex: number) {
		return structIndex * this.structSize_;
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

	get fieldCount() { return this.fields_.length; }

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	field(index: number): Readonly<PositionedStructField<UD>> {
		return this.fields_[index];
	}

	get structSizeBytes() { return this.structSize_; }
	get capacity() { return this.capacity_; }
	get data() { return this.data_; }

	clear() {
		clearArrayBuffer(this.data_);
	}
}
