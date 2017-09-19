// asset/parser/texture - texture asset parser
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
			filtering: "nearest" | "nearestmip" | "linear" | "bilinear" | "trilinear";
			anisotropy: number;
		}

		export const parseTexture = (asset: Asset<Texture2D, TextureAssetMetadata>) =>
			new Promise<Asset>((resolve, reject) => {
				const imageAsset = asset.dependencies && asset.dependencies.image;
				const metadata = asset.metadata || {};

				if (! (imageAsset && imageAsset.kind === "image")) {
					return reject(`Texture parser: required image dependency is missing.`);
				}

				const mipmaps = parseMipMapMode(metadata.mipmaps);
				const repeatS = parseRepeat(metadata.repeatS);
				const repeatT = parseRepeat(metadata.repeatT);
				const filtering = parseFiltering(metadata.filtering);
				const anisotropy = parseAnisotropy(metadata.anisotropy);

				const texture = render.makeTex2DFromProvider(imageAsset.item!, mipmaps);
				
				const tex2D: Texture2D = {
					texture,
					repeatS,
					repeatT,
					sizeFilter: filtering.size,
					mipFilter: filtering.mip,
					anisotropy
				};
				asset.item = tex2D;
				resolve(asset);
			});

		registerParser("texture", parseTexture);

		const parseMipMapMode = (mmm: "source" | "strip" | "regenerate" | undefined) => {
			if (["source", "strip", "regenerate"].indexOf(mmm || "") === -1) {
				if (mmm !== void 0) {
					console.warn(`Texture parser: ignoring invalid mip-map mode`, mmm);
				}
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
				if (rep !== void 0) {
					console.warn(`Texture parser: ignoring invalid texture repeat mode`, rep);
				}
				rep = "repeat";
			}
			return ({
				repeat: render.TextureRepeatMode.Repeat,
				mirror: render.TextureRepeatMode.MirroredRepeat,
				clamp: render.TextureRepeatMode.ClampToEdge
			})[rep!];
		};

		const parseFiltering = (filt: "nearest" | "nearestmip" | "linear" | "bilinear" | "trilinear" | undefined) => {
			if (["nearest", "nearestmip", "linear", "bilinear", "trilinear"].indexOf(filt || "") === -1) {
				if (filt !== void 0) {
					console.warn(`Texture parser: ignoring invalid texture filtering mode`, filt);
				}
				filt = "bilinear";
			}
			return ({
				nearest: { size: render.TextureSizingFilter.Nearest, mip: render.TextureMipFilter.None },
				nearestmip: { size: render.TextureSizingFilter.Nearest, mip: render.TextureMipFilter.Linear },
				linear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.None },
				bilinear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.Nearest },
				trilinear: { size: render.TextureSizingFilter.Linear, mip: render.TextureMipFilter.Linear } 
			})[filt!];
		};

		const parseAnisotropy = (aniso: number | undefined) => {
			if (aniso !== void 0) {
				if (typeof aniso === "number") {
					if (aniso >= 1) {
						if (aniso > 16) {
							console.warn(`Texture parser: clamping anisotropy value of ${aniso} to 16.`);
							aniso = 16;
						}
						return aniso;
					}
					else {
						console.warn(`Texture parser: ignoring invalid anisotropy value, must be between 1 and 16 inclusive.`, aniso);
					}
				}
				else {
					console.warn(`Texture parser: ignoring non-numerical anisotropy value`, aniso);
				}
			}
			return 1;
		};

	} // ns parser

} // ns sd.asset
