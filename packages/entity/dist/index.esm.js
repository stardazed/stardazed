import { SortedArray, transferArrayBuffer, Deque } from '@stardazed/container';

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
 * entity/entity - entities and shared interfaces
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// -- Entity bit-field build up
const entityIndexBits = 24; // numbers are signed int32 types internally in browsers when used as int, but can be treated unsigned
const entityGenerationBits = 8;
const entityIndexMask = (1 << entityIndexBits) - 1;
const entityGenerationMask = (1 << entityGenerationBits) - 1;
function entityGeneration(ent) {
    return (ent >>> entityIndexBits) & entityGenerationMask;
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
            const newBuffer = transferArrayBuffer(this.generation_.buffer, this.generation_.length * 2);
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
        const generation = (ent >>> entityIndexBits) & entityGenerationMask;
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
