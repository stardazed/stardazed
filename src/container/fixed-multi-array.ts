/**
 * container/fixed-multi-array - fixed-size struct of arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { clearArrayBuffer } from "../core";
import * as sa from "./structured-array";

export class FixedMultiArray<UD = unknown> {
	/** @internal */
	private readonly backing_: sa.StructuredArray<UD>;
	/** @internal */
	private readonly basePointers_: TypedArray[];

	/**
	 * @expects isPositiveNonZeroInteger(capacity)
	 * @expects fields.length > 0
	 */
	constructor(capacity: number, fields: sa.StructField<UD>[], alignmentFn: sa.StructAlignmentFn = sa.packStructFields) {
		const layout = alignmentFn(fields);
		this.backing_ = sa.createStructuredArray(layout, sa.StructTopology.StructOfArrays, capacity, sa.StorageAlignment.ItemMultipleOf32);

		this.basePointers_ = layout.posFields.map(posField => {
			const byteOffset = this.backing_.storage.capacity * posField.byteOffset;
			return new (posField.type.arrayType)(this.backing_.storage.data.buffer, byteOffset, this.backing_.storage.capacity * posField.count);
		});
	}

	get fieldCount() { return this.basePointers_.length; }

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	field(index: number) {
		return this.backing_.layout.posFields[index];
	}

	get capacity() { return this.backing_.storage.capacity; }

	clear() {
		clearArrayBuffer(this.backing_.storage.data.buffer);
	}

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	indexedFieldView(index: number) {
		return this.basePointers_[index];
	}
}
