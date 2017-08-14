// render/renderworld - main external interface of rendering engine
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export class RenderWorld implements EffectRegistry {
		private canvas_: HTMLCanvasElement;
		private rd_: RenderDevice;
		private lighting_: TiledLight;
		private effects_: { [name: string]: Effect } = {};
		
		constructor(holderElement: HTMLElement, initialWidth: number, initialHeight: number) {
			assert(initialWidth > 0 && initialWidth <= 8192, "Invalid drawable width");
			assert(initialHeight > 0 && initialHeight <= 8192, "Invalid drawable height");

			this.canvas_ = holderElement.ownerDocument.createElement("canvas");
			this.canvas_.width = initialWidth;
			this.canvas_.height = initialHeight;

			holderElement.appendChild(this.canvas_);
			
			this.rd_ = new gl1.GL1RenderDevice(this.canvas_);
			this.lighting_ = new TiledLight("medium");
		}

		get drawableWidth() {
			return this.canvas_.width;
		}
		get drawableHeight() {
			return this.canvas_.height;
		}

		resizeDrawableTo(width: number, height: number) {
			assert(width > 0 && width <= 8192, "Invalid drawable width");
			assert(height > 0 && height <= 8192, "Invalid drawable height");

			this.canvas_.width = width;
			this.canvas_.height = height;
		}


		// -- EffectRegistry implementation
		registerEffect(effect: Effect) {
			if (effect.name in this.effects_) {
				throw new Error(`Tried to register an Effect named '${effect.name}', but that name is already used.`);
			}
			this.effects_[effect.name] = effect;
			effect.attachToRenderWorld(this);
		}

		effectByName(name: string): Effect | undefined {
			return this.effects_[name];
		}


		// --

		drawScene(scene: Scene) {
			const cmds = this.lighting_.prepareLightsForRender(
				scene.lights,
				scene.lights.allEnabled(),
				scene.transforms,
				scene.camera,
				scene.camera.viewport
			);

			if (! (this.lighting_.lutTextureSampler && this.lighting_.lutTextureSampler.tex && this.lighting_.lutTextureSampler.tex.renderResourceHandle)) {
				return cmds;
			}

			cmds.setFrameBuffer(null, render.ClearMask.ColourDepth, { colour: [0.0, 0.0, 0.0, 1.0] });
			cmds.setViewport(scene.camera.viewport);

			// for (let bmx = 0; bmx < this.baseMesh.subMeshes.length; ++bmx) {
			// 	const bsm = this.baseMesh.subMeshes[bmx];
			// 	const ed = this.baseEDs[bmx];
			// 	this.legacy.addRenderJobs(ed, this.scene.camera, scene.transforms.worldMatrix(this.baseObject.transform), this.baseMesh, bsm, cmds);
			// }
	
			return cmds;
		}

		// -- temporary accessors as I build this out
		get rd() { return this.rd_; }
		get lighting() { return this.lighting_; }
	}
	
} // ns sd.render
