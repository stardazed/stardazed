// game - general purpose game-related stuff
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />

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
