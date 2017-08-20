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

	const pbrVertexFunction: VertexFunction = {
		in: [
			{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 },
			{ name: "vertexNormal", type: SVT.Float3, role: AttrRole.Normal, index: 1 },
			{ name: "vertexUV", type: SVT.Float2, role: AttrRole.UV, index: 2, ifExpr: "HAS_BASE_UV" },
			{ name: "vertexColour", type: SVT.Float3, role: AttrRole.Colour, index: 3, ifExpr: "VERTEX_COLOUR_TINTING" },
		],
		out: [
			{ name: "vertexPos_world", type: SVT.Float4 },
			{ name: "vertexPos_cam", type: SVT.Float3 },
			{ name: "vertexNormal_cam", type: SVT.Float3 },
			{ name: "vertexUV_intp", type: SVT.Float2, ifExpr: "HAS_BASE_UV" },
			{ name: "vertexColour_intp", type: SVT.Float3, ifExpr: "VERTEX_COLOUR_TINTING" },
		],

		constants: [
			{ name: "modelMatrix", type: SVT.Float4x4 },
			{ name: "modelViewMatrix", type: SVT.Float4x4 },
			{ name: "modelViewProjectionMatrix", type: SVT.Float4x4 },
			{ name: "normalMatrix", type: SVT.Float3x3 },
			{ name: "texScaleOffset", type: SVT.Float4, ifExpr: "HAS_BASE_UV" },
		],

		modules: [
			
		],

		main: `
			gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
			vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
			vertexNormal_cam = normalMatrix * vertexNormal;
			vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;
			#if HAS_BASE_UV
				vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;
			#endif
			#if VERTEX_COLOUR_TINTING
				vertexColour_intp = vertexColour;
			#endif
		`
	};

	const pbrFragmentFunction: FragmentFunction = {
		in: [
			{ name: "vertexPos_world", type: SVT.Float4 },
			{ name: "vertexPos_cam", type: SVT.Float3 },
			{ name: "vertexNormal_cam", type: SVT.Float3 },
			{ name: "vertexUV_intp", type: SVT.Float2, ifExpr: "HAS_BASE_UV" },
			{ name: "vertexColour_intp", type: SVT.Float3, ifExpr: "VERTEX_COLOUR_TINTING" },
		],
		outCount: 1,

		modules: [
			"pbrSurfaceInfo",
			"pbrMaterialInfo",
			"pbrMaterialLighting",
			"lightContrib"
		],

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

	export function makeStdShader(): Shader {
		const defines: ShaderDefine[] = [];
		const feat: Features = 0;
		if (feat & Features.VtxUV) {
			defines.push({ name: "HAS_BASE_UV" });
		}
		if (feat & Features.VtxColour) {
			defines.push({ name: "VERTEX_COLOUR_TINTING" });
		}
		defines.push({ name: "PBR_LIGHT_QUALITY", value: 2 });

		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,
			defines,
			vertexFunction: pbrVertexFunction,
			fragmentFunction: pbrFragmentFunction
		};
	}

} // ns sd.render.shader
