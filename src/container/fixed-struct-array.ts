/*
container/fixed-struct-array - fixed-size array of numeric structs
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { clearArrayBuffer } from "../core";
import * as sa from "./structured-array";

export class FixedStructArray<UD = unknown> {
	/** @internal */
	private readonly backing_: sa.StructuredArray<UD>;
	/** @internal */
	private readonly structSize_: number;

	/**
	 * @expects isPositiveNonZeroInteger(capacity)
	 * @expects fields.length > 0
	 */
	constructor(capacity: number, fields: sa.Field<UD>[], alignmentFn: sa.AlignmentFn = sa.alignFields) {
		const layout = alignmentFn(fields);
		this.backing_ = sa.createStructuredArray(layout, sa.Topology.ArrayOfStructs, capacity, sa.StorageAlignment.ItemMultipleOf32);
		this.structSize_ = layout.totalSizeBytes;
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
		return new DataView(this.backing_.storage.data.buffer, byteOffset, this.structSize_);
	}

	/**
	 * @expects structIndex >= 0 && structIndex < this.capacity
	 * @expects fieldIndex >= 0 && fieldIndex < this.fieldCount
	 */
	indexedStructFieldView(structIndex: number, fieldIndex: number) {
		const f = this.backing_.layout.posFields[fieldIndex];
		const byteOffset = (structIndex * this.structSize_) + f.byteOffset;
		return new (f.type.arrayType)(this.backing_.storage.data.buffer, byteOffset, f.count);
	}

	get fieldCount() { return this.backing_.layout.posFields.length; }

	/**
	 * @expects index >= 0 && index < this.fieldCount
	 */
	field(index: number) {
		return this.backing_.layout.posFields[index];
	}

	get structSizeBytes() { return this.structSize_; }
	get capacity() { return this.backing_.storage.capacity; }

	clear() {
		clearArrayBuffer(this.backing_.storage.data.buffer);
	}
}
