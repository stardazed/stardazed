// render/effect/simple-skybox - Simple flat skybox/sphere
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect {

	import SVT = ShaderValueType;
	import AttrRole = geometry.VertexAttributeRole;

	const skyboxVertexFunction: VertexFunction = {
		in: [
			{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 }
		],
		out: [
			{ name: "vertexUV_intp", type: SVT.Float3 }
		],
		constants: [
			{ name: "modelViewProjectionMatrix", type: SVT.Float4x4 }
		],
		main: `
			vec4 vertexPos_cam = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
			gl_Position = vertexPos_cam.xyww;
			vertexUV_intp = vertexPos_model;
		`
	};

	const skyboxFragmentFunction: FragmentFunction = {
		in: [
			{ name: "vertexUV_intp", type: SVT.Float3 }
		],
		modules: [
			"ConvertSRGB",
			"grading/srgb/basic"
		],
		samplers: [
			{ name: "skyboxMap", type: TextureClass.CubeMap, index: 0 }
		],
		outCount: 1,
		main: `
			vec4 colour = textureCube(skyboxMap, vertexUV_intp);
		#ifdef NO_SRGB_TEXTURES
			gl_FragColor = colour;
		#else
			gl_FragColor = vec4(linearToSRGB(colour.rgb), 1.0);
		#endif
		`
	};

	const skyboxShader = (rd: RenderDevice): Shader => ({
		renderResourceType: ResourceType.Shader,
		renderResourceHandle: 0,
		defines: [
			{ name: "NO_SRGB_TEXTURES", value: +(!rd.supportsSRGBTextures) },
		],
		vertexFunction: skyboxVertexFunction,
		fragmentFunction: skyboxFragmentFunction
	});

	export interface SimpleSkyboxEffectData extends EffectData {
		skybox: Texture | undefined;
	}

	export class SimpleSkyboxEffect implements Effect {
		readonly name = "simple-skybox";
		readonly id = 0x88884444;

		private shader_!: Shader;
		private sampler_!: Sampler;
		private matPos_!: Float32Array;
		private matMVP_!: Float32Array;

		attachToRenderWorld(rw: RenderWorld) {
			this.shader_ = skyboxShader(rw.rd);
			this.sampler_ = makeCubemapSampler(false);

			this.matPos_ = mat4.create();
			this.matMVP_ = mat4.create();

			const rcmd = new RenderCommandBuffer();
			rcmd.allocate(this.shader_);
			rcmd.allocate(this.sampler_);
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
			const ssbevData = evData as SimpleSkyboxEffectData;
			if (! ssbevData.skybox) {
				return;
			}

			// use rotation of modelMatrix provided but override position
			// centering the skybox around the eye at all times.
			const cameraPosMatrix = mat4.copy(this.matPos_, modelMatrix);
			cameraPosMatrix[12] = -camera.viewMatrix[12];
			cameraPosMatrix[13] = -camera.viewMatrix[13];
			cameraPosMatrix[14] = -camera.viewMatrix[14];
			const mvp = mat4.multiply(this.matMVP_, camera.viewProjMatrix, cameraPosMatrix);

			toBuffer.render({
				geom,
				primGroup,
				textures: [
					ssbevData.skybox
				],
				samplers: [
					this.sampler_
				],
				constants: [
					{ name: "modelViewProjectionMatrix", value: mvp },
				],
				pipeline: {
					depthTest: DepthTest.LessOrEqual,
					depthWrite: false,
					shader: this.shader_,
					faceCulling: FaceCulling.Disabled
				}
			}, 1.0);
		}

		makeEffectData(): EffectData {
			return {
				__effectID: this.id,
				skybox: undefined
			} as SimpleSkyboxEffectData;
		}

		getTexture(_evd: EffectData, _name: string): Texture | undefined {
			return undefined;
		}
		setTexture(_evd: EffectData, _name: string, _tex: Texture | undefined) {
		}

		getVector(_evd: EffectData, _name: string, _out: MutNumArray): MutNumArray | undefined {
			return undefined;
		}
		setVector(_evd: EffectData, _name: string, _vec: NumArray) {
		}

		getValue(_evd: EffectData, _name: string): number | undefined {
			return undefined;
		}
		setValue(_evd: EffectData, _name: string, _val: number) {
		}
	}

} // ns sd.render.effect
