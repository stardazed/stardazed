// asset-tmx - Tiled (mapeditor.org) TMX files and types
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	// Minimal support for orthogonal right-down order, base64 encoded tile data

	export class TMXLayer {
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


	export class TMXObjectGroup {
		constructor(groupNode: Node) {
			// TBD
		}
	}


	export type TMXLayerSet = { [name: string]: TMXLayer; };
	export type TMXObjectGroupSet = { [name: string]: TMXObjectGroup; };


	export class TMXData {
		layers: TMXLayerSet = {};
		objectGroups: TMXObjectGroupSet = {};

		private width_ = 0;
		private height_ = 0;

		get width() { return this.width_; }
		get height() { return this.height_; }

		load(filePath: string): Promise<TMXData> {
			return loadFile(filePath, {
				tryBreakCache: true,
				mimeType: "application/xml",
				responseType: FileLoadType.Document
			}).then(
				(dataXML: XMLDocument) => {
					var tileDoc = dataXML.childNodes[0];

					seq(tileDoc.attributes).forEach((attr, ix) => {
						if (attr.nodeName == "width")
							this.width_ = parseInt(attr.textContent);
						if (attr.nodeName == "height")
							this.height_ = parseInt(attr.textContent);
					});

					for (var ix = 0; ix < tileDoc.childNodes.length; ++ix) {
						var node = tileDoc.childNodes[ix];

						if (node.nodeName == "layer") {
							this.layers[node.attributes.getNamedItem("name").textContent] = new TMXLayer(node);
						}
						else if (node.nodeName == "objectgroup") {
							this.objectGroups[node.attributes.getNamedItem("name").textContent] = new TMXObjectGroup(node);
						}
					}

					return this;
				}
			);
		};
	}

} // ns sd.asset
