// render/defaultrenderer - WIP standardisation of a "standard" frame render
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	export interface QualitySettings {

	}

	export class DefaultRenderer {
		downsample1: render.FilterPass;
		downsample2: render.FilterPass;
		boxFilter: render.FilterPass;

		constructor(private rc: RenderContext, private scene: world.Scene) {
			this.downsample1 = render.resamplePass(this.rc, this.scene.meshMgr, 512);
			this.downsample2 = render.resamplePass(this.rc, this.scene.meshMgr, 256);
			this.boxFilter = render.boxFilterPass(this.rc, this.scene.meshMgr, 256);
		}

		render(camera: world.ProjectionSetup) {
			// -- shadow pass
			let spotShadow: world.ShadowView | null = null;
			const shadowCaster = this.scene.pbrModelMgr.shadowCaster();

			if (shadowCaster && render.canUseShadowMaps(this.rc)) {
				let rpdShadow = render.makeRenderPassDescriptor();
				rpdShadow.clearMask = render.ClearMask.ColourDepth;
				vec4.set(rpdShadow.clearColour, 1, 1, 1, 1);

				spotShadow = this.scene.lightMgr.shadowViewForLight(this.rc, shadowCaster, .1);
				if (spotShadow) {
					render.runRenderPass(this.rc, this.scene.meshMgr, rpdShadow, spotShadow.shadowFBO, rp => {
						rp.setDepthTest(render.DepthTest.Less);
						this.scene.pbrModelMgr.drawShadows(this.scene.pbrModelMgr.all(), rp, spotShadow!.lightProjection);
					});

					//  filter shadow tex and set as source for shadow calcs
					this.downsample1.apply(this.rc, this.scene.meshMgr, spotShadow.shadowFBO.colourAttachmentTexture(0)!);
					this.downsample2.apply(this.rc, this.scene.meshMgr, this.downsample1.output);
					this.boxFilter.apply(this.rc, this.scene.meshMgr, this.downsample2.output);
					spotShadow.filteredTexture = this.boxFilter.output;
				}
			}

			// -- main forward pass
			const rpdMain = render.makeRenderPassDescriptor();
			vec4.set(rpdMain.clearColour, 0, 0, 0, 1);
			rpdMain.clearMask = render.ClearMask.ColourDepth;

			render.runRenderPass(this.rc, this.scene.meshMgr, rpdMain, null, rp => {
				this.scene.lightMgr.prepareLightsForRender(this.scene.lightMgr.all(), camera, rp.viewport()!);

				rp.setDepthTest(render.DepthTest.Less);
				rp.setFaceCulling(render.FaceCulling.Back);

				// this.scene.pbrModelMgr.draw(this.scene.pbrModelMgr.all(), rp, camera, spotShadow, world.PBRLightingQuality.CookTorrance, this.assets_.tex.reflectCubeSpace);

				// this.skyBox_.draw(rp, camera);
			});
		}
	}

} // ns sd.render
