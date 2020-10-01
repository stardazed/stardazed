/*
container/numeric-queue - numeric chunked queue
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

/**
 * Numeric queue with array-like methods.
 *
 * Use {@link ChunkedQueue} for large non-numeric queues.
 */
export class NumericQueue {
	/** @internal */
	private readonly chunkCtor_: TypedArrayConstructor;
	/** @internal */
	private readonly chunkCapacity_: number;

	/** @internal */
	private chunks_: TypedArray[];
	/** @internal */
	private headChunk_: TypedArray;
	/** @internal */
	private headIndex_: number;
	/** @internal */
	private tailChunk_: TypedArray;
	/** @internal */
	private tailIndex_: number;
	/** @internal */
	private length_: number;

	/** @internal */
	private newChunk() {
		return new this.chunkCtor_(this.chunkCapacity_);
	}

	/**
	 * @expects isPositiveNonZeroInteger(chunkCapacity)
	 */
	constructor(chunkType: TypedArrayConstructor, chunkCapacity = 512) {
		this.chunkCtor_ = chunkType;
		this.chunkCapacity_ = chunkCapacity;

		this.chunks_ = [];
		const firstChunk = this.newChunk();
		this.chunks_.push(firstChunk);

		this.headChunk_ = this.tailChunk_ = firstChunk;
		this.headIndex_ = this.tailIndex_ = 0;
		this.length_ = 0;
	}

	push(n: number) {
		this.tailChunk_[this.tailIndex_] = n;
		++this.tailIndex_;

		if (this.tailIndex_ === this.chunkCapacity_) {
			this.tailChunk_ = this.newChunk();
			this.chunks_.push(this.tailChunk_);
			this.tailIndex_ = 0;
		}

		++this.length_;
	}

	/**
	 * @expects this.length > 0
	 */
	shift() {
		const value = this.headChunk_[this.headIndex_];
		++this.headIndex_;

		if (this.headIndex_ === this.chunkCapacity_) {
			this.chunks_.shift();
			this.headChunk_ = this.chunks_[0];
			this.headIndex_ = 0;
		}

		--this.length_;
		return value;
	}

	clear() {
		this.chunks_ = [];
		const firstChunk = this.newChunk();
		this.chunks_.push(firstChunk);
		this.headChunk_ = this.tailChunk_ = firstChunk;
		this.headIndex_ = this.tailIndex_ = 0;
		this.length_ = 0;
	}

	get length() { return this.length_; }
	get empty() { return this.length_ === 0; }

	/**
	 * @expects this.length > 0
	 */
	get front() {
		return this.headChunk_[this.headIndex_];
	}
}
