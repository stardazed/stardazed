// asset/allocator - allocate GPU resources immediately
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	/**
	 * Extend an AssetPipeline with the capacity to automatically allocate
	 * render assets for usage in the next frame.
	 */
	export const allocatorStage = (rd: render.RenderDevice): AssetPipelineStage => (pipeline: AssetPipeline) => {
		const allocatorProcessor: AssetProcessor = (asset: Asset) =>
			new Promise<Asset>((resolve, _reject) => {
				if ((asset.kind === "texture" || asset.kind === "mesh") && asset.item) {
					const rcb = new render.RenderCommandBuffer();

					if (asset.kind === "mesh") {
						rcb.allocate(asset.item);
					}
					else {
						const tex2D = asset.item as Texture2D;
						rcb.allocate(tex2D.texture);
						// TODO: handle and allocate samplers
					}

					rd.dispatch(rcb);
				}

				resolve(asset);
			});

		// place next processor at end of chain
		const process = pipeline.process;
		pipeline.process = (asset: Asset) => process(asset).then(allocatorProcessor);
	};

} // ns sd.asset
