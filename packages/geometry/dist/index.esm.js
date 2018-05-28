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
 * geometry/vertexfield - vertex field types and properties
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 *
 * A single field in a vertex buffer
 * 3 properties: element type, count and normalization
 */
function vertexFieldElementCount(vf) {
    switch (vf) {
        case 17 /* UInt32 */:
        case 21 /* SInt32 */:
        case 25 /* Float */:
            return 1;
        case 2 /* UInt8x2 */:
        case 130 /* Norm_UInt8x2 */:
        case 6 /* SInt8x2 */:
        case 134 /* Norm_SInt8x2 */:
        case 10 /* UInt16x2 */:
        case 138 /* Norm_UInt16x2 */:
        case 14 /* SInt16x2 */:
        case 142 /* Norm_SInt16x2 */:
        case 18 /* UInt32x2 */:
        case 22 /* SInt32x2 */:
        case 26 /* Floatx2 */:
            return 2;
        case 3 /* UInt8x3 */:
        case 131 /* Norm_UInt8x3 */:
        case 7 /* SInt8x3 */:
        case 135 /* Norm_SInt8x3 */:
        case 11 /* UInt16x3 */:
        case 139 /* Norm_UInt16x3 */:
        case 15 /* SInt16x3 */:
        case 143 /* Norm_SInt16x3 */:
        case 19 /* UInt32x3 */:
        case 23 /* SInt32x3 */:
        case 27 /* Floatx3 */:
            return 3;
        case 4 /* UInt8x4 */:
        case 132 /* Norm_UInt8x4 */:
        case 8 /* SInt8x4 */:
        case 136 /* Norm_SInt8x4 */:
        case 12 /* UInt16x4 */:
        case 140 /* Norm_UInt16x4 */:
        case 16 /* SInt16x4 */:
        case 144 /* Norm_SInt16x4 */:
        case 20 /* UInt32x4 */:
        case 24 /* SInt32x4 */:
        case 28 /* Floatx4 */:
            return 4;
        case 0 /* Undefined */:
        default:
            return 0;
    }
}
function vertexFieldNumericType(vf) {
    switch (vf) {
        case 25 /* Float */:
        case 26 /* Floatx2 */:
        case 27 /* Floatx3 */:
        case 28 /* Floatx4 */:
            return Float;
        case 17 /* UInt32 */:
        case 18 /* UInt32x2 */:
        case 19 /* UInt32x3 */:
        case 20 /* UInt32x4 */:
            return UInt32;
        case 21 /* SInt32 */:
        case 22 /* SInt32x2 */:
        case 23 /* SInt32x3 */:
        case 24 /* SInt32x4 */:
            return SInt32;
        case 10 /* UInt16x2 */:
        case 138 /* Norm_UInt16x2 */:
        case 11 /* UInt16x3 */:
        case 139 /* Norm_UInt16x3 */:
        case 12 /* UInt16x4 */:
        case 140 /* Norm_UInt16x4 */:
            return UInt16;
        case 14 /* SInt16x2 */:
        case 142 /* Norm_SInt16x2 */:
        case 15 /* SInt16x3 */:
        case 143 /* Norm_SInt16x3 */:
        case 16 /* SInt16x4 */:
        case 144 /* Norm_SInt16x4 */:
            return SInt16;
        case 2 /* UInt8x2 */:
        case 130 /* Norm_UInt8x2 */:
        case 3 /* UInt8x3 */:
        case 131 /* Norm_UInt8x3 */:
        case 4 /* UInt8x4 */:
        case 132 /* Norm_UInt8x4 */:
            return UInt8;
        case 6 /* SInt8x2 */:
        case 134 /* Norm_SInt8x2 */:
        case 7 /* SInt8x3 */:
        case 135 /* Norm_SInt8x3 */:
        case 8 /* SInt8x4 */:
        case 136 /* Norm_SInt8x4 */:
            return SInt8;
        case 0 /* Undefined */:
        default:
            return null;
    }
}
function vertexFieldElementSizeBytes(vf) {
    const nt = vertexFieldNumericType(vf);
    return nt ? nt.byteSize : 0;
}
function vertexFieldSizeBytes(vf) {
    return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
}
function vertexFieldIsNormalized(vf) {
    return (vf & 0x80) !== 0;
}

