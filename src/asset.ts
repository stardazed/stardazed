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
		ambientColour: Float3;
		diffuseColour: Float3;

		specularColour: Float3;
		specularFactor: number;
		specularExponent: number;

		emissiveColour: Float3;

		diffuseTexture: Texture2D;
	}

	export type MaterialSet = { [name: string]: Material };


	export function makeMaterial(): Material {
		return {
			ambientColour: [0, 0, 0],
			diffuseColour: [0, 0, 0],

			specularColour: [0, 0, 0],
			specularFactor: 0,
			specularExponent: 0,

			emissiveColour: [0, 0, 0],

			diffuseTexture: null
		};
	}


	interface Model {
		
	}

} // ns sd.asset
