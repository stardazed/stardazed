/**
 * entity/linear-range - simplest instance range
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class InstanceLinearIterator {
    constructor(first, last_) {
        this.last_ = last_;
        this.current = first - 1;
    }
    next() {
        this.current = (this.current + 1);
        return this.current > 0 && this.current <= this.last_;
    }
}
class InstanceLinearRange {
    constructor(first_, last_) {
        this.first_ = first_;
        this.last_ = last_;
        // valid ranges require first >= 1 and last >= first
        // invalid ranges are just treated as empty
    }
    get empty() {
        return this.first_ < 1 || this.last_ < this.first_;
    }
    get front() { return this.first_; }
    get back() { return this.last_; }
    has(inst) {
        return inst >= this.first_ && inst <= this.last_;
    }
    makeIterator() {
        return new InstanceLinearIterator(this.first_, this.last_);
    }
    forEach(fn, thisObj) {
        let index = this.first_;
        const end = this.last_;
        if (index > 0) {
            while (index <= end) {
                fn.call(thisObj, index);
                ++index;
            }
        }
    }
}

/**
 * container/algorithm - some container-oriented algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function appendArrayInPlace(dest, source) {
    const MAX_BLOCK_SIZE = 65535;
    let offset = 0;
    let itemsLeft = source.length;
    if (itemsLeft <= MAX_BLOCK_SIZE) {
        dest.push.apply(dest, source);
    }
    else {
        while (itemsLeft > 0) {
            const pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
            const subSource = source.slice(offset, offset + pushCount);
            dest.push.apply(dest, subSource);
            itemsLeft -= pushCount;
            offset += pushCount;
        }
    }
    return dest;
}

/**
 * core/debug - debugging helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * asserts a condition to be true or throw an error otherwise
 * @param cond A condition that can be evaluated to true or false
 * @param msg Error message that will be thrown if cond is false
 */
function assert(cond, msg) {
    if (!cond) {
        console.error(msg || "assertion failed");
        throw new Error(msg || "assertion failed");
    }
}

/**
 * container/deque - generic double-ended queue container class
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class Deque {
    constructor() {
        // -- block access
        this.blockCapacity = 512;
        this.blocks_ = [];
        this.blocks_.push(this.newBlock());
        this.headBlock_ = this.tailBlock_ = 0;
        this.headIndex_ = this.tailIndex_ = 0;
        this.count_ = 0;
    }
    newBlock() {
        return [];
    }
    get headBlock() { return this.blocks_[this.headBlock_]; }
    get tailBlock() { return this.blocks_[this.tailBlock_]; }
    // -- adding elements
    append(t) {
        if (this.tailIndex_ === this.blockCapacity) {
            if (this.tailBlock_ === this.blocks_.length - 1) {
                this.blocks_.push(this.newBlock());
            }
            this.tailBlock_++;
            this.tailIndex_ = 0;
        }
        this.tailBlock[this.tailIndex_] = t;
        ++this.tailIndex_;
        ++this.count_;
    }
    prepend(t) {
        if (this.headIndex_ === 0) {
            if (this.headBlock_ === 0) {
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
        if (this.headIndex_ === this.blockCapacity) {
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
    get empty() { return this.count_ === 0; }
    get front() {
        assert(this.count_ > 0);
        return this.headBlock[this.headIndex_];
    }
    get back() {
        assert(this.count_ > 0);
        return (this.tailIndex_ > 0) ? this.tailBlock[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity - 1];
    }
}

/**
 * container/sortedarray - always-sorted array type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function lowerBound(array, value) {
    let count = array.length;
    let it;
    let first = 0;
    while (count > 0) {
        const step = count >> 1;
        it = first + step;
        if (array[it] < value) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}
class SortedArray {
    constructor(source, compareFn_) {
        this.compareFn_ = compareFn_;
        this.data_ = source ? source.slice(0) : [];
        if (source) {
            this.sort();
        }
    }
    sort() {
        if (this.data_.length < 2) {
            return;
        }
        const t0 = this.data_[0];
        let cmp = this.compareFn_;
        if (cmp === undefined && typeof t0 !== "string") {
            cmp = (a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0);
        }
        this.data_.sort(cmp);
    }
    insert(value) {
        const successor = lowerBound(this.data_, value);
        this.data_.splice(successor, 0, value);
    }
    insertMultiple(values) {
        const sourceLength = values.length;
        if (sourceLength > Math.min(20, this.data_.length / 2)) {
            appendArrayInPlace(this.data_, values);
            this.sort();
        }
        else {
            for (let ix = 0; ix < sourceLength; ++ix) {
                this.insert(values[ix]);
            }
        }
    }
    get array() {
        return this.data_;
    }
    get length() {
        return this.data_.length;
    }
}

/**
 * entity/array-range - instance range as a sorted array
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class InstanceArrayIterator {
    constructor(array_) {
        this.array_ = array_;
        this.index_ = -1;
    }
    get current() {
        return this.array_[this.index_];
    }
    next() {
        this.index_ += 1;
        return this.index_ < this.array_.length;
    }
}
class InstanceArrayRange {
    constructor(array) {
        this.data_ = new SortedArray(array);
    }
    get empty() {
        return this.data_.length === 0;
    }
    get front() { return this.data_.array[0]; }
    get back() { return this.data_.array[this.data_.length - 1]; }
    has(inst) {
        return this.data_.array.indexOf(inst) > -1;
    }
    makeIterator() {
        return new InstanceArrayIterator(this.data_.array);
    }
    forEach(fn, thisObj) {
        let index = 0;
        const end = this.data_.length;
        while (index < end) {
            fn.call(thisObj, this.data_.array[index]);
            ++index;
        }
    }
}

/**
 * entity/set-range - instance range as a set, most flexible but also slowest
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class InstanceSetIterator {
    constructor(es6Iter) {
        this.es6Iter = es6Iter;
        this.current = 0;
    }
    next() {
        const res = this.es6Iter.next();
        this.current = res.value || 0;
        return !res.done;
    }
}
class InstanceSet {
    constructor() {
        this.data_ = new Set();
    }
    get count() { return this.data_.size; }
    get empty() { return this.data_.size === 0; }
    add(inst) {
        this.data_.add(inst);
    }
    addRange(inst, count) {
        let index = inst;
        const upto = index + count;
        while (index < upto) {
            this.data_.add(index);
            ++index;
        }
    }
    addArray(arr) {
        for (let ix = 0, end = arr.length; ix < end; ++ix) {
            this.data_.add(arr[ix]);
        }
    }
    remove(inst) {
        this.data_.delete(inst);
    }
    removeRange(inst, count) {
        let index = inst;
        const upto = index + count;
        while (index < upto) {
            this.data_.delete(index);
            ++index;
        }
    }
    removeArray(arr) {
        for (let ix = 0, end = arr.length; ix < end; ++ix) {
            this.data_.delete(arr[ix]);
        }
    }
    clear() {
        this.data_.clear();
    }
    has(inst) {
        return this.data_.has(inst);
    }
    makeIterator() {
        return new InstanceSetIterator(this.data_.values());
    }
    forEach(fn, thisObj) {
        this.data_.forEach(fn, thisObj || this);
    }
}

/**
 * core/debug - debugging helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * asserts a condition to be true or throw an error otherwise
 * @param cond A condition that can be evaluated to true or false
 * @param msg Error message that will be thrown if cond is false
 */
