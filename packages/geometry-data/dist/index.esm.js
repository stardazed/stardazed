import { primitiveCountForElementCount, elementCountForPrimitiveCount, vertexFieldElementCount, vertexFieldNumericType } from '@stardazed/geometry';
import { assert } from '@stardazed/core';

/**
 * geometry-data/indexed-triangle-view - mutable triangle view for indexed data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class IndexedTriangleProxy {
    setTriangleIndex(data, triangleIndex) {
        this.data_ = data.subarray(triangleIndex * 3, (triangleIndex + 1) * 3);
    }
    index(index) { return this.data_[index]; }
    setIndex(index, newValue) {
        this.data_[index] = newValue;
    }
    get a() { return this.data_[0]; }
    set a(newValue) { this.data_[0] = newValue; }
    get b() { return this.data_[1]; }
    set b(newValue) { this.data_[1] = newValue; }
    get c() { return this.data_[2]; }
    set c(newValue) { this.data_[2] = newValue; }
}
class IndexBufferTriangleView {
    constructor(indexBuffer_, fromTriangle, toTriangle) {
        this.indexBuffer_ = indexBuffer_;
        this.forEachMutable = this.forEach;
        this.refItemMutable = this.refItem;
        const primitiveCount = primitiveCountForElementCount(4 /* Triangle */, this.indexBuffer_.indexCount);
        if (fromTriangle !== undefined) {
            if (fromTriangle < 0 || fromTriangle >= primitiveCount) {
                throw new Error("Invalid fromTriangle index");
            }
            this.fromTriangle_ = fromTriangle;
        }
        else {
            this.fromTriangle_ = 0;
        }
        if (toTriangle !== undefined) {
            if ((toTriangle < this.fromTriangle_) || (toTriangle > primitiveCount)) {
                throw new Error("Invalid toTriangle index");
            }
            this.toTriangle_ = toTriangle;
        }
        else {
            this.toTriangle_ = primitiveCount;
        }
        // effective count covered by this view
        this.primitiveCount = this.toTriangle_ - this.fromTriangle_;
    }
    forEach(callback) {
        const primCount = this.toTriangle_ - this.fromTriangle_;
        const basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);
        const itp = new IndexedTriangleProxy();
        for (let tix = 0; tix < primCount; ++tix) {
            itp.setTriangleIndex(basePtr, tix);
            callback(itp);
        }
    }
    refItem(triangleIndex) {
        return this.indexBuffer_.typedBasePtr((triangleIndex + this.fromTriangle_) * 3, 3);
    }
    subView(fromTriangle, toTriangle) {
        return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + toTriangle);
    }
    mutableView() {
        return Promise.resolve(this);
    }
}

/**
 * geometry-data/direct-triangle-view - immutable triangle view for non-indexed data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class DirectTriangleProxy {
    constructor() {
        this.baseIndex_ = 0;
    }
    index(index) {
        return this.baseIndex_ + index;
    }
    get a() { return this.baseIndex_; }
    get b() { return this.baseIndex_ + 1; }
    get c() { return this.baseIndex_ + 2; }
    setTriangleIndex(tri) { this.baseIndex_ = tri * 3; }
}
class DirectTriangleView {
    constructor(elementCount, fromTriangle, toTriangle) {
        const primitiveCount = primitiveCountForElementCount(4 /* Triangle */, elementCount);
        if (fromTriangle !== undefined) {
            if (fromTriangle < 0 || fromTriangle >= primitiveCount) {
                throw new Error("Invalid fromTriangle index");
            }
            this.fromTriangle_ = fromTriangle;
        }
        else {
            this.fromTriangle_ = 0;
        }
        if (toTriangle !== undefined) {
            if ((toTriangle < this.fromTriangle_) || (toTriangle > primitiveCount)) {
                throw new Error("Invalid toTriangle index");
            }
            this.toTriangle_ = toTriangle;
        }
        else {
            this.toTriangle_ = primitiveCount;
        }
        // effective count covered by this view
        this.primitiveCount = this.toTriangle_ - this.fromTriangle_;
    }
    forEach(callback) {
        const primCount = this.toTriangle_ - this.fromTriangle_;
        const dtp = new DirectTriangleProxy();
        for (let tri = 0; tri < primCount; ++tri) {
            dtp.setTriangleIndex(tri + this.fromTriangle_);
            callback(dtp);
        }
    }
    refItem(triangleIndex) {
        const baseIndex = triangleIndex * 3;
        return [baseIndex, baseIndex + 1, baseIndex + 2];
    }
    subView(fromTriangle, triangleCount) {
        const elementCount = elementCountForPrimitiveCount(4 /* Triangle */, this.primitiveCount);
        return new DirectTriangleView(elementCount, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
    }
    mutableView() {
        // direct triangle views are synthesised and thus immutable
        return Promise.reject("This TriangleView is immutable");
    }
}

