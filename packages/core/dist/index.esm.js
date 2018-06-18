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
 * @stardazed/core - common types and helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { assert, UInt8, UInt8Clamped, SInt8, UInt16, SInt16, UInt32, SInt32, Float, Double };
//# sourceMappingURL=index.esm.js.map
