/**
 * container/deque - double-ended typed queue container class
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert, TypedArrayConstructor, TypedArray } from "@stardazed/core";

export class Deque {
	private readonly blockCtor_: TypedArrayConstructor;
	private readonly blockCapacity_: number;

	private blocks_: TypedArray[];
	private headBlock_: number;
	private headIndex_: number;
	private tailBlock_: number;
	private tailIndex_: number;
	private count_: number;

	private newBlock() {
		return new this.blockCtor_(this.blockCapacity_);
	}

	private get headBlock() { return this.blocks_[this.headBlock_]; }
	private get tailBlock() { return this.blocks_[this.tailBlock_]; }

	constructor(blockType: TypedArrayConstructor, blockCapacity = 512) {
		this.blockCtor_ = blockType;
		this.blockCapacity_ = blockCapacity;

		this.blocks_ = [];
		this.blocks_.push(this.newBlock());

		this.headBlock_ = this.tailBlock_ = 0;
		this.headIndex_ = this.tailIndex_ = 0;
		this.count_ = 0;
	}

	append(n: number) {
		if (this.tailIndex_ === this.blockCapacity_) {
			if (this.tailBlock_ === this.blocks_.length - 1) {
				this.blocks_.push(this.newBlock());
			}

			this.tailBlock_++;
			this.tailIndex_ = 0;
		}

		this.tailBlock[this.tailIndex_] = n;
		++this.tailIndex_;
		++this.count_;
	}

	prepend(n: number) {
		if (this.headIndex_ === 0) {
			if (this.headBlock_ === 0) {
				this.blocks_.unshift(this.newBlock());
				++this.tailBlock_;
			}
			else {
				--this.headBlock_;
			}

			this.headIndex_ = this.blockCapacity_;
		}

		--this.headIndex_;
		this.headBlock[this.headIndex_] = n;
		++this.count_;
	}

	popFront() {
		assert(this.count_ > 0);

		const value = this.headBlock[this.headIndex_];

		++this.headIndex_;

		if (this.headIndex_ === this.blockCapacity_) {
			// Strategy: keep max. 1 block before head if it was previously created.
			// Once we get to 2 empty blocks before head, then remove the front block.

			if (this.headBlock_ === 0) {
				++this.headBlock_;
			}
			else if (this.headBlock_ === 1) {
				this.blocks_.shift();
				this.tailBlock_--;
			}

			this.headIndex_ = 0;
		}

		--this.count_;
		return value;
	}

	popBack() {
		assert(this.count_ > 0);

		if (this.tailIndex_ === 0) {
			// Strategy: keep max. 1 block after tail if it was previously created.
			// Once we get to 2 empty blocks after tail, then remove the back block.
			const lastBlockIndex = this.blocks_.length - 1;

			if (this.tailBlock_ === lastBlockIndex - 1) {
				this.blocks_.pop();
			}

			--this.tailBlock_;
			this.tailIndex_ = this.blockCapacity_;
		}

		--this.tailIndex_;
		--this.count_;

		return this.tailBlock[this.tailIndex_];
	}

	clear() {
		this.blocks_ = [];

		this.headBlock_ = this.tailBlock_ = 0;
		this.headIndex_ = this.tailIndex_ = 0;
		this.count_ = 0;
	}

	get count() { return this.count_; }
	get empty() { return this.count_ === 0; }

	get front() {
		assert(this.count_ > 0);
		return this.headBlock[this.headIndex_];
	}

	get back() {
		assert(this.count_ > 0);
		return (this.tailIndex_ > 0) ? this.tailBlock[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity_ - 1];
	}
}
