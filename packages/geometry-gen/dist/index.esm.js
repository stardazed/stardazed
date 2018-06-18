import { assert, Float, Double } from '@stardazed/core';
import { stableSort, appendArrayInPlace, copyElementRange, copyIndexedVec3, setIndexedVec3 } from '@stardazed/container';
import { vertexFieldElementCount, vertexFieldNumericType, makeStandardVertexLayout, allocateGeometry, findAttributeOfRoleInGeometry } from '@stardazed/geometry';
import { VertexBufferAttributeView, triangleViewForGeometry } from '@stardazed/geometry-data';
import { vec3, mat3, mat4, quat, clamp01 } from '@stardazed/math';

/**
 * geometry-gen/vertex-types - shortcuts to define vertex attributes
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// -- VertexAttribute shortcuts for common types
function attrPosition2() { return { field: 26 /* Floatx2 */, role: 1 /* Position */ }; }
function attrPosition3() { return { field: 27 /* Floatx3 */, role: 1 /* Position */ }; }
function attrNormal3() { return { field: 27 /* Floatx3 */, role: 2 /* Normal */ }; }
function attrColour3() { return { field: 27 /* Floatx3 */, role: 4 /* Colour */ }; }
function attrUV2() { return { field: 26 /* Floatx2 */, role: 6 /* UV */ }; }
function attrTangent3() { return { field: 27 /* Floatx3 */, role: 3 /* Tangent */ }; }
function attrJointIndexes() { return { field: 24 /* SInt32x4 */, role: 14 /* JointIndexes */ }; }
function attrWeightedPos(index) {
    assert(index >= 0 && index < 4);
    return { field: 28 /* Floatx4 */, role: 10 /* WeightedPos0 */ + index };
}
// -- Common AttributeList shortcuts
var AttrList;
(function (AttrList) {
    function Pos3Norm3() {
        return [attrPosition3(), attrNormal3()];
    }
    AttrList.Pos3Norm3 = Pos3Norm3;
    function Pos3Norm3Colour3() {
        return [attrPosition3(), attrNormal3(), attrColour3()];
    }
    AttrList.Pos3Norm3Colour3 = Pos3Norm3Colour3;
    function Pos3Norm3UV2() {
        return [attrPosition3(), attrNormal3(), attrUV2()];
    }
    AttrList.Pos3Norm3UV2 = Pos3Norm3UV2;
    function Pos3Norm3Colour3UV2() {
        return [attrPosition3(), attrNormal3(), attrColour3(), attrUV2()];
    }
    AttrList.Pos3Norm3Colour3UV2 = Pos3Norm3Colour3UV2;
    function Pos3Norm3UV2Tan3() {
        return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent3()];
    }
    AttrList.Pos3Norm3UV2Tan3 = Pos3Norm3UV2Tan3;
})(AttrList || (AttrList = {}));

