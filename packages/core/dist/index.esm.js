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
    assert(newByteLength > 0);
    if (newByteLength < oldByteLength) {
        return oldBuffer.slice(0, newByteLength);
    }
    const oldBufferView = new Uint8Array(oldBuffer);
    const newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
    newBufferView.set(oldBufferView);
    return newBufferView.buffer;
}

/**
 * core/numeric - numeric types, traits and array helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * Traits of unsigned 8-bit integer numbers.
 */
const UInt8 = {
    min: 0,
    max: 255,
    signed: false,
    byteSize: 1,
    arrayType: Uint8Array
};
/**
 * Traits of unsigned 8-bit clamped integer numbers.
 */
const UInt8Clamped = {
    min: 0,
    max: 255,
    signed: false,
    byteSize: 1,
    arrayType: Uint8ClampedArray
};
/**
 * Traits of signed 8-bit integer numbers.
 */
const SInt8 = {
    min: -128,
    max: 127,
    signed: true,
    byteSize: 1,
    arrayType: Int8Array
};
/**
 * Traits of unsigned 16-bit integer numbers.
 */
const UInt16 = {
    min: 0,
    max: 65535,
    signed: false,
    byteSize: 2,
    arrayType: Uint16Array
};
/**
 * Traits of signed 16-bit integer numbers.
 */
const SInt16 = {
    min: -32768,
    max: 32767,
    signed: true,
    byteSize: 2,
    arrayType: Int16Array
};
/**
 * Traits of unsigned 32-bit integer numbers.
 */
const UInt32 = {
    min: 0,
    max: 4294967295,
    signed: false,
    byteSize: 4,
    arrayType: Uint32Array
};
/**
 * Traits of signed 32-bit integer numbers.
 */
const SInt32 = {
    min: -2147483648,
    max: 2147483647,
    signed: true,
    byteSize: 4,
    arrayType: Int32Array
};
/**
 * Traits of 32-bit floating point numbers.
 */
const Float = {
    min: -340282346638528859811704183484516925440.0,
    max: 340282346638528859811704183484516925440.0,
    signed: true,
    byteSize: 4,
    arrayType: Float32Array
};
/**
 * Traits of 64-bit floating point numbers.
 */
const Double = {
    min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
    max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
    signed: true,
    byteSize: 8,
    arrayType: Float64Array
};

/**
 * core/struct - structural primitive helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
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
 * @stardazed/core - common types and helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { assert, arrayTransfer, UInt8, UInt8Clamped, SInt8, UInt16, SInt16, UInt32, SInt32, Float, Double, cloneStructDeep, propertyCount, makeLUT };
//# sourceMappingURL=index.esm.js.map
