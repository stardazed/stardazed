// render/effect - interface of device-level effects management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface TEMPConstant {
		name: string;
		value: TypedArray;
	}

	export interface EffectRenderJobData {
		pipeline: Pipeline;
		textures: Texture[];
		samplers: Sampler[];
		constants: TEMPConstant[];
	}

	export interface EffectVariant {
		readonly effectName: string;
		readonly variantName: string;

		readonly textureNames: string[];
		readonly textureClasses: TextureClass[];
		readonly colourNames: string[];
		readonly valueNames: string[];
	}

	export interface EffectVariantData {
		readonly __evd?: void;
	}

	export interface Effect {
		readonly name: string;
		readonly variants: ReadonlyArray<EffectVariant>;

		makeVariantData(ev: EffectVariant | string): EffectVariantData | undefined;
		createRenderJobData(evData: EffectVariantData): EffectRenderJobData;

		getTexture(evd: EffectVariantData, name: string): Texture | undefined;
		setTexture(evd: EffectVariantData, name: string, tex: Texture | undefined): void;

		getColour(evd: EffectVariantData, name: string): Float32Array | undefined;
		setColour(evd: EffectVariantData, name: string, rgba: Float32Array): void;
		setColour(evd: EffectVariantData, name: string, r: number, g: number, b: number, a?: number): void;

		getValue(evd: EffectVariantData, name: string): number | undefined;
		setValue(evd: EffectVariantData, name: string, val: number): void;
	}

	export interface EffectRegistry {
		registerEffect(e: Effect): void;
		effectByName(name: string): Effect | undefined;
	}

} // ns sd.render