function assert$1(cond, msg) {
    if (!cond) {
        console.error(msg || "assertion failed");
        throw new Error(msg || "assertion failed");
    }
}

/**
 * core/array - types and helpers for array-likes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// TODO: move this out
function arrayTransfer(oldBuffer, newByteLength) {
    // This placeholder implementation cannot detach `oldBuffer`'s storage
    // but `oldBuffer` is to be treated as a moved-from value in C++ terms
    // after calling transfer.
    const oldByteLength = oldBuffer.byteLength;
    newByteLength = newByteLength | 0;
    assert$1(newByteLength > 0);
    if (newByteLength < oldByteLength) {
        return oldBuffer.slice(0, newByteLength);
    }
    const oldBufferView = new Uint8Array(oldBuffer);
    const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
    newBufferView.set(oldBufferView);
    return newBufferView.buffer;
}

/**
 * entity/entity - entities and shared interfaces
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// -- Entity bit-field build up
const entityIndexBits = 23; // numbers are signed int32 types internally in browsers when not used as int
const entityGenerationBits = 8;
const entityIndexMask = (1 << entityIndexBits) - 1;
const entityGenerationMask = (1 << entityGenerationBits) - 1;
function entityGeneration(ent) {
    return (ent >> entityIndexBits) & entityGenerationMask;
}
function entityIndex(ent) {
    return ent & entityIndexMask;
}
function makeEntity(index, generation) {
    return ((generation & entityGenerationMask) << entityIndexBits) | (index & entityIndexMask);
}
class EntityManager {
    constructor() {
        this.minFreedBuildup = 1024;
        this.generation_ = new Uint8Array(8192);
        this.freedIndices_ = new Deque();
        this.genCount_ = -1;
        // reserve entity id 0
        this.appendGeneration();
    }
    appendGeneration() {
        if (this.genCount_ === this.generation_.length) {
            // grow generation array
            const newBuffer = arrayTransfer(this.generation_.buffer, this.generation_.length * 2);
            this.generation_ = new Uint8Array(newBuffer);
        }
        ++this.genCount_;
        this.generation_[this.genCount_] = 0;
        return this.genCount_;
    }
    create() {
        let index;
        if (this.freedIndices_.count >= this.minFreedBuildup) {
            index = this.freedIndices_.front;
            this.freedIndices_.popFront();
        }
        else {
            index = this.appendGeneration();
        }
        return makeEntity(index, this.generation_[index]);
    }
    alive(ent) {
        // explicitly "inlined" calls to entityIndex/Generation as this method will be called a lot
        const index = ent & entityIndexMask;
        const generation = (ent >> entityIndexBits) & entityGenerationMask;
        return index <= this.genCount_ && (generation === this.generation_[index]);
    }
    destroy(ent) {
        const index = entityIndex(ent);
        this.generation_[index]++;
        this.freedIndices_.append(index);
    }
}

/**
 * @stardazed/entity - entities, instances and components
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { InstanceLinearRange, InstanceArrayRange, InstanceSet, entityGeneration, entityIndex, EntityManager };
//# sourceMappingURL=index.esm.js.map
