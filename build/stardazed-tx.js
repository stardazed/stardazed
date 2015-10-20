// core.ts - Basic type and DOM helpers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="../defs/es6-promise.d.ts" />
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
// game - general purpose game-related stuff
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="core.ts" />
function intRandom(maximum) {
    return (Math.random() * (maximum + 1)) << 0;
}
function intRandomRange(minimum, maximum) {
    var diff = (maximum - minimum) << 0;
    return minimum + intRandom(diff);
}
function deg2rad(deg) {
    return deg * Math.PI / 180.0;
}
function rad2deg(rad) {
    return rad * 180.0 / Math.PI;
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function clamp01(n) {
    return Math.max(0.0, Math.min(1.0, n));
}
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
var Key;
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
})(Key || (Key = {}));
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
        return this.keys[kc] && this.keys[kc].down;
    };
    return Keyboard;
})();
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
// numeric.ts - numeric types, traits and array helpers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
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
        // this function returns an overloaded function that mimics the TypedArrayConstructor new interface
        // so you use it like:     makeTypedArray(UInt16)(...);
        // which is equivalent to: new (UInt16.arrayType)(...);
        // use whichever feels better
        var makeFn = function newArray(src, byteOffset, length) {
            return new (nt.arrayType)(src, byteOffset, length);
        };
        return makeFn;
    }
    sd.makeTypedArray = makeTypedArray;
})(sd || (sd = {}));
// mesh.ts - mesh data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />
/// <reference path="core.ts" />
/// <reference path="game.ts" />
/// <reference path="numeric.ts" />
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
            function VertexBufferAttributeView(vertexBuffer_, attr) {
                this.vertexBuffer_ = vertexBuffer_;
                this.stride_ = this.vertexBuffer_.layout().vertexSizeBytes();
                this.attrOffset_ = attr.offset;
                this.attrElementCount_ = vertexFieldElementCount(attr.field);
                this.typedViewCtor_ = vertexFieldNumericType(attr.field).arrayType;
                this.buffer_ = this.vertexBuffer_.buffer();
            }
            VertexBufferAttributeView.prototype.forEach = function (callback) {
                var max = this.count();
                for (var ix = 0; ix < max; ++ix) {
                    callback(this.item(ix));
                }
            };
            VertexBufferAttributeView.prototype.item = function (index) {
                var offsetBytes = (this.stride_ * index) + this.attrOffset_;
                return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
            };
            VertexBufferAttributeView.prototype.count = function () {
                return this.vertexBuffer_.itemCount();
            };
            VertexBufferAttributeView.prototype.vertexBuffer = function () {
                return this.vertexBuffer_;
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
// mesh-gen.ts - mesh generators
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="mesh.ts" />
var sd;
(function (sd) {
    var mesh;
    (function (mesh_1) {
        var gen;
        (function (gen) {
            var MeshGenerator = (function () {
                function MeshGenerator() {
                }
                MeshGenerator.prototype.generate = function (attrList) {
                    if (!attrList)
                        attrList = mesh_1.AttrList.Pos3Norm3UV2();
                    var vtxCount = this.vertexCount();
                    var mesh = new mesh_1.MeshData(attrList);
                    var vertexBuffer = mesh.primaryVertexBuffer();
                    vertexBuffer.allocate(vtxCount);
                    var indexElementType = mesh_1.minimumIndexElementTypeForVertexCount(vtxCount);
                    mesh.indexBuffer.allocate(3, indexElementType, this.faceCount());
                    var posView = new mesh_1.VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(1));
                    var texAttr = vertexBuffer.attrByRole(5);
                    var texView = texAttr ? new mesh_1.VertexBufferAttributeView(vertexBuffer, texAttr) : null;
                    var triView = new mesh_1.IndexBufferTriangleView(mesh.indexBuffer);
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
                    console.info("vix " + vix);
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
                    this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
                    this.sliceTo_ = clamp01(desc.sliceTo || 1.0);
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
        })(gen = mesh_1.gen || (mesh_1.gen = {}));
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
// mesh-lwo.ts - Lightwave OBJ mesh file import
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="core.ts" />
/// <reference path="mesh.ts" />
var sd;
(function (sd) {
    var mesh;
    (function (mesh_2) {
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
            var mesh = new mesh_2.MeshData(mesh_2.AttrList.Pos3Norm3Colour3UV2());
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
            posView = new mesh_2.VertexBufferAttributeView(vb, vb.attrByRole(1));
            normView = new mesh_2.VertexBufferAttributeView(vb, vb.attrByRole(2));
            uvView = new mesh_2.VertexBufferAttributeView(vb, vb.attrByRole(5));
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
                var colourView = new mesh_2.VertexBufferAttributeView(obj.mesh.primaryVertexBuffer(), colourAttr);
                genColorEntriesFromDrawGroups(obj.drawGroups, materials, colourView);
                return obj;
            });
        }
        mesh_2.loadLWObjectFile = loadLWObjectFile;
    })(mesh = sd.mesh || (sd.mesh = {}));
})(sd || (sd = {}));
// sound - Web SoundManager
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="game.ts" />
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
// transform.ts - entities transform state
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="mesh.ts" />
var sd;
(function (sd) {
    var scene;
    (function (scene) {
        var TransformManager = (function () {
            function TransformManager() {
                this.scaleMat = mat4.create();
                this.rotMat = mat4.create();
                this.transMat = mat4.create();
                this.modelMatrix = mat4.create();
                this.modelViewMatrix = mat4.create();
                this.normalMatrix = mat3.create();
            }
            TransformManager.prototype.setUniformScale = function (s) {
                mat4.fromScaling(this.scaleMat, [s, s, s]);
            };
            TransformManager.prototype.setScale = function (sx, sy, sz) {
                mat4.fromScaling(this.scaleMat, [sx, sy, sz]);
            };
            TransformManager.prototype.setPosition = function (v3OrX, y, z) {
                var v3;
                if (typeof v3OrX === "number")
                    v3 = [v3OrX, y, z];
                else
                    v3 = v3OrX;
                mat4.fromTranslation(this.transMat, v3);
            };
            TransformManager.prototype.setRotation = function (axis, angle) {
                mat4.fromRotation(this.rotMat, angle, axis);
            };
            return TransformManager;
        })();
    })(scene = sd.scene || (sd.scene = {}));
})(sd || (sd = {}));