/**
 * geometry/vertex-attribute - vertex buffer attributes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function isVertexAttribute(va) {
    return typeof va.field === "number" && typeof va.role === "number";
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
 * geometry/vertex-buffer-layout - layout of attributes within a buffer
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class VertexBufferLayoutImpl {
    constructor(attributes, stride) {
        assert(attributes.length > 0, "Cannot create an empty VertexBufferLayout");
        assert(stride > 0, "stride must be positive");
        this.attributes = [...attributes];
        this.stride = stride;
    }
    bytesRequiredForVertexCount(vertexCount) {
        return vertexCount * this.stride;
    }
    attrByRole(role) {
        return this.attributes.find(pa => pa.role === role);
    }
    attrByIndex(index) {
        return this.attributes[index] || null;
    }
    hasAttributeWithRole(role) {
        return this.attrByRole(role) !== undefined;
    }
}
// ---- default buffer layout calc func
function alignFieldOnSize(size, offset) {
    const mask = roundUpPowerOf2(size) - 1;
    return (offset + mask) & ~mask;
}
function alignVertexField(field, offset) {
    return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
}
function makeStandardVertexBufferLayout(attrList, bufferIndex = 0) {
    let offset = 0, maxElemSize = 0;
    // calculate positioning of successive attributes in linear item
    const attributes = attrList.map((attr) => {
        const size = vertexFieldSizeBytes(attr.field);
        maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));
        const alignedOffset = alignVertexField(attr.field, offset);
        offset = alignedOffset + size;
        return {
            field: attr.field,
            role: attr.role,
            bufferIndex,
            offset: alignedOffset
        };
    });
    // align full item size on boundary of biggest element in attribute list, with min of float boundary
    maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
    const stride = alignFieldOnSize(maxElemSize, offset);
    return new VertexBufferLayoutImpl(attributes, stride);
}

/**
 * geometry/vertex-buffer - vertex data storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class VertexBuffer {
    get sizeBytes() {
        return this.vertexCount * this.stride;
    }
    constructor(vertexCount, stride, usingStorage) {
        vertexCount = vertexCount | 0;
        stride = stride | 0;
        assert(vertexCount > 0);
        assert(stride > 0);
        this.vertexCount = vertexCount;
        this.stride = stride;
        if (usingStorage) {
            assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
            this.storage = usingStorage;
        }
        else {
            this.storage = new Uint8ClampedArray(this.sizeBytes);
        }
    }
}

/**
 * geometry/index-element vertex index element
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
const indexElementTypeSizeBytes = makeLUT(1 /* UInt8 */, Uint8Array.BYTES_PER_ELEMENT, 2 /* UInt16 */, Uint16Array.BYTES_PER_ELEMENT, 3 /* UInt32 */, Uint32Array.BYTES_PER_ELEMENT);
function minimumIndexElementTypeForVertexCount(vertexCount) {
    if (vertexCount <= UInt8.max) {
        return 1 /* UInt8 */;
    }
    if (vertexCount <= UInt16.max) {
        return 2 /* UInt16 */;
    }
    return 3 /* UInt32 */;
}
function bytesRequiredForIndexCount(elementType, indexCount) {
    return indexElementTypeSizeBytes[elementType] * indexCount;
}
function typedIndexArrayClassForIndexElement(elementType) {
    switch (elementType) {
        case 1 /* UInt8 */: return Uint8ClampedArray;
        case 2 /* UInt16 */: return Uint16Array;
        case 3 /* UInt32 */: return Uint32Array;
        default:
            throw new Error("Invalid IndexElementType");
    }
}

/**
 * geometry/index-primitive - index primitive traits
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function elementOffsetForPrimitiveCount(primitiveType, primitiveCount) {
    switch (primitiveType) {
        case 1 /* Point */:
            return primitiveCount;
        case 2 /* Line */:
            return primitiveCount * 2;
        case 3 /* LineStrip */:
            return primitiveCount;
        case 4 /* Triangle */:
            return primitiveCount * 3;
        case 5 /* TriangleStrip */:
            return primitiveCount;
        default:
            assert(false, "Unknown primitive type");
            return 0;
    }
}
function elementCountForPrimitiveCount(primitiveType, primitiveCount) {
    assert(primitiveCount >= 0);
    switch (primitiveType) {
        case 1 /* Point */:
            return primitiveCount;
        case 2 /* Line */:
            return primitiveCount * 2;
        case 3 /* LineStrip */:
            return primitiveCount > 0 ? primitiveCount + 1 : 0;
        case 4 /* Triangle */:
            return primitiveCount * 3;
        case 5 /* TriangleStrip */:
            return primitiveCount > 0 ? primitiveCount + 2 : 0;
        default:
            assert(false, "Unknown primitive type");
            return 0;
    }
}
function primitiveCountForElementCount(primitiveType, elementCount) {
    assert(elementCount >= 0);
    switch (primitiveType) {
        case 1 /* Point */:
            return elementCount;
        case 2 /* Line */:
            return (elementCount / 2) | 0;
        case 3 /* LineStrip */:
            return elementCount > 0 ? elementCount - 1 : 0;
        case 4 /* Triangle */:
            return (elementCount / 3) | 0;
        case 5 /* TriangleStrip */:
            return elementCount > 0 ? elementCount - 2 : 0;
        default:
            assert(false, "Unknown primitive type");
            return 0;
    }
}