/**
 * geometry/builder - construct Geometry from normalized sources such as assets
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/*
VertexIndexMapping method A was to test a growing single array technique used
in native code, but in JS it lost out (badly) to method B, which is just to
use a Map with a lot of small arrays in it. Left here to test in the future.

class VertexIndexMappingA implements VertexIndexMapping {
    private offsets_: number[] = [];
    private values_: number[] = [];
    private highest_ = -1;

    get indexCount() { return this.offsets_.length; }

    add(from: number, to: number) {
        if (from > this.highest_) {
            fill(this.offsets_, this.values_.length, from - this.highest_, this.highest_ + 1);
            this.highest_ = from;
        }
        const fromOff = this.offsets_[from];
        this.values_.splice(fromOff, 0, to);
        for (let n = from + 1; n <= this.highest_; ++n) {
            this.offsets_[n]++;
        }
    }

    mappedValues(forIndex: number) {
        const offA = this.offsets_[forIndex];
        const offB = (forIndex < this.offsets_.length - 1) ? this.offsets_[forIndex + 1] : this.values_.length;
        return this.values_.slice(offA, offB);
    }
}
*/
class VertexIndexMappingB {
    constructor() {
        this.data_ = new Map();
    }
    get indexCount() { return this.data_.size; }
    add(from, to) {
        if (!this.data_.has(from)) {
            this.data_.set(from, [to]);
        }
        else {
            const mapped = this.data_.get(from);
            if (mapped.indexOf(to) === -1) {
                mapped.push(to);
            }
            this.data_.set(from, mapped);
        }
    }
    mappedValues(forIndex) {
        return this.data_.get(forIndex);
    }
}
class MeshBuilder {
    constructor(positions, positionIndexes, streams) {
        this.sourcePolygonIndex_ = 0;
        this.streamCount_ = 0;
        this.vertexCount_ = 0;
        this.triangleCount_ = 0;
        // create a local copy of the streams array so we can modify it
        this.streams_ = streams.slice(0);
        // create the positions stream, which is needed for both simple and rigged models
        const positionStream = {
            attr: { role: 1 /* Position */, field: 27 /* Floatx3 */ },
            mapping: 1 /* Vertex */,
            includeInMesh: true,
            values: positions,
            indexes: positionIndexes === null ? undefined : positionIndexes
        };
        // add positions stream at the beginning for simple models and at end for rigged models
        if (this.streams_.find(s => s.attr.role === 14 /* JointIndexes */)) {
            this.streams_.push(positionStream);
        }
        else {
            this.streams_.unshift(positionStream);
        }
        // sort attr streams ensuring ones that are not to be included in the geometry
        // end up at the end.
        stableSort(this.streams_, (sA, sB) => {
            if (sA.includeInMesh === sB.includeInMesh) {
                return 0;
            }
            return sA.includeInMesh ? -1 : 1;
        });
        // minor optimization as the element count will be requested many times
        // also check for ambigious or incorrect grouping
        let groupers = 0;
        for (const s of this.streams_) {
            s.elementCount = vertexFieldElementCount(s.attr.field);
            if (s.controlsGrouping === true) {
                assert(s.elementCount === 1, "A grouping stream must use a single element field");
                const groupNumType = vertexFieldNumericType(s.attr.field);
                assert(groupNumType !== Float && groupNumType !== Double, "A grouping stream must use an integer element");
                groupers++;
            }
        }
        assert(groupers < 2, "More than 1 attr stream indicates it's the grouping stream");
        // start at group 0 in case there is no explicit initial group set
        this.groupIndexStreams_ = new Map();
        this.groupIndexStreams_.set(0, []);
        this.groupIndex_ = 0;
        this.groupIndexesRef_ = this.groupIndexStreams_.get(0);
        // output and de-duplication data
        this.vertexData_ = this.streams_.map(_ => []);
        this.vertexMapping_ = new Map();
        this.indexMap_ = new VertexIndexMappingB();
        this.streamCount_ = this.streams_.length;
    }
    streamIndexesForPVI(polygonVertexIndex, vertexIndex, polygonIndex) {
        const res = [];
        for (const stream of this.streams_) {
            let index;
            if (stream.mapping === 1 /* Vertex */) {
                index = vertexIndex;
            }
            else if (stream.mapping === 2 /* PolygonVertex */) {
                index = polygonVertexIndex;
            }
            else if (stream.mapping === 3 /* Polygon */) {
                index = polygonIndex;
            }
            else {
                index = 0;
            }
            if (stream.indexes) {
                index = stream.indexes[index];
            }
            res.push(index);
        }
        return res;
    }
    setGroup(newGroupIndex) {
        assert(newGroupIndex >= 0, "group index must be >= 0");
        this.groupIndex_ = newGroupIndex;
        if (!this.groupIndexStreams_.has(newGroupIndex)) {
            this.groupIndexStreams_.set(newGroupIndex, []);
        }
        this.groupIndexesRef_ = this.groupIndexStreams_.get(newGroupIndex);
    }
    getVertexIndex(streamIndexes) {
        const key = streamIndexes.join("|");
        if (this.vertexMapping_.has(key)) {
            return this.vertexMapping_.get(key);
        }
        else {
            for (let streamIx = 0; streamIx < this.streamCount_; ++streamIx) {
                const stream = this.streams_[streamIx];
                const elemCount = stream.elementCount;
                const array = this.vertexData_[streamIx];
                const fieldIndex = streamIndexes[streamIx];
                let values = stream.values; // TODO: is this guaranteed to exist in this loop?
                let fieldOffset = elemCount * fieldIndex;
                // This is slowest on all browsers (by a mile)
                // array.push.apply(array, stream.values.subarray(fieldOffset, fieldOffset + stream.elementCount));
                // This is 20% faster in Firefox
                // for (let el = 0; el < elemCount; ++el) {
                // 	array.push(values[fieldOffset + el]);
                // }
                // in FBX it is apparently valid to have -1 indexes to indicate absence of a value
                // we replace that with a 0-filled value
                if (fieldOffset < 0) {
                    values = [0, 0, 0, 0];
                    fieldOffset = 0;
                }
                // This is 20% faster in Webkit
                if (elemCount === 3) {
                    array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2]);
                }
                else if (elemCount === 2) {
                    array.push(values[fieldOffset], values[fieldOffset + 1]);
                }
                else if (elemCount === 4) {
                    array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2], values[fieldOffset + 3]);
                }
                else if (elemCount === 1) {
                    array.push(values[fieldOffset]);
                    if (stream.controlsGrouping) {
                        const gi = values[fieldOffset];
                        if (gi !== this.groupIndex_) {
                            this.setGroup(gi);
                        }
                    }
                }
            }
            const vertexIndex = this.vertexCount_;
            this.vertexCount_++;
            this.vertexMapping_.set(key, vertexIndex);
            return vertexIndex;
        }
    }
    addTriangle(polygonVertexIndexes, vertexIndexes) {
        const indexesA = this.streamIndexesForPVI(polygonVertexIndexes[0], vertexIndexes[0], this.sourcePolygonIndex_);
        const indexesB = this.streamIndexesForPVI(polygonVertexIndexes[1], vertexIndexes[1], this.sourcePolygonIndex_);
        const indexesC = this.streamIndexesForPVI(polygonVertexIndexes[2], vertexIndexes[2], this.sourcePolygonIndex_);
        const dstVIxA = this.getVertexIndex(indexesA);
        const dstVIxB = this.getVertexIndex(indexesB);
        const dstVIxC = this.getVertexIndex(indexesC);
        this.indexMap_.add(vertexIndexes[0], dstVIxA);
        this.indexMap_.add(vertexIndexes[1], dstVIxB);
        this.indexMap_.add(vertexIndexes[2], dstVIxC);
        this.groupIndexesRef_.push(dstVIxA, dstVIxB, dstVIxC);
        this.triangleCount_++;
    }
    addPolygon(polygonVertexIndexes, vertexIndexes) {
        if (polygonVertexIndexes.length === 3) {
            this.addTriangle(polygonVertexIndexes, vertexIndexes);
        }
        else {
            const polyPoints = vertexIndexes.length;
            const pv0 = polygonVertexIndexes[0];
            const v0 = vertexIndexes[0];
            let polyNext = 2;
            while (polyNext < polyPoints) {
                this.addTriangle([pv0, polygonVertexIndexes[polyNext - 1], polygonVertexIndexes[polyNext]], [v0, vertexIndexes[polyNext - 1], vertexIndexes[polyNext]]);
                polyNext++;
            }
        }
        this.sourcePolygonIndex_++;
    }
    get curPolygonIndex() { return this.sourcePolygonIndex_; }
    get indexMap() { return this.indexMap_; }
    complete() {
        // Create Geometry with a VB with the streams marked for inclusion in the
        // final geometry data. Because we sorted the non-included streams to the end
        // of the list the order of this filtered list will still be the same as
        // of the vertexData arrays, so no need for mapping etc.
        const meshAttributeStreams = this.streams_.filter(s => s.includeInMesh);
        const attrs = meshAttributeStreams.map(s => s.attr);
        // allocate as single buffer
        const geom = allocateGeometry({
            layout: makeStandardVertexLayout(attrs),
            vertexCount: this.vertexCount_,
            indexCount: this.triangleCount_ * 3
        });
        const layout = geom.layout.layouts[0];
        // copy vertex streams
        for (let six = 0; six < meshAttributeStreams.length; ++six) {
            const streamData = this.vertexData_[six];
            const attribute = layout.attrByIndex(six);
            if (attribute) {
                const view = new VertexBufferAttributeView(geom.vertexBuffers[0], attribute);
                view.copyValuesFrom(streamData, this.vertexCount_);
            }
            // FIXME else unexpected()
        }
        // All triangles with the same material were merged, create full index buffer
        // and primitive groups
        const mergedIndexes = [];
        let nextElementIndex = 0;
        this.groupIndexStreams_.forEach((indexes, group) => {
            if (indexes.length) {
                appendArrayInPlace(mergedIndexes, indexes);
                const groupElementCount = indexes.length;
                geom.subMeshes.push({
                    type: 4 /* Triangle */,
                    fromElement: nextElementIndex,
                    elementCount: groupElementCount,
                    materialIx: group
                });
                nextElementIndex += groupElementCount;
            }
        });
        const indexView = geom.indexBuffer.typedBasePtr(0, mergedIndexes.length);
        copyElementRange(indexView, 0, mergedIndexes, 0, mergedIndexes.length);
        // geom.indexBuffer!.setIndexes(0, mergedIndexes.length, mergedIndexes);
        return geom;
    }
}