/**
 * geometry-data/vertex-buffer-attribute-view - vertex attribute data access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class VertexBufferAttributeView {
    constructor(vertexBuffer, attr, fromVertex, toVertex) {
        this.vertexBuffer_ = vertexBuffer;
        this.attr_ = attr;
        this.stride_ = this.vertexBuffer_.stride;
        this.elementCount = vertexFieldElementCount(this.attr_.field);
        // validate or use default range
        const fullVertexCount = this.vertexBuffer_.vertexCount;
        if (fromVertex !== undefined) {
            if (fromVertex < 0 || fromVertex > fullVertexCount) {
                throw new Error("Invalid fromVertex index");
            }
            this.fromVertex = fromVertex;
        }
        else {
            this.fromVertex = 0;
        }
        if (toVertex !== undefined) {
            if ((toVertex < this.fromVertex) || (toVertex > fullVertexCount)) {
                throw new Error("Invalid toVertex index");
            }
            this.toVertex = toVertex;
        }
        else {
            this.toVertex = fullVertexCount;
        }
        this.vertexCount = this.toVertex - this.fromVertex;
        // save some often-used fields
        const fieldNumType = vertexFieldNumericType(this.attr_.field);
        if (!fieldNumType) {
            throw new Error("Invalid attribute field type");
        }
        this.fieldNumType_ = fieldNumType;
        this.typedViewCtor_ = this.fieldNumType_.arrayType;
        this.buffer_ = this.vertexBuffer_.storage.buffer;
        this.dataView_ = new DataView(this.buffer_);
    }
    forEach(callback) {
        const max = this.vertexCount;
        for (let ix = 0; ix < max; ++ix) {
            callback(this.refItem(ix));
        }
    }
    copyValuesFrom(source, valueCount, offset = 0) {
        assert(this.fromVertex + offset + valueCount <= this.vertexCount, "buffer overflow");
        assert(source.length >= valueCount * this.elementCount, "not enough elements in source");
        const buffer = this.buffer_;
        const stride = this.stride_;
        const elementSize = this.fieldNumType_.byteSize;
        const firstIndex = this.fromVertex + offset;
        let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * firstIndex) + this.attr_.offset;
        let sourceIndex = 0;
        let arrView;
        if (this.elementCount === 1) {
            if (stride % elementSize === 0) {
                const strideInElements = (stride / elementSize) | 0;
                const offsetInElements = (offsetBytes / elementSize) | 0;
                arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                let vertexOffset = 0;
                for (let n = 0; n < valueCount; ++n) {
                    arrView[vertexOffset] = source[sourceIndex];
                    sourceIndex += 1;
                    vertexOffset += strideInElements;
                }
            }
            else {
                for (let n = 0; n < valueCount; ++n) {
                    arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 1);
                    arrView[0] = source[sourceIndex];
                    sourceIndex += 1;
                    offsetBytes += stride;
                }
            }
        }
        else if (this.elementCount === 2) {
            if (stride % elementSize === 0) {
                const strideInElements = (stride / elementSize) | 0;
                const offsetInElements = (offsetBytes / elementSize) | 0;
                arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                let vertexOffset = 0;
                for (let n = 0; n < valueCount; ++n) {
                    arrView[0 + vertexOffset] = source[sourceIndex];
                    arrView[1 + vertexOffset] = source[sourceIndex + 1];
                    sourceIndex += 2;
                    vertexOffset += strideInElements;
                }
            }
            else {
                for (let n = 0; n < valueCount; ++n) {
                    arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 2);
                    arrView[0] = source[sourceIndex];
                    arrView[1] = source[sourceIndex + 1];
                    sourceIndex += 2;
                    offsetBytes += stride;
                }
            }
        }
        else if (this.elementCount === 3) {
            if (stride % elementSize === 0) {
                const strideInElements = (stride / elementSize) | 0;
                const offsetInElements = (offsetBytes / elementSize) | 0;
                arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                let vertexOffset = 0;
                for (let n = 0; n < valueCount; ++n) {
                    arrView[0 + vertexOffset] = source[sourceIndex];
                    arrView[1 + vertexOffset] = source[sourceIndex + 1];
                    arrView[2 + vertexOffset] = source[sourceIndex + 2];
                    sourceIndex += 3;
                    vertexOffset += strideInElements;
                }
            }
            else {
                for (let n = 0; n < valueCount; ++n) {
                    arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 3);
                    arrView[0] = source[sourceIndex];
                    arrView[1] = source[sourceIndex + 1];
                    arrView[2] = source[sourceIndex + 2];
                    sourceIndex += 3;
                    offsetBytes += stride;
                }
            }
        }
        else if (this.elementCount === 4) {
            if (stride % elementSize === 0) {
                const strideInElements = (stride / elementSize) | 0;
                const offsetInElements = (offsetBytes / elementSize) | 0;
                arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                let vertexOffset = 0;
                for (let n = 0; n < valueCount; ++n) {
                    arrView[0 + vertexOffset] = source[sourceIndex];
                    arrView[1 + vertexOffset] = source[sourceIndex + 1];
                    arrView[2 + vertexOffset] = source[sourceIndex + 2];
                    arrView[3 + vertexOffset] = source[sourceIndex + 3];
                    sourceIndex += 4;
                    vertexOffset += strideInElements;
                }
            }
            else {
                for (let n = 0; n < valueCount; ++n) {
                    arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 4);
                    arrView[0] = source[sourceIndex];
                    arrView[1] = source[sourceIndex + 1];
                    arrView[2] = source[sourceIndex + 2];
                    arrView[3] = source[sourceIndex + 3];
                    sourceIndex += 4;
                    offsetBytes += stride;
                }
            }
        }
    }
    refItem(index) {
        index += this.fromVertex;
        const offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attr_.offset;
        return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.elementCount);
    }
    copyItem(index) {
        index += this.fromVertex;
        let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attr_.offset;
        const result = [];
        switch (this.attr_.field) {
            case 28 /* Floatx4 */:
                result.push(this.dataView_.getFloat32(offsetBytes, true));
                offsetBytes += 4;
            // fall-through
            case 27 /* Floatx3 */:
                result.push(this.dataView_.getFloat32(offsetBytes, true));
                offsetBytes += 4;
            // fall-through
            case 26 /* Floatx2 */:
                result.push(this.dataView_.getFloat32(offsetBytes, true));
                offsetBytes += 4;
            // fall-through
            case 25 /* Float */:
                result.push(this.dataView_.getFloat32(offsetBytes, true));
                break;
            default:
                assert(false, "copyItem not implemented for this fieldtype");
                break;
        }
        return result;
    }
    subView(fromVertex, toVertex) {
        return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.fromVertex + fromVertex, this.fromVertex + toVertex);
    }
}

