/**
 * structured-array/fixed-multi-array - fixed-size struct of arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedArray, clearArrayBuffer } from "@stardazed/array";
import { StructField, packStructFields } from "./struct-field";

export class FixedMultiArray {
	private readonly data_: ArrayBuffer;
	private readonly capacity_: number;
	private readonly basePointers_: TypedArray[];

	/**
	 * @expects isPositiveNonZeroInteger(capacity)
	 * @expects fields.length > 0
	 */
	constructor(capacity: number, fields: StructField[]) {
		const { posFields, totalSizeBytes } = packStructFields(fields);
		this.capacity_ = capacity | 0;
		this.data_ = new ArrayBuffer(totalSizeBytes * this.capacity_);

		this.basePointers_ = posFields.map(posField => {
			const byteOffset = this.capacity_ * posField.byteOffset;
			return new (posField.type.arrayType)(this.data_, byteOffset, this.capacity_ * posField.count);
		});
	}

	get capacity() { return this.capacity_; }
	get fieldCount() { return this.basePointers_.length; }
	get data() { return this.data_; }

	clear() {
		clearArrayBuffer(this.data_);
	}

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	indexedFieldView(index: number) {
		return this.basePointers_[index];
	}
}
