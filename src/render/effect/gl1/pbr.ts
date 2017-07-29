// render/effect/gl1/pbr - GL1 pbr effect group (metallic)
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect.gl1 {

	interface PBREffectData extends render.EffectData {
		diffuse: render.Texture | undefined;
		tint: Float32Array;
	}

	export class PBREffect implements render.Effect {
		readonly name = "pbr";

		private rd_: render.gl1.GL1RenderDevice;
		private sampler_: render.Sampler;
		private shader_: render.Shader;

		private tempMat4_ = mat4.create();
		private tempMat3_ = mat3.create();

		linkWithDevice(rd: render.RenderDevice) {
			this.rd_ = rd as render.gl1.GL1RenderDevice;
			this.sampler_ = render.makeSampler();
			// this.shader_ = render.gl1.makeBasicShader();

			const rcmd = new render.RenderCommandBuffer();
			rcmd.allocate(this.sampler_);
			rcmd.allocate(this.shader_);
			this.rd_.dispatch(rcmd);
		}

		addRenderJobs(
			evData: render.EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: sd.Float4x4,
			mesh: meshdata.MeshData, primGroup: meshdata.PrimitiveGroup,
			toBuffer: render.RenderCommandBuffer
		) {
			const mvp = mat4.multiply(this.tempMat4_, modelMatrix, camera.viewProjMatrix);
			const normMat = mat3.normalFromMat4(this.tempMat3_, mvp);

			toBuffer.render({
				mesh,
				primGroup,
				textures: [(evData as PBREffectData).diffuse!],
				samplers: [this.sampler_],
				constants: [
					{ name: "modelViewProjectionMatrix", value: mvp },
					{ name: "normalMatrix", value: normMat },
					{ name: "mainColour", value: (evData as PBREffectData).tint }
				],
				pipeline: {
					depthTest: render.DepthTest.Less,
					depthWrite: true,
					shader: this.shader_,
					faceCulling: render.FaceCulling.Back
				}
			}, 0);
		}

		makeEffectData(): EffectData {
			return {
				diffuse: undefined,
				tint: vec3.one()
			} as PBREffectData;
		}

		getTexture(evd: render.EffectData, _name: string): render.Texture | undefined {
			return (evd as PBREffectData).diffuse;
		}
		setTexture(evd: render.EffectData, _name: string, tex: render.Texture | undefined) {
			(evd as PBREffectData).diffuse = tex;
		}

		getVector(evd: render.EffectData, _name: string, out: sd.ArrayOfNumber): sd.ArrayOfNumber | undefined {
			vec3.copy(out, (evd as PBREffectData).tint);
			return out;
		}
		setVector(evd: render.EffectData, _name: string, vec: sd.ArrayOfConstNumber) {
			vec3.copy((evd as PBREffectData).tint, vec);
		}

		getValue(_evd: render.EffectData, _name: string): number | undefined {
			return undefined;
		}
		setValue(_evd: render.EffectData, _name: string, _val: number) {
		}
	}

} // ns sd.render.effect.gl1
