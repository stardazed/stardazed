// render/effect - interface of device-level effects management
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface EffectData {
		readonly __effectID: number;
	}

	export interface Effect {
		readonly name: string;
		readonly id: number;

		attachToRenderWorld(rw: RenderWorld): void;

		addRenderJobs(
			evData: EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			geom: geometry.Geometry,
			primGroup: geometry.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		): void;

		makeEffectData(): EffectData;

		getTexture(ed: EffectData, name: string): Texture | undefined;
		setTexture(ed: EffectData, name: string, tex: Texture | undefined): void;

		getValue(ed: EffectData, name: string): number | undefined;
		setValue(ed: EffectData, name: string, val: number): void;

		getVector(ed: EffectData, name: string, out: MutNumArray): MutNumArray | undefined;
		setVector(ed: EffectData, name: string, vec: NumArray): void;
	}

	export interface EffectRegistry {
		registerEffect(e: Effect): void;
		effectByName(name: string): Effect | undefined;
	}

} // ns sd.render