/**
 * geometry/index-buffer - index primitive storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class IndexBuffer {
    constructor(elementType, indexCount, usingStorage) {
        assert(indexCount > 0, "Invalid indexCount, must be > 0");
        assert(elementType !== 0 /* None */);
        this.indexElementType = elementType;
        this.indexElementSizeBytes_ = indexElementTypeSizeBytes[elementType];
        this.indexCount = indexCount;
        assert(this.indexElementSizeBytes_ !== undefined);
        if (usingStorage) {
            assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
            this.storage = usingStorage;
        }
        else {
            this.storage = new Uint8ClampedArray(this.sizeBytes);
        }
    }
    get sizeBytes() { return this.indexCount * this.indexElementSizeBytes_; }
    /**
     *  Direct (sub-)array access
     */
    typedBasePtr(baseIndexNr, indexCount) {
        assert(baseIndexNr < this.indexCount);
        assert(baseIndexNr + indexCount <= this.indexCount);
        const offsetBytes = this.storage.byteOffset + this.indexElementSizeBytes_ * baseIndexNr;
        const arrayClass = typedIndexArrayClassForIndexElement(this.indexElementType);
        return new arrayClass(this.storage.buffer, offsetBytes, indexCount);
    }
}

/**
 * geometry/geometry - geometry compound type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
const isVertexLayout = (vl) => (typeof vl === "object") && vl !== null &&
    Array.isArray(vl.layouts);
function findAttributeOfRoleInLayout(vl, role) {
    for (const layout of vl.layouts) {
        const pa = layout.attrByRole(role);
        if (pa) {
            return pa;
        }
    }
    return undefined;
}
function makeStandardVertexLayout(attrLists) {
    const layouts = [];
    if (attrLists.length > 0) {
        if (isVertexAttribute(attrLists[0])) {
            layouts.push(makeStandardVertexBufferLayout(attrLists));
        }
        else {
            for (let bufferIndex = 0; bufferIndex < attrLists.length; ++bufferIndex) {
                const list = attrLists[bufferIndex];
                layouts.push(makeStandardVertexBufferLayout(list, bufferIndex));
            }
        }
    }
    return {
        layouts
    };
}
const isGeometry = (geom) => (typeof geom === "object") && geom !== null &&
    isVertexLayout(geom.layout) &&
    Array.isArray(geom.vertexBuffers) &&
    (geom.indexBuffer === void 0 || geom.indexBuffer instanceof IndexBuffer) &&
    Array.isArray(geom.subMeshes);
function allocateGeometry(options) {
    let totalBytes = 0;
    for (const layout of options.layout.layouts) {
        totalBytes += layout.bytesRequiredForVertexCount(options.vertexCount);
        totalBytes = alignUp(totalBytes, 8 /* SubBuffer */);
    }
    if (options.indexCount > 0) {
        const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
        totalBytes += bytesRequiredForIndexCount(elementType, options.indexCount);
        totalBytes = alignUp(totalBytes, 8 /* SubBuffer */);
    }
    assert(totalBytes > 0, "Nothing to allocate!");
    const geom = {
        layout: options.layout,
        vertexBuffers: [],
        subMeshes: [],
    };
    const storage = new ArrayBuffer(totalBytes);
    let byteOffset = 0;
    for (const layout of options.layout.layouts) {
        const subSize = layout.bytesRequiredForVertexCount(options.vertexCount);
        const subStorage = new Uint8ClampedArray(storage, byteOffset, subSize);
        const vb = new VertexBuffer(options.vertexCount, layout.stride, subStorage);
        geom.vertexBuffers.push(vb);
        byteOffset += subSize;
        byteOffset = alignUp(byteOffset, 8 /* SubBuffer */);
    }
    if (options.indexCount) {
        const elementType = minimumIndexElementTypeForVertexCount(options.vertexCount);
        const indexSize = bytesRequiredForIndexCount(elementType, options.indexCount);
        const subSize = bytesRequiredForIndexCount(elementType, options.indexCount);
        const subStorage = new Uint8ClampedArray(storage, byteOffset, subSize);
        geom.indexBuffer = new IndexBuffer(elementType, options.indexCount, subStorage);
        byteOffset += indexSize;
        byteOffset = alignUp(byteOffset, 8 /* SubBuffer */);
    }
    assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
    return geom;
}
function findAttributeOfRoleInGeometry(geom, role) {
    const pa = findAttributeOfRoleInLayout(geom.layout, role);
    const avb = pa ? geom.vertexBuffers[pa.bufferIndex] : undefined;
    if (pa && avb) {
        return { vertexBuffer: avb, attr: pa };
    }
    return undefined;
}

/**
 * @stardazed/geometry - geometry storage
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { vertexFieldElementCount, vertexFieldNumericType, vertexFieldElementSizeBytes, vertexFieldSizeBytes, vertexFieldIsNormalized, isVertexAttribute, makeStandardVertexBufferLayout, VertexBuffer, indexElementTypeSizeBytes, minimumIndexElementTypeForVertexCount, bytesRequiredForIndexCount, typedIndexArrayClassForIndexElement, elementOffsetForPrimitiveCount, elementCountForPrimitiveCount, primitiveCountForElementCount, IndexBuffer, isVertexLayout, findAttributeOfRoleInLayout, makeStandardVertexLayout, isGeometry, allocateGeometry, findAttributeOfRoleInGeometry };
//# sourceMappingURL=index.esm.js.map
