/**
 * queue/chunked-queue - generic chunked large queue
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

const CHUNK_SIZE = 32768;

/**
 * Generic queue with array-like methods. Uses a chunked array backing store
 * which avoids a perf bug in Chrome shift()ing values from large queues.
 *
 * Avoid using this for small (< 32K elements) queues, just use an array.
 *
 * Use {@link NumericQueue} for typed numeric queues (of any size).
 */
export class ChunkedQueue<T> {
	/** @internal */
	private readonly chunks_: T[][];
	/** @internal */
	private readChunk_: T[];
	/** @internal */
	private writeChunk_: T[];
	/** @internal */
	private length_: number;

	constructor() {
		this.chunks_ = [[]];
		this.readChunk_ = this.writeChunk_ = this.chunks_[0];
		this.length_ = 0;
	}

	push(t: T): void {
		this.writeChunk_.push(t);
		this.length_ += 1;
		if (this.writeChunk_.length === CHUNK_SIZE) {
			this.writeChunk_ = [];
			this.chunks_.push(this.writeChunk_);
		}
	}

	front(): T | undefined {
		if (this.length_ === 0) {
			return undefined;
		}
		return this.readChunk_[0];
	}

	shift(): T | undefined {
		if (this.length_ === 0) {
			return undefined;
		}
		const t = this.readChunk_.shift();

		this.length_ -= 1;
		if (this.readChunk_.length === 0 && this.readChunk_ !== this.writeChunk_) {
			this.chunks_.shift();
			this.readChunk_ = this.chunks_[0];
		}
		return t;
	}

	get length() {
		return this.length_;
	}
}
