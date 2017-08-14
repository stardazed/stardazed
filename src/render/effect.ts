// render/effect - interface of device-level effects management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface EffectData {
		readonly __evd?: void;
	}

	export interface Effect {
		readonly name: string;

		attachToRenderWorld(rw: RenderWorld): void;

		addRenderJobs(
			evData: EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			mesh: meshdata.MeshData,
			primGroup: meshdata.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		): void;

		makeEffectData(): EffectData;

		getTexture(ed: EffectData, name: string): Texture | undefined;
		setTexture(ed: EffectData, name: string, tex: Texture | undefined): void;

		getValue(ed: EffectData, name: string): number | undefined;
		setValue(ed: EffectData, name: string, val: number): void;

		getVector(ed: EffectData, name: string, out: ArrayOfNumber): ArrayOfNumber | undefined;
		setVector(ed: EffectData, name: string, vec: ArrayOfConstNumber): void;
	}

	export interface EffectRegistry {
		registerEffect(e: Effect): void;
		effectByName(name: string): Effect | undefined;
	}

} // ns sd.render
