// core.ts - Basic type and DOM helpers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="../defs/es6-promise.d.ts" />
function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg || "assertion failed");
    }
}
var sd;
(function (sd) {
    var NumericLimitsConstructor = (function () {
        function NumericLimitsConstructor() {
            this.UInt8 = { min: 0, max: 255 };
            this.UInt16 = { min: 0, max: 65535 };
            this.UInt32 = { min: 0, max: 4294967295 };
            this.SInt8 = { min: -128, max: 127 };
            this.SInt16 = { min: -32768, max: 32767 };
            this.SInt32 = { min: -2147483648, max: 2147483647 };
            this.Float = { min: -340282346638528859811704183484516925440.0, max: 340282346638528859811704183484516925440.0 };
            this.Double = {
                min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
                max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0
            };
        }
        return NumericLimitsConstructor;
    })();
    sd.NumericLimitsConstructor = NumericLimitsConstructor;
    sd.NumericLimits = new NumericLimitsConstructor();
    Object.freeze(sd.NumericLimits);
})(sd || (sd = {}));
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
            _this.keys[evt.keyCode] = true;
            if (!evt.metaKey)
                evt.preventDefault();
        });
        on(window, "keyup", function (evt) {
            _this.keys[evt.keyCode] = false;
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
        return this.keys[kc] === true;
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
// 3d - 3d structures, files, generators
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />
/// <reference path="core.ts" />
/// <reference path="game.ts" />
var TriMesh = (function () {
    function TriMesh(vertexArray, normalArray, colorArray, uvArray) {
        assert(vertexArray.length % 9 == 0, "vertex array must be a triangle soup");
        if (normalArray)
            assert(normalArray.length == vertexArray.length, "normal array must be same size as vertex array");
        if (colorArray)
            assert(colorArray.length == vertexArray.length, "color array must be same size as vertex array");
        if (uvArray)
            assert((uvArray.length / 2) == (vertexArray.length / 3), "each vertex needs a uv");
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = normalArray ? gl.createBuffer() : null;
        this.colorBuffer = colorArray ? gl.createBuffer() : null;
        this.uvBuffer = uvArray ? gl.createBuffer() : null;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
        if (this.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);
        }
        if (this.colorBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
        }
        if (this.uvBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvArray), gl.STATIC_DRAW);
        }
        this.indexCount = vertexArray.length / 3;
    }
    TriMesh.prototype.draw = function (program, texture) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(program.vertexPositionAttribute);
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        if (program.vertexColorAttribute > -1) {
            if (this.colorBuffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
                gl.enableVertexAttribArray(program.vertexColorAttribute);
                gl.vertexAttribPointer(program.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
            }
            else {
                gl.disableVertexAttribArray(program.vertexColorAttribute);
            }
        }
        if (program.vertexNormalAttribute > -1) {
            if (this.normalBuffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
                gl.enableVertexAttribArray(program.vertexNormalAttribute);
                gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            }
            else {
                gl.disableVertexAttribArray(program.vertexNormalAttribute);
            }
        }
        if (program.vertexUVAttribute > -1) {
            if (this.uvBuffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
                gl.enableVertexAttribArray(program.vertexUVAttribute);
                gl.vertexAttribPointer(program.vertexUVAttribute, 2, gl.FLOAT, false, 0, 0);
            }
            else {
                gl.disableVertexAttribArray(program.vertexUVAttribute);
            }
        }
        if (texture && program.textureUniform) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(program.textureUniform, 0);
        }
        gl.drawArrays(gl.TRIANGLES, 0, this.indexCount);
        if (texture && program.textureUniform) {
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    };
    ;
    return TriMesh;
})();
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
function genColorArrayFromDrawGroups(drawGroups, materials) {
    var lastGroup = drawGroups[drawGroups.length - 1];
    var totalIndexes = lastGroup.indexCount + lastGroup.fromIndex;
    var colors = new Float32Array(totalIndexes);
    drawGroups.forEach(function (group) {
        var curIndex = group.fromIndex;
        var maxIndex = group.fromIndex + group.indexCount;
        var mat = materials[group.materialName];
        assert(mat, "material " + group.materialName + " not found");
        while (curIndex < maxIndex) {
            colors[curIndex] = mat.diffuseColor[0];
            colors[curIndex + 1] = mat.diffuseColor[1];
            colors[curIndex + 2] = mat.diffuseColor[2];
            curIndex += 3;
        }
    });
    return colors;
}
function parseLWObjectSource(text) {
    var t0 = performance.now();
    var lines = text.split("\n");
    var vv = [], nn = [], tt = [];
    var vertexes = [], normals = [], uvs = [];
    var mtlFileName = "";
    var materialGroups = [];
    var curMaterialGroup = null;
    function vtx(vx, tx, nx) {
        assert(vx < vv.length, "vx out of bounds " + vx);
        assert(nx < nn.length, "nx out of bounds " + nx);
        var v = vv[vx], n = nn[nx], t = tx > -1 ? tt[tx] : null;
        vertexes.push(v[0], v[1], v[2]);
        normals.push(n[0], n[1], n[2]);
        if (t) {
            assert(tx < tt.length, "tx out of bounds " + tx);
            uvs.push(t[0], t[1]);
        }
    }
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
                    curMaterialGroup.indexCount = vertexes.length - curMaterialGroup.fromIndex;
                }
                curMaterialGroup = {
                    materialName: tokens[1],
                    fromIndex: vertexes.length,
                    indexCount: 0
                };
                materialGroups.push(curMaterialGroup);
                break;
            default: break;
        }
    });
    if (curMaterialGroup) {
        curMaterialGroup.indexCount = vertexes.length - curMaterialGroup.fromIndex;
    }
    var t1 = performance.now();
    return {
        mtlFileName: mtlFileName,
        elementCount: vertexes.length / 3,
        vertexes: vertexes,
        normals: normals,
        uvs: uvs.length ? uvs : null,
        drawGroups: materialGroups
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
        obj.colors = genColorArrayFromDrawGroups(obj.drawGroups, materials);
        return obj;
    });
}
// mesh.ts - mesh data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />
/// <reference path="core.ts" />
/// <reference path="game.ts" />
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
        function vertexFieldElementSizeBytes(vf) {
            switch (vf) {
                case 0:
                    return 0;
                case 21:
                case 22:
                case 23:
                case 24:
                case 13:
                case 17:
                case 14:
                case 18:
                case 15:
                case 19:
                case 16:
                case 20:
                    return 4;
                case 7:
                case 135:
                case 10:
                case 138:
                case 8:
                case 136:
                case 11:
                case 139:
                case 9:
                case 137:
                case 12:
                case 140:
                    return 2;
                case 1:
                case 129:
                case 4:
                case 132:
                case 2:
                case 130:
                case 5:
                case 133:
                case 3:
                case 131:
                case 6:
                case 134:
                    return 1;
            }
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
        var VertexAttribute = (function () {
            function VertexAttribute() {
                this.field = 0;
                this.role = 0;
            }
            return VertexAttribute;
        })();
        mesh.VertexAttribute = VertexAttribute;
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
            function Pos3Norm3UV2() {
                return [attrPosition3(), attrNormal3(), attrUV2()];
            }
            AttrList.Pos3Norm3UV2 = Pos3Norm3UV2;
            function Pos3Norm3UV2Tan4() {
                return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent4()];
            }
            AttrList.Pos3Norm3UV2Tan4 = Pos3Norm3UV2Tan4;
        })(AttrList || (AttrList = {}));
        var PositionedAttribute = (function (_super) {
            __extends(PositionedAttribute, _super);
            function PositionedAttribute(fieldOrAttr, roleOrOffset, offset) {
                _super.call(this);
                if (fieldOrAttr instanceof VertexAttribute) {
                    this.field = fieldOrAttr.field;
                    this.role = fieldOrAttr.role;
                    this.offset = roleOrOffset;
                }
                else {
                    this.field = fieldOrAttr;
                    this.role = roleOrOffset;
                    this.offset = offset;
                }
            }
            return PositionedAttribute;
        })(VertexAttribute);
        mesh.PositionedAttribute = PositionedAttribute;
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
                    return new PositionedAttribute(attr, alignedOffset);
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
        function indexElementTypeSizeBytes(iet) {
            switch (iet) {
                case 0: return Uint8Array.BYTES_PER_ELEMENT;
                case 1: return Uint16Array.BYTES_PER_ELEMENT;
                case 2: return Uint32Array.BYTES_PER_ELEMENT;
            }
        }
        mesh.indexElementTypeSizeBytes = indexElementTypeSizeBytes;
        function minimumIndexElementTypeForVertexCount(vertexCount) {
            if (vertexCount <= sd.NumericLimits.UInt8.max)
                return 0;
            if (vertexCount <= sd.NumericLimits.UInt16.max)
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
            IndexBuffer.prototype.typedBasePtr = function (baseIndexNr) {
                var offsetBytes = this.indexElementSizeBytes() * baseIndexNr;
                if (this.indexElementType() == 2) {
                    return new Uint32Array(this.storage_, offsetBytes);
                }
                else if (this.indexElementType() == 1) {
                    return new Uint16Array(this.storage_, offsetBytes);
                }
                else {
                    return new Uint8Array(this.storage_, offsetBytes);
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
                var typedBasePtr = this.typedBasePtr(indexNr);
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
                var typedBasePtr = this.typedBasePtr(indexNr);
                typedBasePtr[0] = newValue;
            };
            return IndexBuffer;
        })();
        var MeshGenerator = (function () {
            function MeshGenerator() {
            }
            MeshGenerator.prototype.generateInto = function (positions, faces, uvs) {
                if (uvs === void 0) { uvs = null; }
                var posIx = 0, faceIx = 0, uvIx = 0;
                var pos = function (x, y, z) {
                    positions[posIx] = x;
                    positions[posIx + 1] = y;
                    positions[posIx + 2] = z;
                    posIx += 3;
                };
                var face = function (a, b, c) {
                    faces[faceIx] = a;
                    faces[faceIx + 1] = b;
                    faces[faceIx + 2] = c;
                    faceIx += 3;
                };
                var uv = uvs ?
                    function (u, v) {
                        uvs[uvIx] = u;
                        uvs[uvIx + 1] = v;
                        uvIx += 2;
                    }
                    : function (u, v) { };
                this.generateImpl(pos, face, uv);
            };
            return MeshGenerator;
        })();
        mesh.MeshGenerator = MeshGenerator;
        var Sphere = (function (_super) {
            __extends(Sphere, _super);
            function Sphere(radius_, rows_, segs_, sliceFrom_, sliceTo_) {
                if (radius_ === void 0) { radius_ = 1.0; }
                if (rows_ === void 0) { rows_ = 20; }
                if (segs_ === void 0) { segs_ = 30; }
                if (sliceFrom_ === void 0) { sliceFrom_ = 0.0; }
                if (sliceTo_ === void 0) { sliceTo_ = 1.0; }
                _super.call(this);
                this.radius_ = radius_;
                this.rows_ = rows_;
                this.segs_ = segs_;
                this.sliceFrom_ = sliceFrom_;
                this.sliceTo_ = sliceTo_;
                assert(this.rows_ >= 2);
                assert(this.segs_ >= 4);
                assert(this.sliceTo_ > this.sliceFrom_);
            }
            Sphere.prototype.hasTopDisc = function () { return this.sliceFrom_ == 0; };
            Sphere.prototype.hasBottomDisc = function () { return this.sliceTo_ == 1; };
            Sphere.prototype.vertexCount = function () {
                var vc = this.segs_ * (this.rows_ - 1);
                if (this.hasTopDisc())
                    ++vc;
                if (this.hasBottomDisc())
                    ++vc;
                return vc;
            };
            Sphere.prototype.faceCount = function () {
                var fc = 2 * this.segs_ * this.rows_;
                if (this.hasTopDisc())
                    fc -= this.segs_;
                if (this.hasBottomDisc())
                    fc -= this.segs_;
                return fc;
            };
            Sphere.prototype.generateImpl = function (position, face, uv) {
                var Pi = Math.PI;
                var Tau = Math.PI * 2;
                var slice = this.sliceTo_ - this.sliceFrom_;
                var piFrom = this.sliceFrom_ * Pi;
                var piSlice = slice * Pi;
                var halfPiSlice = slice / 2;
                var vix = 0;
                for (var row = 0; row <= this.rows_; ++row) {
                    var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                    var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                    var texV = Math.sin(piFrom + (halfPiSlice / this.rows_) * row);
                    if ((this.hasTopDisc() && row == 0) ||
                        (this.hasBottomDisc() && row == this.rows_)) {
                        position(0, y, 0);
                        uv(0.5, texV);
                        ++vix;
                    }
                    else {
                        for (var seg = 0; seg < this.segs_; ++seg) {
                            var x = Math.sin((Tau / this.segs_) * seg) * segRad;
                            var z = Math.cos((Tau / this.segs_) * seg) * segRad;
                            var texU = Math.sin(((Pi / 2) / this.rows_) * row);
                            position(x, y, z);
                            uv(texU, texV);
                            ++vix;
                        }
                    }
                    if (row > 0) {
                        var raix = vix;
                        var rbix = vix;
                        var ramul, rbmul;
                        if (this.hasTopDisc() && row == 1) {
                            raix -= this.segs_ + 1;
                            rbix -= this.segs_;
                            ramul = 0;
                            rbmul = 1;
                        }
                        else if (this.hasBottomDisc() && row == this.rows_) {
                            raix -= this.segs_ + 1;
                            rbix -= 1;
                            ramul = 1;
                            rbmul = 0;
                        }
                        else {
                            raix -= this.segs_ * 2;
                            rbix -= this.segs_;
                            ramul = 1;
                            rbmul = 1;
                        }
                        for (var seg = 0; seg < this.segs_; ++seg) {
                            var ral = ramul * seg, rar = ramul * ((seg + 1) % this.segs_), rbl = rbmul * seg, rbr = rbmul * ((seg + 1) % this.segs_);
                            if (ral != rar)
                                face(raix + ral, rbix + rbl, raix + rar);
                            if (rbl != rbr)
                                face(raix + rar, rbix + rbl, rbix + rbr);
                        }
                    }
                }
            };
            return Sphere;
        })(MeshGenerator);
        mesh.Sphere = Sphere;
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
//# sourceMappingURL=stardazed-tx.js.map