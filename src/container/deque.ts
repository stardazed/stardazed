// container/deque - generic double-eneded queue container class
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="../core/util.ts" />

namespace sd.container {

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
				const lastBlockIndex = this.blocks_.length - 1;

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

} // ns sd.container
