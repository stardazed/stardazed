function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg || "assertion failed");
    }
}
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
function cloneStruct(object) {
    var copy = {};
    Object.getOwnPropertyNames(object).forEach(function (name) {
        copy[name] = object[name];
    });
    return copy;
}
function isArrayLike(t) {
    return (typeof t == "object") && ("length" in t) && !(t instanceof String || t instanceof Window);
}
function seq(t) {
    if (Array.isArray(t))
        return t;
    if (isArrayLike(t))
        return [].slice.call(t, 0);
    return [t];
}
function $n(sel, base) { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
function $(sel, base) { return (typeof (sel) == 'string') ? $n(sel, base) : seq(sel); }
function $1(sel, base) { return $(sel, base)[0]; }
function show(sel, disp) { $(sel).forEach(function (el) { el.style.display = disp || "block"; }); }
function hide(sel) { $(sel).forEach(function (el) { el.style.display = "none"; }); }
function setDisabled(sel, dis) { $(sel).forEach(function (el) { el.disabled = dis; }); }
function enable(sel) { setDisabled(sel, false); }
function disable(sel) { setDisabled(sel, true); }
function closest(sourceSel, sel) {
    var source = ($1(sourceSel));
    do {
        source = source.parentNode;
        if (source.nodeType != Node.ELEMENT_NODE)
            return null;
        var elem = source;
        if (elem.matches(sel))
            return elem;
    } while (source);
    return null;
}
function nextElementSibling(elem) {
    while (elem) {
        elem = (elem.nextSibling);
        if (elem && elem.nodeType == Node.ELEMENT_NODE)
            return elem;
    }
    return null;
}
function on(target, evt, handler) {
    $(target).forEach(function (tgt) { tgt.addEventListener(evt, handler); });
}
function off(target, evt, handler) {
    $(target).forEach(function (tgt) { tgt.removeEventListener(evt, handler); });
}
function encodeAsQueryString(obj) {
    var items = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            items.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
        }
    }
    return items.join("&");
}
var FileLoadType;
(function (FileLoadType) {
    FileLoadType[FileLoadType["ArrayBuffer"] = 1] = "ArrayBuffer";
    FileLoadType[FileLoadType["Blob"] = 2] = "Blob";
    FileLoadType[FileLoadType["Document"] = 3] = "Document";
    FileLoadType[FileLoadType["JSON"] = 4] = "JSON";
    FileLoadType[FileLoadType["Text"] = 5] = "Text";
})(FileLoadType || (FileLoadType = {}));
function loadFile(filePath, opts) {
    function responseTypeForFileLoadType(flt) {
        switch (flt) {
            case FileLoadType.ArrayBuffer: return "arraybuffer";
            case FileLoadType.Blob: return "blob";
            case FileLoadType.Document: return "document";
            case FileLoadType.JSON: return "json";
            case FileLoadType.Text: return "text";
            default: return "";
        }
    }
    return new Promise(function (resolve, reject) {
        opts = opts || {};
        var xhr = new XMLHttpRequest();
        if (opts.tryBreakCache) {
            filePath += "?__ts=" + Date.now();
        }
        xhr.open("GET", filePath);
        if (opts.responseType) {
            xhr.responseType = responseTypeForFileLoadType(opts.responseType);
        }
        if (opts.mimeType) {
            xhr.overrideMimeType(opts.mimeType);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            assert(xhr.status == 200 || xhr.status == 0);
            resolve(xhr.response);
        };
        xhr.onerror = function () {
            assert(false, filePath + " doesn't exist");
        };
        xhr.send();
    });
}
var sd;
(function (sd) {
    sd.UInt8 = Object.freeze({
        min: 0,
        max: 255,
        signed: false,
        byteSize: 1,
        arrayType: Uint8Array
    });
    sd.UInt8Clamped = Object.freeze({
        min: 0,
        max: 255,
        signed: false,
        byteSize: 1,
        arrayType: Uint8ClampedArray
    });
    sd.SInt8 = Object.freeze({
        min: -128,
        max: 127,
        signed: true,
        byteSize: 1,
        arrayType: Int8Array
    });
    sd.UInt16 = Object.freeze({
        min: 0,
        max: 65535,
        signed: false,
        byteSize: 2,
        arrayType: Uint16Array
    });
    sd.SInt16 = Object.freeze({
        min: -32768,
        max: 32767,
        signed: true,
        byteSize: 2,
        arrayType: Int16Array
    });
    sd.UInt32 = Object.freeze({
        min: 0,
        max: 4294967295,
        signed: false,
        byteSize: 4,
        arrayType: Uint32Array
    });
    sd.SInt32 = Object.freeze({
        min: -2147483648,
        max: 2147483647,
        signed: true,
        byteSize: 4,
        arrayType: Int32Array
    });
    sd.Float = Object.freeze({
        min: -340282346638528859811704183484516925440.0,
        max: 340282346638528859811704183484516925440.0,
        signed: true,
        byteSize: 4,
        arrayType: Float32Array
    });
    sd.Double = Object.freeze({
        min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
        max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
        signed: true,
        byteSize: 8,
        arrayType: Float64Array
    });
    function makeTypedArray(nt) {
        var makeFn = function newArray(src, byteOffset, length) {
            return new (nt.arrayType)(src, byteOffset, length);
        };
        return makeFn;
    }
    sd.makeTypedArray = makeTypedArray;
})(sd || (sd = {}));
var sd;
(function (sd) {
    var math;
    (function (math) {
        function intRandom(maximum) {
            return (Math.random() * (maximum + 1)) << 0;
        }
        math.intRandom = intRandom;
        function intRandomRange(minimum, maximum) {
            var diff = (maximum - minimum) << 0;
            return minimum + intRandom(diff);
        }
        math.intRandomRange = intRandomRange;
        function deg2rad(deg) {
            return deg * Math.PI / 180.0;
        }
        math.deg2rad = deg2rad;
        function rad2deg(rad) {
            return rad * 180.0 / Math.PI;
        }
        math.rad2deg = rad2deg;
        function clamp(n, min, max) {
            return Math.max(min, Math.min(max, n));
        }
        math.clamp = clamp;
        function clamp01(n) {
            return Math.max(0.0, Math.min(1.0, n));
        }
        math.clamp01 = clamp01;
        function isPowerOf2(n) {
            return (n & (n - 1)) == 0;
        }
        math.isPowerOf2 = isPowerOf2;
        function roundUpPowerOf2(n) {
            if (n <= 0)
                return 1;
            n = (n | 0) - 1;
            n |= n >> 1;
            n |= n >> 2;
            n |= n >> 4;
            n |= n >> 8;
            n |= n >> 16;
            return n + 1;
        }
        math.roundUpPowerOf2 = roundUpPowerOf2;
        function alignUp(val, alignmentPow2) {
            return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
        }
        math.alignUp = alignUp;
        function alignDown(val, alignmentPow2) {
            return val & (~(alignmentPow2 - 1));
        }
        math.alignDown = alignDown;
        var Rect = (function () {
            function Rect(left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
                this.topLeft = vec2.fromValues(left, top);
                this.topRight = vec2.fromValues(right, top);
                this.bottomLeft = vec2.fromValues(left, bottom);
                this.bottomRight = vec2.fromValues(right, bottom);
            }
            Rect.prototype.intersectsLineSegment = function (ptA, ptB) {
                var d = vec2.create();
                vec2.subtract(d, ptB, ptA);
                var tmin = 0;
                var tmax = 9999;
                for (var i = 0; i < 2; ++i) {
                    if (Math.abs(d[i]) < 0.00001) {
                        if (ptA[i] < this.topLeft[i] || ptA[i] > this.bottomRight[i])
                            return false;
                    }
                    else {
                        var ood = 1 / d[i];
                        var t1 = (this.topLeft[i] - ptA[i]) * ood;
                        var t2 = (this.bottomRight[i] - ptA[i]) * ood;
                        if (t1 > t2) {
                            var tt = t2;
                            t2 = t1;
                            t1 = tt;
                        }
                        tmin = Math.max(tmin, t1);
                        tmax = Math.min(tmax, t2);
                        if (tmin > tmax)
                            return false;
                    }
                }
                return tmin < 1.0;
            };
            return Rect;
        })();
        math.Rect = Rect;
        var Vec2 = (function () {
            function Vec2() {
            }
            Vec2.zero = new Float32Array([0, 0]);
            Vec2.one = new Float32Array([1, 1]);
            Vec2.elementCount = 2;
            Vec2.byteSize = sd.Float.byteSize * Vec2.elementCount;
            return Vec2;
        })();
        math.Vec2 = Vec2;
        var Vec3 = (function () {
            function Vec3() {
            }
            Vec3.zero = new Float32Array([0, 0, 0]);
            Vec3.one = new Float32Array([1, 1, 1]);
            Vec3.elementCount = 3;
            Vec3.byteSize = sd.Float.byteSize * Vec3.elementCount;
            return Vec3;
        })();
        math.Vec3 = Vec3;
        var Vec4 = (function () {
            function Vec4() {
            }
            Vec4.zero = new Float32Array([0, 0, 0, 0]);
            Vec4.one = new Float32Array([1, 1, 1, 1]);
            Vec4.elementCount = 4;
            Vec4.byteSize = sd.Float.byteSize * Vec4.elementCount;
            return Vec4;
        })();
        math.Vec4 = Vec4;
        var Quat = (function () {
            function Quat() {
            }
            Quat.identity = new Float32Array([0, 0, 0, 1]);
            Quat.elementCount = 4;
            Quat.byteSize = sd.Float.byteSize * Quat.elementCount;
            return Quat;
        })();
        math.Quat = Quat;
        var Mat3 = (function () {
            function Mat3() {
            }
            Mat3.identity = new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
            Mat3.elementCount = 9;
            Mat3.byteSize = sd.Float.byteSize * Mat3.elementCount;
            return Mat3;
        })();
        math.Mat3 = Mat3;
        var Mat4 = (function () {
            function Mat4() {
            }
            Mat4.identity = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            Mat4.elementCount = 16;
            Mat4.byteSize = sd.Float.byteSize * Mat4.elementCount;
            return Mat4;
        })();
        math.Mat4 = Mat4;
        function vectorArrayItem(array, type, index) {
            var fromElement = type.elementCount * index;
            var toElement = fromElement + type.elementCount;
            return array.subarray(fromElement, toElement);
        }
        math.vectorArrayItem = vectorArrayItem;
    })(math = sd.math || (sd.math = {}));
})(sd || (sd = {}));
if (!ArrayBuffer.transfer) {
    ArrayBuffer.transfer = function (oldBuffer, newByteLength) {
        var oldByteLength = oldBuffer.byteLength;
        newByteLength = newByteLength | 0;
        assert(newByteLength > 0);
        if (newByteLength < oldByteLength) {
            return oldBuffer.slice(0, newByteLength);
        }
        var oldBufferView = new Uint8Array(oldBuffer);
        var newBufferView = new Uint8Array(newByteLength);
        newBufferView.set(oldBufferView);
        return newBufferView.buffer;
    };
}
var sd;
(function (sd) {
    var container;
    (function (container) {
        function copyElementRange(src, srcOffset, srcCount, dest, destOffset) {
            for (var ix = 0; ix < srcCount; ++ix) {
                dest[destOffset++] = src[srcOffset++];
            }
        }
        var Deque = (function () {
            function Deque() {
                this.blockCapacity = 512;
                this.blocks_ = [];
                this.blocks_.push(this.newBlock());
                this.headBlock_ = this.tailBlock_ = 0;
                this.headIndex_ = this.tailIndex_ = 0;
                this.count_ = 0;
            }
            Deque.prototype.newBlock = function () {
                return [];
            };
            Deque.prototype.headBlock = function () { return this.blocks_[this.headBlock_]; };
            Deque.prototype.tailBlock = function () { return this.blocks_[this.tailBlock_]; };
            Deque.prototype.append = function (t) {
                if (this.tailIndex_ == this.blockCapacity) {
                    if (this.tailBlock_ == this.blocks_.length - 1) {
                        this.blocks_.push(this.newBlock());
                    }
                    this.tailBlock_++;
                    this.tailIndex_ = 0;
                }
                this.tailBlock()[this.tailIndex_] = t;
                ++this.tailIndex_;
                ++this.count_;
            };
            Deque.prototype.prepend = function (t) {
                if (this.headIndex_ == 0) {
                    if (this.headBlock_ == 0) {
                        this.blocks_.unshift(this.newBlock());
                        ++this.tailBlock_;
                    }
                    else {
                        --this.headBlock_;
                    }
                    this.headIndex_ = this.blockCapacity;
                }
                --this.headIndex_;
                this.headBlock()[this.headIndex_] = t;
                ++this.count_;
            };
            Deque.prototype.popFront = function () {
                assert(this.count_ > 0);
                delete this.headBlock()[this.headIndex_];
                ++this.headIndex_;
                if (this.headIndex_ == this.blockCapacity) {
                    if (this.headBlock_ == 0) {
                        ++this.headBlock_;
                    }
                    else if (this.headBlock_ == 1) {
                        this.blocks_.shift();
                        this.tailBlock_--;
                    }
                    this.headIndex_ = 0;
                }
                --this.count_;
            };
            Deque.prototype.popBack = function () {
                assert(this.count_ > 0);
                if (this.tailIndex_ == 0) {
                    var lastBlockIndex = this.blocks_.length - 1;
                    if (this.tailBlock_ == lastBlockIndex - 1) {
                        this.blocks_.pop();
                    }
                    --this.tailBlock_;
                    this.tailIndex_ = this.blockCapacity;
                }
                --this.tailIndex_;
                delete this.tailBlock()[this.tailIndex_];
                --this.count_;
            };
            Deque.prototype.clear = function () {
                this.blocks_ = [];
                this.headBlock_ = this.tailBlock_ = 0;
                this.headIndex_ = this.tailIndex_ = 0;
                this.count_ = 0;
            };
            Deque.prototype.count = function () { return this.count_; };
            Deque.prototype.empty = function () { return this.count_ == 0; };
            Deque.prototype.front = function () {
                assert(this.count_ > 0);
                return this.headBlock()[this.headIndex_];
            };
            Deque.prototype.back = function () {
                assert(this.count_ > 0);
                return (this.tailIndex_ > 0) ? this.tailBlock()[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity - 1];
            };
            return Deque;
        })();
        container.Deque = Deque;
        var MultiArrayBuffer = (function () {
            function MultiArrayBuffer(initialCapacity, fields) {
                this.capacity_ = 0;
                this.count_ = 0;
                this.elementSumSize_ = 0;
                this.data_ = null;
                var totalOffset = 0;
                this.fields_ = fields.map(function (field, ix) {
                    var curOffset = totalOffset;
                    var sizeBytes = field.type.byteSize * field.count;
                    totalOffset += sizeBytes;
                    return {
                        type: field.type,
                        count: field.count,
                        byteOffset: curOffset,
                        sizeBytes: sizeBytes
                    };
                });
                this.elementSumSize_ = totalOffset;
                this.reserve(initialCapacity);
            }
            MultiArrayBuffer.prototype.capacity = function () { return this.capacity_; };
            MultiArrayBuffer.prototype.count = function () { return this.count_; };
            MultiArrayBuffer.prototype.backIndex = function () {
                assert(this.count_ > 0);
                return this.count_ - 1;
            };
            MultiArrayBuffer.prototype.fieldArrayView = function (f, buffer, itemCount) {
                var byteOffset = f.byteOffset * itemCount;
                return new (f.type.arrayType)(buffer, byteOffset, itemCount * f.count);
            };
            MultiArrayBuffer.prototype.reserve = function (newCapacity) {
                var _this = this;
                assert(newCapacity > 0);
                newCapacity = sd.math.alignUp(newCapacity, 32);
                if (newCapacity <= this.capacity()) {
                    return 0;
                }
                var invalidation = 0;
                var newSizeBytes = newCapacity * this.elementSumSize_;
                var newData = new ArrayBuffer(newSizeBytes);
                assert(newData);
                if (this.data_) {
                    this.fields_.forEach(function (f, ix) {
                        var oldView = _this.fieldArrayView(f, _this.data_, _this.count_);
                        var newView = _this.fieldArrayView(f, newData, newCapacity);
                        newView.set(oldView);
                    });
                    invalidation = 1;
                }
                this.data_ = newData;
                this.capacity_ = newCapacity;
                return invalidation;
            };
            MultiArrayBuffer.prototype.clear = function () {
                this.count_ = 0;
                this.data_ = new ArrayBuffer(this.capacity_ * this.elementSumSize_);
            };
            MultiArrayBuffer.prototype.resize = function (newCount) {
                var _this = this;
                var invalidation = 0;
                if (newCount > this.capacity_) {
                    invalidation = this.reserve(newCount);
                }
                else if (newCount < this.count_) {
                    var elementsToClear = this.count_ - newCount;
                    this.fields_.forEach(function (f, ix) {
                        var array = _this.fieldArrayView(f, _this.data_, _this.count_);
                        var zeroes = new (f.type.arrayType)(elementsToClear * f.count);
                        array.set(zeroes, newCount * f.count);
                    });
                }
                this.count_ = newCount;
                return invalidation;
            };
            MultiArrayBuffer.prototype.extend = function () {
                var invalidation = 0;
                if (this.count_ == this.capacity_) {
                    invalidation = this.reserve(this.capacity_ * 2);
                }
                ++this.count_;
                return invalidation;
            };
            MultiArrayBuffer.prototype.indexedFieldView = function (index) {
                return this.fieldArrayView(this.fields_[index], this.data_, this.capacity_);
            };
            return MultiArrayBuffer;
        })();
        container.MultiArrayBuffer = MultiArrayBuffer;
    })(container = sd.container || (sd.container = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function pixelFormatIsCompressed(format) {
            return format == 9 ||
                format == 10 ||
                format == 11;
        }
        render.pixelFormatIsCompressed = pixelFormatIsCompressed;
        function pixelFormatIsDepthFormat(format) {
            return format == 12 ||
                format == 13 ||
                format == 14;
        }
        render.pixelFormatIsDepthFormat = pixelFormatIsDepthFormat;
        function pixelFormatIsStencilFormat(format) {
            return format == 15;
        }
        render.pixelFormatIsStencilFormat = pixelFormatIsStencilFormat;
        function pixelFormatIsDepthStencilFormat(format) {
            return format == 16;
        }
        render.pixelFormatIsDepthStencilFormat = pixelFormatIsDepthStencilFormat;
        function pixelFormatBytesPerElement(format) {
            switch (format) {
                case 1:
                case 15:
                    return 1;
                case 12:
                    return 2;
                case 2:
                    return 3;
                case 3:
                case 13:
                case 14:
                case 16:
                    return 4;
                case 7:
                    return 12;
                case 8:
                    return 16;
                case 9:
                    return 8;
                case 10:
                case 11:
                    return 16;
                default:
                    assert(false, "unhandled pixel buffer format");
                    return 0;
            }
        }
        render.pixelFormatBytesPerElement = pixelFormatBytesPerElement;
        function makePixelCoordinate(x, y) {
            return { x: x, y: y };
        }
        render.makePixelCoordinate = makePixelCoordinate;
        function makePixelDimensions(width, height) {
            return { width: width, height: height };
        }
        render.makePixelDimensions = makePixelDimensions;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeAttachmentDescriptor(texture, level, layer) {
            return {
                texture: texture || null,
                level: level | 0,
                layer: layer | 0
            };
        }
        render.makeAttachmentDescriptor = makeAttachmentDescriptor;
        function makeFrameBufferDescriptor() {
            var cad = [];
            for (var k = 0; k < 8; ++k) {
                cad.push(makeAttachmentDescriptor());
            }
            Object.seal(cad);
            return {
                colourAttachments: cad,
                depthAttachment: makeAttachmentDescriptor(),
                stencilAttachment: makeAttachmentDescriptor()
            };
        }
        render.makeFrameBufferDescriptor = makeFrameBufferDescriptor;
        function makeFrameBufferAllocationDescriptor(numColourAttachments) {
            var apf = [];
            var auh = [];
            for (var k = 0; k < 8; ++k) {
                apf.push((k < numColourAttachments) ? 3 : 0);
                auh.push(0);
            }
            Object.seal(apf);
            Object.seal(auh);
            return {
                width: 0,
                height: 0,
                colourPixelFormats: apf,
                colourUsageHints: auh,
                depthPixelFormat: 0,
                stencilPixelFormat: 0,
                depthUsageHint: 1,
                stencilUsageHint: 1
            };
        }
        render.makeFrameBufferAllocationDescriptor = makeFrameBufferAllocationDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function useMipMaps(use) {
            return use ? 1 : 0;
        }
        render.useMipMaps = useMipMaps;
        function makeMipMapRange(baseLevel, numLevels) {
            return { baseLevel: baseLevel, numLevels: numLevels };
        }
        render.makeMipMapRange = makeMipMapRange;
        function makeSamplerDescriptor() {
            return {
                repeatS: 0,
                repeatT: 0,
                minFilter: 1,
                magFilter: 1,
                mipFilter: 1,
                maxAnisotropy: 1
            };
        }
        render.makeSamplerDescriptor = makeSamplerDescriptor;
        function maxMipLevelsForDimension(dim) {
            return 1 + Math.floor(Math.log(dim | 0) / Math.LOG2E);
        }
        render.maxMipLevelsForDimension = maxMipLevelsForDimension;
        function makeTextureDescriptor() {
            return {
                textureClass: 0,
                pixelFormat: 0,
                usageHint: 0,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(0, 0),
                mipmaps: 1
            };
        }
        render.makeTextureDescriptor = makeTextureDescriptor;
        function makeTexDesc2D(pixelFormat, width, height, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var maxDim = Math.max(width, height);
            return {
                textureClass: 0,
                pixelFormat: pixelFormat,
                usageHint: 0,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(width, height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(maxDim) : 1
            };
        }
        render.makeTexDesc2D = makeTexDesc2D;
        function makeTexDesc2DFromImageSource(source, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var maxDim = Math.max(source.width, source.height);
            return {
                textureClass: 0,
                pixelFormat: 3,
                usageHint: 0,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(source.width, source.height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(maxDim) : 1,
                pixelData: [source]
            };
        }
        render.makeTexDesc2DFromImageSource = makeTexDesc2DFromImageSource;
        function makeTexDescCube(pixelFormat, dimension, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            return {
                textureClass: 1,
                pixelFormat: pixelFormat,
                usageHint: 0,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(dimension, dimension),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(dimension) : 1
            };
        }
        render.makeTexDescCube = makeTexDescCube;
        function makeTexDescCubeFromImageSources(sources, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var sampler = makeSamplerDescriptor();
            sampler.repeatS = 2;
            sampler.repeatT = 2;
            return {
                textureClass: 1,
                pixelFormat: 3,
                usageHint: 0,
                sampling: sampler,
                dim: render.makePixelDimensions(sources[0].width, sources[0].height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(sources[0].width) : 1,
                pixelData: sources
            };
        }
        render.makeTexDescCubeFromImageSources = makeTexDescCubeFromImageSources;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var contextLimits = {
            maxColourAttachments: 0,
            maxDrawBuffers: 0
        };
        function maxColourAttachments(rc) {
            if (contextLimits.maxColourAttachments == 0) {
                contextLimits.maxColourAttachments = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
            }
            return contextLimits.maxColourAttachments;
        }
        render.maxColourAttachments = maxColourAttachments;
        function maxDrawBuffers(rc) {
            if (contextLimits.maxDrawBuffers == 0) {
                contextLimits.maxDrawBuffers = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_DRAW_BUFFERS_WEBGL) : 1;
            }
            return contextLimits.maxDrawBuffers;
        }
        render.maxDrawBuffers = maxDrawBuffers;
        function makeRenderContext(canvas) {
            var gl;
            try {
                gl = canvas.getContext("webgl");
                if (!gl)
                    gl = canvas.getContext("experimental-webgl");
            }
            catch (e) {
                gl = null;
            }
            if (!gl) {
                assert(false, "WebGL context is unsupported or disabled.");
                return null;
            }
            var eiu = gl.getExtension("OES_element_index_uint");
            var mdb = gl.getExtension("WEBGL_draw_buffers");
            var dte = gl.getExtension("WEBGL_depth_texture");
            dte = dte || gl.getExtension("WEBKIT_WEBGL_depth_texture");
            dte = dte || gl.getExtension("MOZ_WEBGL_depth_texture");
            var s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc");
            s3tc = s3tc || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
            s3tc = s3tc || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
            var bmm = gl.getExtension("EXT_blend_minmax");
            var txa = gl.getExtension("EXT_texture_filter_anisotropic");
            txa = txa || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            gl.clearColor(0.0, 0.0, 0.3, 1.0);
            gl.enable(gl.DEPTH_TEST);
            return {
                canvas: canvas,
                gl: gl,
                ext32bitIndexes: eiu,
                extDrawBuffers: mdb,
                extDepthTexture: dte,
                extS3TC: s3tc,
                extMinMax: bmm,
                extTexAnisotropy: txa
            };
        }
        render.makeRenderContext = makeRenderContext;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function glImageFormatForPixelFormat(rc, format) {
            var gl = rc.gl;
            switch (format) {
                case 1: return gl.ALPHA;
                case 2: return gl.RGB;
                case 3: return gl.RGBA;
                case 4:
                    return gl.RGB;
                case 5:
                case 6:
                    return gl.RGBA;
                case 7: return gl.RGB;
                case 8: return gl.RGBA;
                case 9: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
                case 10: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
                case 11: return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;
                case 12:
                case 13:
                case 14:
                    return gl.DEPTH_COMPONENT;
                case 15:
                    return gl.STENCIL_INDEX;
                case 16:
                    return gl.DEPTH_STENCIL;
                default:
                    assert(false, "unhandled pixel format");
                    return gl.NONE;
            }
        }
        function glPixelDataTypeForPixelFormat(rc, format) {
            var gl = rc.gl;
            if (render.pixelFormatIsCompressed(format))
                return gl.NONE;
            switch (format) {
                case 1:
                case 2:
                case 15:
                case 3:
                    return gl.UNSIGNED_BYTE;
                case 4:
                    return gl.UNSIGNED_SHORT_5_6_5;
                case 5:
                    return gl.UNSIGNED_SHORT_4_4_4_4;
                case 6:
                    return gl.UNSIGNED_SHORT_5_5_5_1;
                case 7:
                case 8:
                case 14:
                    return gl.FLOAT;
                case 12:
                    return gl.UNSIGNED_SHORT;
                case 13:
                    return gl.UNSIGNED_INT;
                case 16:
                    return rc.extDepthTexture ? rc.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;
                default:
                    assert(false, "unhandled pixel format");
                    return gl.NONE;
            }
        }
        function glRenderBufferInternalFormatForPixelFormat(rc, format) {
            var gl = rc.gl;
            switch (format) {
                case 4:
                    return gl.RGB565;
                case 5:
                    return gl.RGBA4;
                case 6:
                    return gl.RGB5_A1;
                case 12:
                    return gl.DEPTH_COMPONENT16;
                case 15:
                    return gl.STENCIL_INDEX8;
                default:
                    return gl.NONE;
            }
        }
        function glTextureRepeatMode(rc, repeat) {
            switch (repeat) {
                case 0: return rc.gl.REPEAT;
                case 1: return rc.gl.MIRRORED_REPEAT;
                case 2: return rc.gl.CLAMP_TO_EDGE;
            }
        }
        function glTextureMinificationFilter(rc, minFilter, mipFilter) {
            var glSizingFilter;
            if (mipFilter == 0) {
                if (minFilter == 0)
                    glSizingFilter = rc.gl.NEAREST;
                else
                    glSizingFilter = rc.gl.LINEAR;
            }
            else if (mipFilter == 1) {
                if (minFilter == 0)
                    glSizingFilter = rc.gl.NEAREST_MIPMAP_NEAREST;
                else
                    glSizingFilter = rc.gl.LINEAR_MIPMAP_NEAREST;
            }
            else {
                if (minFilter == 0)
                    glSizingFilter = rc.gl.NEAREST_MIPMAP_LINEAR;
                else
                    glSizingFilter = rc.gl.LINEAR_MIPMAP_LINEAR;
            }
            return glSizingFilter;
        }
        function glTextureMagnificationFilter(rc, magFilter) {
            if (magFilter == 0)
                return rc.gl.NEAREST;
            else
                return rc.gl.LINEAR;
        }
        var textureLimits = {
            maxDimension: 0,
            maxDimensionCube: 0,
            maxAnisotropy: 0
        };
        function maxTextureDimension(rc, texClass) {
            if (textureLimits.maxDimension == 0) {
                textureLimits.maxDimension = rc.gl.getParameter(rc.gl.MAX_TEXTURE_SIZE);
                textureLimits.maxDimensionCube = rc.gl.getParameter(rc.gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            }
            if (texClass == 1)
                return textureLimits.maxDimensionCube;
            return textureLimits.maxDimension;
        }
        function maxAllowedAnisotropy(rc) {
            if (textureLimits.maxAnisotropy == 0) {
                textureLimits.maxAnisotropy =
                    rc.extTexAnisotropy ?
                        rc.gl.getParameter(rc.extTexAnisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) :
                        1;
            }
            return textureLimits.maxAnisotropy;
        }
        var Texture = (function () {
            function Texture(rc, desc) {
                this.rc = rc;
                this.textureClass_ = desc.textureClass;
                this.dim_ = cloneStruct(desc.dim);
                this.mipmaps_ = desc.mipmaps;
                this.pixelFormat_ = desc.pixelFormat;
                this.sampler_ = cloneStruct(desc.sampling);
                assert(this.mipmaps_ > 0);
                assert(this.width() > 0);
                assert(this.height() > 0);
                assert(this.width() <= maxTextureDimension(rc, this.textureClass_));
                assert(this.height() <= maxTextureDimension(rc, this.textureClass_));
                var npot = !(sd.math.isPowerOf2(this.width()) && sd.math.isPowerOf2(this.height()));
                if (npot) {
                    if (this.sampler_.repeatS != 2 || this.sampler_.repeatT != 2) {
                        console.warn("NPOT textures cannot not repeat, overriding with ClampToEdge", desc);
                        this.sampler_.repeatS = 2;
                        this.sampler_.repeatT = 2;
                    }
                    if (this.mipmaps_ > 1) {
                        console.warn("NPOT textures cannot not have mipmaps, setting levels to 1", desc);
                        this.mipmaps_ = 1;
                    }
                    if (this.sampler_.mipFilter != 0) {
                        console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", desc);
                        this.sampler_.mipFilter = 0;
                    }
                }
                var gl = rc.gl;
                if (desc.textureClass == 0) {
                    if (desc.usageHint == 1) {
                        assert(desc.pixelData == null, "RenderBuffers cannot be initialized with pixeldata");
                        this.createRenderBuffer();
                    }
                    else {
                        this.createTex2D(desc.pixelData);
                    }
                }
                else {
                    this.createTexCube(desc.pixelData);
                }
                if (this.glTarget_ != gl.RENDERBUFFER) {
                    rc.gl.bindTexture(this.glTarget_, this.resource_);
                    gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_S, glTextureRepeatMode(rc, this.sampler_.repeatS));
                    gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_T, glTextureRepeatMode(rc, this.sampler_.repeatS));
                    if (this.mipmaps_ == 1)
                        this.sampler_.mipFilter = 0;
                    gl.texParameteri(this.glTarget_, rc.gl.TEXTURE_MIN_FILTER, glTextureMinificationFilter(rc, this.sampler_.minFilter, this.sampler_.mipFilter));
                    gl.texParameteri(this.glTarget_, rc.gl.TEXTURE_MAG_FILTER, glTextureMagnificationFilter(rc, this.sampler_.magFilter));
                    if (rc.extTexAnisotropy) {
                        var anisotropy = sd.math.clamp(this.sampler_.maxAnisotropy, 1, maxAllowedAnisotropy(rc));
                        gl.texParameterf(this.glTarget_, rc.extTexAnisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
                    }
                    rc.gl.bindTexture(this.glTarget_, null);
                }
            }
            Texture.prototype.createRenderBuffer = function () {
                var gl = this.rc.gl;
                assert(this.mipmaps() == 1, "Cannot create RenderBuffers with multiple levels");
                var sizedFormat = glRenderBufferInternalFormatForPixelFormat(this.rc, this.pixelFormat_);
                if (sizedFormat == gl.NONE) {
                    console.warn("Incompatible PixelFormat for RenderBuffer: falling back to Tex2D");
                    this.createTex2D();
                }
                else {
                    this.glTarget_ = gl.RENDERBUFFER;
                    var rb = gl.createRenderbuffer();
                    gl.bindRenderbuffer(this.glTarget_, rb);
                    gl.renderbufferStorage(this.glTarget_, sizedFormat, this.width(), this.height());
                    gl.bindRenderbuffer(this.glTarget_, null);
                }
            };
            Texture.prototype.createTex2D = function (pixelData) {
                var gl = this.rc.gl;
                assert((pixelData == null) || (pixelData.length == 1), "Tex2D pixelData array must contain 1 item or be omitted completely.");
                var texPixelData = (pixelData && pixelData[0]) || null;
                var glPixelFormat = glImageFormatForPixelFormat(this.rc, this.pixelFormat_);
                var glPixelType = glPixelDataTypeForPixelFormat(this.rc, this.pixelFormat_);
                if (render.pixelFormatIsCompressed(this.pixelFormat_))
                    assert(texPixelData && ("byteLength" in texPixelData), "Compressed textures MUST provide pixelData");
                var tex = this.resource_ = gl.createTexture();
                this.glTarget_ = gl.TEXTURE_2D;
                gl.bindTexture(this.glTarget_, tex);
                var w = this.width();
                var h = this.height();
                if (render.pixelFormatIsCompressed(this.pixelFormat_)) {
                    gl.compressedTexImage2D(this.glTarget_, 0, glPixelFormat, w, h, 0, texPixelData);
                }
                else {
                    if ((texPixelData == null) || ("byteLength" in texPixelData)) {
                        gl.texImage2D(this.glTarget_, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, texPixelData);
                    }
                    else {
                        var tis = texPixelData;
                        assert((tis.width == w) && (tis.height == h), "Tex2D imageSource's size does not match descriptor");
                        gl.texImage2D(this.glTarget_, 0, glPixelFormat, glPixelFormat, glPixelType, tis);
                    }
                }
                if (this.mipmaps_ > 1) {
                    gl.generateMipmap(this.glTarget_);
                }
                gl.bindTexture(this.glTarget_, null);
            };
            Texture.prototype.createTexCube = function (pixelData) {
                var gl = this.rc.gl;
                assert((pixelData == null) || (pixelData.length == 6), "TexCube pixelData array must contain 6 items or be omitted completely.");
                var glPixelFormat = glImageFormatForPixelFormat(this.rc, this.pixelFormat_);
                var glPixelType = glPixelDataTypeForPixelFormat(this.rc, this.pixelFormat_);
                var tex = this.resource_ = gl.createTexture();
                this.glTarget_ = gl.TEXTURE_CUBE_MAP;
                gl.bindTexture(this.glTarget_, tex);
                var w = this.width();
                var h = this.height();
                assert(w == h, "TexCube textures MUST have the same width and height");
                if (render.pixelFormatIsCompressed(this.pixelFormat_)) {
                    assert(pixelData && (pixelData.length == 6), "Compressed textures MUST provide pixelData");
                    for (var layer = 0; layer < 6; ++layer) {
                        assert(pixelData[layer] && ("byteLength" in pixelData[layer]), "pixelData source " + layer + " for compressed TexCube is not an ArrayBufferView");
                        gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, pixelData[layer]);
                    }
                }
                else {
                    for (var layer = 0; layer < 6; ++layer) {
                        var texPixelData = pixelData && pixelData[layer];
                        if ((texPixelData == null) || ("byteLength" in texPixelData)) {
                            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, texPixelData);
                        }
                        else {
                            var tis = texPixelData;
                            assert((tis.width == w) && (tis.height == h), "TexCube pixelData " + layer + "'s size does not match descriptor");
                            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, glPixelFormat, glPixelType, texPixelData);
                        }
                    }
                }
                if (this.mipmaps_ > 1) {
                    gl.generateMipmap(this.glTarget_);
                }
                gl.bindTexture(this.glTarget_, null);
            };
            Texture.prototype.dim = function () { return cloneStruct(this.dim_); };
            Texture.prototype.width = function () { return this.dim_.width; };
            Texture.prototype.height = function () { return this.dim_.height; };
            Texture.prototype.mipmaps = function () { return this.mipmaps_; };
            Texture.prototype.isMipMapped = function () { return this.mipmaps_ > 1; };
            Texture.prototype.pixelFormat = function () { return this.pixelFormat_; };
            Texture.prototype.textureClass = function () { return this.textureClass_; };
            ;
            Texture.prototype.clientWritable = function () {
                return this.glTarget_ != this.rc.gl.RENDERBUFFER;
            };
            Texture.prototype.renderTargetOnly = function () {
                return this.glTarget_ == this.rc.gl.RENDERBUFFER;
            };
            Texture.prototype.resource = function () { return this.resource_; };
            Texture.prototype.target = function () { return this.glTarget_; };
            return Texture;
        })();
        render.Texture = Texture;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function allocateTexturesForFrameBuffer(rc, desc) {
            var fbDesc = render.makeFrameBufferDescriptor();
            var width = desc.width;
            var height = desc.height;
            if (width == 0 && height == 0) {
                width = rc.canvas.width;
                height = rc.canvas.height;
            }
            for (var colourAttIndex = 0; colourAttIndex < desc.colourPixelFormats.length; ++colourAttIndex) {
                if (desc.colourPixelFormats[colourAttIndex] != 0) {
                    var texDesc = render.makeTextureDescriptor();
                    texDesc.textureClass = 0;
                    texDesc.dim.width = width;
                    texDesc.dim.height = height;
                    texDesc.sampling.repeatS = texDesc.sampling.repeatT = 2;
                    texDesc.sampling.mipFilter = 0;
                    texDesc.pixelFormat = desc.colourPixelFormats[colourAttIndex];
                    texDesc.usageHint = desc.colourUsageHints[colourAttIndex];
                    var attachment = fbDesc.colourAttachments[colourAttIndex];
                    attachment.texture = new render.Texture(rc, texDesc);
                }
            }
            var combinedFormat = 0;
            assert(desc.depthPixelFormat == 0 ||
                render.pixelFormatIsDepthFormat(desc.depthPixelFormat) ||
                render.pixelFormatIsDepthStencilFormat(desc.depthPixelFormat));
            assert(desc.stencilPixelFormat == 0 ||
                render.pixelFormatIsStencilFormat(desc.stencilPixelFormat) ||
                render.pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));
            if (render.pixelFormatIsDepthStencilFormat(desc.depthPixelFormat)) {
                assert(desc.depthPixelFormat == desc.stencilPixelFormat);
                assert(desc.depthUsageHint == desc.stencilUsageHint);
                combinedFormat = desc.depthPixelFormat;
            }
            else {
                assert(!render.pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));
            }
            var dsTex = render.makeTextureDescriptor();
            dsTex.textureClass = 0;
            dsTex.dim.width = width;
            dsTex.dim.height = height;
            dsTex.sampling.repeatS = dsTex.sampling.repeatT = 2;
            dsTex.sampling.mipFilter = 0;
            if (combinedFormat != 0) {
                dsTex.pixelFormat = combinedFormat;
                dsTex.usageHint = desc.depthUsageHint;
                var depthStencil = new render.Texture(rc, dsTex);
                fbDesc.depthAttachment.texture = depthStencil;
                fbDesc.stencilAttachment.texture = depthStencil;
            }
            else {
                if (desc.depthPixelFormat != 0) {
                    dsTex.pixelFormat = desc.depthPixelFormat;
                    dsTex.usageHint = desc.depthUsageHint;
                    fbDesc.depthAttachment.texture = new render.Texture(rc, dsTex);
                }
                if (desc.stencilPixelFormat != 0) {
                    dsTex.pixelFormat = desc.stencilPixelFormat;
                    dsTex.usageHint = desc.stencilUsageHint;
                    fbDesc.stencilAttachment.texture = new render.Texture(rc, dsTex);
                }
            }
            return fbDesc;
        }
        render.allocateTexturesForFrameBuffer = allocateTexturesForFrameBuffer;
        var FrameBuffer = (function () {
            function FrameBuffer(rc, desc) {
                var _this = this;
                this.rc = rc;
                this.width_ = 0;
                this.height_ = 0;
                var gl = rc.gl;
                var fbo = this.fbo_ = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                this.attachmentDesc_ = {
                    colourAttachments: desc.colourAttachments.map(function (att) { return cloneStruct(att); }),
                    depthAttachment: cloneStruct(desc.depthAttachment),
                    stencilAttachment: cloneStruct(desc.stencilAttachment)
                };
                var anyTexture = null;
                var drawBuffers = desc.colourAttachments.map(function (attachment, attIndex) {
                    if (attachment.texture) {
                        anyTexture = attachment.texture;
                        var glAttachment = rc.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex;
                        _this.attachTexture(glAttachment, attachment);
                        return glAttachment;
                    }
                    else {
                        return gl.NONE;
                    }
                });
                rc.extDrawBuffers.drawBuffersWEBGL(drawBuffers);
                var depthTex = desc.depthAttachment.texture;
                var stencilTex = desc.stencilAttachment.texture;
                if (depthTex) {
                    anyTexture = depthTex;
                    assert(desc.depthAttachment.level == 0);
                    assert(desc.depthAttachment.layer == 0);
                }
                if (stencilTex) {
                    anyTexture = stencilTex;
                    assert(desc.stencilAttachment.level == 0);
                    assert(desc.stencilAttachment.layer == 0);
                }
                if (depthTex && stencilTex && (depthTex == stencilTex)) {
                    assert(render.pixelFormatIsDepthStencilFormat(depthTex.pixelFormat()));
                    this.attachTexture(gl.DEPTH_STENCIL_ATTACHMENT, desc.depthAttachment);
                }
                else {
                    if (depthTex) {
                        assert(render.pixelFormatIsDepthFormat(depthTex.pixelFormat()));
                        this.attachTexture(gl.DEPTH_ATTACHMENT, desc.depthAttachment);
                    }
                    if (stencilTex) {
                        assert(render.pixelFormatIsStencilFormat(stencilTex.pixelFormat()));
                        this.attachTexture(gl.STENCIL_ATTACHMENT, desc.stencilAttachment);
                    }
                }
                var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (status != gl.FRAMEBUFFER_COMPLETE) {
                    assert(false, "FrameBuffer not complete");
                }
                if (anyTexture) {
                    this.width_ = anyTexture.width();
                    this.height_ = anyTexture.height();
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
            FrameBuffer.prototype.attachTexture = function (glAttachment, attachment) {
                var gl = this.rc.gl;
                if (attachment.texture.target() == gl.RENDERBUFFER) {
                    assert(attachment.level == 0);
                    assert(attachment.layer == 0);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachment, gl.RENDERBUFFER, attachment.texture.resource());
                }
                else {
                    var tex = attachment.texture.resource();
                    assert(attachment.level < attachment.texture.mipmaps());
                    var glTarget = gl.TEXTURE_2D;
                    if (attachment.texture.textureClass() == 1) {
                        assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
                        glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + attachment.layer;
                    }
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, tex, attachment.level);
                }
            };
            FrameBuffer.prototype.bind = function () {
                this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, this.fbo_);
            };
            FrameBuffer.prototype.width = function () { return this.width_; };
            FrameBuffer.prototype.height = function () { return this.height_; };
            FrameBuffer.prototype.resource = function () { return this.fbo_; };
            FrameBuffer.prototype.hasColourAttachment = function (atIndex) {
                assert(atIndex < render.maxColourAttachments(this.rc));
                return this.attachmentDesc_.colourAttachments[atIndex].texture != null;
            };
            FrameBuffer.prototype.hasDepthAttachment = function () {
                return this.attachmentDesc_.depthAttachment.texture != null;
            };
            FrameBuffer.prototype.hasStencilAttachment = function () {
                return this.attachmentDesc_.stencilAttachment.texture != null;
            };
            FrameBuffer.prototype.colourAttachmentTexture = function (atIndex) {
                assert(atIndex < render.maxColourAttachments(this.rc));
                return this.attachmentDesc_.colourAttachments[atIndex].texture;
            };
            FrameBuffer.prototype.depthAttachmentTexture = function () {
                return this.attachmentDesc_.depthAttachment.texture;
            };
            FrameBuffer.prototype.stencilAttachmentTexture = function () {
                return this.attachmentDesc_.stencilAttachment.texture;
            };
            return FrameBuffer;
        })();
        render.FrameBuffer = FrameBuffer;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