/**
 * geometry-gen/calc-derived - calculate normals and tangents
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function genVertexNormals(geom) {
    return triangleViewForGeometry(geom).then(triView => {
        geom.vertexBuffers.forEach((vertexBuffer, ix) => {
            calcVertexNormals(geom.layout.layouts[ix], vertexBuffer, triView);
        });
    });
}
function genVertexTangents(geom) {
    return triangleViewForGeometry(geom).then(triView => {
        geom.vertexBuffers.forEach((vertexBuffer, ix) => {
            calcVertexTangents(geom.layout.layouts[ix], vertexBuffer, triView);
        });
    });
}
function calcVertexNormals(layout, vertexBuffer, triView) {
    const posAttr = layout.attrByRole(1 /* Position */);
    const normAttr = layout.attrByRole(2 /* Normal */);
    if (posAttr && normAttr) {
        const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
        const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
        calcVertexNormalsViews(posView, normView, triView);
    }
    // TODO: else warn?
}
function calcVertexNormalsViews(posView, normView, triView) {
    const vertexCount = posView.vertexCount;
    const normalCount = normView.vertexCount;
    assert(vertexCount <= normalCount);
    const baseVertex = normView.fromVertex;
    normView.forEach(norm => {
        vec3.set(norm, 0, 0, 1);
    });
    const usages = new Float32Array(vertexCount);
    const lineA = vec3.create(), lineB = vec3.create();
    const faceNormal = vec3.create(), temp = vec3.create();
    triView.forEach((face) => {
        const posA = posView.copyItem(face.a - baseVertex);
        const posB = posView.copyItem(face.b - baseVertex);
        const posC = posView.copyItem(face.c - baseVertex);
        vec3.subtract(lineA, posB, posA);
        vec3.subtract(lineB, posC, posB);
        if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001) {
            return;
        }
        vec3.cross(faceNormal, lineA, lineB);
        vec3.normalize(faceNormal, faceNormal);
        for (let fi = 0; fi < 3; ++fi) {
            const fvi = face.index(fi) - baseVertex;
            const norm = normView.refItem(fvi);
            // normBegin[fvi] = (normBegin[fvi] * usages[fvi] + faceNormal) / (usages[fvi] + 1.0f);
            vec3.scaleAndAdd(temp, faceNormal, norm, usages[fvi]);
            vec3.scale(norm, temp, 1 / (usages[fvi] + 1));
            usages[fvi] += 1;
        }
    });
    normView.forEach((norm) => {
        vec3.normalize(norm, norm);
    });
}
function calcVertexTangents(layout, vertexBuffer, triView, uvSet = 6 /* UV0 */) {
    const posAttr = layout.attrByRole(1 /* Position */);
    const normAttr = layout.attrByRole(2 /* Normal */);
    const uvAttr = layout.attrByRole(uvSet);
    const tanAttr = layout.attrByRole(3 /* Tangent */);
    if (posAttr && normAttr && uvAttr && tanAttr) {
        const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
        const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
        const uvView = new VertexBufferAttributeView(vertexBuffer, uvAttr);
        const tanView = new VertexBufferAttributeView(vertexBuffer, tanAttr);
        calcVertexTangentsViews(posView, normView, uvView, tanView, triView);
    }
    // TODO: else warn?
}
function calcVertexTangentsViews(posView, normView, uvView, tanView, triView) {
    // adaptation of http://www.terathon.com/code/tangent.html
    // by Eric Lengyel
    const vertexCount = posView.vertexCount;
    assert(vertexCount <= normView.vertexCount);
    assert(vertexCount <= uvView.vertexCount);
    assert(vertexCount <= tanView.vertexCount);
    const tanBuf = new Float32Array(vertexCount * 3 * 2);
    const tan1 = tanBuf.subarray(0, vertexCount);
    const tan2 = tanBuf.subarray(vertexCount);
    triView.forEach(face => {
        const { a, b, c } = face;
        const v1 = posView.copyItem(a), v2 = posView.copyItem(b), v3 = posView.copyItem(c);
        const w1 = uvView.copyItem(a), w2 = uvView.copyItem(b), w3 = uvView.copyItem(c);
        const x1 = v2[0] - v1[0];
        const x2 = v3[0] - v1[0];
        const y1 = v2[1] - v1[1];
        const y2 = v3[1] - v1[1];
        const z1 = v2[2] - v1[2];
        const z2 = v3[2] - v1[2];
        const s1 = w2[0] - w1[0];
        const s2 = w3[0] - w1[0];
        const t1 = w2[1] - w1[1];
        const t2 = w3[1] - w1[1];
        const rd = (s1 * t2 - s2 * t1);
        const r = rd === 0 ? 0.0 : 1.0 / rd;
        const sdir = [
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r
        ];
        const tdir = [
            (s1 * x2 - s2 * x1) * r,
            (s1 * y2 - s2 * y1) * r,
            (s1 * z2 - s2 * z1) * r
        ];
        // tan1[a] += sdir;
        // tan1[b] += sdir;
        // tan1[c] += sdir;
        const tan1a = copyIndexedVec3(tan1, a);
        const tan1b = copyIndexedVec3(tan1, b);
        const tan1c = copyIndexedVec3(tan1, c);
        setIndexedVec3(tan1, a, vec3.add(tan1a, tan1a, sdir));
        setIndexedVec3(tan1, b, vec3.add(tan1b, tan1b, sdir));
        setIndexedVec3(tan1, c, vec3.add(tan1c, tan1c, sdir));
        // tan2[a] += tdir;
        // tan2[b] += tdir;
        // tan2[c] += tdir;
        const tan2a = copyIndexedVec3(tan2, a);
        const tan2b = copyIndexedVec3(tan2, b);
        const tan2c = copyIndexedVec3(tan2, c);
        setIndexedVec3(tan2, a, vec3.add(tan2a, tan2a, tdir));
        setIndexedVec3(tan2, b, vec3.add(tan2b, tan2b, tdir));
        setIndexedVec3(tan2, c, vec3.add(tan2c, tan2c, tdir));
    });
    for (let ix = 0; ix < vertexCount; ++ix) {
        const n = normView.copyItem(ix);
        const t = copyIndexedVec3(tan1, ix);
        const t2 = copyIndexedVec3(tan2, ix);
        // Gram-Schmidt orthogonalize, specify standard normal in case n or t = 0
        const tangent = vec3.normalize([0, 0, 1], vec3.sub([], t, vec3.scale([], n, vec3.dot(n, t))));
        // Reverse tangent to conform to GL handedness if needed
        if (vec3.dot(vec3.cross([], n, t), t2) < 0) {
            vec3.scale(tangent, tangent, -1);
        }
        if (isNaN(tangent[0]) || isNaN(tangent[1]) || isNaN(tangent[2])) {
            assert(false, "Failure during tangent calculation");
        }
        vec3.copy(tanView.refItem(ix), tangent);
    }
}

