// asset/allocator - allocate GPU resources immediately
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.asset {

	/**
	 * Automatically allocate render assets for usage in the next frame.
	 */
	export const allocator = (rd: render.RenderDevice): AssetProcessor => async (asset: Asset) => {
		if ((asset.kind === "texture" || asset.kind === "texturecube" || asset.kind === "mesh") && asset.item) {
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
	};

} // ns sd.asset
