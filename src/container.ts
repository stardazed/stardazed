// containers - helpers to manage mostly dynamic typed arrays
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />
/// <reference path="math.ts" />

interface ArrayBufferConstructor {
	// proposed for ES7
	transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}

if (! ArrayBuffer.transfer) {
	ArrayBuffer.transfer = function(oldBuffer: ArrayBuffer, newByteLength?: number) {
		// This placeholder implementation cannot detach `oldBuffer`'s storage
		// but `oldBuffer` is to be treated as a moved-from value in C++ terms
		// after calling transfer.

		var oldByteLength = oldBuffer.byteLength;
		newByteLength = newByteLength | 0;
		assert(newByteLength > 0);

		if (newByteLength < oldByteLength) {
			return oldBuffer.slice(0, newByteLength);
		}

		var oldBufferView = new Uint8Array(oldBuffer);
		var newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
		newBufferView.set(oldBufferView);

		return newBufferView.buffer;
	}
}


namespace sd.container {

	export function copyElementRange<T>(src: ArrayLike<T>, srcOffset: number, srcCount: number, dest: ArrayLike<T>, destOffset: number) {
		for (var ix = 0; ix < srcCount; ++ix) {
			dest[destOffset++] = src[srcOffset++];
		}
	}


	export function fill<T>(dest: ArrayLike<T>, value: T, count: number, offset: number = 0) {
		for (var ix = 0; ix < count; ++ix) {
			dest[ix + offset] = value;
		}
	}


	// -- single element copy and set methods, mostly meant for accessors of components with MABs

	export function copyIndexedVec2(data: TypedArray, index: number): ArrayOfNumber {
		var offset = (index * 2) | 0;
		return [data[offset], data[offset + 1]];
	}

	export function setIndexedVec2(data: TypedArray, index: number, v2: ArrayOfNumber) {
		var offset = (index * 2) | 0;
		data[offset]     = v2[0];
		data[offset + 1] = v2[1];
	}


	export function copyIndexedVec3(data: TypedArray, index: number): ArrayOfNumber {
		var offset = (index * 3) | 0;
		return [data[offset], data[offset + 1], data[offset + 2]];
	}

	export function setIndexedVec3(data: TypedArray, index: number, v3: ArrayOfNumber) {
		var offset = (index * 3) | 0;
		data[offset]     = v3[0];
		data[offset + 1] = v3[1];
		data[offset + 2] = v3[2];
	}


	export function copyIndexedVec4(data: TypedArray, index: number): ArrayOfNumber {
		var offset = (index * 4) | 0;
		return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
	}

	export function setIndexedVec4(data: TypedArray, index: number, v4: ArrayOfNumber) {
		var offset = (index * 4) | 0;
		data[offset]     = v4[0];
		data[offset + 1] = v4[1];
		data[offset + 2] = v4[2];
		data[offset + 3] = v4[3];
	}


	//  ___                    
	// |   \ ___ __ _ _  _ ___ 
	// | |) / -_) _` | || / -_)
	// |___/\___\__, |\_,_\___|
	//             |_|         

	export class Deque<T> {
		private blocks_: T[][];
		private headBlock_: number;
		private headIndex_: number;
		private tailBlock_: number;
		private tailIndex_: number;
		private count_: number;

		// -- block access
		private blockCapacity = 512;

		private newBlock(): T[] {
			return [];
		}
			
		private get headBlock() { return this.blocks_[this.headBlock_]; }
		private get tailBlock() { return this.blocks_[this.tailBlock_]; }


		constructor() {
			this.blocks_ = [];
			this.blocks_.push(this.newBlock());

			this.headBlock_ = this.tailBlock_ = 0;
			this.headIndex_ = this.tailIndex_ = 0;
			this.count_ = 0;
		}


		// -- adding elements
		append(t: T) {
			if (this.tailIndex_ == this.blockCapacity) {
				if (this.tailBlock_ == this.blocks_.length - 1) {
					this.blocks_.push(this.newBlock());
				}

				this.tailBlock_++;
				this.tailIndex_ = 0;
			}

			this.tailBlock[this.tailIndex_] = t;
			++this.tailIndex_;
			++this.count_;
		}

		prepend(t: T) {
			if (this.headIndex_ == 0) {
				if (this.headBlock_ == 0) {
					this.blocks_.unshift(this.newBlock());
					++this.tailBlock_;
				}
				else {
					--this.headBlock_;
				}

				this.headIndex_ = this.blockCapacity;
			}

			--this.headIndex_;
			this.headBlock[this.headIndex_] = t;
			++this.count_;
		}


		// -- removing elements
		popFront() {
			assert(this.count_ > 0);

			delete this.headBlock[this.headIndex_];

			++this.headIndex_;

			if (this.headIndex_ == this.blockCapacity) {
				// Strategy: keep max. 1 block before head if it was previously created.
				// Once we get to 2 empty blocks before head, then remove the front block.

				if (this.headBlock_ == 0) {
					++this.headBlock_;
				}
				else if (this.headBlock_ == 1) {
					this.blocks_.shift();
					this.tailBlock_--;
				}

				this.headIndex_ = 0;
			}

			--this.count_;
		}


