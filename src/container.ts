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


namespace sd {

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
		private blockCapacity = 128;

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

} // ns sd
