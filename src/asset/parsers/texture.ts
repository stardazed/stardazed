// asset/parser/texture - texture higher-level asset
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export interface Texture2D {
		texture: render.Texture;
		repeatS: render.TextureRepeatMode;
		repeatT: render.TextureRepeatMode;
		sizeFilter: render.TextureSizingFilter;
		mipFilter: render.TextureMipFilter;
		anisotropy: number; // 1..16
	}

	export namespace parser {

		export interface TextureAssetMetadata {
			mipmaps: "source" | "strip" | "regenerate";
			repeatS: "repeat" | "mirror" | "clamp";
			repeatT: "repeat" | "mirror" | "clamp";
			filtering: "nearest" | "linear" | "bilinear" | "trilinear";
		}

		export const parseTexture = (asset: Asset<Texture2D, TextureAssetMetadata>) => {
			const imageAsset: Asset<image.PixelDataProvider> | undefined = asset.dependencies && asset.dependencies[0];
			const metadata = asset.metadata || {};

			if (! (imageAsset && imageAsset.kind === "image")) {
				throw new Error(`Texture parser: required image dependency is missing.`);
			}

			const mipmaps = parseMipMapMode(metadata.mipmaps);
			const repeatS = parseRepeat(metadata.repeatS);
			const repeatT = parseRepeat(metadata.repeatT);
			const filtering = parseFiltering(metadata.filtering);

			const texture = render.makeTex2DFromProvider(imageAsset.item!, mipmaps);
			
			const tex2D: Texture2D = {
				texture,
				repeatS,
				repeatT,
				sizeFilter: filtering.size,
				mipFilter: filtering.mip,
				anisotropy: 1
			};
			asset.item = tex2D;
			return Promise.resolve(asset);
		};

		registerParser("texture", parseTexture);

		const parseMipMapMode = (mmm: "source" | "strip" | "regenerate" | undefined) => {
			if (["source", "strip", "regenerate"].indexOf(mmm || "") === -1) {
				mmm = "source";
			}
			return ({
				source: render.MipMapMode.Source,
				strip: render.MipMapMode.Strip,
				regenerate: render.MipMapMode.Regenerate,
			})[mmm!];
		};

		const parseRepeat = (rep: "repeat" | "mirror" | "clamp" | undefined) => {
			if (["repeat", "mirror", "clamp"].indexOf(rep || "") === -1) {
				rep = "repeat";
			}
			return ({
				repeat: render.TextureRepeatMode.Repeat,
				mirror: render.TextureRepeatMode.MirroredRepeat,
				clamp: render.TextureRepeatMode.ClampToEdge
			})[rep!];
		};

		const parseFiltering = (filt: "nearest" | "linear" | "bilinear" | "trilinear" | undefined) => {
			if (["nearest", "linear", "bilinear", "trilinear"].indexOf(filt || "") === -1) {
				filt = "bilinear";
			}
			return ({
				nearest: { size: render.TextureSizingFilter.Nearest, mip: render.TextureMipFilter.None },
				linear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.None },
				bilinear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.Nearest },
				trilinear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.Linear } 
			})[filt!];
		};

	} // ns parser

} // ns sd.asset
