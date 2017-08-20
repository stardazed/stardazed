// render/shader/pbr - prototype shader gen
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.shader {

	import SVT = ShaderValueType;
	import AttrRole =  meshdata.VertexAttributeRole;

	const enum Features {
		// VtxPosition and VtxNormal are required and implied
		VtxUV                      = 1 << 0,
		VtxColour                  = 1 << 1,

		LightingQuality            = 1 << 2 | 1 << 3,  // 2-bit number, higher is better

		Emissive                   = 1 << 4,

		AlbedoMap                  = 1 << 5,  // RGB channels of Albedo
		RoughnessMap               = 1 << 6,  // R channel of RMA
		MetallicMap                = 1 << 7,  // G channel of RMA
		AOMap                      = 1 << 8,  // B channel of RMA

		NormalMap                  = 1 << 9,  // RGB channels of NormalHeight
		HeightMap                  = 1 << 10, // A channel of NormalHeight

		ShadowMap                  = 1 << 11,
	}

	// const LightingQualityBitShift = 2;

	// ----

	function standardVertexFunction(feat: Features): VertexFunction {
		const fn: VertexFunction = {
			in: [
				{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 },
				{ name: "vertexNormal", type: SVT.Float3, role: AttrRole.Normal, index: 1 },
			],
			out: [
				{ name: "vertexPos_world", type: SVT.Float4 },
				{ name: "vertexPos_cam", type: SVT.Float3 },
				{ name: "vertexNormal_cam", type: SVT.Float3 },
			],

			constants: [
				{ name: "modelMatrix", type: SVT.Float4x4 },
				{ name: "modelViewMatrix", type: SVT.Float4x4 },
				{ name: "modelViewProjectionMatrix", type: SVT.Float4x4 },
				{ name: "normalMatrix", type: SVT.Float3x3 },
			],

			main: `
				gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
				vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
				vertexNormal_cam = normalMatrix * vertexNormal;
				vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;
			`
		};

		if (feat & Features.VtxUV) {
			fn.in.push({ name: "vertexUV", type: SVT.Float2, role: AttrRole.UV, index: 2 });
			fn.out!.push({ name: "vertexUV_intp", type: SVT.Float2 });
			fn.constants!.push({ name: "texScaleOffset", type: SVT.Float4 });
			fn.main += "vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;\n";
		}

		if (feat & Features.VtxColour) {
			fn.in.push({ name: "vertexColour", type: SVT.Float3, role: AttrRole.Colour, index: 3 });
			fn.out!.push({ name: "vertexColour_intp", type: SVT.Float3 });
			fn.main += "vertexColour_intp = vertexColour;\n";
		}

		return fn;
	}

	function standardFragmentFunction(): FragmentFunction {
		const attr: Conditional<ShaderAttribute>[] = [
			{ name: "vertexPos_world", type: SVT.Float4 },
			{ name: "vertexPos_cam", type: SVT.Float3 },
			{ name: "vertexNormal_cam", type: SVT.Float3 },
		];

		const dependencies: string[] = [
			"gammaConstants",
			"surfaceInfo",
			"pbrMaterialInfo",
			"pbrMaterialLighting",
			"lightContrib"
		];
		const mr = new ModuleResolver(gl1Modules);
		const lib = mergeModules(mr.resolve(dependencies) as GL1Module[]);

		const fn: FragmentFunction = {
			in: attr,
			outCount: 1,
			extensions: lib.extensions,
			constants: lib.constants,
			samplers: lib.samplers,
			structs: lib.structs,
			constValues: lib.constValues,
			code: lib.code,
			main: `
				SurfaceInfo si = calcSurfaceInfo();
				MaterialInfo mi = getMaterialInfo(si.UV);

				// vec3 totalLight = calcLightIBL(baseColour, matParam, si);
				// totalLight += mi.emissive;
				// totalLight += totalDynamicLightContributionTiledForward(si, mi) * shadowFactor;
				// totalLight *= mi.ao;

				vec3 totalLight = calcLightShared(vec3(1.0), 1.0, normalize(vec3(0.1, 0.1, 1.0)), si, mi);
				gl_FragColor = vec4(pow(totalLight, LINEAR_TO_SRGB), 1.0);
				// gl_FragColor = vec4(totalLight, 1.0);
			`
		};

		return fn;
	}

	export function makeStdShader(): Shader {
		const vertexFunction = standardVertexFunction(0);
		const fragmentFunction = standardFragmentFunction();

		const defines: ShaderDefine[] = [];
		const feat: Features = 0;
		if (feat & Features.VtxUV) {
			defines.push({ name: "HAS_BASE_UV" });
			// attr.push({ name: "vertexUV_intp", type: SVT.Float2 });
		}
		if (feat & Features.VtxColour) {
			defines.push({ name: "VERTEX_COLOUR_TINTING" });
			// attr.push({ name: "vertexColour_intp", type: SVT.Float3 });
		}
		defines.push({ name: "PBR_LIGHT_QUALITY", value: 2 });


		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,
			defines: [],
			vertexFunction,
			fragmentFunction
		};	
	}

} // ns sd.render.shader
