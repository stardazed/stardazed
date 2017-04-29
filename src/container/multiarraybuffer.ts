// container/multiarraybuffer - struct-of-arrays containers for primitive types
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../core/util.ts" />
/// <reference path="../math/math.ts" />

namespace sd.container {

	export interface MABField {
		type: NumericType;
		count: number;
	}


	interface PositionedMABField extends MABField {
		byteOffset: number;
		sizeBytes: number;
	}


	export const enum InvalidatePointers {
		No,
		Yes
	}


	function positionFields(fields: MABField[]): PositionedMABField[] {
		let totalOffset = 0;
		return fields.map(field => {
			const curOffset = totalOffset;
			const sizeBytes = field.type.byteSize * field.count;
			totalOffset += sizeBytes;

			return {
				type: field.type,
				count: field.count,
				byteOffset: curOffset,
				sizeBytes
			};
		});
	}


	function clearBuffer(data: ArrayBuffer) {
		const numDoubles = (data.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
		const doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
		const remainingBytes = data.byteLength - doublesByteSize;

		// As of 2015-11, a loop-zero construct is faster than TypedArray create+set for large arrays in most browsers
		const doubleView = new Float64Array(data);
		const remainderView = new Uint8Array(data, doublesByteSize);
		for (let d = 0; d < numDoubles; ++d) {
			doubleView[d] = 0;
		}
		for (let b = 0; b < remainingBytes; ++b) {
			remainderView[b] = 0;
		}
	}


	export class FixedMultiArray {
		private data_: ArrayBuffer;
		private basePointers_: TypedArray[];

		constructor(private capacity_: number, fields: MABField[]) {
			const posFields = positionFields(fields);
			const lastField = posFields[posFields.length - 1];
			const elementSumSize = lastField.byteOffset + lastField.sizeBytes;

			this.data_ = new ArrayBuffer(elementSumSize * capacity_);

			this.basePointers_ = posFields.map(posField => {
				const byteOffset = capacity_ * posField.byteOffset;
				return new (posField.type.arrayType)(this.data_, byteOffset, capacity_ * posField.count);
			});
		}

		get capacity() { return this.capacity_; }
		get data() { return this.data_; }

		clear() {
			clearBuffer(this.data_);
		}

		indexedFieldView(index: number) {
			return this.basePointers_[index];
		}
	}


	export class MultiArrayBuffer {
		private fields_: PositionedMABField[];
		private capacity_ = 0;
		private count_ = 0;
		private elementSumSize_ = 0;
		private data_: ArrayBuffer | null = null;

		constructor(initialCapacity: number, fields: MABField[]) {
			let totalOffset = 0;
			this.fields_ = fields.map(field => {
				const curOffset = totalOffset;
				const sizeBytes = field.type.byteSize * field.count;
				totalOffset += sizeBytes;

				return {
					type: field.type,
					count: field.count,
					byteOffset: curOffset,
					sizeBytes
				};
			});

			this.elementSumSize_ = totalOffset;

			this.reserve(initialCapacity);
		}


		get capacity() { return this.capacity_; }
		get count() { return this.count_; }
		get backIndex() {
			assert(this.count_ > 0);
			return this.count_ - 1;
		}


		private fieldArrayView(f: PositionedMABField, buffer: ArrayBuffer, itemCount: number) {
			const byteOffset = f.byteOffset * itemCount;
			return new (f.type.arrayType)(buffer, byteOffset, itemCount * f.count);
		}


		reserve(newCapacity: number): InvalidatePointers {
			assert(newCapacity > 0);

			// By forcing an allocated multiple of 32 elements, we never have
			// to worry about padding between consecutive arrays. 32 is chosen
			// as it is the AVX layout requirement, so e.g. a char field followed
			// by an m256 field will be aligned regardless of array length.
			// We could align to 16 or even 8 and likely be fine, but this container
			// isn't meant for tiny arrays so 32 it is.

			newCapacity = math.alignUp(newCapacity, 32);
			if (newCapacity <= this.capacity_) {
				// TODO: add way to cut capacity?
				return InvalidatePointers.No;
			}

			const newData = new ArrayBuffer(newCapacity * this.elementSumSize_);
			assert(newData);

			let invalidation = InvalidatePointers.No;
			if (this.data_) {
				// Since a capacity change will change the length of each array individually
				// we need to re-layout the data in the new buffer.
				// We iterate over the basePointers and copy count_ elements from the old
				// data to each new array. With large arrays >100k elements this can take
				// millisecond-order time, so avoid resizes when possible.

				this.fields_.forEach(field => {
					const oldView = this.fieldArrayView(field, this.data_!, this.count_);
					const newView = this.fieldArrayView(field, newData, newCapacity);
					newView.set(oldView);
				});

				invalidation = InvalidatePointers.Yes;
			}

			this.data_ = newData;
			this.capacity_ = newCapacity;

			return invalidation;
		}


		clear() {
			this.count_ = 0;
			clearBuffer(this.data_!);
		}


		resize(newCount: number): InvalidatePointers {
			let invalidation = InvalidatePointers.No;

			if (newCount > this.capacity_) {
				// automatically expand up to next highest power of 2 size
				invalidation = this.reserve(math.roundUpPowerOf2(newCount));
			}
			else if (newCount < this.count_) {
				// Reducing the count will clear the now freed up elements so that when
				// a new allocation is made the element data is guaranteed to be zeroed.

				const elementsToClear = this.count_ - newCount;

				this.fields_.forEach(field => {
					const array = this.fieldArrayView(field, this.data_!, this.count_);
					const zeroes = new (field.type.arrayType)(elementsToClear * field.count);
					array.set(zeroes, newCount * field.count);
				});
			}

			this.count_ = newCount;
			return invalidation;
		}


		extend(): InvalidatePointers {
			let invalidation = InvalidatePointers.No;

			if (this.count_ === this.capacity_) {
				invalidation = this.reserve(this.capacity_ * 2);
			}

			++this.count_;
			return invalidation;
		}


		indexedFieldView(index: number) {
			return this.fieldArrayView(this.fields_[index], this.data_!, this.capacity_);
		}
	}

} // ns sd.container
