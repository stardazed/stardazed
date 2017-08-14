// render/renderworld - main external interface of rendering engine
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export class RenderWorld {
		private canvas_: HTMLCanvasElement;
		private rd_: RenderDevice;
		private lighting_: TiledLight;

		constructor(parentElement: HTMLElement, initialWidth: number, initialHeight: number) {
			assert(initialWidth > 0 && initialWidth <= 8192, "Invalid drawable width");
			assert(initialHeight > 0 && initialHeight <= 8192, "Invalid drawable height");

			this.canvas_ = parentElement.ownerDocument.createElement("canvas");
			this.canvas_.width = initialWidth;
			this.canvas_.height = initialHeight;

			parentElement.appendChild(this.canvas_);
			
			this.rd_ = new gl1.GL1RenderDevice(this.canvas_);
			this.lighting_ = new TiledLight("medium");
		}

		resizeDrawableTo(width: number, height: number) {
			assert(width > 0 && width <= 8192, "Invalid drawable width");
			assert(height > 0 && height <= 8192, "Invalid drawable height");

			this.canvas_.width = width;
			this.canvas_.height = height;
		}

		// temporary accessors as I build this out
		get rd() { return this.rd_; }
		get lighting() { return this.lighting_; }
	}
	
} // ns sd.render
