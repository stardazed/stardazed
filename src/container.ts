// containers - helpers to manage mostly dynamic typed arrays
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />
/// <reference path="numeric.ts" />

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
			
		private headBlock() { return this.blocks_[this.headBlock_]; }
		private tailBlock() { return this.blocks_[this.tailBlock_]; }


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

			this.tailBlock()[this.tailIndex_] = t;
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
			this.headBlock()[this.headIndex_] = t;
			++this.count_;
		}


		// -- removing elements
		popFront() {
			assert(this.count_ > 0);

			delete this.headBlock()[this.headIndex_];

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

			delete this.tailBlock()[this.tailIndex_];

			--this.count_;
		}


		clear() {
			this.blocks_ = [];

			this.headBlock_ = this.tailBlock_ = 0;
			this.headIndex_ = this.tailIndex_ = 0;
			this.count_ = 0;
		}
			

		// -- observers
		count() { return this.count_; }
		empty() { return this.count_ == 0; }

		front(): T {
			assert(this.count_ > 0);
			return this.headBlock()[this.headIndex_];
		}

		back(): T {
			assert(this.count_ > 0);
			return (this.tailIndex_ > 0) ? this.tailBlock()[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity - 1];
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


		capacity() { return this.capacity_; }
		count() { return this.count_; }
		backIndex() {
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

			newCapacity = alignUp(newCapacity, 32);
			if (newCapacity <= this.capacity()) {
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
			// This behaviour differs from the C++ implementation in that this replaces the buffer with
			// a newly created one. For clients there is no noticeable difference.
			this.count_ = 0;
			this.data_ = new ArrayBuffer(this.capacity_ * this.elementSumSize_);
		}


		resize(newCount: number): InvalidatePointers {
			var invalidation = InvalidatePointers.No;

			if (newCount > this.capacity_) {
				invalidation = this.reserve(newCount);
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
