var veclib;
(function (veclib) {
    veclib.EPSILON = 0.000001;
    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }
    veclib.clamp = clamp;
    function clamp01(n) {
        return Math.max(0.0, Math.min(1.0, n));
    }
    veclib.clamp01 = clamp01;
    function mix(a, b, ratio) {
        return a * (1 - ratio) + b * ratio;
    }
    veclib.mix = mix;
    ;
    function refIndexedVec2(data, index) {
        return data.subarray(index * 2, (index + 1) * 2);
    }
    veclib.refIndexedVec2 = refIndexedVec2;
    function copyIndexedVec2(data, index) {
        var offset = (index * 2) | 0;
        return [data[offset], data[offset + 1]];
    }
    veclib.copyIndexedVec2 = copyIndexedVec2;
    function setIndexedVec2(data, index, v2) {
        var offset = (index * 2) | 0;
        data[offset] = v2[0];
        data[offset + 1] = v2[1];
    }
    veclib.setIndexedVec2 = setIndexedVec2;
    function copyVec2FromOffset(data, offset) {
        return [data[offset], data[offset + 1]];
    }
    veclib.copyVec2FromOffset = copyVec2FromOffset;
    function setVec2AtOffset(data, offset, v2) {
        data[offset] = v2[0];
        data[offset + 1] = v2[1];
    }
    veclib.setVec2AtOffset = setVec2AtOffset;
    function offsetOfIndexedVec2(index) { return (index * 2) | 0; }
    veclib.offsetOfIndexedVec2 = offsetOfIndexedVec2;
    function refIndexedVec3(data, index) {
        return data.subarray(index * 3, (index + 1) * 3);
    }
    veclib.refIndexedVec3 = refIndexedVec3;
    function copyIndexedVec3(data, index) {
        var offset = (index * 3) | 0;
        return [data[offset], data[offset + 1], data[offset + 2]];
    }
    veclib.copyIndexedVec3 = copyIndexedVec3;
    function setIndexedVec3(data, index, v3) {
        var offset = (index * 3) | 0;
        data[offset] = v3[0];
        data[offset + 1] = v3[1];
        data[offset + 2] = v3[2];
    }
    veclib.setIndexedVec3 = setIndexedVec3;
    function copyVec3FromOffset(data, offset) {
        return [data[offset], data[offset + 1], data[offset + 2]];
    }
    veclib.copyVec3FromOffset = copyVec3FromOffset;
    function setVec3AtOffset(data, offset, v3) {
        data[offset] = v3[0];
        data[offset + 1] = v3[1];
        data[offset + 2] = v3[2];
    }
    veclib.setVec3AtOffset = setVec3AtOffset;
    function offsetOfIndexedVec3(index) { return (index * 3) | 0; }
    veclib.offsetOfIndexedVec3 = offsetOfIndexedVec3;
    function refIndexedVec4(data, index) {
        return data.subarray(index * 4, (index + 1) * 4);
    }
    veclib.refIndexedVec4 = refIndexedVec4;
    function copyIndexedVec4(data, index) {
        var offset = (index * 4) | 0;
        return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    }
    veclib.copyIndexedVec4 = copyIndexedVec4;
    function setIndexedVec4(data, index, v4) {
        var offset = (index * 4) | 0;
        data[offset] = v4[0];
        data[offset + 1] = v4[1];
        data[offset + 2] = v4[2];
        data[offset + 3] = v4[3];
    }
    veclib.setIndexedVec4 = setIndexedVec4;
    function copyVec4FromOffset(data, offset) {
        return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    }
    veclib.copyVec4FromOffset = copyVec4FromOffset;
    function setVec4AtOffset(data, offset, v4) {
        data[offset] = v4[0];
        data[offset + 1] = v4[1];
        data[offset + 2] = v4[2];
        data[offset + 3] = v4[3];
    }
    veclib.setVec4AtOffset = setVec4AtOffset;
    function offsetOfIndexedVec4(index) { return (index * 4) | 0; }
    veclib.offsetOfIndexedVec4 = offsetOfIndexedVec4;
    function refIndexedMat3(data, index) {
        return data.subarray(index * 9, (index + 1) * 9);
    }
    veclib.refIndexedMat3 = refIndexedMat3;
    function copyIndexedMat3(data, index) {
        var offset = (index * 9) | 0;
        return [
            data[offset], data[offset + 1], data[offset + 2],
            data[offset + 3], data[offset + 4], data[offset + 5],
            data[offset + 6], data[offset + 7], data[offset + 8],
        ];
    }
    veclib.copyIndexedMat3 = copyIndexedMat3;
    function setIndexedMat3(data, index, m3) {
        var offset = (index * 9) | 0;
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
    veclib.setIndexedMat3 = setIndexedMat3;
    function offsetOfIndexedMat3(index) { return (index * 9) | 0; }
    veclib.offsetOfIndexedMat3 = offsetOfIndexedMat3;
    function refIndexedMat4(data, index) {
        return data.subarray(index * 16, (index + 1) * 16);
    }
    veclib.refIndexedMat4 = refIndexedMat4;
    function copyIndexedMat4(data, index) {
        var offset = (index * 16) | 0;
        return [
            data[offset], data[offset + 1], data[offset + 2], data[offset + 3],
            data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7],
            data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11],
            data[offset + 12], data[offset + 13], data[offset + 14], data[offset + 15]
        ];
    }
    veclib.copyIndexedMat4 = copyIndexedMat4;
    function setIndexedMat4(data, index, m4) {
        var offset = (index * 16) | 0;
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
    veclib.setIndexedMat4 = setIndexedMat4;
    function offsetOfIndexedMat4(index) { return (index * 16) | 0; }
    veclib.offsetOfIndexedMat4 = offsetOfIndexedMat4;
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var mat2;
    (function (mat2) {
        mat2.ELEMENT_COUNT = 4;
        function create() {
            var out = new Float32Array(mat2.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        mat2.create = create;
        function clone(a) {
            var out = new Float32Array(mat2.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        }
        mat2.clone = clone;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        }
        mat2.copy = copy;
        function identity(out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        mat2.identity = identity;
        function fromValues(m00, m01, m10, m11) {
            var out = new Float32Array(mat2.ELEMENT_COUNT);
            out[0] = m00;
            out[1] = m01;
            out[2] = m10;
            out[3] = m11;
            return out;
        }
        mat2.fromValues = fromValues;
        function set(out, m00, m01, m10, m11) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m10;
            out[3] = m11;
            return out;
        }
        mat2.set = set;
        function transpose(out, a) {
            if (out === a) {
                var a1 = a[1];
                out[1] = a[2];
                out[2] = a1;
            }
            else {
                out[0] = a[0];
                out[1] = a[2];
                out[2] = a[1];
                out[3] = a[3];
            }
            return out;
        }
        mat2.transpose = transpose;
        function invert(out, a) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var det = a0 * a3 - a2 * a1;
            if (!det) {
                return null;
            }
            det = 1.0 / det;
            out[0] = a3 * det;
            out[1] = -a1 * det;
            out[2] = -a2 * det;
            out[3] = a0 * det;
            return out;
        }
        mat2.invert = invert;
        function adjoint(out, a) {
            var a0 = a[0];
            out[0] = a[3];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = a0;
            return out;
        }
        mat2.adjoint = adjoint;
        function determinant(a) {
            return a[0] * a[3] - a[2] * a[1];
        }
        mat2.determinant = determinant;
        function multiply(out, a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = a0 * b0 + a2 * b1;
            out[1] = a1 * b0 + a3 * b1;
            out[2] = a0 * b2 + a2 * b3;
            out[3] = a1 * b2 + a3 * b3;
            return out;
        }
        mat2.multiply = multiply;
        mat2.mul = multiply;
        function rotate(out, a, rad) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = a0 * c + a2 * s;
            out[1] = a1 * c + a3 * s;
            out[2] = a0 * -s + a2 * c;
            out[3] = a1 * -s + a3 * c;
            return out;
        }
        mat2.rotate = rotate;
        function scale(out, a, v2) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var v0 = v2[0], v1 = v2[1];
            out[0] = a0 * v0;
            out[1] = a1 * v0;
            out[2] = a2 * v1;
            out[3] = a3 * v1;
            return out;
        }
        mat2.scale = scale;
        function fromRotation(out, rad) {
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = -s;
            out[3] = c;
            return out;
        }
        mat2.fromRotation = fromRotation;
        function fromScaling(out, v2) {
            out[0] = v2[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = v2[1];
            return out;
        }
        mat2.fromScaling = fromScaling;
        function str(a) {
            return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }
        mat2.str = str;
        function frob(a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
        }
        mat2.frob = frob;
        function LDU(L, D, U, a) {
            L[2] = a[2] / a[0];
            U[0] = a[0];
            U[1] = a[1];
            U[3] = a[3] - L[2] * U[1];
            return [L, D, U];
        }
        mat2.LDU = LDU;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            return out;
        }
        mat2.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            return out;
        }
        mat2.subtract = subtract;
        mat2.sub = subtract;
        function multiplyScalar(out, a, scale) {
            out[0] = a[0] * scale;
            out[1] = a[1] * scale;
            out[2] = a[2] * scale;
            out[3] = a[3] * scale;
            return out;
        }
        mat2.multiplyScalar = multiplyScalar;
        function multiplyScalarAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            return out;
        }
        mat2.multiplyScalarAndAdd = multiplyScalarAndAdd;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
        }
        mat2.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= veclib.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
        }
        mat2.equals = equals;
    })(mat2 = veclib.mat2 || (veclib.mat2 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var mat2d;
    (function (mat2d) {
        mat2d.ELEMENT_COUNT = 6;
        function create() {
            var out = new Float32Array(mat2d.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = 0;
            out[5] = 0;
            return out;
        }
        mat2d.create = create;
        function clone(a) {
            var out = new Float32Array(mat2d.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            return out;
        }
        mat2d.clone = clone;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            return out;
        }
        mat2d.copy = copy;
        function identity(out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = 0;
            out[5] = 0;
            return out;
        }
        mat2d.identity = identity;
        function fromValues(a, b, c, d, tx, ty) {
            var out = new Float32Array(mat2d.ELEMENT_COUNT);
            out[0] = a;
            out[1] = b;
            out[2] = c;
            out[3] = d;
            out[4] = tx;
            out[5] = ty;
            return out;
        }
        mat2d.fromValues = fromValues;
        function set(out, a, b, c, d, tx, ty) {
            out[0] = a;
            out[1] = b;
            out[2] = c;
            out[3] = d;
            out[4] = tx;
            out[5] = ty;
            return out;
        }
        mat2d.set = set;
        function invert(out, a) {
            var aa = a[0], ab = a[1], ac = a[2], ad = a[3];
            var atx = a[4], aty = a[5];
            var det = aa * ad - ab * ac;
            if (!det) {
                return null;
            }
            det = 1.0 / det;
            out[0] = ad * det;
            out[1] = -ab * det;
            out[2] = -ac * det;
            out[3] = aa * det;
            out[4] = (ac * aty - ad * atx) * det;
            out[5] = (ab * atx - aa * aty) * det;
            return out;
        }
        mat2d.invert = invert;
        function determinant(a) {
            return a[0] * a[3] - a[1] * a[2];
        }
        mat2d.determinant = determinant;
        function multiply(out, a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
            out[0] = a0 * b0 + a2 * b1;
            out[1] = a1 * b0 + a3 * b1;
            out[2] = a0 * b2 + a2 * b3;
            out[3] = a1 * b2 + a3 * b3;
            out[4] = a0 * b4 + a2 * b5 + a4;
            out[5] = a1 * b4 + a3 * b5 + a5;
            return out;
        }
        mat2d.multiply = multiply;
        mat2d.mul = multiply;
        function rotate(out, a, rad) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = a0 * c + a2 * s;
            out[1] = a1 * c + a3 * s;
            out[2] = a0 * -s + a2 * c;
            out[3] = a1 * -s + a3 * c;
            out[4] = a4;
            out[5] = a5;
            return out;
        }
        mat2d.rotate = rotate;
        function scale(out, a, v2) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            var v0 = v2[0], v1 = v2[1];
            out[0] = a0 * v0;
            out[1] = a1 * v0;
            out[2] = a2 * v1;
            out[3] = a3 * v1;
            out[4] = a4;
            out[5] = a5;
            return out;
        }
        mat2d.scale = scale;
        function translate(out, a, v2) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            var v0 = v2[0], v1 = v2[1];
            out[0] = a0;
            out[1] = a1;
            out[2] = a2;
            out[3] = a3;
            out[4] = a0 * v0 + a2 * v1 + a4;
            out[5] = a1 * v0 + a3 * v1 + a5;
            return out;
        }
        mat2d.translate = translate;
        function fromRotation(out, rad) {
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = -s;
            out[3] = c;
            out[4] = 0;
            out[5] = 0;
            return out;
        }
        mat2d.fromRotation = fromRotation;
        function fromScaling(out, v2) {
            out[0] = v2[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = v2[1];
            out[4] = 0;
            out[5] = 0;
            return out;
        }
        mat2d.fromScaling = fromScaling;
        function fromTranslation(out, v2) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = v2[0];
            out[5] = v2[1];
            return out;
        }
        mat2d.fromTranslation = fromTranslation;
        function str(a) {
            return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
        }
        mat2d.str = str;
        function frob(a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) +
                Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
        }
        mat2d.frob = frob;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            return out;
        }
        mat2d.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            return out;
        }
        mat2d.subtract = subtract;
        mat2d.sub = subtract;
        function multiplyScalar(out, a, scale) {
            out[0] = a[0] * scale;
            out[1] = a[1] * scale;
            out[2] = a[2] * scale;
            out[3] = a[3] * scale;
            out[4] = a[4] * scale;
            out[5] = a[5] * scale;
            return out;
        }
        mat2d.multiplyScalar = multiplyScalar;
        function multiplyScalarAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            out[4] = a[4] + (b[4] * scale);
            out[5] = a[5] + (b[5] * scale);
            return out;
        }
        mat2d.multiplyScalarAndAdd = multiplyScalarAndAdd;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
        }
        mat2d.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= veclib.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
                Math.abs(a4 - b4) <= veclib.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
                Math.abs(a5 - b5) <= veclib.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)));
        }
        mat2d.equals = equals;
    })(mat2d = veclib.mat2d || (veclib.mat2d = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var mat3;
    (function (mat3) {
        mat3.ELEMENT_COUNT = 9;
        function create() {
            var out = new Float32Array(mat3.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        }
        mat3.create = create;
        function clone(a) {
            var out = new Float32Array(mat3.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        }
        mat3.clone = clone;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        }
        mat3.copy = copy;
        function identity(out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        }
        mat3.identity = identity;
        function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
            var out = new Float32Array(mat3.ELEMENT_COUNT);
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m10;
            out[4] = m11;
            out[5] = m12;
            out[6] = m20;
            out[7] = m21;
            out[8] = m22;
            return out;
        }
        mat3.fromValues = fromValues;
        function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m10;
            out[4] = m11;
            out[5] = m12;
            out[6] = m20;
            out[7] = m21;
            out[8] = m22;
            return out;
        }
        mat3.set = set;
        function transpose(out, a) {
            if (out === a) {
                var a01 = a[1], a02 = a[2], a12 = a[5];
                out[1] = a[3];
                out[2] = a[6];
                out[3] = a01;
                out[5] = a[7];
                out[6] = a02;
                out[7] = a12;
            }
            else {
                out[0] = a[0];
                out[1] = a[3];
                out[2] = a[6];
                out[3] = a[1];
                out[4] = a[4];
                out[5] = a[7];
                out[6] = a[2];
                out[7] = a[5];
                out[8] = a[8];
            }
            return out;
        }
        mat3.transpose = transpose;
        function invert(out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20;
            var det = a00 * b01 + a01 * b11 + a02 * b21;
            if (!det) {
                return null;
            }
            det = 1.0 / det;
            out[0] = b01 * det;
            out[1] = (-a22 * a01 + a02 * a21) * det;
            out[2] = (a12 * a01 - a02 * a11) * det;
            out[3] = b11 * det;
            out[4] = (a22 * a00 - a02 * a20) * det;
            out[5] = (-a12 * a00 + a02 * a10) * det;
            out[6] = b21 * det;
            out[7] = (-a21 * a00 + a01 * a20) * det;
            out[8] = (a11 * a00 - a01 * a10) * det;
            return out;
        }
        mat3.invert = invert;
        function adjoint(out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
            out[0] = (a11 * a22 - a12 * a21);
            out[1] = (a02 * a21 - a01 * a22);
            out[2] = (a01 * a12 - a02 * a11);
            out[3] = (a12 * a20 - a10 * a22);
            out[4] = (a00 * a22 - a02 * a20);
            out[5] = (a02 * a10 - a00 * a12);
            out[6] = (a10 * a21 - a11 * a20);
            out[7] = (a01 * a20 - a00 * a21);
            out[8] = (a00 * a11 - a01 * a10);
            return out;
        }
        mat3.adjoint = adjoint;
        function determinant(a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
            return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
        }
        mat3.determinant = determinant;
        function multiply(out, a, b) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];
            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b00 * a02 + b01 * a12 + b02 * a22;
            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b10 * a02 + b11 * a12 + b12 * a22;
            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return out;
        }
        mat3.multiply = multiply;
        mat3.mul = multiply;
        function rotate(out, a, rad) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = c * a00 + s * a10;
            out[1] = c * a01 + s * a11;
            out[2] = c * a02 + s * a12;
            out[3] = c * a10 - s * a00;
            out[4] = c * a11 - s * a01;
            out[5] = c * a12 - s * a02;
            out[6] = a20;
            out[7] = a21;
            out[8] = a22;
            return out;
        }
        mat3.rotate = rotate;
        function scale(out, a, v2) {
            var x = v2[0], y = v2[1];
            out[0] = x * a[0];
            out[1] = x * a[1];
            out[2] = x * a[2];
            out[3] = y * a[3];
            out[4] = y * a[4];
            out[5] = y * a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        }
        mat3.scale = scale;
        function translate(out, a, v2) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
            var x = v2[0], y = v2[1];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a10;
            out[4] = a11;
            out[5] = a12;
            out[6] = x * a00 + y * a10 + a20;
            out[7] = x * a01 + y * a11 + a21;
            out[8] = x * a02 + y * a12 + a22;
            return out;
        }
        mat3.translate = translate;
        function fromRotation(out, rad) {
            var s = Math.sin(rad), c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = 0;
            out[3] = -s;
            out[4] = c;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        }
        mat3.fromRotation = fromRotation;
        function fromScaling(out, v2) {
            out[0] = v2[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = v2[1];
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        }
        mat3.fromScaling = fromScaling;
        function fromTranslation(out, v2) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = v2[0];
            out[7] = v2[1];
            out[8] = 1;
            return out;
        }
        mat3.fromTranslation = fromTranslation;
        function fromMat2d(out, m2d) {
            out[0] = m2d[0];
            out[1] = m2d[1];
            out[2] = 0;
            out[3] = m2d[2];
            out[4] = m2d[3];
            out[5] = 0;
            out[6] = m2d[4];
            out[7] = m2d[5];
            out[8] = 1;
            return out;
        }
        mat3.fromMat2d = fromMat2d;
        function fromMat4(out, m4) {
            out[0] = m4[0];
            out[1] = m4[1];
            out[2] = m4[2];
            out[3] = m4[4];
            out[4] = m4[5];
            out[5] = m4[6];
            out[6] = m4[8];
            out[7] = m4[9];
            out[8] = m4[10];
            return out;
        }
        mat3.fromMat4 = fromMat4;
        function fromQuat(out, q) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, yx = y * x2, yy = y * y2, zx = z * x2, zy = z * y2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
            out[0] = 1 - yy - zz;
            out[3] = yx - wz;
            out[6] = zx + wy;
            out[1] = yx + wz;
            out[4] = 1 - xx - zz;
            out[7] = zy - wx;
            out[2] = zx - wy;
            out[5] = zy + wx;
            out[8] = 1 - xx - yy;
            return out;
        }
        mat3.fromQuat = fromQuat;
        function normalFromMat4(out, m4) {
            var a00 = m4[0], a01 = m4[1], a02 = m4[2], a03 = m4[3], a10 = m4[4], a11 = m4[5], a12 = m4[6], a13 = m4[7], a20 = m4[8], a21 = m4[9], a22 = m4[10], a23 = m4[11], a30 = m4[12], a31 = m4[13], a32 = m4[14], a33 = m4[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
            var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) {
                return null;
            }
            det = 1.0 / det;
            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            return out;
        }
        mat3.normalFromMat4 = normalFromMat4;
        function str(a) {
            return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
        }
        mat3.str = str;
        function frob(a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
                Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
        }
        mat3.frob = frob;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            out[6] = a[6] + b[6];
            out[7] = a[7] + b[7];
            out[8] = a[8] + b[8];
            return out;
        }
        mat3.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            out[6] = a[6] - b[6];
            out[7] = a[7] - b[7];
            out[8] = a[8] - b[8];
            return out;
        }
        mat3.subtract = subtract;
        mat3.sub = subtract;
        function multiplyScalar(out, a, scale) {
            out[0] = a[0] * scale;
            out[1] = a[1] * scale;
            out[2] = a[2] * scale;
            out[3] = a[3] * scale;
            out[4] = a[4] * scale;
            out[5] = a[5] * scale;
            out[6] = a[6] * scale;
            out[7] = a[7] * scale;
            out[8] = a[8] * scale;
            return out;
        }
        mat3.multiplyScalar = multiplyScalar;
        function multiplyScalarAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            out[4] = a[4] + (b[4] * scale);
            out[5] = a[5] + (b[5] * scale);
            out[6] = a[6] + (b[6] * scale);
            out[7] = a[7] + (b[7] * scale);
            out[8] = a[8] + (b[8] * scale);
            return out;
        }
        mat3.multiplyScalarAndAdd = multiplyScalarAndAdd;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
                a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
                a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
        }
        mat3.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= veclib.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
                Math.abs(a4 - b4) <= veclib.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
                Math.abs(a5 - b5) <= veclib.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
                Math.abs(a6 - b6) <= veclib.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
                Math.abs(a7 - b7) <= veclib.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
                Math.abs(a8 - b8) <= veclib.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
        }
        mat3.equals = equals;
    })(mat3 = veclib.mat3 || (veclib.mat3 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var mat4simd;
    (function (mat4simd) {
        function transpose(out, a) {
            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            var a3 = SIMD.Float32x4.load(a, 12);
            var tmp01, tmp23;
            var out0, out1, out2, out3;
            tmp01 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            tmp23 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            out0 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
            out1 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
            SIMD.Float32x4.store(out, 0, out0);
            SIMD.Float32x4.store(out, 4, out1);
            tmp01 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            tmp23 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            out2 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
            out3 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
            SIMD.Float32x4.store(out, 8, out2);
            SIMD.Float32x4.store(out, 12, out3);
            return out;
        }
        mat4simd.transpose = transpose;
        function invert(out, a) {
            var row0, row1, row2, row3, tmp1, minor0, minor1, minor2, minor3, det;
            var a0 = SIMD.Float32x4.load(a, 0), a1 = SIMD.Float32x4.load(a, 4), a2 = SIMD.Float32x4.load(a, 8), a3 = SIMD.Float32x4.load(a, 12);
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
            row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
            row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);
            tmp1 = SIMD.Float32x4.mul(row2, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.mul(row1, tmp1);
            minor1 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
            minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
            minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(row1, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
            minor3 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
            minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
            minor2 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
            minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(row0, row1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));
            tmp1 = SIMD.Float32x4.mul(row0, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
            minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.mul(row0, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);
            det = SIMD.Float32x4.mul(row0, minor0);
            det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
            det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
            tmp1 = SIMD.Float32x4.reciprocalApproximation(det);
            det = SIMD.Float32x4.sub(SIMD.Float32x4.add(tmp1, tmp1), SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
            det = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
            if (!det) {
                return null;
            }
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(det, minor0));
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(det, minor1));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(det, minor2));
            SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
            return out;
        }
        mat4simd.invert = invert;
        function adjoint(out, a) {
            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            var a3 = SIMD.Float32x4.load(a, 12);
            var row0, row1, row2, row3;
            var tmp1;
            var minor0, minor1, minor2, minor3;
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
            row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
            row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);
            tmp1 = SIMD.Float32x4.mul(row2, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.mul(row1, tmp1);
            minor1 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
            minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
            minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(row1, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
            minor3 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
            minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
            minor2 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
            minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);
            tmp1 = SIMD.Float32x4.mul(row0, row1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));
            tmp1 = SIMD.Float32x4.mul(row0, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
            minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.mul(row0, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);
            SIMD.Float32x4.store(out, 0, minor0);
            SIMD.Float32x4.store(out, 4, minor1);
            SIMD.Float32x4.store(out, 8, minor2);
            SIMD.Float32x4.store(out, 12, minor3);
            return out;
        }
        mat4simd.adjoint = adjoint;
        function multiply(out, a, b) {
            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            var a3 = SIMD.Float32x4.load(a, 12);
            var b0 = SIMD.Float32x4.load(b, 0);
            var out0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 0, out0);
            var b1 = SIMD.Float32x4.load(b, 4);
            var out1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 4, out1);
            var b2 = SIMD.Float32x4.load(b, 8);
            var out2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 8, out2);
            var b3 = SIMD.Float32x4.load(b, 12);
            var out3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 12, out3);
            return out;
        }
        mat4simd.multiply = multiply;
        function rotateX(out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad));
            var c = SIMD.Float32x4.splat(Math.cos(rad));
            if (a !== out) {
                out[0] = a[0];
                out[1] = a[1];
                out[2] = a[2];
                out[3] = a[3];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.add(SIMD.Float32x4.mul(a1, c), SIMD.Float32x4.mul(a2, s)));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a2, c), SIMD.Float32x4.mul(a1, s)));
            return out;
        }
        mat4simd.rotateX = rotateX;
        function rotateY(out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad)), c = SIMD.Float32x4.splat(Math.cos(rad));
            if (a !== out) {
                out[4] = a[4];
                out[5] = a[5];
                out[6] = a[6];
                out[7] = a[7];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            var a0 = SIMD.Float32x4.load(a, 0);
            var a2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a0, c), SIMD.Float32x4.mul(a2, s)));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.add(SIMD.Float32x4.mul(a0, s), SIMD.Float32x4.mul(a2, c)));
            return out;
        }
        mat4simd.rotateY = rotateY;
        function rotateZ(out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad)), c = SIMD.Float32x4.splat(Math.cos(rad));
            if (a !== out) {
                out[8] = a[8];
                out[9] = a[9];
                out[10] = a[10];
                out[11] = a[11];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.add(SIMD.Float32x4.mul(a0, c), SIMD.Float32x4.mul(a1, s)));
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a1, c), SIMD.Float32x4.mul(a0, s)));
            return out;
        }
        mat4simd.rotateZ = rotateZ;
        function scale(out, a, v3) {
            var vec = SIMD.Float32x4(v3[0], v3[1], v3[2], 0);
            var a0 = SIMD.Float32x4.load(a, 0);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0)));
            var a1 = SIMD.Float32x4.load(a, 4);
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1)));
            var a2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2)));
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        }
        mat4simd.scale = scale;
        function translate(out, a, v3) {
            var a0 = SIMD.Float32x4.load(a, 0), a1 = SIMD.Float32x4.load(a, 4), a2 = SIMD.Float32x4.load(a, 8), a3 = SIMD.Float32x4.load(a, 12);
            var vec = SIMD.Float32x4(v3[0], v3[1], v3[2], 0);
            if (a !== out) {
                out[0] = a[0];
                out[1] = a[1];
                out[2] = a[2];
                out[3] = a[3];
                out[4] = a[4];
                out[5] = a[5];
                out[6] = a[6];
                out[7] = a[7];
                out[8] = a[8];
                out[9] = a[9];
                out[10] = a[10];
                out[11] = a[11];
            }
            a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
            a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
            a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));
            var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
            SIMD.Float32x4.store(out, 12, t0);
            return out;
        }
        mat4simd.translate = translate;
    })(mat4simd = veclib.mat4simd || (veclib.mat4simd = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var mat4;
    (function (mat4) {
        mat4.ELEMENT_COUNT = 16;
        function create() {
            var out = new Float32Array(mat4.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.create = create;
        function clone(a) {
            var out = new Float32Array(mat4.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        }
        mat4.clone = clone;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        }
        mat4.copy = copy;
        function identity(out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.identity = identity;
        function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
            var out = new Float32Array(mat4.ELEMENT_COUNT);
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m03;
            out[4] = m10;
            out[5] = m11;
            out[6] = m12;
            out[7] = m13;
            out[8] = m20;
            out[9] = m21;
            out[10] = m22;
            out[11] = m23;
            out[12] = m30;
            out[13] = m31;
            out[14] = m32;
            out[15] = m33;
            return out;
        }
        mat4.fromValues = fromValues;
        function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m03;
            out[4] = m10;
            out[5] = m11;
            out[6] = m12;
            out[7] = m13;
            out[8] = m20;
            out[9] = m21;
            out[10] = m22;
            out[11] = m23;
            out[12] = m30;
            out[13] = m31;
            out[14] = m32;
            out[15] = m33;
            return out;
        }
        mat4.set = set;
        function transpose(out, a) {
            if (out === a) {
                var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a01;
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a02;
                out[9] = a12;
                out[11] = a[14];
                out[12] = a03;
                out[13] = a13;
                out[14] = a23;
            }
            else {
                out[0] = a[0];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a[1];
                out[5] = a[5];
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a[2];
                out[9] = a[6];
                out[10] = a[10];
                out[11] = a[14];
                out[12] = a[3];
                out[13] = a[7];
                out[14] = a[11];
                out[15] = a[15];
            }
            return out;
        }
        mat4.transpose = transpose;
        function invert(out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
            var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) {
                return null;
            }
            det = 1.0 / det;
            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
            return out;
        }
        mat4.invert = invert;
        function adjoint(out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
            out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
            out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
            out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
            out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
            out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
            out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
            out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
            out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
            out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
            out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
            out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
            out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
            out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
            out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
            out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
            out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
            return out;
        }
        mat4.adjoint = adjoint;
        function determinant(a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
            return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        }
        mat4.determinant = determinant;
        function multiply(out, a, b) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            b0 = b[4];
            b1 = b[5];
            b2 = b[6];
            b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            b0 = b[8];
            b1 = b[9];
            b2 = b[10];
            b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            b0 = b[12];
            b1 = b[13];
            b2 = b[14];
            b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            return out;
        }
        mat4.multiply = multiply;
        mat4.mul = multiply;
        function rotate(out, a, rad, axis) {
            var x = axis[0], y = axis[1], z = axis[2];
            var len = Math.sqrt(x * x + y * y + z * z);
            if (Math.abs(len) < veclib.EPSILON) {
                return null;
            }
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var t = 1 - c;
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            var b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
            var b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
            var b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
            out[0] = a00 * b00 + a10 * b01 + a20 * b02;
            out[1] = a01 * b00 + a11 * b01 + a21 * b02;
            out[2] = a02 * b00 + a12 * b01 + a22 * b02;
            out[3] = a03 * b00 + a13 * b01 + a23 * b02;
            out[4] = a00 * b10 + a10 * b11 + a20 * b12;
            out[5] = a01 * b10 + a11 * b11 + a21 * b12;
            out[6] = a02 * b10 + a12 * b11 + a22 * b12;
            out[7] = a03 * b10 + a13 * b11 + a23 * b12;
            out[8] = a00 * b20 + a10 * b21 + a20 * b22;
            out[9] = a01 * b20 + a11 * b21 + a21 * b22;
            out[10] = a02 * b20 + a12 * b21 + a22 * b22;
            out[11] = a03 * b20 + a13 * b21 + a23 * b22;
            if (a !== out) {
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            return out;
        }
        mat4.rotate = rotate;
        function rotateX(out, a, rad) {
            var s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            if (a !== out) {
                out[0] = a[0];
                out[1] = a[1];
                out[2] = a[2];
                out[3] = a[3];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            out[4] = a10 * c + a20 * s;
            out[5] = a11 * c + a21 * s;
            out[6] = a12 * c + a22 * s;
            out[7] = a13 * c + a23 * s;
            out[8] = a20 * c - a10 * s;
            out[9] = a21 * c - a11 * s;
            out[10] = a22 * c - a12 * s;
            out[11] = a23 * c - a13 * s;
            return out;
        }
        mat4.rotateX = rotateX;
        function rotateY(out, a, rad) {
            var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            if (a !== out) {
                out[4] = a[4];
                out[5] = a[5];
                out[6] = a[6];
                out[7] = a[7];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            out[0] = a00 * c - a20 * s;
            out[1] = a01 * c - a21 * s;
            out[2] = a02 * c - a22 * s;
            out[3] = a03 * c - a23 * s;
            out[8] = a00 * s + a20 * c;
            out[9] = a01 * s + a21 * c;
            out[10] = a02 * s + a22 * c;
            out[11] = a03 * s + a23 * c;
            return out;
        }
        mat4.rotateY = rotateY;
        function rotateZ(out, a, rad) {
            var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            if (a !== out) {
                out[8] = a[8];
                out[9] = a[9];
                out[10] = a[10];
                out[11] = a[11];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            out[0] = a00 * c + a10 * s;
            out[1] = a01 * c + a11 * s;
            out[2] = a02 * c + a12 * s;
            out[3] = a03 * c + a13 * s;
            out[4] = a10 * c - a00 * s;
            out[5] = a11 * c - a01 * s;
            out[6] = a12 * c - a02 * s;
            out[7] = a13 * c - a03 * s;
            return out;
        }
        mat4.rotateZ = rotateZ;
        function scale(out, a, v3) {
            var x = v3[0], y = v3[1], z = v3[2];
            out[0] = a[0] * x;
            out[1] = a[1] * x;
            out[2] = a[2] * x;
            out[3] = a[3] * x;
            out[4] = a[4] * y;
            out[5] = a[5] * y;
            out[6] = a[6] * y;
            out[7] = a[7] * y;
            out[8] = a[8] * z;
            out[9] = a[9] * z;
            out[10] = a[10] * z;
            out[11] = a[11] * z;
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        }
        mat4.scale = scale;
        function translate(out, a, v3) {
            var x = v3[0], y = v3[1], z = v3[2];
            if (a === out) {
                out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
                out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
                out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
                out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
            }
            else {
                var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
                var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
                var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
                out[0] = a00;
                out[1] = a01;
                out[2] = a02;
                out[3] = a03;
                out[4] = a10;
                out[5] = a11;
                out[6] = a12;
                out[7] = a13;
                out[8] = a20;
                out[9] = a21;
                out[10] = a22;
                out[11] = a23;
                out[12] = a00 * x + a10 * y + a20 * z + a[12];
                out[13] = a01 * x + a11 * y + a21 * z + a[13];
                out[14] = a02 * x + a12 * y + a22 * z + a[14];
                out[15] = a03 * x + a13 * y + a23 * z + a[15];
            }
            return out;
        }
        mat4.translate = translate;
        function fromRotation(out, rad, axis) {
            var x = axis[0], y = axis[1], z = axis[2];
            var len = Math.sqrt(x * x + y * y + z * z);
            if (Math.abs(len) < veclib.EPSILON) {
                return null;
            }
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var t = 1 - c;
            out[0] = x * x * t + c;
            out[1] = y * x * t + z * s;
            out[2] = z * x * t - y * s;
            out[3] = 0;
            out[4] = x * y * t - z * s;
            out[5] = y * y * t + c;
            out[6] = z * y * t + x * s;
            out[7] = 0;
            out[8] = x * z * t + y * s;
            out[9] = y * z * t - x * s;
            out[10] = z * z * t + c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromRotation = fromRotation;
        function fromScaling(out, v3) {
            out[0] = v3[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = v3[1];
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = v3[2];
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromScaling = fromScaling;
        function fromTranslation(out, v3) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = v3[0];
            out[13] = v3[1];
            out[14] = v3[2];
            out[15] = 1;
            return out;
        }
        mat4.fromTranslation = fromTranslation;
        function fromXRotation(out, rad) {
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = c;
            out[6] = s;
            out[7] = 0;
            out[8] = 0;
            out[9] = -s;
            out[10] = c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromXRotation = fromXRotation;
        function fromYRotation(out, rad) {
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = c;
            out[1] = 0;
            out[2] = -s;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = s;
            out[9] = 0;
            out[10] = c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromYRotation = fromYRotation;
        function fromZRotation(out, rad) {
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = 0;
            out[3] = 0;
            out[4] = -s;
            out[5] = c;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromZRotation = fromZRotation;
        function fromRotationTranslation(out, q, v3) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
            out[0] = 1 - (yy + zz);
            out[1] = xy + wz;
            out[2] = xz - wy;
            out[3] = 0;
            out[4] = xy - wz;
            out[5] = 1 - (xx + zz);
            out[6] = yz + wx;
            out[7] = 0;
            out[8] = xz + wy;
            out[9] = yz - wx;
            out[10] = 1 - (xx + yy);
            out[11] = 0;
            out[12] = v3[0];
            out[13] = v3[1];
            out[14] = v3[2];
            out[15] = 1;
            return out;
        }
        mat4.fromRotationTranslation = fromRotationTranslation;
        function fromRotationTranslationScale(out, q, v, s) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2];
            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;
            return out;
        }
        mat4.fromRotationTranslationScale = fromRotationTranslationScale;
        function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2], ox = o[0], oy = o[1], oz = o[2];
            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
            out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
            out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
            out[15] = 1;
            return out;
        }
        mat4.fromRotationTranslationScaleOrigin = fromRotationTranslationScaleOrigin;
        function fromQuat(out, q) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, yx = y * x2, yy = y * y2, zx = z * x2, zy = z * y2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
            out[0] = 1 - yy - zz;
            out[1] = yx + wz;
            out[2] = zx - wy;
            out[3] = 0;
            out[4] = yx - wz;
            out[5] = 1 - xx - zz;
            out[6] = zy + wx;
            out[7] = 0;
            out[8] = zx + wy;
            out[9] = zy - wx;
            out[10] = 1 - xx - yy;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        }
        mat4.fromQuat = fromQuat;
        function getTranslation(out, a) {
            out[0] = a[12];
            out[1] = a[13];
            out[2] = a[14];
            return out;
        }
        mat4.getTranslation = getTranslation;
        function getScaling(out, a) {
            var m11 = a[0], m12 = a[1], m13 = a[2], m21 = a[4], m22 = a[5], m23 = a[6], m31 = a[8], m32 = a[9], m33 = a[10];
            out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
            out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
            out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
            return out;
        }
        mat4.getScaling = getScaling;
        function getRotation(out, a) {
            var trace = a[0] + a[5] + a[10];
            var S;
            if (trace > 0) {
                S = Math.sqrt(trace + 1.0) * 2;
                out[3] = 0.25 * S;
                out[0] = (a[6] - a[9]) / S;
                out[1] = (a[8] - a[2]) / S;
                out[2] = (a[1] - a[4]) / S;
            }
            else if ((a[0] > a[5]) && (a[0] > a[10])) {
                S = Math.sqrt(1.0 + a[0] - a[5] - a[10]) * 2;
                out[3] = (a[6] - a[9]) / S;
                out[0] = 0.25 * S;
                out[1] = (a[1] + a[4]) / S;
                out[2] = (a[8] + a[2]) / S;
            }
            else if (a[5] > a[10]) {
                S = Math.sqrt(1.0 + a[5] - a[0] - a[10]) * 2;
                out[3] = (a[8] - a[2]) / S;
                out[0] = (a[1] + a[4]) / S;
                out[1] = 0.25 * S;
                out[2] = (a[6] + a[9]) / S;
            }
            else {
                S = Math.sqrt(1.0 + a[10] - a[0] - a[5]) * 2;
                out[3] = (a[1] - a[4]) / S;
                out[0] = (a[8] + a[2]) / S;
                out[1] = (a[6] + a[9]) / S;
                out[2] = 0.25 * S;
            }
            return out;
        }
        mat4.getRotation = getRotation;
        function frustum(out, left, right, bottom, top, near, far) {
            var rl = 1 / (right - left), tb = 1 / (top - bottom), nf = 1 / (near - far);
            out[0] = (near * 2) * rl;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = (near * 2) * tb;
            out[6] = 0;
            out[7] = 0;
            out[8] = (right + left) * rl;
            out[9] = (top + bottom) * tb;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = (far * near * 2) * nf;
            out[15] = 0;
            return out;
        }
        mat4.frustum = frustum;
        function perspective(out, fovy, aspect, near, far) {
            var f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = (2 * far * near) * nf;
            out[15] = 0;
            return out;
        }
        mat4.perspective = perspective;
        function perspectiveFromFieldOfView(out, fov, near, far) {
            var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0), downTan = Math.tan(fov.downDegrees * Math.PI / 180.0), leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0), rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0), xScale = 2.0 / (leftTan + rightTan), yScale = 2.0 / (upTan + downTan);
            out[0] = xScale;
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 0.0;
            out[4] = 0.0;
            out[5] = yScale;
            out[6] = 0.0;
            out[7] = 0.0;
            out[8] = -((leftTan - rightTan) * xScale * 0.5);
            out[9] = ((upTan - downTan) * yScale * 0.5);
            out[10] = far / (near - far);
            out[11] = -1.0;
            out[12] = 0.0;
            out[13] = 0.0;
            out[14] = (far * near) / (near - far);
            out[15] = 0.0;
            return out;
        }
        mat4.perspectiveFromFieldOfView = perspectiveFromFieldOfView;
        function ortho(out, left, right, bottom, top, near, far) {
            var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (far + near) * nf;
            out[15] = 1;
            return out;
        }
        mat4.ortho = ortho;
        function lookAt(out, eye, center, up) {
            var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
            var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
            if (Math.abs(eyex - centerx) < veclib.EPSILON &&
                Math.abs(eyey - centery) < veclib.EPSILON &&
                Math.abs(eyez - centerz) < veclib.EPSILON) {
                return identity(out);
            }
            z0 = eyex - centerx;
            z1 = eyey - centery;
            z2 = eyez - centerz;
            len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;
            x0 = upy * z2 - upz * z1;
            x1 = upz * z0 - upx * z2;
            x2 = upx * z1 - upy * z0;
            len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
            if (!len) {
                x0 = 0;
                x1 = 0;
                x2 = 0;
            }
            else {
                len = 1 / len;
                x0 *= len;
                x1 *= len;
                x2 *= len;
            }
            y0 = z1 * x2 - z2 * x1;
            y1 = z2 * x0 - z0 * x2;
            y2 = z0 * x1 - z1 * x0;
            len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
            if (!len) {
                y0 = 0;
                y1 = 0;
                y2 = 0;
            }
            else {
                len = 1 / len;
                y0 *= len;
                y1 *= len;
                y2 *= len;
            }
            out[0] = x0;
            out[1] = y0;
            out[2] = z0;
            out[3] = 0;
            out[4] = x1;
            out[5] = y1;
            out[6] = z1;
            out[7] = 0;
            out[8] = x2;
            out[9] = y2;
            out[10] = z2;
            out[11] = 0;
            out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
            out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
            out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
            out[15] = 1;
            return out;
        }
        mat4.lookAt = lookAt;
        function str(a) {
            return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
        }
        mat4.str = str;
        function frob(a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
                Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) +
                Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) +
                Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
        }
        mat4.frob = frob;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            out[6] = a[6] + b[6];
            out[7] = a[7] + b[7];
            out[8] = a[8] + b[8];
            out[9] = a[9] + b[9];
            out[10] = a[10] + b[10];
            out[11] = a[11] + b[11];
            out[12] = a[12] + b[12];
            out[13] = a[13] + b[13];
            out[14] = a[14] + b[14];
            out[15] = a[15] + b[15];
            return out;
        }
        mat4.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            out[6] = a[6] - b[6];
            out[7] = a[7] - b[7];
            out[8] = a[8] - b[8];
            out[9] = a[9] - b[9];
            out[10] = a[10] - b[10];
            out[11] = a[11] - b[11];
            out[12] = a[12] - b[12];
            out[13] = a[13] - b[13];
            out[14] = a[14] - b[14];
            out[15] = a[15] - b[15];
            return out;
        }
        mat4.subtract = subtract;
        mat4.sub = subtract;
        function multiplyScalar(out, a, scale) {
            out[0] = a[0] * scale;
            out[1] = a[1] * scale;
            out[2] = a[2] * scale;
            out[3] = a[3] * scale;
            out[4] = a[4] * scale;
            out[5] = a[5] * scale;
            out[6] = a[6] * scale;
            out[7] = a[7] * scale;
            out[8] = a[8] * scale;
            out[9] = a[9] * scale;
            out[10] = a[10] * scale;
            out[11] = a[11] * scale;
            out[12] = a[12] * scale;
            out[13] = a[13] * scale;
            out[14] = a[14] * scale;
            out[15] = a[15] * scale;
            return out;
        }
        mat4.multiplyScalar = multiplyScalar;
        function multiplyScalarAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            out[4] = a[4] + (b[4] * scale);
            out[5] = a[5] + (b[5] * scale);
            out[6] = a[6] + (b[6] * scale);
            out[7] = a[7] + (b[7] * scale);
            out[8] = a[8] + (b[8] * scale);
            out[9] = a[9] + (b[9] * scale);
            out[10] = a[10] + (b[10] * scale);
            out[11] = a[11] + (b[11] * scale);
            out[12] = a[12] + (b[12] * scale);
            out[13] = a[13] + (b[13] * scale);
            out[14] = a[14] + (b[14] * scale);
            out[15] = a[15] + (b[15] * scale);
            return out;
        }
        mat4.multiplyScalarAndAdd = multiplyScalarAndAdd;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
                a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
                a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
                a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
        }
        mat4.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11], a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= veclib.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
                Math.abs(a4 - b4) <= veclib.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
                Math.abs(a5 - b5) <= veclib.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
                Math.abs(a6 - b6) <= veclib.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
                Math.abs(a7 - b7) <= veclib.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
                Math.abs(a8 - b8) <= veclib.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
                Math.abs(a9 - b9) <= veclib.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
                Math.abs(a10 - b10) <= veclib.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
                Math.abs(a11 - b11) <= veclib.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
                Math.abs(a12 - b12) <= veclib.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
                Math.abs(a13 - b13) <= veclib.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
                Math.abs(a14 - b14) <= veclib.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
                Math.abs(a15 - b15) <= veclib.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
        }
        mat4.equals = equals;
    })(mat4 = veclib.mat4 || (veclib.mat4 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var vec2;
    (function (vec2) {
        var clampf = veclib.clamp;
        var clamp01f = veclib.clamp01;
        var mixf = veclib.mix;
        vec2.ELEMENT_COUNT = 2;
        function create() {
            var out = new Float32Array(vec2.ELEMENT_COUNT);
            out[0] = 0;
            out[1] = 0;
            return out;
        }
        vec2.create = create;
        vec2.zero = create;
        function one() {
            var out = new Float32Array(vec2.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 1;
            return out;
        }
        vec2.one = one;
        function clone(a) {
            var out = new Float32Array(vec2.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            return out;
        }
        vec2.clone = clone;
        function fromValues(x, y) {
            var out = new Float32Array(vec2.ELEMENT_COUNT);
            out[0] = x;
            out[1] = y;
            return out;
        }
        vec2.fromValues = fromValues;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            return out;
        }
        vec2.copy = copy;
        function set(out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        }
        vec2.set = set;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            return out;
        }
        vec2.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            return out;
        }
        vec2.subtract = subtract;
        vec2.sub = subtract;
        function multiply(out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            return out;
        }
        vec2.multiply = multiply;
        vec2.mul = multiply;
        function divide(out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            return out;
        }
        vec2.divide = divide;
        vec2.div = divide;
        function ceil(out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            return out;
        }
        vec2.ceil = ceil;
        function floor(out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            return out;
        }
        vec2.floor = floor;
        function min(out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            return out;
        }
        vec2.min = min;
        function max(out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            return out;
        }
        vec2.max = max;
        function round(out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            return out;
        }
        vec2.round = round;
        function scale(out, a, s) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            return out;
        }
        vec2.scale = scale;
        function scaleAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            return out;
        }
        vec2.scaleAndAdd = scaleAndAdd;
        function distance(a, b) {
            var x = b[0] - a[0];
            var y = b[1] - a[1];
            return Math.sqrt(x * x + y * y);
        }
        vec2.distance = distance;
        vec2.dist = distance;
        function squaredDistance(a, b) {
            var x = b[0] - a[0];
            var y = b[1] - a[1];
            return x * x + y * y;
        }
        vec2.squaredDistance = squaredDistance;
        vec2.sqrDist = squaredDistance;
        function length(a) {
            var x = a[0];
            var y = a[1];
            return Math.sqrt(x * x + y * y);
        }
        vec2.length = length;
        ;
        vec2.len = length;
        function squaredLength(a) {
            var x = a[0];
            var y = a[1];
            return x * x + y * y;
        }
        vec2.squaredLength = squaredLength;
        ;
        vec2.sqrLen = squaredLength;
        function negate(out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            return out;
        }
        vec2.negate = negate;
        function inverse(out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            return out;
        }
        vec2.inverse = inverse;
        function normalize(out, a) {
            var x = a[0];
            var y = a[1];
            var len = x * x + y * y;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out[0] = a[0] * len;
                out[1] = a[1] * len;
            }
            return out;
        }
        vec2.normalize = normalize;
        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1];
        }
        vec2.dot = dot;
        function cross(out, a, b) {
            var z = a[0] * b[1] - a[1] * b[0];
            out[0] = out[1] = 0;
            out[2] = z;
            return out;
        }
        vec2.cross = cross;
        function lerp(out, a, b, t) {
            var ax = a[0];
            var ay = a[1];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            return out;
        }
        vec2.lerp = lerp;
        function random(out, scale) {
            if (scale === void 0) { scale = 1.0; }
            var r = Math.random() * 2.0 * Math.PI;
            out[0] = Math.cos(r) * scale;
            out[1] = Math.sin(r) * scale;
            return out;
        }
        vec2.random = random;
        function clamp(out, a, min, max) {
            if (typeof min === "number") {
                out[0] = clampf(a[0], min, max);
                out[1] = clampf(a[1], min, max);
            }
            else {
                out[0] = clampf(a[0], min[0], max[0]);
                out[1] = clampf(a[1], min[1], max[1]);
            }
            return out;
        }
        vec2.clamp = clamp;
        function clamp01(out, a) {
            out[0] = clamp01f(a[0]);
            out[1] = clamp01f(a[1]);
            return out;
        }
        vec2.clamp01 = clamp01;
        function mix(out, a, b, ratio) {
            if (typeof ratio === "number") {
                out[0] = mixf(a[0], b[0], ratio);
                out[1] = mixf(a[1], b[1], ratio);
            }
            else {
                out[0] = mixf(a[0], b[0], ratio[0]);
                out[1] = mixf(a[1], b[1], ratio[1]);
            }
            return out;
        }
        vec2.mix = mix;
        function sign(out, a) {
            out[0] = Math.sign(a[0]);
            out[1] = Math.sign(a[1]);
            return out;
        }
        vec2.sign = sign;
        function transformMat2(out, a, m) {
            var x = a[0];
            var y = a[1];
            out[0] = m[0] * x + m[2] * y;
            out[1] = m[1] * x + m[3] * y;
            return out;
        }
        vec2.transformMat2 = transformMat2;
        function transformMat2d(out, a, m) {
            var x = a[0];
            var y = a[1];
            out[0] = m[0] * x + m[2] * y + m[4];
            out[1] = m[1] * x + m[3] * y + m[5];
            return out;
        }
        vec2.transformMat2d = transformMat2d;
        function transformMat3(out, a, m) {
            var x = a[0];
            var y = a[1];
            out[0] = m[0] * x + m[3] * y + m[6];
            out[1] = m[1] * x + m[4] * y + m[7];
            return out;
        }
        vec2.transformMat3 = transformMat3;
        function transformMat4(out, a, m) {
            var x = a[0];
            var y = a[1];
            out[0] = m[0] * x + m[4] * y + m[12];
            out[1] = m[1] * x + m[5] * y + m[13];
            return out;
        }
        vec2.transformMat4 = transformMat4;
        function forEach(a, opt, fn) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var stride = opt.stride || vec2.ELEMENT_COUNT;
            var offset = opt.offset || 0;
            var count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
            var vec = create();
            for (var i = offset; i < count; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                fn(vec, vec, args);
                a[i] = vec[0];
                a[i + 1] = vec[1];
            }
            return a;
        }
        vec2.forEach = forEach;
        function str(a) {
            return "vec2(" + a[0] + ", " + a[1] + ")";
        }
        vec2.str = str;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1];
        }
        vec2.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1];
            var b0 = b[0], b1 = b[1];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
        }
        vec2.equals = equals;
    })(vec2 = veclib.vec2 || (veclib.vec2 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var vec3;
    (function (vec3) {
        var clampf = veclib.clamp;
        var clamp01f = veclib.clamp01;
        var mixf = veclib.mix;
        vec3.ELEMENT_COUNT = 3;
        function create() {
            var out = new Float32Array(vec3.ELEMENT_COUNT);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            return out;
        }
        vec3.create = create;
        vec3.zero = create;
        function one() {
            var out = new Float32Array(vec3.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 1;
            out[2] = 1;
            return out;
        }
        vec3.one = one;
        function clone(a) {
            var out = new Float32Array(vec3.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        }
        vec3.clone = clone;
        function fromValues(x, y, z) {
            var out = new Float32Array(vec3.ELEMENT_COUNT);
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        }
        vec3.fromValues = fromValues;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        }
        vec3.copy = copy;
        function set(out, x, y, z) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        }
        vec3.set = set;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        }
        vec3.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        }
        vec3.subtract = subtract;
        vec3.sub = subtract;
        function multiply(out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            return out;
        }
        vec3.multiply = multiply;
        vec3.mul = multiply;
        function divide(out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            out[2] = a[2] / b[2];
            return out;
        }
        vec3.divide = divide;
        vec3.div = divide;
        function ceil(out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            out[2] = Math.ceil(a[2]);
            return out;
        }
        vec3.ceil = ceil;
        function floor(out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            out[2] = Math.floor(a[2]);
            return out;
        }
        vec3.floor = floor;
        function min(out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            return out;
        }
        vec3.min = min;
        function max(out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            return out;
        }
        vec3.max = max;
        function round(out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            out[2] = Math.round(a[2]);
            return out;
        }
        vec3.round = round;
        function scale(out, a, s) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;
            return out;
        }
        vec3.scale = scale;
        function scaleAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            return out;
        }
        vec3.scaleAndAdd = scaleAndAdd;
        function distance(a, b) {
            var x = b[0] - a[0];
            var y = b[1] - a[1];
            var z = b[2] - a[2];
            return Math.sqrt(x * x + y * y + z * z);
        }
        vec3.distance = distance;
        vec3.dist = distance;
        function squaredDistance(a, b) {
            var x = b[0] - a[0];
            var y = b[1] - a[1];
            var z = b[2] - a[2];
            return x * x + y * y + z * z;
        }
        vec3.squaredDistance = squaredDistance;
        vec3.sqrDist = squaredDistance;
        function length(a) {
            var x = a[0], y = a[1], z = a[2];
            return Math.sqrt(x * x + y * y + z * z);
        }
        vec3.length = length;
        vec3.len = length;
        function squaredLength(a) {
            var x = a[0];
            var y = a[1];
            var z = a[2];
            return x * x + y * y + z * z;
        }
        vec3.squaredLength = squaredLength;
        vec3.sqrLen = squaredLength;
        function negate(out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            return out;
        }
        vec3.negate = negate;
        function inverse(out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            out[2] = 1.0 / a[2];
            return out;
        }
        vec3.inverse = inverse;
        function normalize(out, a) {
            var x = a[0];
            var y = a[1];
            var z = a[2];
            var len = x * x + y * y + z * z;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out[0] = a[0] * len;
                out[1] = a[1] * len;
                out[2] = a[2] * len;
            }
            return out;
        }
        vec3.normalize = normalize;
        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }
        vec3.dot = dot;
        function cross(out, a, b) {
            var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
            out[0] = ay * bz - az * by;
            out[1] = az * bx - ax * bz;
            out[2] = ax * by - ay * bx;
            return out;
        }
        vec3.cross = cross;
        function lerp(out, a, b, t) {
            var ax = a[0], ay = a[1], az = a[2];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            out[2] = az + t * (b[2] - az);
            return out;
        }
        vec3.lerp = lerp;
        function hermite(out, a, b, c, d, t) {
            var factorTimes2 = t * t;
            var factor1 = factorTimes2 * (2 * t - 3) + 1;
            var factor2 = factorTimes2 * (t - 2) + t;
            var factor3 = factorTimes2 * (t - 1);
            var factor4 = factorTimes2 * (3 - 2 * t);
            out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
            out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
            out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
            return out;
        }
        vec3.hermite = hermite;
        function bezier(out, a, b, c, d, t) {
            var inverseFactor = 1 - t;
            var inverseFactorTimesTwo = inverseFactor * inverseFactor;
            var factorTimes2 = t * t;
            var factor1 = inverseFactorTimesTwo * inverseFactor;
            var factor2 = 3 * t * inverseFactorTimesTwo;
            var factor3 = 3 * factorTimes2 * inverseFactor;
            var factor4 = factorTimes2 * t;
            out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
            out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
            out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
            return out;
        }
        vec3.bezier = bezier;
        function random(out, scale) {
            if (scale === void 0) { scale = 1.0; }
            scale = scale || 1.0;
            var r = Math.random() * 2.0 * Math.PI;
            var z = (Math.random() * 2.0) - 1.0;
            var zScale = Math.sqrt(1.0 - z * z) * scale;
            out[0] = Math.cos(r) * zScale;
            out[1] = Math.sin(r) * zScale;
            out[2] = z * scale;
            return out;
        }
        vec3.random = random;
        function clamp(out, a, min, max) {
            if (typeof min === "number") {
                out[0] = clampf(a[0], min, max);
                out[1] = clampf(a[1], min, max);
                out[2] = clampf(a[2], min, max);
            }
            else {
                out[0] = clampf(a[0], min[0], max[0]);
                out[1] = clampf(a[1], min[1], max[1]);
                out[2] = clampf(a[2], min[2], max[2]);
            }
            return out;
        }
        vec3.clamp = clamp;
        function clamp01(out, a) {
            out[0] = clamp01f(a[0]);
            out[1] = clamp01f(a[1]);
            out[2] = clamp01f(a[2]);
            return out;
        }
        vec3.clamp01 = clamp01;
        function mix(out, a, b, ratio) {
            if (typeof ratio === "number") {
                out[0] = mixf(a[0], b[0], ratio);
                out[1] = mixf(a[1], b[1], ratio);
                out[2] = mixf(a[2], b[2], ratio);
            }
            else {
                out[0] = mixf(a[0], b[0], ratio[0]);
                out[1] = mixf(a[1], b[1], ratio[1]);
                out[2] = mixf(a[2], b[2], ratio[2]);
            }
            return out;
        }
        vec3.mix = mix;
        function sign(out, a) {
            out[0] = Math.sign(a[0]);
            out[1] = Math.sign(a[1]);
            out[2] = Math.sign(a[2]);
            return out;
        }
        vec3.sign = sign;
        function transformMat3(out, a, m) {
            var x = a[0], y = a[1], z = a[2];
            out[0] = x * m[0] + y * m[3] + z * m[6];
            out[1] = x * m[1] + y * m[4] + z * m[7];
            out[2] = x * m[2] + y * m[5] + z * m[8];
            return out;
        }
        vec3.transformMat3 = transformMat3;
        function transformMat4(out, a, m) {
            var x = a[0];
            var y = a[1];
            var z = a[2];
            var w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
            out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
            out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
            out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
            return out;
        }
        vec3.transformMat4 = transformMat4;
        function transformQuat(out, a, q) {
            var x = a[0], y = a[1], z = a[2];
            var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;
            out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return out;
        }
        vec3.transformQuat = transformQuat;
        function rotateX(out, a, b, c) {
            var p = [];
            var r = [];
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];
            r[0] = p[0];
            r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
            r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];
            return out;
        }
        vec3.rotateX = rotateX;
        function rotateY(out, a, b, c) {
            var p = [];
            var r = [];
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];
            r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
            r[1] = p[1];
            r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];
            return out;
        }
        vec3.rotateY = rotateY;
        function rotateZ(out, a, b, c) {
            var p = [];
            var r = [];
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];
            r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
            r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
            r[2] = p[2];
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];
            return out;
        }
        vec3.rotateZ = rotateZ;
        function reflect(out, a, normal) {
            scale(out, normal, 2.0 * vec3.dot(a, normal));
            return vec3.sub(out, a, out);
        }
        vec3.reflect = reflect;
        function arbitraryOrthogonalVec(a) {
            var p = create();
            var ax = Math.abs(a[0]);
            var ay = Math.abs(a[1]);
            var az = Math.abs(a[2]);
            var dominantAxis = (ax > ay) ? (ax > az ? 0 : 2) : (ay > az ? 1 : 2);
            switch (dominantAxis) {
                case 0:
                    p[0] = -a[1] - a[2];
                    p[1] = a[0];
                    p[2] = a[0];
                    break;
                case 1:
                    p[0] = a[1];
                    p[1] = -a[0] - a[2];
                    p[2] = a[1];
                    break;
                case 2:
                    p[0] = a[2];
                    p[1] = a[2];
                    p[2] = -a[0] - a[1];
                    break;
            }
            return p;
        }
        vec3.arbitraryOrthogonalVec = arbitraryOrthogonalVec;
        function forEach(a, opt, fn) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var stride = opt.stride || vec3.ELEMENT_COUNT;
            var offset = opt.offset || 0;
            var count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
            var vec = create();
            for (var i = offset; i < count; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                vec[2] = a[i + 2];
                fn(vec, vec, args);
                a[i] = vec[0];
                a[i + 1] = vec[1];
                a[i + 2] = vec[2];
            }
            return a;
        }
        vec3.forEach = forEach;
        function angle(a, b) {
            var tempA = clone(a);
            var tempB = clone(b);
            normalize(tempA, tempA);
            normalize(tempB, tempB);
            var cosine = dot(tempA, tempB);
            if (cosine > 1.0) {
                return 0;
            }
            else if (cosine < -1.0) {
                return Math.PI;
            }
            else {
                return Math.acos(cosine);
            }
        }
        vec3.angle = angle;
        function str(a) {
            return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
        }
        vec3.str = str;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
        }
        vec3.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2];
            var b0 = b[0], b1 = b[1], b2 = b[2];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
        }
        vec3.equals = equals;
    })(vec3 = veclib.vec3 || (veclib.vec3 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var vec4;
    (function (vec4) {
        var clampf = veclib.clamp;
        var clamp01f = veclib.clamp01;
        var mixf = veclib.mix;
        vec4.ELEMENT_COUNT = 4;
        function create() {
            var out = new Float32Array(vec4.ELEMENT_COUNT);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            return out;
        }
        vec4.create = create;
        vec4.zero = create;
        function one() {
            var out = new Float32Array(vec4.ELEMENT_COUNT);
            out[0] = 1;
            out[1] = 1;
            out[2] = 1;
            out[3] = 1;
            return out;
        }
        vec4.one = one;
        function clone(a) {
            var out = new Float32Array(vec4.ELEMENT_COUNT);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        }
        vec4.clone = clone;
        function fromValues(x, y, z, w) {
            var out = new Float32Array(vec4.ELEMENT_COUNT);
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        }
        vec4.fromValues = fromValues;
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        }
        vec4.copy = copy;
        function set(out, x, y, z, w) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        }
        vec4.set = set;
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            return out;
        }
        vec4.add = add;
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            return out;
        }
        vec4.subtract = subtract;
        vec4.sub = subtract;
        function multiply(out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            out[3] = a[3] * b[3];
            return out;
        }
        vec4.multiply = multiply;
        vec4.mul = multiply;
        function divide(out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            out[2] = a[2] / b[2];
            out[3] = a[3] / b[3];
            return out;
        }
        vec4.divide = divide;
        vec4.div = divide;
        function ceil(out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            out[2] = Math.ceil(a[2]);
            out[3] = Math.ceil(a[3]);
            return out;
        }
        vec4.ceil = ceil;
        function floor(out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            out[2] = Math.floor(a[2]);
            out[3] = Math.floor(a[3]);
            return out;
        }
        vec4.floor = floor;
        function min(out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            out[3] = Math.min(a[3], b[3]);
            return out;
        }
        vec4.min = min;
        function max(out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            out[3] = Math.max(a[3], b[3]);
            return out;
        }
        vec4.max = max;
        function round(out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            out[2] = Math.round(a[2]);
            out[3] = Math.round(a[3]);
            return out;
        }
        vec4.round = round;
        function scale(out, a, s) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;
            out[3] = a[3] * s;
            return out;
        }
        vec4.scale = scale;
        function scaleAndAdd(out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            return out;
        }
        vec4.scaleAndAdd = scaleAndAdd;
        function distance(a, b) {
            var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
            return Math.sqrt(x * x + y * y + z * z + w * w);
        }
        vec4.distance = distance;
        vec4.dist = distance;
        function squaredDistance(a, b) {
            var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
            return x * x + y * y + z * z + w * w;
        }
        vec4.squaredDistance = squaredDistance;
        vec4.sqrDist = squaredDistance;
        function length(a) {
            var x = a[0], y = a[1], z = a[2], w = a[3];
            return Math.sqrt(x * x + y * y + z * z + w * w);
        }
        vec4.length = length;
        vec4.len = length;
        function squaredLength(a) {
            var x = a[0], y = a[1], z = a[2], w = a[3];
            return x * x + y * y + z * z + w * w;
        }
        vec4.squaredLength = squaredLength;
        vec4.sqrLen = squaredLength;
        function negate(out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = -a[3];
            return out;
        }
        vec4.negate = negate;
        function inverse(out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            out[2] = 1.0 / a[2];
            out[3] = 1.0 / a[3];
            return out;
        }
        vec4.inverse = inverse;
        function normalize(out, a) {
            var x = a[0], y = a[1], z = a[2], w = a[3];
            var len = x * x + y * y + z * z + w * w;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out[0] = x * len;
                out[1] = y * len;
                out[2] = z * len;
                out[3] = w * len;
            }
            return out;
        }
        vec4.normalize = normalize;
        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        }
        vec4.dot = dot;
        function lerp(out, a, b, t) {
            var ax = a[0], ay = a[1], az = a[2], aw = a[3];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            out[2] = az + t * (b[2] - az);
            out[3] = aw + t * (b[3] - aw);
            return out;
        }
        vec4.lerp = lerp;
        function random(out, scale) {
            if (scale === void 0) { scale = 1.0; }
            out[0] = Math.random();
            out[1] = Math.random();
            out[2] = Math.random();
            out[3] = Math.random();
            vec4.normalize(out, out);
            vec4.scale(out, out, scale);
            return out;
        }
        vec4.random = random;
        function clamp(out, a, min, max) {
            if (typeof min === "number") {
                out[0] = clampf(a[0], min, max);
                out[1] = clampf(a[1], min, max);
                out[2] = clampf(a[2], min, max);
                out[3] = clampf(a[3], min, max);
            }
            else {
                out[0] = clampf(a[0], min[0], max[0]);
                out[1] = clampf(a[1], min[1], max[1]);
                out[2] = clampf(a[2], min[2], max[2]);
                out[3] = clampf(a[3], min[3], max[3]);
            }
            return out;
        }
        vec4.clamp = clamp;
        function clamp01(out, a) {
            out[0] = clamp01f(a[0]);
            out[1] = clamp01f(a[1]);
            out[2] = clamp01f(a[2]);
            out[3] = clamp01f(a[3]);
            return out;
        }
        vec4.clamp01 = clamp01;
        function mix(out, a, b, ratio) {
            if (typeof ratio === "number") {
                out[0] = mixf(a[0], b[0], ratio);
                out[1] = mixf(a[1], b[1], ratio);
                out[2] = mixf(a[2], b[2], ratio);
                out[3] = mixf(a[3], b[3], ratio);
            }
            else {
                out[0] = mixf(a[0], b[0], ratio[0]);
                out[1] = mixf(a[1], b[1], ratio[1]);
                out[2] = mixf(a[2], b[2], ratio[2]);
                out[3] = mixf(a[3], b[3], ratio[3]);
            }
            return out;
        }
        vec4.mix = mix;
        function sign(out, a) {
            out[0] = Math.sign(a[0]);
            out[1] = Math.sign(a[1]);
            out[2] = Math.sign(a[2]);
            out[3] = Math.sign(a[3]);
            return out;
        }
        vec4.sign = sign;
        function transformMat4(out, a, m) {
            var x = a[0], y = a[1], z = a[2], w = a[3];
            out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
            return out;
        }
        vec4.transformMat4 = transformMat4;
        function transformQuat(out, a, q) {
            var x = a[0], y = a[1], z = a[2], qx = q[0], qy = q[1], qz = q[2], qw = q[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
            out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            out[3] = a[3];
            return out;
        }
        vec4.transformQuat = transformQuat;
        function forEach(a, opt, fn) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var stride = opt.stride || vec4.ELEMENT_COUNT;
            var offset = opt.offset || 0;
            var count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
            var vec = create();
            for (var i = offset; i < count; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                vec[2] = a[i + 2];
                vec[3] = a[i + 3];
                fn(vec, vec, args);
                a[i] = vec[0];
                a[i + 1] = vec[1];
                a[i + 2] = vec[2];
                a[i + 3] = vec[3];
            }
            return a;
        }
        vec4.forEach = forEach;
        function str(a) {
            return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }
        vec4.str = str;
        function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
        }
        vec4.exactEquals = exactEquals;
        function equals(a, b) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            return (Math.abs(a0 - b0) <= veclib.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
                Math.abs(a1 - b1) <= veclib.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
                Math.abs(a2 - b2) <= veclib.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
                Math.abs(a3 - b3) <= veclib.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
        }
        vec4.equals = equals;
    })(vec4 = veclib.vec4 || (veclib.vec4 = {}));
})(veclib || (veclib = {}));
var veclib;
(function (veclib) {
    var quat;
    (function (quat) {
        quat.ELEMENT_COUNT = 4;
        function create() {
            var out = new Float32Array(quat.ELEMENT_COUNT);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        quat.create = create;
        var tmpVec3_ = veclib.vec3.create();
        var xUnitVec3_ = veclib.vec3.fromValues(1, 0, 0);
        var yUnitVec3_ = veclib.vec3.fromValues(0, 1, 0);
        function rotationTo(out, a, b) {
            var dot = veclib.vec3.dot(a, b);
            if (dot < (-1 + veclib.EPSILON)) {
                veclib.vec3.cross(tmpVec3_, xUnitVec3_, a);
                if (veclib.vec3.length(tmpVec3_) < veclib.EPSILON) {
                    veclib.vec3.cross(tmpVec3_, yUnitVec3_, a);
                }
                veclib.vec3.normalize(tmpVec3_, tmpVec3_);
                quat.setAxisAngle(out, tmpVec3_, Math.PI);
                return out;
            }
            else if (dot > (1 - veclib.EPSILON)) {
                out[0] = 0;
                out[1] = 0;
                out[2] = 0;
                out[3] = 1;
                return out;
            }
            else {
                veclib.vec3.cross(tmpVec3_, a, b);
                out[0] = tmpVec3_[0];
                out[1] = tmpVec3_[1];
                out[2] = tmpVec3_[2];
                out[3] = 1 + dot;
                return quat.normalize(out, out);
            }
        }
        quat.rotationTo = rotationTo;
        var mat_ = veclib.mat3.create();
        function setAxes(out, view, right, up) {
            mat_[0] = right[0];
            mat_[3] = right[1];
            mat_[6] = right[2];
            mat_[1] = up[0];
            mat_[4] = up[1];
            mat_[7] = up[2];
            mat_[2] = -view[0];
            mat_[5] = -view[1];
            mat_[8] = -view[2];
            return quat.normalize(out, quat.fromMat3(out, mat_));
        }
        quat.setAxes = setAxes;
        quat.clone = veclib.vec4.clone;
        quat.fromValues = veclib.vec4.fromValues;
        quat.copy = veclib.vec4.copy;
        quat.set = veclib.vec4.set;
        function identity(out) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        quat.identity = identity;
        function setAxisAngle(out, axis, rad) {
            rad = rad * 0.5;
            var s = Math.sin(rad);
            out[0] = s * axis[0];
            out[1] = s * axis[1];
            out[2] = s * axis[2];
            out[3] = Math.cos(rad);
            return out;
        }
        quat.setAxisAngle = setAxisAngle;
        function getAxisAngle(outAxis, q) {
            var rad = Math.acos(q[3]) * 2.0;
            var s = Math.sin(rad / 2.0);
            if (s !== 0.0) {
                outAxis[0] = q[0] / s;
                outAxis[1] = q[1] / s;
                outAxis[2] = q[2] / s;
            }
            else {
                outAxis[0] = 1;
                outAxis[1] = 0;
                outAxis[2] = 0;
            }
            return rad;
        }
        quat.getAxisAngle = getAxisAngle;
        quat.add = veclib.vec4.add;
        function multiply(out, a, b) {
            var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
            out[0] = ax * bw + aw * bx + ay * bz - az * by;
            out[1] = ay * bw + aw * by + az * bx - ax * bz;
            out[2] = az * bw + aw * bz + ax * by - ay * bx;
            out[3] = aw * bw - ax * bx - ay * by - az * bz;
            return out;
        }
        quat.multiply = multiply;
        quat.mul = quat.multiply;
        quat.scale = veclib.vec4.scale;
        function rotateX(out, a, rad) {
            rad *= 0.5;
            var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = Math.sin(rad), bw = Math.cos(rad);
            out[0] = ax * bw + aw * bx;
            out[1] = ay * bw + az * bx;
            out[2] = az * bw - ay * bx;
            out[3] = aw * bw - ax * bx;
            return out;
        }
        quat.rotateX = rotateX;
        function rotateY(out, a, rad) {
            rad *= 0.5;
            var ax = a[0], ay = a[1], az = a[2], aw = a[3], by = Math.sin(rad), bw = Math.cos(rad);
            out[0] = ax * bw - az * by;
            out[1] = ay * bw + aw * by;
            out[2] = az * bw + ax * by;
            out[3] = aw * bw - ay * by;
            return out;
        }
        quat.rotateY = rotateY;
        function rotateZ(out, a, rad) {
            rad *= 0.5;
            var ax = a[0], ay = a[1], az = a[2], aw = a[3], bz = Math.sin(rad), bw = Math.cos(rad);
            out[0] = ax * bw + ay * bz;
            out[1] = ay * bw - ax * bz;
            out[2] = az * bw + aw * bz;
            out[3] = aw * bw - az * bz;
            return out;
        }
        quat.rotateZ = rotateZ;
        function calculateW(out, a) {
            var x = a[0], y = a[1], z = a[2];
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
            return out;
        }
        quat.calculateW = calculateW;
        quat.dot = veclib.vec4.dot;
        quat.lerp = veclib.vec4.lerp;
        function slerp(out, a, b, t) {
            var ax = a[0], ay = a[1], az = a[2], aw = a[3];
            var bx = b[0], by = b[1], bz = b[2], bw = b[3];
            var omega, cosom, sinom, scale0, scale1;
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            if (cosom < 0.0) {
                cosom = -cosom;
                bx = -bx;
                by = -by;
                bz = -bz;
                bw = -bw;
            }
            if ((1.0 - cosom) > veclib.EPSILON) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            }
            else {
                scale0 = 1.0 - t;
                scale1 = t;
            }
            out[0] = scale0 * ax + scale1 * bx;
            out[1] = scale0 * ay + scale1 * by;
            out[2] = scale0 * az + scale1 * bz;
            out[3] = scale0 * aw + scale1 * bw;
            return out;
        }
        quat.slerp = slerp;
        var tempQ1_ = quat.create();
        var tempQ2_ = quat.create();
        function sqlerp(out, a, b, c, d, t) {
            slerp(tempQ1_, a, d, t);
            slerp(tempQ2_, b, c, t);
            slerp(out, tempQ1_, tempQ2_, 2 * t * (1 - t));
            return out;
        }
        quat.sqlerp = sqlerp;
        function invert(out, a) {
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3, invDot = dot ? 1.0 / dot : 0;
            out[0] = -a0 * invDot;
            out[1] = -a1 * invDot;
            out[2] = -a2 * invDot;
            out[3] = a3 * invDot;
            return out;
        }
        quat.invert = invert;
        function conjugate(out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = a[3];
            return out;
        }
        quat.conjugate = conjugate;
        quat.length = veclib.vec4.length;
        quat.len = quat.length;
        quat.squaredLength = veclib.vec4.squaredLength;
        quat.sqrLen = quat.squaredLength;
        quat.normalize = veclib.vec4.normalize;
        function fromMat3(out, m) {
            var fTrace = m[0] + m[4] + m[8];
            var fRoot;
            if (fTrace > 0.0) {
                fRoot = Math.sqrt(fTrace + 1.0);
                out[3] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot;
                out[0] = (m[5] - m[7]) * fRoot;
                out[1] = (m[6] - m[2]) * fRoot;
                out[2] = (m[1] - m[3]) * fRoot;
            }
            else {
                var i = 0;
                if (m[4] > m[0]) {
                    i = 1;
                }
                if (m[8] > m[i * 3 + i]) {
                    i = 2;
                }
                var j = (i + 1) % 3;
                var k = (i + 2) % 3;
                fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
                out[i] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot;
                out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
                out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
                out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
            }
            return out;
        }
        quat.fromMat3 = fromMat3;
        function fromEuler(yaw, pitch, roll) {
            var y = yaw * 0.5;
            var p = pitch * 0.5;
            var r = roll * 0.5;
            var siny = Math.sin(y), cosy = Math.cos(y);
            var sinp = Math.sin(p), cosp = Math.cos(p);
            var sinr = Math.sin(r), cosr = Math.cos(r);
            return quat.normalize(new Float32Array(quat.ELEMENT_COUNT), [
                sinr * cosp * cosy - cosr * sinp * siny,
                cosr * sinp * cosy + sinr * cosp * siny,
                cosr * cosp * siny - sinr * sinp * cosy,
                cosr * cosp * cosy + sinr * sinp * siny
            ]);
        }
        quat.fromEuler = fromEuler;
        function str(a) {
            return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }
        quat.str = str;
        quat.exactEquals = veclib.vec4.exactEquals;
        quat.equals = veclib.vec4.equals;
    })(quat = veclib.quat || (veclib.quat = {}));
})(veclib || (veclib = {}));
