// render/effect/standard - The Standard Effect/Material
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect {

	import AttrRole = meshdata.VertexAttributeRole;
	import SVT = ShaderValueType;

	function standardVertexFunction(_data: StandardEffectData): VertexFunction {
		return {
			in: [
				{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 },
				{ name: "vertexNormal", type: SVT.Float3, role: AttrRole.Normal, index: 1 },
				{ name: "vertexUV", type: SVT.Float2, role: AttrRole.UV, index: 2 },
			],
			out: [
				{ name: "vertexPos_world", type: SVT.Float4 },
				{ name: "vertexPos_cam", type: SVT.Float3 },
				{ name: "vertexNormal_cam", type: SVT.Float3 },
				{ name: "vertexUV_intp", type: SVT.Float2 },
			],

			constants: [
				{ name: "modelMatrix", type: SVT.Float4x4 },
				{ name: "modelViewMatrix", type: SVT.Float4x4 },
				{ name: "modelViewProjectionMatrix", type: SVT.Float4x4 },
				{ name: "normalMatrix", type: SVT.Float3x3 },
				{ name: "texScaleOffset", type: SVT.Float4 },
			],

			main: `
				gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
				vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
				vertexNormal_cam = normalMatrix * vertexNormal;
				vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;
				vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;
				// vertexColour_intp = vertexColour;
			`
		};
	}

	function standardFragmentFunction(_data: StandardEffectData): FragmentFunction {
		return {
			in: [
				{ name: "vertexPos_world", type: SVT.Float4 },
				{ name: "vertexPos_cam", type: SVT.Float3 },
				{ name: "vertexNormal_cam", type: SVT.Float3 },
				{ name: "vertexUV_intp", type: SVT.Float2 },
			],
			outCount: 1,

			modules: [
				"shadowedTotalLightContrib",
				"tiledLight",
				"grading/srgb/basic",
				"legacy/colourResponse",
				"basicNormalMap",
				"DepthFog",
				"fog/depth/linear"
			],

			main: `
			SurfaceInfo si = calcSurfaceInfo();
			MaterialInfo mi = getMaterialInfo(si.UV);

			vec3 totalLight = totalDynamicLightContributionTiledForward(si, mi);
			totalLight += vec3(0.015, 0.01, 0.02);

			totalLight = applyDepthFog(totalLight * mi.albedo.rgb, length(vertexPos_cam));

			gl_FragColor = vec4(linearToSRGB(totalLight), 1.0);
			`
		};
	}

	export function makeStandardShader(rd: RenderDevice, data: StandardEffectData): Shader {
		const vertexFunction = standardVertexFunction(data);
		const fragmentFunction = standardFragmentFunction(data);

		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,
			defines: [
				{ name: "NO_SRGB_TEXTURES", value: +(! rd.supportsSRGBTextures) },
				{ name: "HAS_BASE_UV", value: 1 },
				{ name: "ALBEDO_MAP", value: data.diffuse ? 1 : 0 },
				{ name: "SPECULAR", value: +(data.specularFactor[3] !== 0) },
				{ name: "SPECULAR_MAP", value: 0 },
				{ name: "NORMAL_MAP", value: data.normal ? 1 : 0 },
				{ name: "HEIGHT_MAP", value: 0 },
			],
			vertexFunction,
			fragmentFunction
		};	
	}


	export interface StandardEffectData extends EffectData {
		diffuse: Texture | undefined;
		normal: Texture | undefined;
		specularFactor: Float32Array;
		tint: Float32Array;
		texScaleOffset: Float32Array;
	}

	const SEDID = (data: StandardEffectData) => (
		(data.diffuse ? 1 : 0) << 0 |
		(data.normal ? 1 : 0) << 1 |
		(data.specularFactor[3] ? 1 : 0) << 2
	);

	export class StandardEffect implements Effect {
		readonly name = "standard";
		readonly id = 0x057ADA2D;

		private rd_: RenderDevice;
		private lighting_: TiledLight;
		private sampler_: Sampler;
		private shaders_ = new Map<number, Shader>();

		fogColour = vec4.fromValues(0, 0, 0, 1);
		fogParams = vec4.fromValues(8.0, 11.5, 1, 0);

		attachToRenderWorld(rw: RenderWorld) {
			this.rd_ = rw.rd;
			this.lighting_ = rw.lighting;
			this.sampler_ = makeSampler();

			const rcmd = new RenderCommandBuffer();
			rcmd.allocate(this.sampler_);
			this.rd_.dispatch(rcmd);
			this.rd_.processFrame();
		}

		addRenderJobs(
			evData: EffectData,
			camera: math.ProjectionSetup,
			modelMatrix: Float4x4,
			mesh: meshdata.MeshData, primGroup: meshdata.PrimitiveGroup,
			toBuffer: RenderCommandBuffer
		) {
			const sdata = evData as StandardEffectData;
			const ledid = SEDID(sdata);
			let shader = this.shaders_.get(ledid);
			if (! shader) {
				shader = makeStandardShader(this.rd_, sdata);
				toBuffer.allocate(shader);
				this.shaders_.set(ledid, shader);
			}

			const mv = mat4.multiply(mat4.create(), camera.viewMatrix, modelMatrix);
			const mvp = mat4.multiply(mat4.create(), camera.projectionMatrix, mv);
			const normMat = mat3.normalFromMat4(mat3.create(), mv);

			const lightingSampler = this.lighting_.lutTextureSampler;

			toBuffer.render({
				mesh,
				primGroup,
				textures: [
					sdata.diffuse,
					sdata.normal,
					undefined,
					undefined,
					undefined,
					undefined,
					lightingSampler.tex
				],
				samplers: [
					this.sampler_,
					this.sampler_,
					undefined,
					undefined,
					undefined,
					undefined,
					lightingSampler.samp
				],
				constants: [
					{ name: "modelMatrix", value: modelMatrix as Float32Array },
					{ name: "modelViewMatrix", value: mv },
					{ name: "modelViewProjectionMatrix", value: mvp },
					{ name: "normalMatrix", value: normMat },

					{ name: "fogColour", value: this.fogColour },
					{ name: "fogParams", value: this.fogParams },
					{ name: "lightLUTParam", value: this.lighting_.lutParam },
					{ name: "baseColour", value: sdata.tint },
					{ name: "specularFactor", value: sdata.specularFactor },
					{ name: "texScaleOffset", value: sdata.texScaleOffset }
				],
				pipeline: {
					depthTest: DepthTest.Less,
					depthWrite: true,
					shader,
					faceCulling: FaceCulling.Back
				}
			}, 0);
		}

		makeEffectData(): StandardEffectData {
			return {
				__effectID: this.id,
				diffuse: undefined,
				normal: undefined,
				specularFactor: vec4.zero(),
				tint: vec4.one(),
				texScaleOffset: vec4.fromValues(1, 1, 0, 0)
			};
		}

		getTexture(evd: EffectData, name: string): Texture | undefined {
			if (name === "diffuse") {
				return (evd as StandardEffectData).diffuse;
			}
			if (name === "normal") {
				return (evd as StandardEffectData).normal;
			}
			return undefined;
		}
		setTexture(evd: EffectData, name: string, tex: Texture | undefined) {
			if (name === "diffuse") {
				(evd as StandardEffectData).diffuse = tex;
			}
			else if (name === "normal") {
				(evd as StandardEffectData).normal = tex;
			}
		}

		getVector(evd: EffectData, name: string, out: sd.ArrayOfNumber): sd.ArrayOfNumber | undefined {
			if (name === "tint") {
				vec4.copy(out, (evd as StandardEffectData).tint);
			}
			else if (name === "texScaleOffset") {
				vec4.copy(out, (evd as StandardEffectData).texScaleOffset);
			}
			else if (name === "specularFactor") {
				vec4.copy(out, (evd as StandardEffectData).specularFactor);
			}
			return out;
		}
		setVector(evd: EffectData, name: string, vec: sd.ArrayOfConstNumber) {
			if (name === "tint") {
				vec4.copy((evd as StandardEffectData).tint, vec);
			}
			else if (name === "texScaleOffset") {
				vec4.copy((evd as StandardEffectData).texScaleOffset, vec);
			}
			else if (name === "specularFactor") {
				vec4.copy((evd as StandardEffectData).specularFactor, vec);
			}
		}

		getValue(_evd: EffectData, _name: string): number | undefined {
			return undefined;
		}
		setValue(_evd: EffectData, _name: string, _val: number) {
		}

	}

} // ns sd.render.effect
