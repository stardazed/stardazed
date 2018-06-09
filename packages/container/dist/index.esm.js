/**
 * container/algorithm - some container-oriented algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * Generate a hash value (a number containing a 32-bit signed int) for a string.
 * Based on Java's string hashing algorithm adapted for how JS stores strings.
 * @param s The string to hash
 */
function hashString(s) {
    if (s.length === 0) {
        return 0;
    }
    let hash = 0;
    for (let i = 0; i < s.length; ++i) {
        const chr = s.charCodeAt(i);
        // JS charcodes are 16-bit, hash higher-order byte first (often 0)
        hash = (((hash << 5) - hash) + ((chr >> 8) & 0xFF)) | 0;
        // hash lower-order byte
        hash = (((hash << 5) - hash) + (chr & 0xFF)) | 0;
    }
    return hash;
}
/**
 * Copy all or a specified set of values from source to dest, including undefined values.
 * Thus, this may unset values in the destination object as well as set or change them.
 * @param dest The object to overwrite values in
 * @param source The source object to read values from
 * @param keys Optional explicit set of keys to copy, defaults to all values in source
 */
function override(dest, source, keys) {
    if (keys === undefined) {
        keys = Object.keys(source);
    }
    for (const k of keys) {
        dest[k] = source[k];
    }
    return dest;
}
/**
 * Map each keyed property of obj using the provided function returning a new object.
 * @param obj The source object to convert
 * @param mapper A conversion function that takes each keyed prop of obj and returns a converted value
 */
function mapObject(obj, mapper) {
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = mapper(obj[key], key);
        }
    }
    return result;
}
/**
 * Takes an array of isomorphic objects and groups the values of the fields together keyed
 * by a field name provided as group. The grouped values are deduplicated as well.
 * @example Given ts = [{n:"a", v:1}, {n:"a", v:2}, {n:"b", v:50}] and group = "n"
 * the output will be: { a:{v:[1,2]}, b:{v:[50]} }
 * @param group Name of the field in the items that will be used to group the other fields by
 * @param ts List of objects that have will be grouped by {{group}}
 */
function groupFieldsBy(group, ts) {
    return ts.reduce((res, val) => {
        const key = val[group]; // FIXME: check with TS group why K is not essentially a string
        let coll;
        if (!(key in res)) {
            coll = {};
            res[key] = coll;
        }
        else {
            coll = res[key];
        }
        for (const k in val) {
            if (k !== group && val.hasOwnProperty(k)) {
                if (!(k in coll)) {
                    coll[k] = [];
                }
                if (coll[k].indexOf(val[k]) === -1) {
                    coll[k].push(val[k]);
                }
            }
        }
        return res;
    }, {});
}
/**
 * Make a lowerBound function for a specific data type.
 * @see lowerBound
 * @returns a lowerBound function specialized with the specified comparator
 */
