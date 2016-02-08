// asset.ts - Main asset types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export interface Texture2D {
		data: render.TextureImageData;
		format: render.PixelFormat;

		width: number;
		height: number;
	}


	export interface Material {
		diffuseColour: Float3;
		diffuseTexture: Texture2D;

		specularColour: Float3;
		specularFactor: number;
		specularExponent: number;
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(): Material {
		return {
			diffuseColour: [0, 0, 0],
			diffuseTexture: null,

			specularColour: [0, 0, 0],
			specularFactor: 0,
			specularExponent: 0,
		};
	}


	interface Model {
		
	}

} // ns sd.asset
