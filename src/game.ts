// game - general purpose game-related stuff
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />

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


function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}


interface Math {
	sign(n: number): number;
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
	ESC = 27,

	PAGEUP = 33,
	PAGEDOWN = 34,
	HOME = 36,
	END = 35,
	DELETE = 46,

	// charCode equals keyCode for A-Z
	A = 'A'.charCodeAt(0), B = 'B'.charCodeAt(0), C = 'C'.charCodeAt(0), D = 'D'.charCodeAt(0), 
	E = 'E'.charCodeAt(0), F = 'F'.charCodeAt(0), G = 'G'.charCodeAt(0), H = 'H'.charCodeAt(0),
	I = 'I'.charCodeAt(0), J = 'J'.charCodeAt(0), K = 'K'.charCodeAt(0), L = 'L'.charCodeAt(0),
	M = 'M'.charCodeAt(0), N = 'N'.charCodeAt(0), O = 'O'.charCodeAt(0), P = 'P'.charCodeAt(0), 
	Q = 'Q'.charCodeAt(0), R = 'R'.charCodeAt(0), S = 'S'.charCodeAt(0), T = 'T'.charCodeAt(0), 
	U = 'U'.charCodeAt(0), V = 'V'.charCodeAt(0), W = 'W'.charCodeAt(0), X = 'X'.charCodeAt(0), 
	Y = 'Y'.charCodeAt(0), Z = 'Z'.charCodeAt(0)
};


class Keyboard {
	keys: { [key: number]: { down: boolean; when: number; }; } = {};

	// The extra check in the key handlers for the timeStamp was added
	// after I encountered a rare, but frequently enough occuring bug
	// where, when a key is pressed for a longer time so that repeat 
	// keydown events are fired, _very_ occasionally the last keydown
	// would be fired with the same timeStamp as the keyup event but
	// the event handler for that last down event was fired AFTER the
	// keyup event handler, causing the key to appear to be "stuck".

	constructor() {
		on(window, "keydown", (evt: KeyboardEvent) => {
			var key = this.keys[evt.keyCode];

			if (! key) {
				this.keys[evt.keyCode] = { down: true, when: evt.timeStamp };
			}
			else {
				if (key.when < evt.timeStamp) {
					key.down = true;
					key.when = evt.timeStamp;
				}
			}

			if (! evt.metaKey)
				evt.preventDefault();
		});
		
		on(window, "keyup", (evt: KeyboardEvent) => {
			var key = this.keys[evt.keyCode];
			if (! key) {
				this.keys[evt.keyCode] = { down: false, when: evt.timeStamp };
			}
			else {
				key.down = false;
				key.when = evt.timeStamp;
			}
			
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

	down(kc: Key): boolean {
		return this.keys[kc] && this.keys[kc].down;
	}
}


// -- Tiled (mapeditor.org) TMX file
// Minimal support for orthogonal right-down order, base64 encoded tile data
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


class TMXObjectGroup {
	constructor(groupNode: Node) {
		// TBD
	}
}


type TMXLayerSet = { [name: string]: TMXLayer; };
type TMXObjectGroupSet = { [name: string]: TMXObjectGroup; };


class TMXData {
	layers: TMXLayerSet = {};
	objectGroups: TMXObjectGroupSet = {};
	width: number;
	height: number;

	load(filePath: string): Promise<TMXData> {
		return loadFile(filePath, {
			tryBreakCache: true,
			mimeType: "application/xml",
			responseType: FileLoadType.Document
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
					if (node.nodeName == "layer") {
						this.layers[node.attributes["name"].textContent] = new TMXLayer(node); // fixme: use name attrib of layer node
					}
					else if (node.nodeName == "objectgroup") {
						this.objectGroups[node.attributes["name"].textContent] = new TMXObjectGroup(node);
					}
				}

				return this;
			}
		);
	};
}
