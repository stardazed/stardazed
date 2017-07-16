// render/effect - interface of device-level effects management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface TEMPConstant {
		name: string;
		value: TypedArray;
	}

	export interface EffectData {
		readonly __evd?: void;
	}

	export interface Effect {
		readonly name: string;
		readonly variants: ReadonlyArray<string>;

		linkWithDevice(rd: RenderDevice): void;

		addRenderJobs(
			evData: EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			mesh: meshdata.MeshData, primGroup: meshdata.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		): void;

		makeEffectData(variant: string): EffectData | undefined;

		getTexture(evd: EffectData, name: string): Texture | undefined;
		setTexture(evd: EffectData, name: string, tex: Texture | undefined): void;

		getColour(evd: EffectData, name: string): Float32Array | undefined;
		setColour(evd: EffectData, name: string, rgba: Float32Array): void;

		getValue(evd: EffectData, name: string): number | undefined;
		setValue(evd: EffectData, name: string, val: number): void;
	}

	export interface EffectRegistry {
		registerEffect(e: Effect): void;
		effectByName(name: string): Effect | undefined;
	}

} // ns sd.render