		popBack() {
			assert(this.count_ > 0);

			if (this.tailIndex_ == 0) {
				// Strategy: keep max. 1 block after tail if it was previously created.
				// Once we get to 2 empty blocks after tail, then remove the back block.
					
				var lastBlockIndex = this.blocks_.length - 1;

				if (this.tailBlock_ == lastBlockIndex - 1) {
					this.blocks_.pop();
				}

				--this.tailBlock_;
				this.tailIndex_ = this.blockCapacity;
			}

			--this.tailIndex_;

			delete this.tailBlock[this.tailIndex_];

			--this.count_;
		}


		clear() {
			this.blocks_ = [];

			this.headBlock_ = this.tailBlock_ = 0;
			this.headIndex_ = this.tailIndex_ = 0;
			this.count_ = 0;
		}
			

		// -- observers
		get count() { return this.count_; }
		get empty() { return this.count_ == 0; }

		get front(): T {
			assert(this.count_ > 0);
			return this.headBlock[this.headIndex_];
		}

		get back(): T {
			assert(this.count_ > 0);
			return (this.tailIndex_ > 0) ? this.tailBlock[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity - 1];
		}
	}


	//  __  __      _ _   _   _                     ___       __  __         
	// |  \/  |_  _| | |_(_) /_\  _ _ _ _ __ _ _  _| _ )_  _ / _|/ _|___ _ _ 
	// | |\/| | || | |  _| |/ _ \| '_| '_/ _` | || | _ \ || |  _|  _/ -_) '_|
	// |_|  |_|\_,_|_|\__|_/_/ \_\_| |_| \__,_|\_, |___/\_,_|_| |_| \___|_|  
	//                                         |__/                          

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


	export class MultiArrayBuffer {
		private fields_: PositionedMABField[];
		private capacity_ = 0;
		private count_ = 0;
		private elementSumSize_ = 0;
		private data_: ArrayBuffer = null;


		constructor(initialCapacity: number, fields: MABField[]) {
			var totalOffset = 0;
			this.fields_ = fields.map((field: MABField, ix: number) => {
				var curOffset = totalOffset;
				var sizeBytes = field.type.byteSize * field.count;
				totalOffset += sizeBytes;

				return {
					type: field.type,
					count: field.count,
					byteOffset: curOffset,
					sizeBytes: sizeBytes
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
			var byteOffset = f.byteOffset * itemCount;
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

			var invalidation = InvalidatePointers.No;
			var newSizeBytes = newCapacity * this.elementSumSize_;

			var newData = new ArrayBuffer(newSizeBytes);
			assert(newData);
		
			if (this.data_) {
				// Since a capacity change will change the length of each array individually
				// we need to re-layout the data in the new buffer.
				// We iterate over the basePointers and copy count_ elements from the old
				// data to each new array. With large arrays >100k elements this can take
				// millisecond-order time, so avoid resizes when possible.

				this.fields_.forEach((f, ix) => {
					var oldView = this.fieldArrayView(f, this.data_, this.count_);
					var newView = this.fieldArrayView(f, newData, newCapacity);
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

			var numDoubles = (this.data_.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
			var doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
			var remainingBytes = this.data_.byteLength - doublesByteSize;

			// As of 2015-11, a loop-zero construct is faster than TypedArray create+set for large arrays in most browsers
			var doubleView = new Float64Array(this.data_);
			var remainderView = new Uint8Array(this.data_, doublesByteSize);
			for (var d = 0; d < numDoubles; ++d) {
				doubleView[d] = 0;
			}
			for (var b = 0; b < remainingBytes; ++b) {
				remainderView[b] = 0;
			}
		}


		resize(newCount: number): InvalidatePointers {
			var invalidation = InvalidatePointers.No;

			if (newCount > this.capacity_) {
				// automatically expand up to next highest power of 2 size
				invalidation = this.reserve(math.roundUpPowerOf2(newCount));
			}
			else if (newCount < this.count_) {
				// Reducing the count will clear the now freed up elements so that when
				// a new allocation is made the element data is guaranteed to be zeroed.

				var elementsToClear = this.count_ - newCount;

				this.fields_.forEach((f, ix) => {
					var array = this.fieldArrayView(f, this.data_, this.count_);
					var zeroes = new (f.type.arrayType)(elementsToClear * f.count);
					array.set(zeroes, newCount * f.count);
				});
			}

			this.count_ = newCount;
			return invalidation;
		}


		extend(): InvalidatePointers {
			var invalidation = InvalidatePointers.No;

			if (this.count_ == this.capacity_) {
				invalidation = this.reserve(this.capacity_ * 2);
			}

			++this.count_;
			return invalidation;
		}


		indexedFieldView(index: number) {
			return this.fieldArrayView(this.fields_[index], this.data_, this.capacity_);
		}
	}

} // ns sd.container
