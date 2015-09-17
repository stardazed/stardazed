// libzmgame.js - general purpose game-related stuff
// requires libzm.js
// (c) 2015 by Arthur Langereis - @zenmumbler


// -- Numbers

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


// -- Images

function loadImage(src) {
	return new Promise(function(resolve,reject) {
		var image = new Image();
		image.onload = function() { resolve(image); };
		image.onerror = function() { reject(src + " doesn't exist"); };
		image.src = src;
	});
}


function imageData(image) {
	assert(img instanceof Image);

	var cvs = document.createElement("canvas");
	cvs.width = image.width;
	cvs.height = image.height;
	var tc = cvs.getContext("2d");
	tc.drawImage(image, 0, 0);

	return tc.getImageData(0,0, image.width, image.height);
}


function loadImageData(src) {
	return loadImage(src).then(function(image) {
		return imageData(image);
	});
}


// -- Keyboard Input

var Key = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	SPACE: 32,
	RETURN: 13,
	ESC: 27
};

(function(){
	var A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0);
	for (var cc = A; cc <= Z; ++cc) { Key[String.fromCharCode(cc)] = cc; }

	var zero = '0'.charCodeAt(0), nine = '9'.charCodeAt(0);
	for (var cc = zero; cc <= nine; ++cc) { Key[String.fromCharCode(cc)] = cc; }
}());


function Keyboard() {
	var keys = [];

	on(window, "keydown", function(evt) {
		state.keys[evt.keyCode] = true;
		if (! evt.metaKey)
			evt.preventDefault();
	});
	
	on(window, "keyup", function(evt) {
		keys[evt.keyCode] = false;
		if (! evt.metaKey)
			evt.preventDefault();
	});

	on(window, "blur", function() {
		keys = [];
	});

	on(window, "focus", function() {
		keys = [];
	});

	this.down = function(kc) {
		return keys[kc] === true;
	};
}


// -- Tiled (mapeditor.org) TMX file

function TMXData() {
	this.layers = [];
	this.width = 0;
	this.height = 0;

	function LayerData(layerNode) {
		var self = this;
		this.width = 0;
		this.height = 0;
		var byteView = new Uint8Array(atob(layerNode.textContent.trim()).split("").map(function(c) { return c.charCodeAt(0); }));
		this.tileData = new Uint32Array(byteView.buffer);

		seq(layerNode.attributes).forEach(function(attr, ix) {
			if (attr.nodeName == "width")
				self.width = parseInt(attr.textContent);
			if (attr.nodeName == "height")
				self.height = parseInt(attr.textContent);
		});

		this.rangeOnRow = function(row, fromCol, tileCount) {
			var offset = (row * width) + fromCol;
			return this.tileData.slice(offset, offset + tileCount);
		};

		this.tileAt = function(col, row) {
			if (row < 0 || col < 0 || row >= this.height || col >= this.width)
				return -1;
			return this.tileData[(row * this.width) + col];
		};

		this.setTileAt = function(col, row, tile) {
			if (row < 0 || col < 0 || row >= this.height || col >= this.width)
				return;
			this.tileData[(row * this.width) + col] = tile;
		};

		this.eachTile = function(callback) {
			var off = 0;
			for (var row = 0; row < height; ++row) {
				for (var col = 0; col < width; ++col) {
					if (this.tileData[off])
						callback(row, col, this.tileData[off]);
					++off;
				}
			}
		};
	}

	this.load = function(filePath) {
		var self = this;
		
		return loadFile(filePath, {
			tryBreakCache: true,
			xml: true,
			mimeType: "application/xml"
		}).then(
			function(dataXML) {
				var tileDoc = dataXML.childNodes[0];

				seq(tileDoc.attributes).forEach(function(attr, ix) {
					if (attr.nodeName == "width")
						self.width = parseInt(attr.textContent);
					if (attr.nodeName == "height")
						self.height = parseInt(attr.textContent);
				});

				for (var ix=0; ix < tileDoc.childNodes.length; ++ix) {
					var node = tileDoc.childNodes[ix];
					if (node.nodeName == "layer")
						self.layers.push(new LayerData(node));
				}

				return self;
			}
		);
	};
}
