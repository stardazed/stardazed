// render/effect/shadowmap - Shadowmap shaders
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect {

	import SVT = ShaderValueType;
	import AttrRole = geometry.VertexAttributeRole;

	const vsmShadowVertexFunction: VertexFunction = {
		in: [
			{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 }
		],
		out: [
			{ name: "vertexPos_world", type: SVT.Float4 }
		],
		constants: [
			{ name: "modelMatrix", type: SVT.Float4x4 },
			{ name: "lightViewProjectionMatrix", type: SVT.Float4x4 }
		],
		main: `
			vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
			gl_Position = lightViewProjectionMatrix * vertexPos_world;
		`
	};

	const vsmShadowFragmentFunction: FragmentFunction = {
		extensions: [
			{ name: "GL_OES_standard_derivatives", action: "require" }
		],
		in: [
			{ name: "vertexPos_world", type: SVT.Float4 }
		],
		constants: [
			{ name: "lightViewMatrix", type: SVT.Float4x4 },
			{ name: "lightData", type: SVT.Float4 },
		],
		outCount: 1,
		main: `
			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;
			float depth = clamp(length(lightPos) / lightData[3], 0.0, 1.0);
			float dx = dFdx(depth);
			float dy = dFdy(depth);
			gl_FragColor = vec4(depth, depth * depth + 0.25 * (dx * dx + dy * dy), 0.0, 1.0);
		`
	};

	const vsmShadowShader = (): Shader => ({
		renderResourceType: ResourceType.Shader,
		renderResourceHandle: 0,
		defines: [],
		vertexFunction: vsmShadowVertexFunction,
		fragmentFunction: vsmShadowFragmentFunction
	});

	export interface VSMShadowMapEffectData extends EffectData {
		data: Float32Array;
	}

	export class VSMShadowMapEffect implements Effect {
		readonly name = "vsm-shadow";
		readonly id = 0x00010001;
	
		private shader_!: Shader;
	
		attachToRenderWorld(rw: RenderWorld) {
			this.shader_ = vsmShadowShader();
	
			const rcmd = new RenderCommandBuffer();
			rcmd.allocate(this.shader_);
			rw.rd.dispatch(rcmd);
		}
	
		addRenderJobs(
			evData: EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			geom: geometry.Geometry,
			primGroup: geometry.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		) {
			const mv = mat4.multiply(mat4.create(), camera.viewMatrix, modelMatrix);
			const mvp = mat4.multiply(mat4.create(), camera.viewProjMatrix, modelMatrix);
	
			toBuffer.render({
				geom,
				primGroup,
				textures: [],
				samplers: [],
				constants: [
					{ name: "modelMatrix", value: modelMatrix as Float32Array },
					{ name: "lightViewMatrix", value: mv },
					{ name: "lightViewProjectionMatrix", value: mvp },
					{ name: "lightRange", value: (evData as VSMShadowMapEffectData).data }
				],
				pipeline: {
					depthTest: DepthTest.Less,
					depthWrite: true,
					shader: this.shader_,
					faceCulling: FaceCulling.Back
				}
			}, 0);
		}
	
		makeEffectData(): EffectData {
			return {
				__effectID: this.id,
				data: vec4.fromValues(0, 0, 0, 1)
			} as VSMShadowMapEffectData;
		}
	
		getTexture(_evd: EffectData, _name: string): Texture | undefined {
			return undefined;
		}
		setTexture(_evd: EffectData, _name: string, _tex: Texture | undefined) {
		}
	
		getVector(_evd: EffectData, _name: string, _out: sd.ArrayOfNumber): sd.ArrayOfNumber | undefined {
			return undefined;
		}
		setVector(_evd: EffectData, _name: string, _vec: sd.ArrayOfConstNumber) {
		}
	
		getValue(evd: EffectData, name: string): number | undefined {
			if (name === "range") {
				return (evd as VSMShadowMapEffectData).data[3];
			}
			return undefined;
		}
		setValue(evd: EffectData, name: string, val: number) {
			if (name === "range") {
				(evd as VSMShadowMapEffectData).data[3] = Math.max(0.01, val);
			}
		}
	}
	
} // ns sd.render.effect