function loadImage(src) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () { resolve(image); };
        image.onerror = function () { reject(src + " doesn't exist"); };
        image.src = src;
    });
}
function imageData(image) {
    var cvs = document.createElement("canvas");
    cvs.width = image.width;
    cvs.height = image.height;
    var tc = cvs.getContext("2d");
    tc.drawImage(image, 0, 0);
    return tc.getImageData(0, 0, image.width, image.height);
}
function loadImageData(src) {
    return loadImage(src).then(function (image) {
        return imageData(image);
    });
}
var TMXLayer = (function () {
    function TMXLayer(layerNode) {
        var _this = this;
        var byteView = new Uint8Array(atob(layerNode.textContent.trim()).split("").map(function (c) { return c.charCodeAt(0); }));
        this.tileData = new Uint32Array(byteView.buffer);
        seq(layerNode.attributes).forEach(function (attr, ix) {
            if (attr.nodeName == "width")
                _this.width = parseInt(attr.textContent);
            if (attr.nodeName == "height")
                _this.height = parseInt(attr.textContent);
        });
    }
    TMXLayer.prototype.tileAt = function (col, row) {
        if (row < 0 || col < 0 || row >= this.height || col >= this.width)
            return -1;
        return this.tileData[(row * this.width) + col];
    };
    TMXLayer.prototype.setTileAt = function (col, row, tile) {
        if (row < 0 || col < 0 || row >= this.height || col >= this.width)
            return;
        this.tileData[(row * this.width) + col] = tile;
    };
    TMXLayer.prototype.eachTile = function (callback) {
        var off = 0;
        for (var row = 0; row < this.height; ++row) {
            for (var col = 0; col < this.width; ++col) {
                if (this.tileData[off])
                    callback(row, col, this.tileData[off]);
                ++off;
            }
        }
    };
    return TMXLayer;
})();
var TMXObjectGroup = (function () {
    function TMXObjectGroup(groupNode) {
    }
    return TMXObjectGroup;
})();
var TMXData = (function () {
    function TMXData() {
        this.layers = {};
        this.objectGroups = {};
    }
    TMXData.prototype.load = function (filePath) {
        var _this = this;
        return loadFile(filePath, {
            tryBreakCache: true,
            mimeType: "application/xml",
            responseType: FileLoadType.Document
        }).then(function (dataXML) {
            var tileDoc = dataXML.childNodes[0];
            seq(tileDoc.attributes).forEach(function (attr, ix) {
                if (attr.nodeName == "width")
                    this.width = parseInt(attr.textContent);
                if (attr.nodeName == "height")
                    this.height = parseInt(attr.textContent);
            });
            for (var ix = 0; ix < tileDoc.childNodes.length; ++ix) {
                var node = tileDoc.childNodes[ix];
                if (node.nodeName == "layer") {
                    _this.layers[node.attributes["name"].textContent] = new TMXLayer(node);
                }
                else if (node.nodeName == "objectgroup") {
                    _this.objectGroups[node.attributes["name"].textContent] = new TMXObjectGroup(node);
                }
            }
            return _this;
        });
    };
    ;
    return TMXData;
})();
var sd;
(function (sd) {
    var io;
    (function (io) {
        (function (Key) {
            Key[Key["UP"] = 38] = "UP";
            Key[Key["DOWN"] = 40] = "DOWN";
            Key[Key["LEFT"] = 37] = "LEFT";
            Key[Key["RIGHT"] = 39] = "RIGHT";
            Key[Key["SPACE"] = 32] = "SPACE";
            Key[Key["RETURN"] = 13] = "RETURN";
            Key[Key["ESC"] = 27] = "ESC";
            Key[Key["PAGEUP"] = 33] = "PAGEUP";
            Key[Key["PAGEDOWN"] = 34] = "PAGEDOWN";
            Key[Key["HOME"] = 36] = "HOME";
            Key[Key["END"] = 35] = "END";
            Key[Key["DELETE"] = 46] = "DELETE";
            Key[Key["A"] = 'A'.charCodeAt(0)] = "A";
            Key[Key["B"] = 'B'.charCodeAt(0)] = "B";
            Key[Key["C"] = 'C'.charCodeAt(0)] = "C";
            Key[Key["D"] = 'D'.charCodeAt(0)] = "D";
            Key[Key["E"] = 'E'.charCodeAt(0)] = "E";
            Key[Key["F"] = 'F'.charCodeAt(0)] = "F";
            Key[Key["G"] = 'G'.charCodeAt(0)] = "G";
            Key[Key["H"] = 'H'.charCodeAt(0)] = "H";
            Key[Key["I"] = 'I'.charCodeAt(0)] = "I";
            Key[Key["J"] = 'J'.charCodeAt(0)] = "J";
            Key[Key["K"] = 'K'.charCodeAt(0)] = "K";
            Key[Key["L"] = 'L'.charCodeAt(0)] = "L";
            Key[Key["M"] = 'M'.charCodeAt(0)] = "M";
            Key[Key["N"] = 'N'.charCodeAt(0)] = "N";
            Key[Key["O"] = 'O'.charCodeAt(0)] = "O";
            Key[Key["P"] = 'P'.charCodeAt(0)] = "P";
            Key[Key["Q"] = 'Q'.charCodeAt(0)] = "Q";
            Key[Key["R"] = 'R'.charCodeAt(0)] = "R";
            Key[Key["S"] = 'S'.charCodeAt(0)] = "S";
            Key[Key["T"] = 'T'.charCodeAt(0)] = "T";
            Key[Key["U"] = 'U'.charCodeAt(0)] = "U";
            Key[Key["V"] = 'V'.charCodeAt(0)] = "V";
            Key[Key["W"] = 'W'.charCodeAt(0)] = "W";
            Key[Key["X"] = 'X'.charCodeAt(0)] = "X";
            Key[Key["Y"] = 'Y'.charCodeAt(0)] = "Y";
            Key[Key["Z"] = 'Z'.charCodeAt(0)] = "Z";
        })(io.Key || (io.Key = {}));
        var Key = io.Key;
        ;
        var Keyboard = (function () {
            function Keyboard() {
                var _this = this;
                this.keys = {};
                on(window, "keydown", function (evt) {
                    var key = _this.keys[evt.keyCode];
                    if (!key) {
                        _this.keys[evt.keyCode] = { down: true, when: evt.timeStamp };
                    }
                    else {
                        if (key.when < evt.timeStamp) {
                            key.down = true;
                            key.when = evt.timeStamp;
                        }
                    }
                    if (!evt.metaKey)
                        evt.preventDefault();
                });
                on(window, "keyup", function (evt) {
                    var key = _this.keys[evt.keyCode];
                    if (!key) {
                        _this.keys[evt.keyCode] = { down: false, when: evt.timeStamp };
                    }
                    else {
                        key.down = false;
                        key.when = evt.timeStamp;
                    }
                    if (!evt.metaKey)
                        evt.preventDefault();
                });
                on(window, "blur", function (evt) {
                    _this.keys = {};
                });
                on(window, "focus", function (evt) {
                    _this.keys = {};
                });
            }
            Keyboard.prototype.down = function (kc) {
                return !!(this.keys[kc] && this.keys[kc].down);
            };
            return Keyboard;
        })();
        io.Keyboard = Keyboard;
    })(io = sd.io || (sd.io = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var Instance = (function () {
            function Instance(ref) {
                this.ref = ref;
            }
            Instance.prototype.equals = function (other) { return other.ref == this.ref; };
            Instance.prototype.valid = function () { return this.ref != 0; };
            return Instance;
        })();
        world.Instance = Instance;
        var Entity = (function () {
            function Entity(index, gen) {
                this.id = (gen << Entity.indexBits) | index;
            }
            Entity.prototype.index = function () { return this.id & Entity.indexMask; };
            Entity.prototype.generation = function () { return (this.id >> Entity.indexBits) & Entity.generationMask; };
            Entity.prototype.equals = function (other) { return other.id == this.id; };
            Entity.prototype.valid = function () { return this.id != 0; };
            Entity.minFreedBuildup = 1024;
            Entity.indexBits = 24;
            Entity.generationBits = 7;
            Entity.indexMask = (1 << Entity.indexBits) - 1;
            Entity.generationMask = (1 << Entity.generationBits) - 1;
            return Entity;
        })();
        world.Entity = Entity;
        var EntityManager = (function () {
            function EntityManager() {
                this.minFreedBuildup = 1024;
                this.indexBits = 24;
                this.generationBits = 7;
                this.indexMask = (1 << this.indexBits) - 1;
                this.generationMask = (1 << this.generationBits) - 1;
                this.generation_ = new Uint8Array(2048);
                this.freedIndices_ = new sd.container.Deque();
                this.genCount_ = -1;
                this.appendGeneration();
            }
            EntityManager.prototype.appendGeneration = function () {
                if (this.genCount_ == this.generation_.length) {
                    var newBuffer = ArrayBuffer.transfer(this.generation_.buffer, this.generation_.length * 2);
                    this.generation_ = new Uint8Array(newBuffer);
                }
                ++this.genCount_;
                this.generation_[this.genCount_] = 0;
                return this.genCount_;
            };
            EntityManager.prototype.create = function () {
                var index;
                if (this.freedIndices_.count() >= this.minFreedBuildup) {
                    index = this.freedIndices_.front();
                    this.freedIndices_.popFront();
                }
                else {
                    index = this.appendGeneration();
                }
                return new Entity(index, this.generation_[index]);
            };
            EntityManager.prototype.alive = function (ent) {
                var index = ent.index();
                return index <= this.genCount_ && (ent.generation() == this.generation_[index]);
            };
            EntityManager.prototype.destroy = function (ent) {
                var index = ent.index();
                this.generation_[index]++;
                this.freedIndices_.append(index);
            };
            return EntityManager;
        })();
        world.EntityManager = EntityManager;
        var TransformManager = (function () {
            function TransformManager() {
                var instanceFields = [
                    { type: sd.UInt32, count: 1 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 16 }
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(512, instanceFields);
                this.rebase();
            }
            TransformManager.prototype.rebase = function () {
                this.parentBase_ = this.instanceData_.indexedFieldView(0);
                this.positionBase_ = this.instanceData_.indexedFieldView(1);
                this.rotationBase_ = this.instanceData_.indexedFieldView(2);
                this.scaleBase_ = this.instanceData_.indexedFieldView(3);
                this.modelMatrixBase_ = this.instanceData_.indexedFieldView(4);
            };
            TransformManager.prototype.count = function () { return this.instanceData_.count(); };
            TransformManager.prototype.assign = function (linkedEntity, descOrParent, parent) {
                var entIndex = linkedEntity.index();
                if (this.instanceData_.count() < entIndex) {
                    var newCount = sd.math.roundUpPowerOf2(entIndex);
                    if (this.instanceData_.resize(newCount) == 1) {
                        this.rebase();
                    }
                }
                var h = new Instance(entIndex);
                if (descOrParent && ("position" in descOrParent)) {
                    var desc = descOrParent;
                    if (parent)
                        this.parentBase_[h.ref] = parent.ref;
                    this.positionBase_.set(desc.position, h.ref * sd.math.Vec3.elementCount);
                    this.rotationBase_.set(desc.rotation, h.ref * sd.math.Quat.elementCount);
                    this.scaleBase_.set(desc.scale, h.ref * sd.math.Vec3.elementCount);
                    var modelMat = sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref);
                    mat4.fromRotationTranslationScale(modelMat, desc.rotation, desc.position, desc.scale);
                }
                else {
                    var par = descOrParent;
                    if (par)
                        this.parentBase_[h.ref] = par.ref;
                    this.rotationBase_.set(sd.math.Quat.identity, h.ref * sd.math.Quat.elementCount);
                    this.scaleBase_.set(sd.math.Vec3.one, h.ref * sd.math.Vec3.elementCount);
                    this.modelMatrixBase_.set(sd.math.Mat4.identity, h.ref * sd.math.Mat4.elementCount);
                }
                return h;
            };
            TransformManager.prototype.parent = function (h) { return new Instance(this.parentBase_[h.ref]); };
            TransformManager.prototype.position = function (h) { return sd.math.vectorArrayItem(this.positionBase_, sd.math.Vec3, h.ref); };
            TransformManager.prototype.rotation = function (h) { return sd.math.vectorArrayItem(this.rotationBase_, sd.math.Quat, h.ref); };
            TransformManager.prototype.scale = function (h) { return sd.math.vectorArrayItem(this.scaleBase_, sd.math.Vec3, h.ref); };
            TransformManager.prototype.modelMatrix = function (h) { return sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref); };
            TransformManager.prototype.setParent = function (h, newParent) {
                assert(h.ref != 0);
                this.parentBase_[h.ref] = newParent.ref;
            };
            TransformManager.prototype.setPosition = function (h, newPosition) {
                assert(h.ref != 0);
                this.positionBase_.set(newPosition, h.ref * sd.math.Vec3.elementCount);
                var modelMat = sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref);
                mat4.fromRotationTranslationScale(modelMat, this.rotation(h), newPosition, this.scale(h));
            };
            TransformManager.prototype.setRotation = function (h, newRotation) {
                assert(h.ref != 0);
                this.rotationBase_.set(newRotation, h.ref * sd.math.Quat.elementCount);
                var modelMat = sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref);
                mat4.fromRotationTranslationScale(modelMat, newRotation, this.position(h), this.scale(h));
            };
            TransformManager.prototype.setPositionAndRotation = function (h, newPosition, newRotation) {
                assert(h.ref != 0);
                this.positionBase_.set(newPosition, h.ref * sd.math.Vec3.elementCount);
                this.rotationBase_.set(newRotation, h.ref * sd.math.Quat.elementCount);
                var modelMat = sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref);
                mat4.fromRotationTranslationScale(modelMat, newRotation, newPosition, this.scale(h));
            };
            TransformManager.prototype.setScale = function (h, newScale) {
                assert(h.ref != 0);
                this.scaleBase_.set(newScale, h.ref * sd.math.Vec3.elementCount);
                var modelMat = sd.math.vectorArrayItem(this.modelMatrixBase_, sd.math.Mat4, h.ref);
                mat4.fromRotationTranslationScale(modelMat, this.rotation(h), this.position(h), newScale);
            };
            TransformManager.prototype.forEntity = function (ent) {
                return new Instance(ent.index());
            };
            TransformManager.root = new Instance(0);
            return TransformManager;
        })();
        world.TransformManager = TransformManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var model;
    (function (model) {
        var MaterialManager = (function () {
            function MaterialManager() {
                this.albedoMaps_ = [];
                this.normalMaps_ = [];
                var initialCapacity = 256;
                var fields = [
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 1 },
                    { type: sd.Float, count: 2 },
                    { type: sd.Float, count: 2 },
                    { type: sd.UInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(initialCapacity, fields);
                this.albedoMaps_.length = initialCapacity;
                this.normalMaps_.length = initialCapacity;
            }
            MaterialManager.prototype.append = function (desc) {
                this.instanceData_.extend();
                var matIndex = this.instanceData_.count() - 1;
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(0), sd.math.Vec3, matIndex).set(desc.mainColour);
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(1), sd.math.Vec3, matIndex).set(desc.specularColour);
                this.instanceData_.indexedFieldView(2)[matIndex] = desc.specularExponent;
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(3), sd.math.Vec2, matIndex).set(desc.textureScale);
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(4), sd.math.Vec2, matIndex).set(desc.textureOffset);
                this.instanceData_.indexedFieldView(5)[matIndex] = desc.flags;
                this.albedoMaps_[matIndex] = desc.albedoMap;
                this.normalMaps_[matIndex] = desc.normalMap;
                return new sd.world.Instance(matIndex);
            };
            MaterialManager.prototype.destroy = function (index) {
                var matIndex = index.ref;
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(0), sd.math.Vec3, matIndex).set(sd.math.Vec3.zero);
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(1), sd.math.Vec3, matIndex).set(sd.math.Vec3.zero);
                this.instanceData_.indexedFieldView(2)[matIndex] = 0;
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(3), sd.math.Vec2, matIndex).set(sd.math.Vec2.zero);
                sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(4), sd.math.Vec2, matIndex).set(sd.math.Vec2.zero);
                this.instanceData_.indexedFieldView(5)[matIndex] = 0;
                this.albedoMaps_[matIndex] = null;
                this.normalMaps_[matIndex] = null;
            };
            MaterialManager.prototype.copyDescriptor = function (index) {
                var matIndex = index.ref;
                assert(matIndex < this.instanceData_.count());
                return {
                    mainColour: sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(0), sd.math.Vec3, matIndex),
                    specularColour: sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(1), sd.math.Vec3, matIndex),
                    specularExponent: this.instanceData_.indexedFieldView(2)[matIndex],
                    textureScale: sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(3), sd.math.Vec2, matIndex),
                    textureOffset: sd.math.vectorArrayItem(this.instanceData_.indexedFieldView(4), sd.math.Vec2, matIndex),
                    flags: this.instanceData_.indexedFieldView(5)[matIndex],
                    albedoMap: this.albedoMaps_[matIndex],
                    normalMap: this.normalMaps_[matIndex]
                };
            };
            return MaterialManager;
        })();
        model.MaterialManager = MaterialManager;
    })(model = sd.model || (sd.model = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var mesh;
    (function (mesh) {
        ;
        function vertexFieldElementCount(vf) {
            switch (vf) {
                case 0:
                    return 0;
                case 13:
                case 17:
                case 21:
                    return 1;
                case 1:
                case 129:
                case 4:
                case 132:
                case 7:
                case 135:
                case 10:
                case 138:
                case 14:
                case 18:
                case 22:
                    return 2;
                case 2:
                case 130:
                case 5:
                case 133:
                case 8:
                case 136:
                case 11:
                case 139:
                case 15:
                case 19:
                case 23:
                    return 3;
                case 3:
                case 131:
                case 6:
                case 134:
                case 9:
                case 137:
                case 12:
                case 140:
                case 16:
                case 20:
                case 24:
                    return 4;
            }
        }
        mesh.vertexFieldElementCount = vertexFieldElementCount;
        function vertexFieldNumericType(vf) {
            switch (vf) {
                case 0:
                    return null;
                case 21:
                case 22:
                case 23:
                case 24:
                    return sd.Float;
                case 13:
                case 14:
                case 15:
                case 16:
                    return sd.UInt32;
                case 17:
                case 18:
                case 19:
                case 20:
                    return sd.SInt32;
                case 7:
                case 135:
                case 8:
                case 136:
                case 9:
                case 137:
                    return sd.UInt16;
                case 10:
                case 138:
                case 11:
                case 139:
                case 12:
                case 140:
                    return sd.SInt16;
                case 1:
                case 129:
                case 2:
                case 130:
                case 3:
                case 131:
                    return sd.UInt8;
                case 4:
                case 132:
                case 5:
                case 133:
                case 6:
                case 134:
                    return sd.SInt8;
            }
        }
        mesh.vertexFieldNumericType = vertexFieldNumericType;
        function vertexFieldElementSizeBytes(vf) {
            var nt = vertexFieldNumericType(vf);
            return nt ? nt.byteSize : 0;
        }
        mesh.vertexFieldElementSizeBytes = vertexFieldElementSizeBytes;
        function vertexFieldSizeBytes(vf) {
            return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
        }
        mesh.vertexFieldSizeBytes = vertexFieldSizeBytes;
        function vertexFieldIsNormalized(vf) {
            return (vf & 0x80) != 0;
        }
        mesh.vertexFieldIsNormalized = vertexFieldIsNormalized;
        ;
        function maxVertexAttributes() {
            return 16;
        }
        mesh.maxVertexAttributes = maxVertexAttributes;
        function attrPosition3() { return { field: 23, role: 1 }; }
        mesh.attrPosition3 = attrPosition3;
        function attrNormal3() { return { field: 23, role: 2 }; }
        mesh.attrNormal3 = attrNormal3;
        function attrColour3() { return { field: 23, role: 4 }; }
        mesh.attrColour3 = attrColour3;
        function attrUV2() { return { field: 22, role: 5 }; }
        mesh.attrUV2 = attrUV2;
        function attrTangent4() { return { field: 24, role: 3 }; }
        mesh.attrTangent4 = attrTangent4;
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
            function Pos3Norm3UV2Tan4() {
                return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent4()];
            }
            AttrList.Pos3Norm3UV2Tan4 = Pos3Norm3UV2Tan4;
        })(AttrList = mesh.AttrList || (mesh.AttrList = {}));
        function makePositionedAttr(fieldOrAttr, roleOrOffset, offset) {
            if ("field" in fieldOrAttr) {
                var attr = fieldOrAttr;
                return {
                    field: attr.field,
                    role: attr.role,
                    offset: roleOrOffset
                };
            }
            else {
                return {
                    field: fieldOrAttr,
                    role: roleOrOffset,
                    offset: offset
                };
            }
        }
        mesh.makePositionedAttr = makePositionedAttr;
        function alignFieldOnSize(size, offset) {
            var mask = size - 1;
            return (offset + mask) & ~mask;
        }
        function alignVertexField(field, offset) {
            return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
        }
        var VertexLayout = (function () {
            function VertexLayout(attrList) {
                this.attributeCount_ = 0;
                this.vertexSizeBytes_ = 0;
                this.attributeCount_ = attrList.length;
                assert(this.attributeCount_ <= maxVertexAttributes());
                var offset = 0, maxElemSize = 0;
                this.attrs_ = attrList.map(function (attr) {
                    var size = vertexFieldSizeBytes(attr.field);
                    maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));
                    var alignedOffset = alignVertexField(attr.field, offset);
                    offset = alignedOffset + size;
                    return makePositionedAttr(attr, alignedOffset);
                });
                maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
                this.vertexSizeBytes_ = alignFieldOnSize(maxElemSize, offset);
            }
            VertexLayout.prototype.attributeCount = function () { return this.attributeCount_; };
            VertexLayout.prototype.vertexSizeBytes = function () { return this.vertexSizeBytes_; };
            VertexLayout.prototype.bytesRequiredForVertexCount = function (vertexCount) {
                return vertexCount * this.vertexSizeBytes();
            };
            VertexLayout.prototype.attrByRole = function (role) {
                return this.attrs_.find(function (pa) { return pa.role == role; });
            };
            VertexLayout.prototype.attrByIndex = function (index) {
                return this.attrs_[index];
            };
            VertexLayout.prototype.hasAttributeWithRole = function (role) {
                return this.attrByRole(role) != null;
            };
            return VertexLayout;
        })();
        mesh.VertexLayout = VertexLayout;
        var VertexBuffer = (function () {
            function VertexBuffer(attrs) {
                this.itemCount_ = 0;
                this.storage_ = null;
                if (attrs instanceof VertexLayout)
                    this.layout_ = attrs;
                else
                    this.layout_ = new VertexLayout(attrs);
            }
            VertexBuffer.prototype.layout = function () { return this.layout_; };
            VertexBuffer.prototype.strideBytes = function () { return this.layout_.vertexSizeBytes(); };
            VertexBuffer.prototype.attributeCount = function () { return this.layout_.attributeCount(); };
            VertexBuffer.prototype.itemCount = function () { return this.itemCount_; };
            VertexBuffer.prototype.bufferSizeBytes = function () { return this.strideBytes() * this.itemCount_; };
            VertexBuffer.prototype.allocate = function (itemCount) {
                this.itemCount_ = itemCount;
                this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(itemCount));
            };
            VertexBuffer.prototype.buffer = function () { return this.storage_; };
            VertexBuffer.prototype.hasAttributeWithRole = function (role) {
                return this.layout_.hasAttributeWithRole(role);
            };
            VertexBuffer.prototype.attrByRole = function (role) {
                return this.layout_.attrByRole(role);
            };
            VertexBuffer.prototype.attrByIndex = function (index) {
                return this.layout_.attrByIndex(index);
            };
            return VertexBuffer;
        })();
        mesh.VertexBuffer = VertexBuffer;
        var VertexBufferAttributeView = (function () {
            function VertexBufferAttributeView(vertexBuffer_, attr_, firstItem_, itemCount) {
                if (firstItem_ === void 0) { firstItem_ = 0; }
                if (itemCount === void 0) { itemCount = -1; }
                this.vertexBuffer_ = vertexBuffer_;
                this.attr_ = attr_;
                this.firstItem_ = firstItem_;
                this.stride_ = this.vertexBuffer_.layout().vertexSizeBytes();
                this.attrOffset_ = attr_.offset;
                this.attrElementCount_ = vertexFieldElementCount(attr_.field);
                this.typedViewCtor_ = vertexFieldNumericType(attr_.field).arrayType;
                this.buffer_ = this.vertexBuffer_.buffer();
                this.viewItemCount_ = itemCount < 0 ? (this.vertexBuffer_.itemCount() - this.firstItem_) : itemCount;
                assert(this.firstItem_ + this.viewItemCount_ <= this.vertexBuffer_.itemCount(), "view item range is bigger than buffer");
            }
            VertexBufferAttributeView.prototype.forEach = function (callback) {
                var max = this.count();
                for (var ix = 0; ix < max; ++ix) {
                    callback(this.item(ix));
                }
            };
            VertexBufferAttributeView.prototype.item = function (index) {
                index += this.firstItem_;
                var offsetBytes = (this.stride_ * index) + this.attrOffset_;
                return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
            };
            VertexBufferAttributeView.prototype.count = function () {
                return this.viewItemCount_;
            };
            VertexBufferAttributeView.prototype.vertexBuffer = function () {
                return this.vertexBuffer_;
            };
            VertexBufferAttributeView.prototype.subView = function (fromItem, subItemCount) {
                return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.firstItem_ + fromItem, subItemCount);
            };
            return VertexBufferAttributeView;
        })();
        mesh.VertexBufferAttributeView = VertexBufferAttributeView;
        function indexElementTypeSizeBytes(iet) {
            switch (iet) {
                case 0: return Uint8Array.BYTES_PER_ELEMENT;
                case 1: return Uint16Array.BYTES_PER_ELEMENT;
                case 2: return Uint32Array.BYTES_PER_ELEMENT;
            }
        }
        mesh.indexElementTypeSizeBytes = indexElementTypeSizeBytes;
        function minimumIndexElementTypeForVertexCount(vertexCount) {
            if (vertexCount <= sd.UInt8.max)
                return 0;
            if (vertexCount <= sd.UInt16.max)
                return 1;
            return 2;
        }
        mesh.minimumIndexElementTypeForVertexCount = minimumIndexElementTypeForVertexCount;
        var IndexBuffer = (function () {
            function IndexBuffer() {
                this.primitiveType_ = 0;
                this.indexElementType_ = 0;
                this.indexCount_ = 0;
                this.primitiveCount_ = 0;
                this.indexElementSizeBytes_ = 0;
                this.storage_ = null;
            }
            IndexBuffer.prototype.allocate = function (primitiveType, elementType, primitiveCount) {
                this.primitiveType_ = primitiveType;
                this.indexElementType_ = elementType;
                this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
                this.primitiveCount_ = primitiveCount;
                switch (primitiveType) {
                    case 0:
                        this.indexCount_ = primitiveCount;
                        break;
                    case 1:
                        this.indexCount_ = primitiveCount * 2;
                        break;
                    case 2:
                        this.indexCount_ = primitiveCount + 1;
                        break;
                    case 3:
                        this.indexCount_ = primitiveCount * 3;
                        break;
                    case 4:
                        this.indexCount_ = primitiveCount + 2;
                        break;
                }
                this.storage_ = new ArrayBuffer(this.bufferSizeBytes());
            };
            IndexBuffer.prototype.primitiveType = function () { return this.primitiveType_; };
            IndexBuffer.prototype.indexElementType = function () { return this.indexElementType_; };
            IndexBuffer.prototype.primitiveCount = function () { return this.primitiveCount_; };
            IndexBuffer.prototype.indexCount = function () { return this.indexCount_; };
            IndexBuffer.prototype.indexElementSizeBytes = function () { return this.indexElementSizeBytes_; };
            IndexBuffer.prototype.bufferSizeBytes = function () { return this.indexCount() * this.indexElementSizeBytes(); };
            IndexBuffer.prototype.buffer = function () { return this.storage_; };
            IndexBuffer.prototype.typedBasePtr = function (baseIndexNr, elementCount) {
                var offsetBytes = this.indexElementSizeBytes() * baseIndexNr;
                if (this.indexElementType() == 2) {
                    return new Uint32Array(this.storage_, offsetBytes, elementCount);
                }
                else if (this.indexElementType() == 1) {
                    return new Uint16Array(this.storage_, offsetBytes, elementCount);
                }
                else {
                    return new Uint8Array(this.storage_, offsetBytes, elementCount);
                }
            };
            IndexBuffer.prototype.indexes = function (baseIndexNr, outputCount, outputPtr) {
                assert(baseIndexNr < this.indexCount());
                assert(baseIndexNr + outputCount < this.indexCount());
                assert(outputPtr.length >= outputCount);
                var typedBasePtr = this.typedBasePtr(baseIndexNr);
                for (var ix = 0; ix < outputCount; ++ix) {
                    outputPtr[ix] = typedBasePtr[ix];
                }
            };
            IndexBuffer.prototype.index = function (indexNr) {
                var typedBasePtr = this.typedBasePtr(indexNr, 1);
                return typedBasePtr[0];
            };
            IndexBuffer.prototype.setIndexes = function (baseIndexNr, sourceCount, sourcePtr) {
                assert(baseIndexNr < this.indexCount());
                assert(baseIndexNr + sourceCount < this.indexCount());
                assert(sourcePtr.length >= sourceCount);
                var typedBasePtr = this.typedBasePtr(baseIndexNr);
                for (var ix = 0; ix < sourceCount; ++ix) {
                    typedBasePtr[ix] = sourcePtr[ix];
                }
            };
            IndexBuffer.prototype.setIndex = function (indexNr, newValue) {
                var typedBasePtr = this.typedBasePtr(indexNr, 1);
                typedBasePtr[0] = newValue;
            };
            return IndexBuffer;
        })();
        mesh.IndexBuffer = IndexBuffer;
        var TriangleProxy = (function () {
            function TriangleProxy(data, triangleIndex) {
                this.data_ = new data.constructor(data.buffer, triangleIndex * 3 * data.BYTES_PER_ELEMENT, 3);
            }
            TriangleProxy.prototype.index = function (index) { return this.data_[index]; };
            TriangleProxy.prototype.a = function () { return this.data_[0]; };
            TriangleProxy.prototype.b = function () { return this.data_[1]; };
            TriangleProxy.prototype.c = function () { return this.data_[2]; };
            TriangleProxy.prototype.setIndex = function (index, newValue) {
                this.data_[index] = newValue;
            };
            TriangleProxy.prototype.setA = function (newValue) { this.data_[0] = newValue; };
            TriangleProxy.prototype.setB = function (newValue) { this.data_[1] = newValue; };
            TriangleProxy.prototype.setC = function (newValue) { this.data_[2] = newValue; };
            return TriangleProxy;
        })();
        mesh.TriangleProxy = TriangleProxy;
        var IndexBufferTriangleView = (function () {
            function IndexBufferTriangleView(indexBuffer_, fromTriangle_, toTriangle_) {
                if (fromTriangle_ === void 0) { fromTriangle_ = -1; }
                if (toTriangle_ === void 0) { toTriangle_ = -1; }
                this.indexBuffer_ = indexBuffer_;
                this.fromTriangle_ = fromTriangle_;
                this.toTriangle_ = toTriangle_;
                assert(this.indexBuffer_.primitiveType() == 3);
                if (this.fromTriangle_ < 0)
                    this.fromTriangle_ = 0;
                if (this.fromTriangle_ >= this.indexBuffer_.primitiveCount())
                    this.fromTriangle_ = this.indexBuffer_.primitiveCount() - 1;
                if ((this.toTriangle_ < 0) || (this.toTriangle_ >= this.indexBuffer_.primitiveCount()))
                    this.toTriangle_ = this.indexBuffer_.primitiveCount() - 1;
            }
            IndexBufferTriangleView.prototype.forEach = function (callback) {
                var basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3);
                var primCount = this.toTriangle_ - this.fromTriangle_;
                for (var tix = 0; tix < primCount; ++tix) {
                    callback(new TriangleProxy(basePtr, tix));
                }
            };
            IndexBufferTriangleView.prototype.item = function (triangleIndex) {
                return this.indexBuffer_.typedBasePtr(triangleIndex * 3, 3);
            };
            IndexBufferTriangleView.prototype.count = function () {
                return this.toTriangle_ - this.fromTriangle_;
            };
            return IndexBufferTriangleView;
        })();
        mesh.IndexBufferTriangleView = IndexBufferTriangleView;
        function calcVertexNormals(vertexBuffer, indexBuffer) {
            var posAttr = vertexBuffer.attrByRole(1);
            var normAttr = vertexBuffer.attrByRole(2);
            assert(posAttr && normAttr);
            var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
            var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
            var triView = new IndexBufferTriangleView(indexBuffer);
            calcVertexNormalsImpl(posView, normView, triView);
        }
        mesh.calcVertexNormals = calcVertexNormals;
        function calcVertexNormalsImpl(posView, normView, triView) {
            var vertexCount = posView.count();
            var normalCount = normView.count();
            assert(vertexCount <= normalCount);
            normView.forEach(function (norm) {
                vec3.set(norm, 0, 0, 1);
            });
            var usages = new Float32Array(vertexCount);
            var lineA = vec3.create(), lineB = vec3.create();
            var faceNormal = vec3.create(), temp = vec3.create();
            triView.forEach(function (face) {
                var posA = posView.item(face.a());
                var posB = posView.item(face.b());
                var posC = posView.item(face.c());
                vec3.subtract(lineA, posB, posA);
                vec3.subtract(lineB, posC, posB);
                if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001)
                    return;
                vec3.cross(faceNormal, lineA, lineB);
                vec3.normalize(faceNormal, faceNormal);
                for (var fi = 0; fi < 3; ++fi) {
                    var fvi = face.index(fi);
                    var norm = normView.item(fvi);
                    vec3.scaleAndAdd(temp, faceNormal, norm, usages[fvi]);
                    vec3.scale(norm, temp, 1 / (usages[fvi] + 1));
                    usages[fvi] += 1;
                }
            });
            normView.forEach(function (norm) {
                vec3.normalize(norm, norm);
            });
        }
        var MeshData = (function () {
            function MeshData(attrs) {
                this.vertexBuffers = [];
                this.primitiveGroups = [];
                if (attrs) {
                    this.vertexBuffers.push(new VertexBuffer(attrs));
                }
                this.indexBuffer = new IndexBuffer();
            }
            MeshData.prototype.findFirstAttributeWithRole = function (role) {
                var pa = null;
                var avb = null;
                this.vertexBuffers.forEach(function (vb) {
                    if (!pa) {
                        pa = vb.attrByRole(role);
                        if (pa)
                            avb = vb;
                    }
                });
                if (pa)
                    return { vertexBuffer: avb, attr: pa };
                else
                    return null;
            };
            MeshData.prototype.primaryVertexBuffer = function () {
                assert(this.vertexBuffers.length > 0);
                return this.vertexBuffers[0];
            };
            MeshData.prototype.genVertexNormals = function () {
                var _this = this;
                this.vertexBuffers.forEach(function (vertexBuffer) {
                    var posAttr = vertexBuffer.attrByRole(1), normAttr = vertexBuffer.attrByRole(2);
                    if (posAttr && normAttr) {
                        calcVertexNormals(vertexBuffer, _this.indexBuffer);
                    }
                });
            };
            return MeshData;
        })();
        mesh.MeshData = MeshData;
        ;
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var mesh;
    (function (mesh_1) {
        function scale(mesh, scale) {
            assert(scale.length == 3);
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new mesh_1.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { vec3.multiply(pos, pos, scale); });
            }
        }
        mesh_1.scale = scale;
        function translate(mesh, globalDelta) {
            assert(globalDelta.length == 3);
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new mesh_1.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { vec3.add(pos, pos, globalDelta); });
            }
        }
        mesh_1.translate = translate;
        function rotate(mesh, rotation) {
            assert(rotation.length == 4);
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new mesh_1.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { vec3.transformQuat(pos, pos, rotation); });
            }
            var normAttr = mesh.findFirstAttributeWithRole(2);
            if (normAttr) {
                var normView = new mesh_1.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
                normView.forEach(function (norm) { vec3.transformQuat(norm, norm, rotation); });
            }
        }
        mesh_1.rotate = rotate;
        function transform(mesh, rotate, translate, scale) {
            if (!rotate)
                rotate = quat.create();
            if (!translate)
                translate = vec3.create();
            if (!scale)
                scale = vec3.fromValues(1, 1, 1);
            assert(rotate.length == 4, "rotate must be a quad");
            assert(translate.length == 3, "translate must be a vec3");
            assert(scale.length == 3, "scale must be a vec3");
            var posMatrix = mat4.create();
            mat4.fromRotationTranslationScale(posMatrix, rotate, translate, scale);
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new mesh_1.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { vec3.transformMat4(pos, pos, posMatrix); });
            }
            var normAttr = mesh.findFirstAttributeWithRole(2);
            if (normAttr) {
                var normView = new mesh_1.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
                var normalMatrix = mat3.create();
                mat3.fromMat4(normalMatrix, posMatrix);
                mat3.invert(normalMatrix, normalMatrix);
                mat3.transpose(normalMatrix, normalMatrix);
                normView.forEach(function (norm) { vec3.transformMat3(norm, norm, normalMatrix); });
            }
        }
        mesh_1.transform = transform;
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var sd;
(function (sd) {
    var mesh;
    (function (mesh_2) {
        var gen;
        (function (gen) {
            var MeshGenerator = (function () {
                function MeshGenerator() {
                }
                MeshGenerator.prototype.generate = function (attrList) {
                    if (!attrList)
                        attrList = mesh_2.AttrList.Pos3Norm3UV2();
                    var vtxCount = this.vertexCount();
                    var mesh = new mesh_2.MeshData(attrList);
                    var vertexBuffer = mesh.primaryVertexBuffer();
                    vertexBuffer.allocate(vtxCount);
                    var indexElementType = mesh_2.minimumIndexElementTypeForVertexCount(vtxCount);
                    mesh.indexBuffer.allocate(3, indexElementType, this.faceCount());
                    var posView = new mesh_2.VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(1));
                    var texAttr = vertexBuffer.attrByRole(5);
                    var texView = texAttr ? new mesh_2.VertexBufferAttributeView(vertexBuffer, texAttr) : null;
                    var triView = new mesh_2.IndexBufferTriangleView(mesh.indexBuffer);
                    this.generateInto(posView, triView, texView);
                    mesh.genVertexNormals();
                    mesh.primitiveGroups.push({ fromPrimIx: 0, primCount: this.faceCount(), materialIx: 0 });
                    return mesh;
                };
                MeshGenerator.prototype.generateInto = function (positions, faces, uvs) {
                    var posIx = 0, faceIx = 0, uvIx = 0;
                    var pos = function (x, y, z) {
                        var v3 = positions.item(posIx);
                        v3[0] = x;
                        v3[1] = y;
                        v3[2] = z;
                        posIx++;
                    };
                    var face = function (a, b, c) {
                        var v3 = faces.item(faceIx);
                        v3[0] = a;
                        v3[1] = b;
                        v3[2] = c;
                        faceIx++;
                    };
                    var uv = uvs ?
                        function (u, v) {
                            var v2 = uvs.item(uvIx);
                            v2[0] = u;
                            v2[1] = v;
                            uvIx++;
                        }
                        : function (u, v) { };
                    this.generateImpl(pos, face, uv);
                };
                return MeshGenerator;
            })();
            gen.MeshGenerator = MeshGenerator;
            var Composite = (function (_super) {
                __extends(Composite, _super);
                function Composite(parts_) {
                    var _this = this;
                    _super.call(this);
                    this.parts_ = parts_;
                    this.totalVertexes_ = 0;
                    this.totalFaces_ = 0;
                    parts_.forEach(function (tmd) {
                        _this.totalVertexes_ += tmd.generator.vertexCount();
                        _this.totalFaces_ += tmd.generator.faceCount();
                    });
                }
                Composite.prototype.vertexCount = function () {
                    return this.totalVertexes_;
                };
                Composite.prototype.faceCount = function () {
                    return this.totalFaces_;
                };
                Composite.prototype.generateInto = function (positions, faces, uvs) {
                    var posIx = 0, faceIx = 0, uvIx = 0;
                    var baseVertex = 0;
                    var pos = function (x, y, z) {
                        var v3 = positions.item(posIx);
                        v3[0] = x;
                        v3[1] = y;
                        v3[2] = z;
                        posIx++;
                    };
                    var face = function (a, b, c) {
                        var v3 = faces.item(faceIx);
                        v3[0] = a + baseVertex;
                        v3[1] = b + baseVertex;
                        v3[2] = c + baseVertex;
                        faceIx++;
                    };
                    var uv = uvs ?
                        function (u, v) {
                            var v2 = uvs.item(uvIx);
                            v2[0] = u;
                            v2[1] = v;
                            uvIx++;
                        }
                        : function (u, v) { };
                    this.parts_.forEach(function (part) {
                        part.generator.generateImpl(pos, face, uv);
                        var transMatrix = mat4.create();
                        var rotation = part.rotation || quat.create();
                        var translation = part.translation || vec3.create();
                        var scale = part.scale || vec3.fromValues(1, 1, 1);
                        mat4.fromRotationTranslationScale(transMatrix, rotation, translation, scale);
                        var partVertexCount = part.generator.vertexCount();
                        var subPosView = positions.subView(baseVertex, partVertexCount);
                        subPosView.forEach(function (pos) { vec3.transformMat4(pos, pos, transMatrix); });
                        baseVertex += partVertexCount;
                    });
                };
                Composite.prototype.generateImpl = function (position, face, uv) {
                };
                return Composite;
            })(MeshGenerator);
            gen.Composite = Composite;
            var Plane = (function (_super) {
                __extends(Plane, _super);
                function Plane(desc) {
                    _super.call(this);
                    this.width_ = desc.width;
                    this.depth_ = desc.depth;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.yGen_ = desc.yGen || (function (x, z) { return 0; });
                    assert(this.width_ > 0);
                    assert(this.depth_ > 0);
                    assert(this.rows_ > 0);
                    assert(this.segs_ > 0);
                }
                Plane.prototype.vertexCount = function () {
                    return (this.rows_ + 1) * (this.segs_ + 1);
                };
                Plane.prototype.faceCount = function () {
                    return 2 * this.rows_ * this.segs_;
                };
                Plane.prototype.generateImpl = function (position, face, uv) {
                    var halfWidth = this.width_ / 2;
                    var halfDepth = this.depth_ / 2;
                    var tileDimX = this.width_ / this.segs_;
                    var tileDimZ = this.depth_ / this.rows_;
                    for (var z = 0; z <= this.rows_; ++z) {
                        var posZ = -halfDepth + (z * tileDimZ);
                        for (var x = 0; x <= this.segs_; ++x) {
                            var posX = -halfWidth + (x * tileDimX);
                            position(posX, this.yGen_(posX, posZ), posZ);
                            uv(x / this.segs_, z / this.rows_);
                        }
                    }
                    var baseIndex = 0;
                    var vertexRowCount = this.segs_ + 1;
                    for (var z = 0; z < this.rows_; ++z) {
                        for (var x = 0; x < this.segs_; ++x) {
                            face(baseIndex + x + 1, baseIndex + x + vertexRowCount, baseIndex + x + vertexRowCount + 1);
                            face(baseIndex + x, baseIndex + x + vertexRowCount, baseIndex + x + 1);
                        }
                        baseIndex += vertexRowCount;
                    }
                };
                return Plane;
            })(MeshGenerator);
            gen.Plane = Plane;
            function cubeDescriptor(diam) {
                return { width: diam, height: diam, depth: diam };
            }
            gen.cubeDescriptor = cubeDescriptor;
            var Box = (function (_super) {
                __extends(Box, _super);
                function Box(desc) {
                    _super.call(this);
                    this.xDiam_ = desc.width;
                    this.yDiam_ = desc.height;
                    this.zDiam_ = desc.depth;
                    assert(this.xDiam_ > 0);
                    assert(this.yDiam_ > 0);
                    assert(this.zDiam_ > 0);
                }
                Box.prototype.vertexCount = function () {
                    return 24;
                };
                Box.prototype.faceCount = function () {
                    return 12;
                };
                Box.prototype.generateImpl = function (position, face, uv) {
                    var xh = this.xDiam_ / 2;
                    var yh = this.yDiam_ / 2;
                    var zh = this.zDiam_ / 2;
                    var curVtx = 0;
                    var p = [
                        [-xh, -yh, -zh],
                        [xh, -yh, -zh],
                        [xh, yh, -zh],
                        [-xh, yh, -zh],
                        [-xh, -yh, zh],
                        [xh, -yh, zh],
                        [xh, yh, zh],
                        [-xh, yh, zh]
                    ];
                    var quad = function (a, b, c, d) {
                        position(p[a][0], p[a][1], p[a][2]);
                        position(p[b][0], p[b][1], p[b][2]);
                        position(p[c][0], p[c][1], p[c][2]);
                        position(p[d][0], p[d][1], p[d][2]);
                        uv(1, 0);
                        uv(0, 0);
                        uv(0, 1);
                        uv(1, 1);
                        face(curVtx, curVtx + 1, curVtx + 2);
                        face(curVtx + 2, curVtx + 3, curVtx);
                        curVtx += 4;
                    };
                    quad(3, 2, 1, 0);
                    quad(7, 3, 0, 4);
                    quad(6, 7, 4, 5);
                    quad(2, 6, 5, 1);
                    quad(7, 6, 2, 3);
                    quad(5, 4, 0, 1);
                };
                return Box;
            })(MeshGenerator);
            gen.Box = Box;
            var Cone = (function (_super) {
                __extends(Cone, _super);
                function Cone(desc) {
                    _super.call(this);
                    this.radiusA_ = desc.radiusA;
                    this.radiusB_ = desc.radiusB;
                    this.height_ = desc.height;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    assert(this.radiusA_ >= 0);
                    assert(this.radiusB_ >= 0);
                    assert(!((this.radiusA_ == 0) && (this.radiusB_ == 0)));
                    assert(this.rows_ >= 1);
                    assert(this.segs_ >= 3);
                }
                Cone.prototype.vertexCount = function () {
                    return (this.segs_ + 1) * (this.rows_ + 1);
                };
                Cone.prototype.faceCount = function () {
                    var fc = (2 * this.segs_ * this.rows_);
                    if ((this.radiusA_ == 0) || (this.radiusB_ == 0))
                        fc -= this.segs_;
                    return fc;
                };
                Cone.prototype.generateImpl = function (position, face, uv) {
                    var vix = 0;
                    var radiusDiff = this.radiusB_ - this.radiusA_;
                    var Tau = Math.PI * 2;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var relPos = row / this.rows_;
                        var y = (relPos * -this.height_) + (this.height_ / 2);
                        var segRad = this.radiusA_ + (relPos * radiusDiff);
                        var texV = relPos;
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var x = Math.sin((Tau / this.segs_) * seg) * segRad;
                            var z = Math.cos((Tau / this.segs_) * seg) * segRad;
                            var texU = seg / this.segs_;
                            position(x, y, z);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg, rr = seg + 1;
                                if (row > 1 || this.radiusA_ > 0)
                                    face(raix + rl, rbix + rl, raix + rr);
                                if (row < this.rows_ || this.radiusB_ > 0)
                                    face(raix + rr, rbix + rl, rbix + rr);
                            }
                        }
                    }
                };
                return Cone;
            })(MeshGenerator);
            gen.Cone = Cone;
            var Sphere = (function (_super) {
                __extends(Sphere, _super);
                function Sphere(desc) {
                    _super.call(this);
                    this.radius_ = desc.radius;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.sliceFrom_ = sd.math.clamp01(desc.sliceFrom || 0.0);
                    this.sliceTo_ = sd.math.clamp01(desc.sliceTo || 1.0);
                    assert(this.radius_ > 0);
                    assert(this.rows_ >= 2);
                    assert(this.segs_ >= 3);
                    assert(this.sliceTo_ > this.sliceFrom_);
                }
                Sphere.prototype.vertexCount = function () {
                    return (this.segs_ + 1) * (this.rows_ + 1);
                };
                Sphere.prototype.faceCount = function () {
                    var fc = 2 * this.segs_ * this.rows_;
                    if (this.sliceFrom_ == 0.0)
                        fc -= this.segs_;
                    if (this.sliceTo_ == 1.0)
                        fc -= this.segs_;
                    return fc;
                };
                Sphere.prototype.generateImpl = function (position, face, uv) {
                    var Pi = Math.PI;
                    var Tau = Math.PI * 2;
                    var slice = this.sliceTo_ - this.sliceFrom_;
                    var piFrom = this.sliceFrom_ * Pi;
                    var piSlice = slice * Pi;
                    var vix = 0;
                    var openTop = this.sliceFrom_ > 0.0;
                    var openBottom = this.sliceTo_ < 1.0;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                        var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                        var texV = this.sliceFrom_ + ((row / this.rows_) * slice);
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var x = Math.sin((Tau / this.segs_) * seg) * segRad;
                            var z = Math.cos((Tau / this.segs_) * seg) * segRad;
                            var texU = seg / this.segs_;
                            position(x, y, z);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg, rr = seg + 1;
                                if (row > 1 || openTop)
                                    face(raix + rl, rbix + rl, raix + rr);
                                if (row < this.rows_ || openBottom)
                                    face(raix + rr, rbix + rl, rbix + rr);
                            }
                        }
                    }
                };
                return Sphere;
            })(MeshGenerator);
            gen.Sphere = Sphere;
            var Torus = (function (_super) {
                __extends(Torus, _super);
                function Torus(desc) {
                    _super.call(this);
                    this.minorRadius_ = desc.minorRadius;
                    this.majorRadius_ = desc.majorRadius;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.sliceFrom_ = sd.math.clamp01(desc.sliceFrom || 0.0);
                    this.sliceTo_ = sd.math.clamp01(desc.sliceTo || 1.0);
                    assert(this.minorRadius_ >= 0);
                    assert(this.majorRadius_ >= this.minorRadius_);
                    assert(this.minorRadius_ > 0 || this.majorRadius_ > 0);
                    assert(this.rows_ >= 4);
                    assert(this.segs_ >= 3);
                    assert(this.sliceTo_ > this.sliceFrom_);
                }
                Torus.prototype.vertexCount = function () {
                    return (this.segs_ + 1) * (this.rows_ + 1);
                };
                Torus.prototype.faceCount = function () {
                    return 2 * this.segs_ * this.rows_;
                };
                Torus.prototype.generateImpl = function (position, face, uv) {
                    var Pi = Math.PI;
                    var Tau = Math.PI * 2;
                    var slice = this.sliceTo_ - this.sliceFrom_;
                    var piFrom = this.sliceFrom_ * Tau;
                    var piSlice = slice * Tau;
                    var vix = 0;
                    var innerRadius = this.majorRadius_ - this.minorRadius_;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var majorAngle = piFrom + ((piSlice * row) / this.rows_);
                        var texV = this.sliceFrom_ + ((row / this.rows_) * slice);
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var innerAngle = (Tau * seg) / this.segs_;
                            var x = Math.cos(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                            var y = Math.sin(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                            var z = Math.sin(innerAngle) * innerRadius;
                            var texU = seg / this.segs_;
                            position(x, y, z);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg, rr = seg + 1;
                                face(raix + rl, rbix + rl, raix + rr);
                                face(raix + rr, rbix + rl, rbix + rr);
                            }
                        }
                    }
                };
                return Torus;
            })(MeshGenerator);
            gen.Torus = Torus;
        })(gen = mesh_2.gen || (mesh_2.gen = {}));
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var mesh;
    (function (mesh_3) {
        function parseLWMaterialSource(text) {
            var lines = text.split("\n");
            var materials = {};
            var curMat = null;
            lines.forEach(function (line) {
                var tokens = line.split(" ");
                switch (tokens[0]) {
                    case "newmtl":
                        curMat = materials[tokens[1]] = {};
                        break;
                    case "Ka":
                        curMat.ambientColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
                        break;
                    case "Kd":
                        curMat.diffuseColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
                        break;
                    case "Ks":
                        curMat.specularColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
                        break;
                    default:
                        break;
                }
            });
            return materials;
        }
        function genColorEntriesFromDrawGroups(drawGroups, materials, colourView) {
            var lastGroup = drawGroups[drawGroups.length - 1];
            var totalIndexes = lastGroup.indexCount + lastGroup.fromIndex;
            drawGroups.forEach(function (group) {
                var curIndex = group.fromIndex;
                var maxIndex = group.fromIndex + group.indexCount;
                var mat = materials[group.materialName];
                assert(mat, "material " + group.materialName + " not found");
                while (curIndex < maxIndex) {
                    vec3.copy(colourView.item(curIndex), mat.diffuseColor);
                    curIndex++;
                }
            });
        }
        function parseLWObjectSource(text) {
            var t0 = performance.now();
            var lines = text.split("\n");
            var vv = [], nn = [], tt = [];
            var mtlFileName = "";
            var materialGroups = [];
            var curMaterialGroup = null;
            var mesh = new mesh_3.MeshData(mesh_3.AttrList.Pos3Norm3Colour3UV2());
            var vb = mesh.primaryVertexBuffer();
            var posView;
            var normView;
            var uvView;
            var vertexIx = 0;
            function vtx(vx, tx, nx) {
                assert(vx < vv.length, "vx out of bounds " + vx);
                var v = vv[vx], n = nx > -1 ? nn[nx] : null, t = tx > -1 ? tt[tx] : null;
                vec3.set(posView.item(vertexIx), v[0], v[1], v[2]);
                if (n) {
                    assert(nx < nn.length, "nx out of bounds " + nx);
                    vec3.set(normView.item(vertexIx), n[0], n[1], n[2]);
                }
                if (t) {
                    assert(tx < tt.length, "tx out of bounds " + tx);
                    vec2.set(uvView.item(vertexIx), t[0], t[1]);
                }
                ++vertexIx;
            }
            var triCount = 0;
            lines.forEach(function (line) {
                if (line.slice(0, 2) == "f ")
                    triCount++;
            });
            vb.allocate(triCount * 3);
            posView = new mesh_3.VertexBufferAttributeView(vb, vb.attrByRole(1));
            normView = new mesh_3.VertexBufferAttributeView(vb, vb.attrByRole(2));
            uvView = new mesh_3.VertexBufferAttributeView(vb, vb.attrByRole(5));
            mesh.indexBuffer = null;
            function fxtoi(fx) { return (+fx) - 1; }
            lines.forEach(function (line) {
                var tokens = line.split(" ");
                switch (tokens[0]) {
                    case "mtllib":
                        mtlFileName = tokens[1];
                        break;
                    case "v":
                        vv.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                        break;
                    case "vn":
                        nn.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                        break;
                    case "vt":
                        tt.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
                        break;
                    case "f":
                        vtx.apply(null, tokens[1].split("/").map(fxtoi));
                        vtx.apply(null, tokens[2].split("/").map(fxtoi));
                        vtx.apply(null, tokens[3].split("/").map(fxtoi));
                        break;
                    case "usemtl":
                        if (curMaterialGroup) {
                            curMaterialGroup.indexCount = vertexIx - curMaterialGroup.fromIndex;
                        }
                        curMaterialGroup = {
                            materialName: tokens[1],
                            fromIndex: vertexIx,
                            indexCount: 0
                        };
                        materialGroups.push(curMaterialGroup);
                        break;
                    default: break;
                }
            });
            if (curMaterialGroup) {
                curMaterialGroup.indexCount = vertexIx - curMaterialGroup.fromIndex;
            }
            var t1 = performance.now();
            return {
                mtlFileName: mtlFileName,
                mesh: mesh,
                drawGroups: materialGroups,
                materials: null
            };
        }
        function loadLWMaterialFile(filePath) {
            return loadFile(filePath).then(function (text) {
                return parseLWMaterialSource(text);
            });
        }
        function loadLWObjectFile(filePath) {
            var mtlResolve = null;
            var mtlProm = new Promise(function (resolve) {
                mtlResolve = resolve;
            });
            var objProm = loadFile(filePath).then(function (text) {
                return parseLWObjectSource(text);
            }).then(function (objData) {
                assert(objData.mtlFileName.length > 0, "no MTL file?");
                var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + objData.mtlFileName;
                loadLWMaterialFile(mtlFilePath).then(function (materials) {
                    mtlResolve(materials);
                });
                return objData;
            });
            return Promise.all([mtlProm, objProm]).then(function (values) {
                var materials = values[0];
                var obj = values[1];
                obj.materials = materials;
                var colourAttr = obj.mesh.primaryVertexBuffer().attrByRole(4);
                var colourView = new mesh_3.VertexBufferAttributeView(obj.mesh.primaryVertexBuffer(), colourAttr);
                genColorEntriesFromDrawGroups(obj.drawGroups, materials, colourView);
                return obj;
            });
        }
        mesh_3.loadLWObjectFile = loadLWObjectFile;
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeColourBlendingDescriptor() {
            return {
                enabled: false,
                rgbBlendOp: 0,
                alphaBlendOp: 0,
                sourceRGBFactor: 1,
                sourceAlphaFactor: 1,
                destRGBFactor: 0,
                destAlphaFactor: 0
            };
        }
        render.makeColourBlendingDescriptor = makeColourBlendingDescriptor;
        function makeColourWriteMask() {
            return {
                red: true,
                green: true,
                blue: true,
                alpha: true
            };
        }
        render.makeColourWriteMask = makeColourWriteMask;
        function makePipelineDescriptor() {
            var cpf = [];
            for (var k = 0; k < 8; ++k) {
                cpf.push(0);
            }
            Object.seal(cpf);
            return {
                colourPixelFormats: cpf,
                depthPixelFormat: 0,
                stencilPixelFormat: 0,
                writeMask: makeColourWriteMask(),
                blending: makeColourBlendingDescriptor(),
                vertexShader: null,
                fragmentShader: null
            };
        }
        render.makePipelineDescriptor = makePipelineDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function glBlendEqForBlendOperation(rc, op) {
            switch (op) {
                case 0: return rc.gl.FUNC_ADD;
                case 1: return rc.gl.FUNC_SUBTRACT;
                case 2: rc.gl.FUNC_REVERSE_SUBTRACT;
                case 3: return rc.extMinMax ? rc.extMinMax.MIN_EXT : rc.gl.FUNC_SUBTRACT;
                case 4: return rc.extMinMax ? rc.extMinMax.MAX_EXT : rc.gl.FUNC_ADD;
            }
        }
        function glBlendFuncForBlendFactor(rc, factor) {
            switch (factor) {
                case 0: return rc.gl.ZERO;
                case 1: return rc.gl.ONE;
                case 2: return rc.gl.SRC_COLOR;
                case 3: rc.gl.ONE_MINUS_SRC_COLOR;
                case 4: return rc.gl.DST_COLOR;
                case 5: return rc.gl.ONE_MINUS_DST_COLOR;
                case 6: return rc.gl.SRC_ALPHA;
                case 7: return rc.gl.ONE_MINUS_SRC_ALPHA;
                case 8: return rc.gl.SRC_ALPHA_SATURATE;
                case 9: return rc.gl.DST_ALPHA;
                case 10: return rc.gl.ONE_MINUS_DST_ALPHA;
                case 11: return rc.gl.CONSTANT_COLOR;
                case 12: return rc.gl.ONE_MINUS_CONSTANT_COLOR;
                case 13: return rc.gl.CONSTANT_ALPHA;
                case 14: return rc.gl.ONE_MINUS_CONSTANT_ALPHA;
            }
        }
        var Pipeline = (function () {
            function Pipeline(rc, desc) {
                this.rc = rc;
                this.colourPixelFormats_ = desc.colourPixelFormats.slice(0);
                this.depthPixelFormat_ = desc.depthPixelFormat;
                this.stencilPixelFormat_ = desc.stencilPixelFormat;
                this.writeMask_ = cloneStruct(desc.writeMask);
                this.blending_ = cloneStruct(desc.blending);
                if (this.writeMask_.red && this.writeMask_.green && this.writeMask_.blue && this.writeMask_.alpha) {
                    this.writeMask_ = null;
                }
                var highestEnabledAttachment = -1;
                this.colourPixelFormats_.slice(1).forEach(function (pf, ix) {
                    if (pf != 0)
                        highestEnabledAttachment = ix;
                });
                if (highestEnabledAttachment >= render.maxColourAttachments(rc)) {
                    assert(rc.extDrawBuffers, "This GL only supports up to " + render.maxColourAttachments(rc) + " attachment(s)");
                }
                var gl = rc.gl;
                this.program_ = gl.createProgram();
                if (desc.vertexShader)
                    gl.attachShader(this.program_, desc.vertexShader);
                if (desc.fragmentShader)
                    gl.attachShader(this.program_, desc.fragmentShader);
                gl.linkProgram(this.program_);
                if (!gl.getProgramParameter(this.program_, gl.LINK_STATUS)) {
                    var errorLog = gl.getProgramInfoLog(this.program_);
                    console.error("Program link failed:", errorLog);
                    assert(false, "bad program");
                }
            }
            Pipeline.prototype.bind = function () {
                var gl = this.rc.gl;
                gl.useProgram(this.program_);
                if (this.writeMask_)
                    gl.colorMask(this.writeMask_.red, this.writeMask_.green, this.writeMask_.blue, this.writeMask_.alpha);
                if (this.blending_.enabled) {
                    gl.enable(gl.BLEND);
                    var rgbEq = glBlendEqForBlendOperation(this.rc, this.blending_.rgbBlendOp);
                    var alphaEq = glBlendEqForBlendOperation(this.rc, this.blending_.alphaBlendOp);
                    gl.blendEquationSeparate(rgbEq, alphaEq);
                    var rgbSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceRGBFactor);
                    var alphaSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceAlphaFactor);
                    var rgbDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destRGBFactor);
                    var alphaDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destAlphaFactor);
                    gl.blendFuncSeparate(rgbSrcFn, rgbDestFn, alphaSrcFn, alphaDestFn);
                }
            };
            Pipeline.prototype.unbind = function () {
                var gl = this.rc.gl;
                gl.useProgram(null);
                if (this.writeMask_)
                    gl.colorMask(true, true, true, true);
                if (this.blending_.enabled) {
                    gl.disable(gl.BLEND);
                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFunc(gl.ONE, gl.ZERO);
                }
            };
            Pipeline.prototype.colourPixelFormats = function () { return this.colourPixelFormats_.slice(0); };
            Pipeline.prototype.depthPixelFormat = function () { return this.depthPixelFormat_; };
            Pipeline.prototype.stencilPixelFormat = function () { return this.stencilPixelFormat_; };
            Pipeline.prototype.program = function () { return this.program_; };
            return Pipeline;
        })();
        render.Pipeline = Pipeline;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeScissorRect() {
            return {
                originX: 0,
                originY: 0,
                width: 32768,
                height: 32768
            };
        }
        render.makeScissorRect = makeScissorRect;
        function makeViewport() {
            return {
                originX: 0,
                originY: 0,
                width: 0,
                height: 0,
                nearZ: 0,
                farZ: 1
            };
        }
        render.makeViewport = makeViewport;
        function makeDepthStencilTestDescriptor() {
            return {
                depthTest: 1
            };
        }
        render.makeDepthStencilTestDescriptor = makeDepthStencilTestDescriptor;
        function makeRenderPassDescriptor() {
            return {
                clearMask: 7,
                clearColour: [0, 0, 0, 1],
                clearDepth: 1.0,
                clearStencil: 0
            };
        }
        render.makeRenderPassDescriptor = makeRenderPassDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var DepthStencilTest = (function () {
            function DepthStencilTest(rc, desc) {
                this.rc = rc;
                this.depthTestEnabled_ = desc.depthTest != 0;
                switch (desc.depthTest) {
                    case 1:
                        this.depthFunc_ = rc.gl.ALWAYS;
                        break;
                    case 2:
                        this.depthFunc_ = rc.gl.NEVER;
                        break;
                    case 3:
                        this.depthFunc_ = rc.gl.LESS;
                        break;
                    case 4:
                        this.depthFunc_ = rc.gl.LEQUAL;
                        break;
                    case 5:
                        this.depthFunc_ = rc.gl.EQUAL;
                        break;
                    case 6:
                        this.depthFunc_ = rc.gl.NOTEQUAL;
                        break;
                    case 7:
                        this.depthFunc_ = rc.gl.GEQUAL;
                        break;
                    case 8:
                        this.depthFunc_ = rc.gl.GREATER;
                        break;
                    default:
                        this.depthFunc_ = rc.gl.NONE;
                        break;
                }
            }
            DepthStencilTest.prototype.apply = function () {
                if (this.depthTestEnabled_) {
                    this.rc.gl.enable(this.rc.gl.DEPTH_TEST);
                    this.rc.gl.depthFunc(this.depthFunc_);
                }
                else {
                    this.rc.gl.disable(this.rc.gl.DEPTH_TEST);
                }
            };
            return DepthStencilTest;
        })();
        render.DepthStencilTest = DepthStencilTest;
        var RenderPass = (function () {
            function RenderPass(rc, desc_, frameBuffer_) {
                this.rc = rc;
                this.desc_ = desc_;
                this.frameBuffer_ = frameBuffer_;
                this.pipeline_ = null;
                assert(desc_.clearColour.length >= 4);
            }
            RenderPass.prototype.setup = function () {
                var gl = this.rc.gl;
                this.frameBuffer_.bind();
                var glClearMask = 0;
                if (this.desc_.clearMask & 1) {
                    gl.clearColor(this.desc_.clearColour[0], this.desc_.clearColour[1], this.desc_.clearColour[2], this.desc_.clearColour[3]);
                    glClearMask |= gl.COLOR_BUFFER_BIT;
                }
                if (this.desc_.clearMask & 2) {
                    gl.clearDepth(this.desc_.clearDepth);
                    glClearMask |= gl.DEPTH_BUFFER_BIT;
                }
                if (this.desc_.clearMask & 4) {
                    gl.clearStencil(this.desc_.clearStencil);
                    glClearMask |= gl.STENCIL_BUFFER_BIT;
                }
                if (glClearMask) {
                    gl.clear(glClearMask);
                }
            };
            RenderPass.prototype.teardown = function () {
                if (this.pipeline_) {
                    this.pipeline_.unbind();
                    this.pipeline_ = null;
                }
                this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, null);
            };
            RenderPass.prototype.frameBuffer = function () { return this.frameBuffer_; };
            RenderPass.prototype.setPipeline = function (pipeline) {
                if (pipeline === this.pipeline_)
                    return;
                if (this.pipeline_)
                    this.pipeline_.unbind();
                this.pipeline_ = pipeline;
                if (this.pipeline_) {
                    this.pipeline_.bind();
                }
            };
            RenderPass.prototype.setDepthStencilTest = function (dst) {
                dst.apply();
            };
            RenderPass.prototype.setFaceCulling = function (faceCulling) {
                if (faceCulling == 0) {
                    this.rc.gl.disable(this.rc.gl.CULL_FACE);
                }
                else {
                    this.rc.gl.enable(this.rc.gl.CULL_FACE);
                    var mode = (faceCulling == 2) ? this.rc.gl.BACK : this.rc.gl.FRONT;
                    this.rc.gl.cullFace(mode);
                }
            };
            RenderPass.prototype.setFrontFaceWinding = function (winding) {
                var mode = (winding == 0) ? this.rc.gl.CW : this.rc.gl.CCW;
                this.rc.gl.frontFace(mode);
            };
            RenderPass.prototype.setViewPort = function (viewport) {
                this.rc.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
                this.rc.gl.depthRange(viewport.nearZ, viewport.farZ);
            };
            RenderPass.prototype.setScissorRect = function (rect) {
                this.rc.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);
                if (rect.originX > 0 || rect.originY > 0 || rect.width < this.frameBuffer_.width() || rect.height < this.frameBuffer_.height())
                    this.rc.gl.enable(this.rc.gl.SCISSOR_TEST);
                else
                    this.rc.gl.disable(this.rc.gl.SCISSOR_TEST);
            };
            RenderPass.prototype.setConstantBlendColour = function (colour4) {
                assert(colour4.length >= 4);
                this.rc.gl.blendColor(colour4[0], colour4[1], colour4[2], colour4[3]);
            };
            RenderPass.prototype.drawIndexedPrimitives = function (startIndex, indexCount) {
            };
            return RenderPass;
        })();
        render.RenderPass = RenderPass;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var SoundManager = (function () {
    function SoundManager() {
        this.context = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
        assert(this.context, "No sound");
    }
    SoundManager.prototype.loadSoundFile = function (filePath) {
        var _this = this;
        return loadFile(filePath, {
            responseType: FileLoadType.ArrayBuffer
        }).then(function (data) {
            return new Promise(function (resolve, reject) {
                _this.context.decodeAudioData(data, function (audioData) {
                    resolve(audioData);
                }, function () {
                    assert(false, "Audio file not found: " + filePath);
                    reject("file not found");
                });
            });
        });
    };
    return SoundManager;
})();
var sd;
(function (sd) {
    var model;
    (function (model) {
        var StandardShader = (function () {
            function StandardShader(gl_, materialMgr_) {
                this.gl_ = gl_;
                this.materialMgr_ = materialMgr_;
            }
            StandardShader.prototype.makeShader = function (type, sourceText) {
                var shader = this.gl_.createShader(type);
                this.gl_.shaderSource(shader, sourceText);
                this.gl_.compileShader(shader);
                if (!this.gl_.getShaderParameter(shader, this.gl_.COMPILE_STATUS)) {
                    var errorLog = this.gl_.getShaderInfoLog(shader);
                    alert("COMPILE FAILED\n\n" + errorLog);
                    console.error("Shader compilation failed:", errorLog);
                    console.error("Source", sourceText);
                    assert(false, "bad shader");
                }
                return shader;
            };
            StandardShader.prototype.programForFeatures = function (feat) {
                var gl = this.gl_;
                var vertexSource = this.vertexShaderSource(feat);
                var fragmentSource = this.fragmentShaderSource(feat);
                var vertexShader = this.makeShader(gl.VERTEX_SHADER, vertexSource);
                var fragmentShader = this.makeShader(gl.FRAGMENT_SHADER, fragmentSource);
                var program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    var errorLog = gl.getProgramInfoLog(program);
                    alert("LINK FAILED\n\n" + errorLog);
                    console.error("Program link failed:", errorLog);
                    console.error("Vertex Source", vertexSource);
                    console.error("Fragment Source", fragmentSource);
                    assert(false, "bad program");
                }
                gl.useProgram(program);
                program.vertexPositionAttribute = gl.getAttribLocation(program, "vertexPos_model");
                program.vertexNormalAttribute = gl.getAttribLocation(program, "vertexNormal");
                program.vertexColorAttribute = gl.getAttribLocation(program, "vertexColor");
                program.vertexUVAttribute = gl.getAttribLocation(program, "vertexUV");
                program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
                program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
                program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
                program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");
                program.ambientSunFactorUniform = gl.getUniformLocation(program, "ambientSunFactor");
                program.textureUniform = gl.getUniformLocation(program, "albedoSampler");
                gl.useProgram(null);
                return program;
            };
            StandardShader.prototype.vertexShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f)
                    source.push(s); };
                var if_any = function (s, f) { if ((feat & f) != 0)
                    source.push(s); };
                line("attribute vec3 vertexPos_model;");
                line("attribute vec3 vertexNormal;");
                if_all("attribute vec2 vertexUV;", 2);
                if_all("attribute vec3 vertexColor;", 4);
                line("varying vec3 vertexNormal_intp;");
                if_all("varying vec3 vertexPos_cam_intp;", 8);
                if_all("varying vec2 vertexUV_intp;", 2);
                if_all("varying vec3 vertexColor_intp;", 4);
                line("uniform mat4 modelViewProjectionMatrix;");
                if_all("uniform mat4 modelViewMatrix;", 8);
                line("uniform mat3 normalMatrix;");
                line("void main() {");
                line("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
                line("	vertexNormal_intp = normalize(normalMatrix * vertexNormal);");
                if_all("	vertexPos_cam_intp = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;", 8);
                if_all("	vertexUV_intp = vertexUV;", 2);
                if_all("	vertexColor_intp = vertexColor;", 4);
                line("}");
                return source.join("\n") + "\n";
            };
            StandardShader.prototype.fragmentShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f)
                    source.push(s); };
                var if_any = function (s, f) { if ((feat & f) != 0)
                    source.push(s); };
                line("precision highp float;");
                line("varying vec3 vertexNormal_intp;");
                if_all("varying vec3 vertexPos_cam_intp;", 8);
                if_all("varying vec2 vertexUV_intp;", 2);
                if_all("varying vec3 vertexColor_intp;", 4);
                line("uniform mat3 lightNormalMatrix;");
                line("uniform float ambientSunFactor;");
                if_all("uniform sampler2D albedoSampler;", 16);
                line("const vec3 sunlightColor = vec3(1, 1, 1);");
                line("void main() {");
                line("	vec3 lightDirection = normalize(vec3(.8, .7, .4));");
                line("	vec3 normal = normalize(vertexNormal_intp);");
                line("	vec3 lightVec = normalize(lightNormalMatrix * lightDirection);");
                if (feat & 8) {
                    line("	vec3 viewVec = normalize(-vertexPos_cam_intp);");
                    line("	vec3 reflectVec = reflect(-lightVec, normal);");
                    line("	float spec = max(dot(reflectVec, viewVec), 0.0);");
                    line("	spec = pow(spec, 8.0); // shininess");
                    line("	vec3 specContrib = sunlightColor * spec;");
                }
                if ((feat & (2 | 16)) == (2 | 16)) {
                    line("	vec3 lightColor = sunlightColor * max(ambientSunFactor, dot(lightVec, normal));");
                    line("	vec3 texColor = texture2D(albedoSampler, vertexUV_intp).xyz;");
                    line("	vec3 outColor = lightColor * texColor;");
                }
                else if (feat & 4) {
                    line("	vec3 diffColor = (sunlightColor * 0.1) + (vertexColor_intp * 0.9);");
                    line("	vec3 outColor = diffColor * (ambientSunFactor + 0.5 * dot(lightVec, normal));");
                }
                else {
                    line("	vec3 outColor = vec3(0.0, 1.0, 0.0);");
                }
                if (feat & 8) {
                    line("	outColor = outColor + specContrib;");
                }
                line("	gl_FragColor = vec4(outColor, 1.0);");
                line("}");
                return source.join("\n") + "\n";
            };
            return StandardShader;
        })();
        model.StandardShader = StandardShader;
    })(model = sd.model || (sd.model = {}));
})(sd || (sd = {}));
