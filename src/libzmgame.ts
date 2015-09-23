// libzmgame - general purpose game-related stuff
// requires libzm
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="libzm.ts" />

// -- Numbers

function intRandom(maximum: number): number {
	return (Math.random() * (maximum + 1)) << 0;
}


function intRandomRange(minimum: number, maximum: number): number {
	var diff = (maximum - minimum) << 0;
	return minimum + intRandom(diff);
}


function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}


function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}


// -- Images

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise(function(resolve,reject) {
		var image = new Image();
		image.onload = function() { resolve(image); };
		image.onerror = function() { reject(src + " doesn't exist"); };
		image.src = src;
	});
}


function imageData(image: HTMLImageElement): ImageData {
	var cvs = document.createElement("canvas");
	cvs.width = image.width;
	cvs.height = image.height;
	var tc = cvs.getContext("2d");
	tc.drawImage(image, 0, 0);

	return tc.getImageData(0,0, image.width, image.height);
}


function loadImageData(src: string): Promise<ImageData> {
	return loadImage(src).then(function(image) {
		return imageData(image);
	});
}


// -- Keyboard Input

enum Key {
	UP = 38,
	DOWN = 40,
	LEFT = 37,
	RIGHT = 39,
	SPACE = 32,
	RETURN = 13,
	ESC = 27
};

(function(){
	var A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0);
	for (var cc = A; cc <= Z; ++cc) { Key[String.fromCharCode(cc)] = cc; }

	var zero = '0'.charCodeAt(0), nine = '9'.charCodeAt(0);
	for (var cc = zero; cc <= nine; ++cc) { Key[String.fromCharCode(cc)] = cc; }
}());


class Keyboard {
	keys: { [key:number]: boolean; } = {};

	constructor() {
		on(window, "keydown", (evt: KeyboardEvent) => {
			this.keys[evt.keyCode] = true;
			if (! evt.metaKey)
				evt.preventDefault();
		});
		
		on(window, "keyup", (evt: KeyboardEvent) => {
			this.keys[evt.keyCode] = false;
			if (! evt.metaKey)
				evt.preventDefault();
		});

		on(window, "blur", (evt) => {
			this.keys = {};
		});

		on(window, "focus", (evt) => {
			this.keys = {};
		});
	}

	down(kc: Key) {
		return this.keys[kc] === true;
	}
}


// -- Tiled (mapeditor.org) TMX file
class TMXLayer {
	width: number;
	height: number;
	tileData: Uint32Array;

	constructor(layerNode: Node) {
		var byteView = new Uint8Array(atob(layerNode.textContent.trim()).split("").map(c => { return c.charCodeAt(0); }));
		this.tileData = new Uint32Array(byteView.buffer);

		seq(layerNode.attributes).forEach((attr, ix) => {
			if (attr.nodeName == "width")
				this.width = parseInt(attr.textContent);
			if (attr.nodeName == "height")
				this.height = parseInt(attr.textContent);
		});
	}

	tileAt(col: number, row: number) {
		if (row < 0 || col < 0 || row >= this.height || col >= this.width)
			return -1;
		return this.tileData[(row * this.width) + col];
	}

	setTileAt(col: number, row: number, tile: number) {
		if (row < 0 || col < 0 || row >= this.height || col >= this.width)
			return;
		this.tileData[(row * this.width) + col] = tile;
	}

	eachTile(callback: (row: number, col: number, tile: number) => void) {
		var off = 0;
		for (var row = 0; row < this.height; ++row) {
			for (var col = 0; col < this.width; ++col) {
				if (this.tileData[off])
					callback(row, col, this.tileData[off]);
				++off;
			}
		}
	}
}


type TMXLayerSet = { [name: string]: TMXLayer; };


class TMXData {
	layers: TMXLayerSet = {};
	width: number;
	height: number;

	load(filePath: string) {
		return loadFile(filePath, {
			tryBreakCache: true,
			xml: true,
			mimeType: "application/xml"
		}).then(
			(dataXML: XMLDocument) => {
				var tileDoc = dataXML.childNodes[0];

				seq(tileDoc.attributes).forEach(function(attr, ix) {
					if (attr.nodeName == "width")
						this.width = parseInt(attr.textContent);
					if (attr.nodeName == "height")
						this.height = parseInt(attr.textContent);
				});

				for (var ix=0; ix < tileDoc.childNodes.length; ++ix) {
					var node = tileDoc.childNodes[ix];
					if (node.nodeName == "layer")
						this.layers["layer" + ix] = new TMXLayer(node); // fixme: use name attrib of layer node
				}

				return this;
			}
		);
	};
}
