// libzmgame - general purpose game-related stuff
// requires libzm
// (c) 2015 by Arthur Langereis - @zenmumbler
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
})(Key || (Key = {}));
;
(function () {
    var A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0);
    for (var cc = A; cc <= Z; ++cc) {
        Key[String.fromCharCode(cc)] = cc;
    }
    var zero = '0'.charCodeAt(0), nine = '9'.charCodeAt(0);
    for (var cc = zero; cc <= nine; ++cc) {
        Key[String.fromCharCode(cc)] = cc;
    }
}());
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
var TMXData = (function () {
    function TMXData() {
        this.layers = [];
    }
    TMXData.prototype.load = function (filePath) {
        var _this = this;
        return loadFile(filePath, {
            tryBreakCache: true,
            xml: true,
            mimeType: "application/xml"
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
                if (node.nodeName == "layer")
                    _this.layers.push(new TMXLayer(node));
            }
            return _this;
        });
    };
    ;
    return TMXData;
})();
//# sourceMappingURL=libzmgame.js.map