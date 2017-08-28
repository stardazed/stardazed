// render/renderworld - main external interface of rendering engine
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export class RenderWorld implements EffectRegistry {
		private canvas_: HTMLCanvasElement;
		private rd_: RenderDevice;
		private lighting_: TiledLight;
		private effects_: Map<string | number, Effect>;
		
		constructor(holderElement: HTMLElement, initialWidth: number, initialHeight: number) {
			assert(initialWidth > 0 && initialWidth <= 8192, "Invalid drawable width");
			assert(initialHeight > 0 && initialHeight <= 8192, "Invalid drawable height");

			this.canvas_ = holderElement.ownerDocument.createElement("canvas");
			this.canvas_.width = initialWidth;
			this.canvas_.height = initialHeight;

			holderElement.appendChild(this.canvas_);

			this.effects_ = new Map();
			
			this.rd_ = new gl1.GL1RenderDevice(this.canvas_);
			this.lighting_ = new TiledLight("large");
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
			this.effects_.set(effect.name, effect);
			this.effects_.set(effect.id, effect);
			effect.attachToRenderWorld(this);
		}

		effectByName(name: string): Effect | undefined {
			return this.effects_.get(name);
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

			const lightingReady = this.lighting_.lutTextureSampler && this.lighting_.lutTextureSampler.tex && this.lighting_.lutTextureSampler.tex.renderResourceHandle;

			if (lightingReady) {
				cmds.setFrameBuffer(null, render.ClearMask.ColourDepth, { colour: [0.0, 0.0, 0.0, 1.0] });
				cmds.setViewport(scene.camera.viewport);

				const transforms = scene.transforms;
				const renderers = scene.renderers;
				const meshes = scene.meshes;
				const camera = scene.camera;

				renderers.all().forEach(mri => {
					if (renderers.enabled(mri)) {
						const ent = renderers.entity(mri);
						const mi = meshes.forEntity(ent);
						if (mi !== 0) {
							const worldMat = transforms.worldMatrix(transforms.forEntity(ent));
							const mesh = meshes.mesh(mi);
							const subMeshes = meshes.subMeshes(mi);
							const materials = renderers.materials(mri);
							const subMeshCount = subMeshes.length;
							const materialCount = materials.length;
							const commandCount = Math.max(subMeshCount, materialCount);

							for (let cix = 0; cix < commandCount; ++cix) {
								const material = materials[Math.min(cix, materialCount - 1)];
								const subMesh = subMeshes[Math.min(cix, subMeshCount - 1)];
								const effect = this.effects_.get(material.__effectID)!;
								effect.addRenderJobs(
									material,
									camera, worldMat,
									mesh, subMesh,
									cmds
								);
							}
						}
					}
				});
			}
	
			this.rd_.dispatch(cmds);			
		}

		// -- temporary accessors as I build this out
		get rd() { return this.rd_; }
		get lighting() { return this.lighting_; }
	}
	
} // ns sd.render