const makeLowerBound = (comp) => (array, value) => {
    let count = array.length;
    let it;
    let first = 0;
    while (count > 0) {
        const step = count >> 1;
        it = first + step;
        if (comp(array[it], value)) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
};
/**
 * Make an upperBound function for a specific data type.
 * @see upperBound
 * @returns an upperBound function specialized with the specified comparator
 */
const makeUpperBound = (comp) => (array, value) => {
    let count = array.length;
    let it;
    let first = 0;
    while (count > 0) {
        const step = count >> 1;
        it = first + step;
        if (!comp(value, array[it])) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
};
/**
 * Returns an index pointing to the first element in the array that is not less than
 * (i.e. greater or equal to) value, or array.length if no such element is found.
 */
const lowerBound = makeLowerBound((a, b) => a < b);
/**
 * Returns an index pointing to the first element in the array that is greater than value,
 * or array.length if no such element is found.
 */
const upperBound = makeUpperBound((a, b) => a < b);
/**
 * Remove all duplicates found in the source array leaving only the first
 * instance of each individual element, leaving the order of the remaining
 * elements intact. Elements can optionally be given an explicit comparison proxy
 * by means of a provided helper function.
 * @param arr Source array
 * @param idGen Optional function to provide a unique identifier for each item
 */
function stableUnique(arr, idGen) {
    const seen = new Set();
    return arr.filter(val => {
        const key = idGen ? idGen(val) : val;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
/**
 * Deep clone an object. Use only for simple struct types.
 * @param object The object to clone
 */
function cloneStructDeep(object) {
    const copy = {};
    Object.getOwnPropertyNames(object).forEach(name => {
        if (typeof object[name] === "object" && object[name] !== null) {
            copy[name] = cloneStructDeep(object[name]);
        }
        else {
            copy[name] = object[name];
        }
    });
    return copy;
}
/**
 * Returns the count of properties in an object.
 * @param obj Any object
 */
function propertyCount(obj) {
    return Object.getOwnPropertyNames(obj).length;
}
/**
 * Create an immutable object that acts as a lookup table with numerical keys, such as (const) enum values.
 * @param keyVals Alternating key, value pairs
 */
function makeLUT(...keyVals) {
    const lut = {};
    const count = keyVals.length;
    for (let i = 0; i < count; i += 2) {
        lut[keyVals[i]] = keyVals[i + 1];
    }
    return Object.freeze(lut);
}

/**
 * container/array - helpers to manage mostly dynamic typed arrays
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function transferArrayBuffer(oldBuffer, newByteLength) {
    const oldByteLength = oldBuffer.byteLength;
    newByteLength = newByteLength | 0;
    if (newByteLength < oldByteLength) {
        return oldBuffer.slice(0, newByteLength);
    }
    const oldBufferView = new Uint8Array(oldBuffer);
    const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
    newBufferView.set(oldBufferView);
    return newBufferView.buffer;
}
function clearArrayBuffer(data) {
    const numDoubles = (data.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
    const doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
    const remainingBytes = data.byteLength - doublesByteSize;
    const doubleView = new Float64Array(data);
    const remainderView = new Uint8Array(data, doublesByteSize);
    if (doubleView.fill) {
        doubleView.fill(0);
    }
    else {
        // As of 2015-11, a loop-zero construct is faster than TypedArray create+set for large arrays in most browsers
        for (let d = 0; d < numDoubles; ++d) {
            doubleView[d] = 0;
        }
    }
    for (let b = 0; b < remainingBytes; ++b) {
        remainderView[b] = 0;
    }
}
function copyElementRange(dest, destOffset, src, srcOffset, srcCount) {
    for (let ix = 0; ix < srcCount; ++ix) {
        dest[destOffset++] = src[srcOffset++];
    }
    return dest;
}
function fill(dest, value, count, offset = 0) {
    for (let ix = 0; ix < count; ++ix) {
        dest[ix + offset] = value;
    }
    return dest;
}
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
// -- single element ref, copy and set methods, mostly meant for accessors of components with MABs
function refIndexedVec2(data, index) {
    return data.subarray(index * 2, (index + 1) * 2);
}
function copyIndexedVec2(data, index) {
    const offset = (index * 2) | 0;
    return [data[offset], data[offset + 1]];
}
function setIndexedVec2(data, index, v2) {
    const offset = (index * 2) | 0;
    data[offset] = v2[0];
    data[offset + 1] = v2[1];
}
function copyVec2FromOffset(data, offset) {
    return [data[offset], data[offset + 1]];
}
function setVec2AtOffset(data, offset, v2) {
    data[offset] = v2[0];
    data[offset + 1] = v2[1];
}
function offsetOfIndexedVec2(index) { return (index * 2) | 0; }
function refIndexedVec3(data, index) {
    return data.subarray(index * 3, (index + 1) * 3);
}
function copyIndexedVec3(data, index) {
    const offset = (index * 3) | 0;
    return [data[offset], data[offset + 1], data[offset + 2]];
}
function setIndexedVec3(data, index, v3) {
    const offset = (index * 3) | 0;
    data[offset] = v3[0];
    data[offset + 1] = v3[1];
    data[offset + 2] = v3[2];
}
function copyVec3FromOffset(data, offset) {
    return [data[offset], data[offset + 1], data[offset + 2]];
}
function setVec3AtOffset(data, offset, v3) {
    data[offset] = v3[0];
    data[offset + 1] = v3[1];
    data[offset + 2] = v3[2];
}
function offsetOfIndexedVec3(index) { return (index * 3) | 0; }
function refIndexedVec4(data, index) {
    return data.subarray(index * 4, (index + 1) * 4);
}
function copyIndexedVec4(data, index) {
    const offset = (index * 4) | 0;
    return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
}
function setIndexedVec4(data, index, v4) {
    const offset = (index * 4) | 0;
    data[offset] = v4[0];
    data[offset + 1] = v4[1];
    data[offset + 2] = v4[2];
    data[offset + 3] = v4[3];
}
function copyVec4FromOffset(data, offset) {
    return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
}
function setVec4AtOffset(data, offset, v4) {
    data[offset] = v4[0];
    data[offset + 1] = v4[1];
    data[offset + 2] = v4[2];
    data[offset + 3] = v4[3];
}
function offsetOfIndexedVec4(index) { return (index * 4) | 0; }
function refIndexedMat3(data, index) {
    return data.subarray(index * 9, (index + 1) * 9);
}
function copyIndexedMat3(data, index) {
    const offset = (index * 9) | 0;
    return [
        data[offset], data[offset + 1], data[offset + 2],
        data[offset + 3], data[offset + 4], data[offset + 5],
        data[offset + 6], data[offset + 7], data[offset + 8],
    ];
}
function setIndexedMat3(data, index, m3) {
    const offset = (index * 9) | 0;
    data[offset] = m3[0];
    data[offset + 1] = m3[1];
    data[offset + 2] = m3[2];
    data[offset + 3] = m3[3];
    data[offset + 4] = m3[4];
    data[offset + 5] = m3[5];
    data[offset + 6] = m3[6];
    data[offset + 7] = m3[7];
    data[offset + 8] = m3[8];
}
function offsetOfIndexedMat3(index) { return (index * 9) | 0; }
function refIndexedMat4(data, index) {
    return data.subarray(index * 16, (index + 1) * 16);
}
function copyIndexedMat4(data, index) {
    const offset = (index * 16) | 0;
    return [
        data[offset], data[offset + 1], data[offset + 2], data[offset + 3],
        data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7],
        data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11],
        data[offset + 12], data[offset + 13], data[offset + 14], data[offset + 15]
    ];
}
function setIndexedMat4(data, index, m4) {
    const offset = (index * 16) | 0;
    data[offset] = m4[0];
    data[offset + 1] = m4[1];
    data[offset + 2] = m4[2];
    data[offset + 3] = m4[3];
    data[offset + 4] = m4[4];
    data[offset + 5] = m4[5];
    data[offset + 6] = m4[6];
    data[offset + 7] = m4[7];
    data[offset + 8] = m4[8];
    data[offset + 9] = m4[9];
    data[offset + 10] = m4[10];
    data[offset + 11] = m4[11];
    data[offset + 12] = m4[12];
    data[offset + 13] = m4[13];
    data[offset + 14] = m4[14];
    data[offset + 15] = m4[15];
}
function offsetOfIndexedMat4(index) { return (index * 16) | 0; }

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
 * math/common - shared elements
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// roundUpPowerOf2
// return closest powerOf2 number that is >= n
// e.g.: 15 -> 16; 16 -> 16; 17 -> 32
function roundUpPowerOf2(n) {
    if (n <= 0) {
        return 1;
    }
    n = (n | 0) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
}
// alignUp
// round val up to closest alignmentPow2
function alignUp(val, alignmentPow2) {
    return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
}

/**
 * container/arraybuffer - arrays of structs and structs of arrays (numeric data only)
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function mabFieldSizeBytes(field) {
    return field.type.byteSize * field.count;
}
function packMABFields(fields) {
    let totalOffset = 0;
    const posFields = fields.map(field => {
        const curOffset = totalOffset;
        const sizeBytes = mabFieldSizeBytes(field);
        totalOffset += sizeBytes;
        return {
            type: field.type,
            count: field.count,
            byteOffset: curOffset,
            sizeBytes
        };
    });
    return { posFields, totalSizeBytes: totalOffset };
}
function alignMABField(field, offset) {
    const sizeBytes = mabFieldSizeBytes(field);
    const mask = roundUpPowerOf2(sizeBytes) - 1;
    return (offset + mask) & ~mask;
}
function alignMABFields(fields) {
    let totalOffset = 0;
    const posFields = fields.map(field => {
        const curOffset = totalOffset;
        totalOffset = alignMABField(field, totalOffset);
        return {
            type: field.type,
            count: field.count,
            byteOffset: curOffset,
            sizeBytes: mabFieldSizeBytes(field)
        };
    });
    return { posFields, totalSizeBytes: totalOffset };
}
class FixedMultiArray {
    constructor(capacity_, fields) {
        this.capacity_ = capacity_;
        const { posFields, totalSizeBytes } = packMABFields(fields);
        this.data_ = new ArrayBuffer(totalSizeBytes * capacity_);
        this.basePointers_ = posFields.map(posField => {
            const byteOffset = capacity_ * posField.byteOffset;
            return new (posField.type.arrayType)(this.data_, byteOffset, capacity_ * posField.count);
        });
    }
    get capacity() { return this.capacity_; }
    get data() { return this.data_; }
    clear() {
        clearArrayBuffer(this.data_);
    }
    indexedFieldView(index) {
        return this.basePointers_[index];
    }
}
class MultiArrayBuffer {
    constructor(initialCapacity, fields) {
        this.capacity_ = 0;
        this.count_ = 0;
        this.elementSumSize_ = 0;
        this.data_ = null;
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
    fieldArrayView(f, buffer, itemCount) {
        const byteOffset = f.byteOffset * itemCount;
        return new (f.type.arrayType)(buffer, byteOffset, itemCount * f.count);
    }
    reserve(newCapacity) {
        assert(newCapacity > 0);
        // By forcing an allocated multiple of 32 elements, we never have
        // to worry about padding between consecutive arrays. 32 is chosen
        // as it is the AVX layout requirement, so e.g. a char field followed
        // by an m256 field will be aligned regardless of array length.
        // We could align to 16 or even 8 and likely be fine, but this container
        // isn't meant for tiny arrays so 32 it is.
        newCapacity = alignUp(newCapacity, 32);
        if (newCapacity <= this.capacity_) {
            // TODO: add way to cut capacity?
            return 0 /* No */;
        }
        const newData = new ArrayBuffer(newCapacity * this.elementSumSize_);
        assert(newData);
        let invalidation = 0 /* No */;
        if (this.data_) {
            // Since a capacity change will change the length of each array individually
            // we need to re-layout the data in the new buffer.
            // We iterate over the basePointers and copy count_ elements from the old
            // data to each new array. With large arrays >100k elements this can take
            // millisecond-order time, so avoid resizes when possible.
            this.fields_.forEach(field => {
                const oldView = this.fieldArrayView(field, this.data_, this.count_);
                const newView = this.fieldArrayView(field, newData, newCapacity);
                newView.set(oldView);
            });
            invalidation = 1 /* Yes */;
        }
        this.data_ = newData;
        this.capacity_ = newCapacity;
        return invalidation;
    }
    clear() {
        this.count_ = 0;
        clearArrayBuffer(this.data_);
    }
    resize(newCount) {
        let invalidation = 0 /* No */;
        if (newCount > this.capacity_) {
            // automatically expand up to next highest power of 2 size
            invalidation = this.reserve(roundUpPowerOf2(newCount));
        }
        else if (newCount < this.count_) {
            // Reducing the count will clear the now freed up elements so that when
            // a new allocation is made the element data is guaranteed to be zeroed.
            const elementsToClear = this.count_ - newCount;
            this.fields_.forEach(field => {
                const array = this.fieldArrayView(field, this.data_, this.count_);
                const zeroes = new (field.type.arrayType)(elementsToClear * field.count);
                array.set(zeroes, newCount * field.count);
            });
        }
        this.count_ = newCount;
        return invalidation;
    }
    extend() {
        let invalidation = 0 /* No */;
        if (this.count_ === this.capacity_) {
            invalidation = this.reserve(this.capacity_ * 2);
        }
        ++this.count_;
        return invalidation;
    }
    indexedFieldView(index) {
        return this.fieldArrayView(this.fields_[index], this.data_, this.capacity_);
    }
}
class FixedStructArray {
    constructor(capacity, fields) {
        const result = alignMABFields(fields);
        this.fields_ = result.posFields;
        this.structSize_ = result.totalSizeBytes;
        this.capacity_ = capacity;
        this.data_ = new ArrayBuffer(this.structSize_ * this.capacity_);
    }
    indexedStructBuffer(structIndex) {
        const byteOffset = structIndex * this.structSize_;
        return this.data_.slice(byteOffset, byteOffset + this.structSize_);
    }
    indexedStructFieldView(structIndex, fieldIndex) {
        const f = this.fields_[fieldIndex];
        const byteOffset = (structIndex * this.structSize_) + f.byteOffset;
        return new (f.type.arrayType)(this.data_, byteOffset, f.count);
    }
    get structSizeBytes() { return this.structSize_; }
    get capacity() { return this.capacity_; }
    get data() { return this.data_; }
    clear() {
        clearArrayBuffer(this.data_);
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
 * container/sort - sorting algorithms
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * Standard (string) sort comparison function, used when comparing
 * multiple string fields together or when using non-standard sort.
 * @param a left string to compare
 * @param b right string to compare
 */
function genericOrder(a, b) {
    return a < b ? -1 : ((a === b) ? 0 : 1);
}
/**
 * In-place stable insertion sort a range of elements inside an array
 * @internal
 * @param a The array to sort
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param pred Function that returns the relative order of 2 items
 */
function insertionSortInternal(a, l, r, pred) {
    const len = r - l;
    for (let i = 1; i < len + 1; i++) {
        const temp = a[i + l];
        let j = i;
        while ((j > 0) && (pred(a[j + l - 1], temp) > 0)) {
            a[j + l] = a[j + l - 1];
            j -= 1;
        }
        a[j + l] = temp;
    }
}
/**
 * In-place stable insertion sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
function insertionSort(a, pred) {
    insertionSortInternal(a, 0, a.length - 1, pred);
    return a;
}
/**
 * Standard merge of two sorted half arrays into a single sorted array.
 * @internal
 * @param merged Destination array
 * @param start Index into {merged} to start inserting
 * @param left Left range of items
 * @param startLeft Index into {left} to start from
 * @param sizeLeft Count of items in {left} to process
 * @param right Right range of items
 * @param startRight Index into {right} to start from
 * @param sizeRight Count of items in {right} to process
 * @param pred Function that returns the relative order of 2 items
 */
function merge(merged, start, left, startLeft, sizeLeft, right, startRight, sizeRight, pred) {
    const totalSize = sizeLeft + sizeRight;
    const endMerged = start + totalSize;
    const endLeft = startLeft + sizeLeft;
    const endRight = startRight + sizeRight;
    for (let i = startLeft, j = startRight, k = start; k < endMerged; k++) {
        // if reached end of first half array, run through the loop 
        // filling in only from the second half array
        if (i === endLeft) {
            merged[k] = right[j++];
            continue;
        }
        // if reached end of second half array, run through the loop 
        // filling in only from the first half array
        if (j === endRight) {
            merged[k] = left[i++];
            continue;
        }
        // merged array is filled with the smaller or equal element of the two 
        // arrays, in order, ensuring a stable sort
        merged[k] = (pred(left[i], right[j]) <= 0) ?
            left[i++] : right[j++];
    }
}
/**
 * Merge sort data during merging without the additional copying back to array.
 * All data movement is done during the course of the merges.
 * @internal
 * @param a Source array
 * @param b Duplicate of source array
 * @param l Left index (inclusive) inside {a} of the range to operate on
 * @param r Right index (exclusive) inside {a} of the range to operate on
 * @param pred Function that returns the relative order of 2 items
 */
function mergeSortInternal(a, b, l, r, pred) {
    if (r <= l) {
        return;
    }
    if (r - l <= 10) {
        insertionSortInternal(a, l, r, pred);
        return;
    }
    const m = ((l + r) / 2) >>> 0;
    // switch arrays to msort b thus recursively writing results to b
    mergeSortInternal(b, a, l, m, pred); // merge sort left
    mergeSortInternal(b, a, m + 1, r, pred); // merge sort right
    // merge partitions of b into a
    merge(a, l, b, l, m - l + 1, b, m + 1, r - m, pred); // merge
}
/**
 * In-place stable merge sort for homogeneous standard arrays.
 * @param a The array to be sorted (in-place)
 * @param pred Function that returns the relative order of 2 items
 * @returns The sorted array
 */
function mergeSort(a, pred) {
    const b = a.slice(0);
    mergeSortInternal(a, b, 0, a.length - 1, pred);
    return a;
}
/**
 * @alias mergeSort The common stable sort algorithm.
 */
const stableSort = mergeSort;

/**
 * container/sortedarray - always-sorted array type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class SortedArray {
    constructor(source, compareFn) {
        this.compareFn_ = compareFn || genericOrder;
        this.data_ = source ? source.slice(0) : [];
        if (source) {
            this.sort();
        }
    }
    sort() {
        stableSort(this.data_, this.compareFn_);
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
 * @stardazed/container - container types and helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { hashString, override, mapObject, groupFieldsBy, makeLowerBound, makeUpperBound, lowerBound, upperBound, stableUnique, cloneStructDeep, propertyCount, makeLUT, transferArrayBuffer, clearArrayBuffer, copyElementRange, fill, appendArrayInPlace, refIndexedVec2, copyIndexedVec2, setIndexedVec2, copyVec2FromOffset, setVec2AtOffset, offsetOfIndexedVec2, refIndexedVec3, copyIndexedVec3, setIndexedVec3, copyVec3FromOffset, setVec3AtOffset, offsetOfIndexedVec3, refIndexedVec4, copyIndexedVec4, setIndexedVec4, copyVec4FromOffset, setVec4AtOffset, offsetOfIndexedVec4, refIndexedMat3, copyIndexedMat3, setIndexedMat3, offsetOfIndexedMat3, refIndexedMat4, copyIndexedMat4, setIndexedMat4, offsetOfIndexedMat4, FixedMultiArray, MultiArrayBuffer, FixedStructArray, Deque, genericOrder, insertionSort, mergeSort, stableSort, SortedArray };
//# sourceMappingURL=index.esm.js.map
