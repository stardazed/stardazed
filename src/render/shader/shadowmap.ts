// render/shader/shadowmap - Shadowmap shaders
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.shader {

	import SVT = ShaderValueType;
	import AttrRole = meshdata.VertexAttributeRole;

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

	export interface VSMShadowData extends EffectData {
		data: Float32Array;
	}

	export class VSMShadowMapEffect implements render.Effect {
		readonly name = "vsm-shadow";
		readonly id = 0x00010001;
	
		private rd_: render.gl1.GL1RenderDevice;
		private shader_: render.Shader;
	
		attachToRenderWorld(rw: render.RenderWorld) {
			this.rd_ = rw.rd as render.gl1.GL1RenderDevice;
			this.shader_ = vsmShadowShader();
	
			const rcmd = new render.RenderCommandBuffer();
			rcmd.allocate(this.shader_);
			this.rd_.dispatch(rcmd);
			this.rd_.processFrame();
		}
	
		addRenderJobs(
			evData: render.EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: sd.Float4x4,
			mesh: meshdata.MeshData,
			primGroup: meshdata.PrimitiveGroup,
			toBuffer: render.RenderCommandBuffer
		) {
			const mv = mat4.multiply(mat4.create(), camera.viewMatrix, modelMatrix);
			const mvp = mat4.multiply(mat4.create(), camera.viewProjMatrix, modelMatrix);
	
			toBuffer.render({
				mesh,
				primGroup,
				textures: [],
				samplers: [],
				constants: [
					{ name: "modelMatrix", value: modelMatrix as Float32Array },
					{ name: "lightViewMatrix", value: mv },
					{ name: "lightViewProjectionMatrix", value: mvp },
					{ name: "lightRange", value: (evData as VSMShadowData).data }
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
				__effectID: this.id,
				data: vec4.fromValues(0, 0, 0, 1)
			} as VSMShadowData;
		}
	
		getTexture(_evd: render.EffectData, _name: string): render.Texture | undefined {
			return undefined;
		}
		setTexture(_evd: render.EffectData, _name: string, _tex: render.Texture | undefined) {
		}
	
		getVector(_evd: render.EffectData, _name: string, _out: sd.ArrayOfNumber): sd.ArrayOfNumber | undefined {
			return undefined;
		}
		setVector(_evd: render.EffectData, _name: string, _vec: sd.ArrayOfConstNumber) {
		}
	
		getValue(evd: render.EffectData, name: string): number | undefined {
			if (name === "range") {
				return (evd as VSMShadowData).data[3];
			}
			return undefined;
		}
		setValue(evd: render.EffectData, name: string, val: number) {
			if (name === "range") {
				(evd as VSMShadowData).data[3] = Math.max(0.01, val);
			}
		}
	}
	
} // ns sd.render.shader