/**
 * geometry-gen/generate - geometry generators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function generate(gens, attrList) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!attrList) {
            attrList = AttrList.Pos3Norm3UV2();
        }
        const genList = Array.isArray(gens) ? gens : [gens];
        let totalVertexCount = 0;
        let totalFaceCount = 0;
        for (const genSource of genList) {
            const generator = ("generator" in genSource) ? genSource.generator : genSource;
            totalVertexCount += generator.vertexCount;
            totalFaceCount += generator.faceCount;
        }
        // -- create vertex and index buffers for combined geometry
        const geom = allocateGeometry({
            layout: makeStandardVertexLayout(attrList),
            vertexCount: totalVertexCount,
            indexCount: totalFaceCount * 3
        });
        const layout = geom.layout.layouts[0];
        const vertexBuffer = geom.vertexBuffers[0];
        // -- views into various attributes and the index buffer
        const normalAttr = layout.attrByRole(2 /* Normal */);
        const texAttr = layout.attrByRole(6 /* UV */);
        const posView = new VertexBufferAttributeView(geom.vertexBuffers[0], layout.attrByRole(1 /* Position */));
        const normalView = normalAttr ? new VertexBufferAttributeView(vertexBuffer, normalAttr) : null;
        const texView = texAttr ? new VertexBufferAttributeView(vertexBuffer, texAttr) : null;
        const triView = yield (yield triangleViewForGeometry(geom)).mutableView();
        // -- data add functions for the generators
        let posIx = 0, faceIx = 0, normalIx = 0, uvIx = 0, baseVertex = 0;
        const pos2 = (x, y, _z) => {
            const v2 = posView.refItem(posIx);
            v2[0] = x;
            v2[1] = y;
            posIx++;
        };
        const pos3 = (x, y, z) => {
            const v3 = posView.refItem(posIx);
            v3[0] = x;
            v3[1] = y;
            v3[2] = z;
            posIx++;
        };
        const pos = posView.elementCount === 2 ? pos2 : pos3;
        const face = (a, b, c) => {
            const i3 = triView.refItemMutable(faceIx);
            i3[0] = a + baseVertex;
            i3[1] = b + baseVertex;
            i3[2] = c + baseVertex;
            faceIx++;
        };
        const normal = normalView ?
            (x, y, z) => {
                const v3 = normalView.refItem(normalIx);
                v3[0] = x;
                v3[1] = y;
                v3[2] = z;
                normalIx++;
            }
            : (_x, _y, _z) => { };
        const uv = texView ?
            (u, v) => {
                const v2 = texView.refItem(uvIx);
                v2[0] = u;
                v2[1] = v;
                uvIx++;
            }
            : (_u, _v) => { };
        // -- generate and optionally transform each part
        const posTransMatrix = mat4.create();
        const normTransMatrix = mat3.create();
        for (const genSource of genList) {
            const generator = ("generator" in genSource) ? genSource.generator : genSource;
            generator.generate(pos, face, normal, uv);
            const subVtxCount = generator.vertexCount;
            const subFaceCount = generator.faceCount;
            const subPosView = posView.subView(baseVertex, subVtxCount); // WARNING FIXME: param 2 has changed to "toTriangle"
            const subNormalView = normalView ? normalView.subView(baseVertex, subVtxCount) : null; // WARNING FIXME: param 2 has changed to "toTriangle"
            // -- if the generator does not supply normals but the geometry has a Normal attribute, we calculate them
            if (subNormalView && !generator.explicitNormals) {
                const subFaceView = triView.subView(faceIx - subFaceCount, subFaceCount); // WARNING FIXME: param 2 has changed to "toTriangle"
                calcVertexNormalsViews(subPosView, subNormalView, subFaceView);
                normalIx += subVtxCount;
            }
            // is this a TransformedMeshGen?
            if ("generator" in genSource) {
                const xformGen = genSource;
                const rotation = xformGen.rotation || quat.create();
                const translation = xformGen.translation || vec3.create();
                const scale = xformGen.scale || vec3.fromValues(1, 1, 1);
                // -- transform positions
                mat4.fromRotationTranslationScale(posTransMatrix, rotation, translation, scale);
                subPosView.forEach(vtxPos => { vec3.transformMat4(vtxPos, vtxPos, posTransMatrix); });
                // -- transform normals
                if (subNormalView) {
                    mat3.normalFromMat4(normTransMatrix, posTransMatrix);
                    subNormalView.forEach((norm) => { vec3.transformMat3(norm, norm, normTransMatrix); });
                }
            }
            baseVertex += generator.vertexCount;
        }
        // -- currently generate single primitive group for full geometry
        // TODO: make this more configurable
        geom.subMeshes.push({
            type: 4 /* Triangle */,
            fromElement: 0,
            elementCount: totalFaceCount * 3,
            materialIx: 0
        });
        return geom;
    });
}
//   ___               _
//  / _ \ _  _ __ _ __| |
// | (_) | || / _` / _` |
//  \__\_\\_,_\__,_\__,_|
//
class Quad {
    constructor(width_ = 1, height_ = 1) {
        this.width_ = width_;
        this.height_ = height_;
        assert(width_ > 0);
        assert(height_ > 0);
    }
    get vertexCount() {
        return 4;
    }
    get faceCount() {
        return 2;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        const xh = this.width_ / 2;
        const yh = this.height_ / 2;
        position(-xh, yh, 0);
        position(xh, yh, 0);
        position(-xh, -yh, 0);
        position(xh, -yh, 0);
        normal(0, 0, -1);
        normal(0, 0, -1);
        normal(0, 0, -1);
        normal(0, 0, -1);
        // quad shows texture fully
        uv(0, 0);
        uv(1, 0);
        uv(0, 1);
        uv(1, 1);
        // ccw faces
        face(0, 3, 1);
        face(0, 2, 3);
    }
}
function genFullscreenQuad() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield generate(new Quad(2, 2), [attrPosition2(), attrUV2()]);
    });
}
//  _  _ ___   ___ _____    _                _     
// | \| |   \ / __|_   _| _(_)__ _ _ _  __ _| |___ 
// | .` | |) | (__  | || '_| / _` | ' \/ _` | / -_)
// |_|\_|___/ \___| |_||_| |_\__,_|_||_\__, |_\___|
//                                     |___/       
class NDCTriangle {
    get vertexCount() {
        return 3;
    }
    get faceCount() {
        return 1;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        position(-1, -1, 0);
        position(-1, 4, 0);
        position(4, -1, 0);
        normal(0, 0, -1);
        normal(0, 0, -1);
        normal(0, 0, -1);
        // UVs go from 0 to 1 over 2 units
        uv(0, 0);
        uv(0, 2);
        uv(2, 0);
        // ccw
        face(0, 1, 2);
    }
}
function genFullscreenTriangle() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield generate(new NDCTriangle(), [attrPosition2(), attrUV2()]);
    });
}
class Plane {
    constructor(desc) {
        this.width_ = desc.width;
        this.depth_ = desc.depth;
        this.rows_ = desc.rows | 0;
        this.segs_ = desc.segs | 0;
        this.yGen_ = desc.yGen || ((_x, _z) => 0);
        assert(this.width_ > 0);
        assert(this.depth_ > 0);
        assert(this.rows_ > 0);
        assert(this.segs_ > 0);
    }
    get vertexCount() {
        return (this.rows_ + 1) * (this.segs_ + 1);
    }
    get faceCount() {
        return 2 * this.rows_ * this.segs_;
    }
    get explicitNormals() {
        return false;
    }
    generate(position, face, _normal, uv) {
        const halfWidth = this.width_ / 2;
        const halfDepth = this.depth_ / 2;
        const tileDimX = this.width_ / this.segs_;
        const tileDimZ = this.depth_ / this.rows_;
        // -- positions
        for (let z = 0; z <= this.rows_; ++z) {
            const posZ = -halfDepth + (z * tileDimZ);
            for (let x = 0; x <= this.segs_; ++x) {
                const posX = -halfWidth + (x * tileDimX);
                position(posX, this.yGen_(posX, posZ), posZ);
                uv(x / this.segs_, z / this.rows_);
            }
        }
        // -- faces
        let baseIndex = 0;
        const vertexRowCount = this.segs_ + 1;
        for (let z = 0; z < this.rows_; ++z) {
            for (let x = 0; x < this.segs_; ++x) {
                face(baseIndex + x + 1, baseIndex + x + vertexRowCount, baseIndex + x + vertexRowCount + 1);
                face(baseIndex + x, baseIndex + x + vertexRowCount, baseIndex + x + 1);
            }
            baseIndex += vertexRowCount;
        }
    }
}
function cubeDescriptor(diam, inward = false) {
    return { width: diam, height: diam, depth: diam, inward };
}
class Box {
    constructor(desc) {
        this.xDiam_ = desc.width;
        this.yDiam_ = desc.height;
        this.zDiam_ = desc.depth;
        this.inward_ = desc.inward || false;
        assert(this.xDiam_ > 0);
        assert(this.yDiam_ > 0);
        assert(this.zDiam_ > 0);
        this.uvRange_ = desc.uvRange ? [desc.uvRange[0], desc.uvRange[1]] : [1, 1];
        this.uvOffset_ = desc.uvOffset ? [desc.uvOffset[0], desc.uvOffset[1]] : [0, 0];
    }
    get vertexCount() {
        return 24;
    }
    get faceCount() {
        return 12;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        const xh = this.xDiam_ / 2;
        const yh = this.yDiam_ / 2;
        const zh = this.zDiam_ / 2;
        const uA = this.uvOffset_[0];
        const uB = this.uvOffset_[0] + this.uvRange_[0];
        const vA = this.uvOffset_[1];
        const vB = this.uvOffset_[1] + this.uvRange_[1];
        let curVtx = 0;
        // unique positions
        const p = [
            [-xh, -yh, -zh],
            [xh, -yh, -zh],
            [xh, yh, -zh],
            [-xh, yh, -zh],
            [-xh, -yh, zh],
            [xh, -yh, zh],
            [xh, yh, zh],
            [-xh, yh, zh]
        ];
        // topleft, topright, botright, botleft
        const quad = (a, b, c, d, norm) => {
            if (this.inward_) {
                vec3.negate(norm, norm);
            }
            position(p[a][0], p[a][1], p[a][2]);
            position(p[b][0], p[b][1], p[b][2]);
            position(p[c][0], p[c][1], p[c][2]);
            position(p[d][0], p[d][1], p[d][2]);
            // normals
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            // each cube quad shows texture fully by default
            uv(uB, vA);
            uv(uA, vA);
            uv(uA, vB);
            uv(uB, vB);
            // ccw faces
            if (this.inward_) {
                face(curVtx, curVtx + 2, curVtx + 1);
                face(curVtx + 2, curVtx, curVtx + 3);
            }
            else {
                face(curVtx, curVtx + 1, curVtx + 2);
                face(curVtx + 2, curVtx + 3, curVtx);
            }
            curVtx += 4;
        };
        /* tslint:disable:whitespace */
        quad(3, 2, 1, 0, [0, 0, -1]); // front
        quad(7, 3, 0, 4, [-1, 0, 0]); // left
        quad(6, 7, 4, 5, [0, 0, 1]); // back
        quad(2, 6, 5, 1, [1, 0, 0]); // right
        quad(7, 6, 2, 3, [0, 1, 0]); // top
        quad(5, 4, 0, 1, [0, -1, 0]); // bottom
        /* tslint:enable:whitespace */
    }
}
class RoundedBox {
    constructor(desc) {
        this.xDiam_ = desc.width;
        this.yDiam_ = desc.height;
        this.zDiam_ = desc.depth;
        this.radius_ = desc.cornerRadius;
        this.inward_ = desc.inward || false;
        assert(this.xDiam_ > 0);
        assert(this.yDiam_ > 0);
        assert(this.zDiam_ > 0);
        const minDiamHalf = Math.min(this.xDiam_, this.yDiam_, this.zDiam_) / 2;
        assert(this.radius_ >= 0 && this.radius_ <= minDiamHalf);
        this.uvRange_ = desc.uvRange ? [desc.uvRange[0], desc.uvRange[1]] : [1, 1];
        this.uvOffset_ = desc.uvOffset ? [desc.uvOffset[0], desc.uvOffset[1]] : [0, 0];
    }
    get vertexCount() {
        return 24;
    }
    get faceCount() {
        return 12;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        const xh = this.xDiam_ / 2;
        const yh = this.yDiam_ / 2;
        const zh = this.zDiam_ / 2;
        const uA = this.uvOffset_[0];
        const uB = this.uvOffset_[0] + this.uvRange_[0];
        const vA = this.uvOffset_[1];
        const vB = this.uvOffset_[1] + this.uvRange_[1];
        let curVtx = 0;
        // unique positions
        const p = [
            [-xh, -yh, -zh],
            [xh, -yh, -zh],
            [xh, yh, -zh],
            [-xh, yh, -zh],
            [-xh, -yh, zh],
            [xh, -yh, zh],
            [xh, yh, zh],
            [-xh, yh, zh]
        ];
        // topleft, topright, botright, botleft
        const quad = (a, b, c, d, norm) => {
            if (this.inward_) {
                vec3.negate(norm, norm);
            }
            position(p[a][0], p[a][1], p[a][2]);
            position(p[b][0], p[b][1], p[b][2]);
            position(p[c][0], p[c][1], p[c][2]);
            position(p[d][0], p[d][1], p[d][2]);
            // normals
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            normal(norm[0], norm[1], norm[2]);
            // each cube quad shows texture fully by default
            uv(uB, vA);
            uv(uA, vA);
            uv(uA, vB);
            uv(uB, vB);
            // ccw faces
            if (this.inward_) {
                face(curVtx, curVtx + 2, curVtx + 1);
                face(curVtx + 2, curVtx, curVtx + 3);
            }
            else {
                face(curVtx, curVtx + 1, curVtx + 2);
                face(curVtx + 2, curVtx + 3, curVtx);
            }
            curVtx += 4;
        };
        /* tslint:disable:whitespace */
        quad(3, 2, 1, 0, [0, 0, -1]); // front
        quad(7, 3, 0, 4, [-1, 0, 0]); // left
        quad(6, 7, 4, 5, [0, 0, 1]); // back
        quad(2, 6, 5, 1, [1, 0, 0]); // right
        quad(7, 6, 2, 3, [0, 1, 0]); // top
        quad(5, 4, 0, 1, [0, -1, 0]); // bottom
        /* tslint:enable:whitespace */
    }
}
class Cone {
    constructor(desc) {
        this.radiusA_ = desc.radiusA;
        this.radiusB_ = desc.radiusB;
        this.height_ = desc.height;
        this.rows_ = desc.rows | 0;
        this.segs_ = desc.segs | 0;
        assert(this.radiusA_ >= 0);
        assert(this.radiusB_ >= 0);
        assert(!((this.radiusA_ === 0) && (this.radiusB_ === 0)));
        assert(this.rows_ >= 1);
        assert(this.segs_ >= 3);
    }
    get vertexCount() {
        return (this.segs_ + 1) * (this.rows_ + 1);
    }
    get faceCount() {
        let fc = (2 * this.segs_ * this.rows_);
        if ((this.radiusA_ === 0) || (this.radiusB_ === 0)) {
            fc -= this.segs_;
        }
        return fc;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        let vix = 0;
        const radiusDiff = this.radiusB_ - this.radiusA_;
        const tau = Math.PI * 2;
        const yNorm = radiusDiff / this.height_;
        for (let row = 0; row <= this.rows_; ++row) {
            const relPos = row / this.rows_;
            const y = (relPos * -this.height_) + (this.height_ / 2);
            const segRad = this.radiusA_ + (relPos * radiusDiff);
            const texV = relPos;
            for (let seg = 0; seg <= this.segs_; ++seg) {
                const x = Math.sin((tau / this.segs_) * seg) * segRad;
                const z = Math.cos((tau / this.segs_) * seg) * segRad;
                const texU = seg / this.segs_;
                position(x, y, z);
                const norm = vec3.normalize([], [x, yNorm, z]);
                normal(norm[0], norm[1], norm[2]);
                uv(texU, texV);
                ++vix;
            }
            // construct row of faces
            if (row > 0) {
                const raix = vix - ((this.segs_ + 1) * 2);
                const rbix = vix - (this.segs_ + 1);
                for (let seg = 0; seg < this.segs_; ++seg) {
                    const rl = seg;
                    const rr = seg + 1;
                    if (row > 1 || this.radiusA_ > 0) {
                        face(raix + rl, rbix + rl, raix + rr);
                    }
                    if (row < this.rows_ || this.radiusB_ > 0) {
                        face(raix + rr, rbix + rl, rbix + rr);
                    }
                }
            }
        }
    }
}
class Sphere {
    constructor(desc) {
        this.radius_ = desc.radius;
        this.rows_ = desc.rows | 0;
        this.segs_ = desc.segs | 0;
        this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
        this.sliceTo_ = clamp01(desc.sliceTo || 1.0);
        assert(this.radius_ > 0);
        assert(this.rows_ >= 2);
        assert(this.segs_ >= 3);
        assert(this.sliceTo_ > this.sliceFrom_);
    }
    get vertexCount() {
        return (this.segs_ + 1) * (this.rows_ + 1);
    }
    get faceCount() {
        let fc = 2 * this.segs_ * this.rows_;
        if (this.sliceFrom_ === 0.0) {
            fc -= this.segs_;
        }
        if (this.sliceTo_ === 1.0) {
            fc -= this.segs_;
        }
        return fc;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        const pi = Math.PI;
        const tau = Math.PI * 2;
        const slice = this.sliceTo_ - this.sliceFrom_;
        const piFrom = this.sliceFrom_ * pi;
        const piSlice = slice * pi;
        let vix = 0;
        const openTop = this.sliceFrom_ > 0.0;
        const openBottom = this.sliceTo_ < 1.0;
        for (let row = 0; row <= this.rows_; ++row) {
            const y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
            const segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
            const texV = this.sliceFrom_ + ((row / this.rows_) * slice);
            for (let seg = 0; seg <= this.segs_; ++seg) {
                const tauSeg = (tau / this.segs_);
                const x = Math.sin(tauSeg * seg) * segRad;
                const z = Math.cos(tauSeg * seg) * segRad;
                const texU = seg / this.segs_;
                // for a sphere with origin at [0,0,0], the normalized position is the normal
                position(x, y, z);
                const norm = vec3.normalize([], [x, y, z]);
                normal(norm[0], norm[1], norm[2]);
                uv(texU, texV);
                ++vix;
            }
            // construct row of faces
            if (row > 0) {
                const raix = vix - ((this.segs_ + 1) * 2);
                const rbix = vix - (this.segs_ + 1);
                for (let seg = 0; seg < this.segs_; ++seg) {
                    const rl = seg;
                    const rr = seg + 1;
                    if (row > 1 || openTop) {
                        face(raix + rl, rbix + rl, raix + rr);
                    }
                    if (row < this.rows_ || openBottom) {
                        face(raix + rr, rbix + rl, rbix + rr);
                    }
                }
            }
        }
    }
}
class Torus {
    constructor(desc) {
        this.minorRadius_ = desc.minorRadius;
        this.majorRadius_ = desc.majorRadius;
        this.rows_ = desc.rows | 0;
        this.segs_ = desc.segs | 0;
        this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
        this.sliceTo_ = clamp01(desc.sliceTo || 1.0);
        assert(this.minorRadius_ >= 0);
        assert(this.majorRadius_ >= this.minorRadius_);
        assert(this.minorRadius_ > 0 || this.majorRadius_ > 0);
        assert(this.rows_ >= 4);
        assert(this.segs_ >= 3);
        assert(this.sliceTo_ > this.sliceFrom_);
    }
    get vertexCount() {
        return (this.segs_ + 1) * (this.rows_ + 1);
    }
    get faceCount() {
        return 2 * this.segs_ * this.rows_;
    }
    get explicitNormals() {
        return true;
    }
    generate(position, face, normal, uv) {
        const tau = Math.PI * 2;
        const slice = this.sliceTo_ - this.sliceFrom_;
        const piFrom = this.sliceFrom_ * tau;
        const piSlice = slice * tau;
        let vix = 0;
        const innerRadius = this.majorRadius_ - this.minorRadius_;
        for (let row = 0; row <= this.rows_; ++row) {
            const majorAngle = piFrom + ((piSlice * row) / this.rows_); // angle on the x-y plane
            const texV = this.sliceFrom_ + ((row / this.rows_) * slice);
            for (let seg = 0; seg <= this.segs_; ++seg) {
                const innerAngle = (tau * seg) / this.segs_;
                const cx = Math.cos(majorAngle) * this.majorRadius_;
                const cy = Math.sin(majorAngle) * this.majorRadius_;
                const x = Math.cos(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                const y = Math.sin(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                const z = Math.sin(innerAngle) * innerRadius;
                const texU = seg / this.segs_;
                const vNorm = vec3.normalize([], [x - cx, y - cy, z]);
                position(x, y, z);
                normal(vNorm[0], vNorm[1], vNorm[2]);
                uv(texU, texV);
                ++vix;
            }
            // construct row of faces
            if (row > 0) {
                const raix = vix - ((this.segs_ + 1) * 2);
                const rbix = vix - (this.segs_ + 1);
                for (let seg = 0; seg < this.segs_; ++seg) {
                    const rl = seg;
                    const rr = seg + 1;
                    face(raix + rl, rbix + rl, raix + rr);
                    face(raix + rr, rbix + rl, rbix + rr);
                }
            }
        }
    }
}

/**
 * geometry-gen/manipulate - geometry manipulators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function scale(geom, scale) {
    const posAttr = findAttributeOfRoleInGeometry(geom, 1 /* Position */);
    if (posAttr) {
        const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
        posView.forEach(pos => { vec3.multiply(pos, pos, scale); });
    }
}
function translate(geom, globalDelta) {
    const posAttr = findAttributeOfRoleInGeometry(geom, 1 /* Position */);
    if (posAttr) {
        const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
        posView.forEach(pos => { vec3.add(pos, pos, globalDelta); });
    }
}
function rotate(geom, rotation) {
    const posAttr = findAttributeOfRoleInGeometry(geom, 1 /* Position */);
    if (posAttr) {
        const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
        posView.forEach(pos => { vec3.transformQuat(pos, pos, rotation); });
    }
    const normAttr = findAttributeOfRoleInGeometry(geom, 2 /* Normal */);
    if (normAttr) {
        const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
        normView.forEach(norm => { vec3.transformQuat(norm, norm, rotation); });
    }
}
function transform(geom, actions) {
    const rotation = actions.rotate || quat.create();
    const translation = actions.translate || vec3.zero();
    const scale = actions.scale || vec3.one();
    const posMatrix = mat4.fromRotationTranslationScale([], rotation, translation, scale);
    const posAttr = findAttributeOfRoleInGeometry(geom, 1 /* Position */);
    if (posAttr) {
        const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
        posView.forEach(pos => { vec3.transformMat4(pos, pos, posMatrix); });
    }
    const normAttr = findAttributeOfRoleInGeometry(geom, 2 /* Normal */);
    if (normAttr) {
        const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
        const normalMatrix = mat3.normalFromMat4([], posMatrix);
        normView.forEach(norm => { vec3.transformMat3(norm, norm, normalMatrix); });
    }
}

/**
 * @stardazed/geometry-gen - geometry generation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { attrPosition2, attrPosition3, attrNormal3, attrColour3, attrUV2, attrTangent3, attrJointIndexes, attrWeightedPos, AttrList, MeshBuilder, genVertexNormals, genVertexTangents, calcVertexNormals, calcVertexNormalsViews, calcVertexTangents, calcVertexTangentsViews, generate, Quad, genFullscreenQuad, NDCTriangle, genFullscreenTriangle, Plane, cubeDescriptor, Box, RoundedBox, Cone, Sphere, Torus, scale, translate, rotate, transform };
//# sourceMappingURL=index.esm.js.map
