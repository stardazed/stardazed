// asset/parser/texture - texture higher-level asset
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {

	export namespace parser {
		export interface TextureAssetMetadata {
			mipmaps: "source" | "strip" | "regenerate";
			repeatS: "repeat" | "mirror" | "clamp";
			repeatT: "repeat" | "mirror" | "clamp";
			filtering: "nearest" | "linear" | "bilinear" | "trilinear";
			image: RawAsset<ImageAssetMetadata>;
		}

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

		export type TextureAssetParser = AssetParser<Texture2D, Partial<TextureAssetMetadata>>;

		/**
		 * Create a Texture for an asset blob
		 * @param resource The source data to be parsed
		 */
		export function* parseTexture(resource: RawAsset<TextureAssetMetadata>) {
			const imageSA = resource.metadata.image;
			if (imageSA && imageSA.kind === "image") {
				const image: asset.Image = yield imageSA;
				const mipmaps = parseMipMapMode(resource.metadata.mipmaps);
				const repeatS = parseRepeat(resource.metadata.repeatS);
				const repeatT = parseRepeat(resource.metadata.repeatT);
				const filtering = parseFiltering(resource.metadata.filtering);
				console.info(repeatS, repeatT, filtering); // make TS shut up about unused items
				const texture = render.makeTex2DFromProvider(image.provider, mipmaps);

				const tex2D: Texture2D = {
					...makeAsset("texture", resource.name),
					texture,
					anisotropy: 1
				};
				return tex2D;
			}
			else {
				throw new Error(`Texture parser: required image sub-resource is missing.`);
			}
		}
	} // ns parser

	export interface TextureSampler extends Asset {
		sampler: render.Sampler;
	}

	export interface Texture2D extends Asset {
		texture: render.Texture;
		samplerAsset?: TextureSampler; // hmm
		anisotropy: number; // 1..16
	}

	export interface Library {
		loadTexture(ra: parser.RawAsset): Promise<Texture2D>;
		textureByName(name: string): Texture2D | undefined;
	}
	registerAssetLoaderParser("texture", parser.parseTexture);

} // ns sd.asset