/**
 * @stardazed/geometry-data - vertex and index buffer element access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function triangleViewForIndexBuffer(ib) {
    return new IndexBufferTriangleView(ib);
}
function triangleViewForGeometry(geom) {
    return new Promise((resolve, reject) => {
        const allTrianglePrimitives = geom.subMeshes.every(sm => sm.type === 4 /* Triangle */);
        if (!allTrianglePrimitives) {
            return reject("Cannot create TriangleView as not all submeshes are of Triangle type");
        }
        if (geom.indexBuffer) {
            resolve(new IndexBufferTriangleView(geom.indexBuffer));
        }
        else {
            const elementCount = geom.subMeshes.map(sm => sm.elementCount).reduce((sum, count) => sum + count, 0);
            resolve(new DirectTriangleView(elementCount));
        }
    });
}
function triangleViewForSubMesh(geom, subMeshIndex) {
    return new Promise((resolve, reject) => {
        const subMesh = geom.subMeshes[subMeshIndex];
        if (!subMesh) {
            return reject(`SubMesh index ${subMeshIndex} is out of range`);
        }
        if (subMesh.type !== 4 /* Triangle */) {
            return reject(`SubMesh at index ${subMeshIndex} does not use Triangle primitives`);
        }
        const fromTriangle = primitiveCountForElementCount(4 /* Triangle */, subMesh.fromElement);
        const toTriangle = fromTriangle + primitiveCountForElementCount(4 /* Triangle */, subMesh.elementCount);
        if (geom.indexBuffer) {
            resolve(new IndexBufferTriangleView(geom.indexBuffer, fromTriangle, toTriangle));
        }
        else {
            resolve(new DirectTriangleView(subMesh.elementCount, fromTriangle, toTriangle));
        }
    });
}

export { triangleViewForIndexBuffer, triangleViewForGeometry, triangleViewForSubMesh, VertexBufferAttributeView };
//# sourceMappingURL=index.esm.js.map
