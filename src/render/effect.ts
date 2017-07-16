// render/effect - interface of device-level effects management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface TEMPConstant {
		name: string;
		value: TypedArray;
	}

	export interface EffectVariant {
		readonly name: string;

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

		linkWithDevice(rd: RenderDevice): void;

		addRenderJobs(
			evData: EffectVariantData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			mesh: meshdata.MeshData, primGroup: meshdata.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		): void;

		makeVariantData(ev: EffectVariant | string): EffectVariantData | undefined;

		getTexture(evd: EffectVariantData, name: string): Texture | undefined;
		setTexture(evd: EffectVariantData, name: string, tex: Texture | undefined): void;

		getColour(evd: EffectVariantData, name: string): Float32Array | undefined;
		setColour(evd: EffectVariantData, name: string, rgba: Float32Array): void;

		getValue(evd: EffectVariantData, name: string): number | undefined;
		setValue(evd: EffectVariantData, name: string, val: number): void;
	}

	export interface EffectRegistry {
		registerEffect(e: Effect): void;
		effectByName(name: string): Effect | undefined;
	}

} // ns sd.render
