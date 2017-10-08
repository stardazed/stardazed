// render/effect/pbr-modules - standard material effect modules
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../module.ts" />

namespace sd.render.effect {
	
	import SVT = ShaderValueType;
	
	registerModule({
		name: "pbr/lightingMath",
		constValues: [
			{ name: "PI", type: SVT.Float, expr: "3.1415926536" }
		],
		code: `
		// compute fresnel specular factor for given base specular and product
		// product could be NdV or VdH depending on used technique
		vec3 fresnel_factor(vec3 f0, float product) {
			// method A
			// return mix(f0, vec3(1.0), pow(1.01 - product, 5.0));
			// method B (from Brian Karis' paper)
			return f0 + (vec3(1.0) - f0) * pow(2.0, (-5.55473 * product - 6.98316) * product);
			// method C (UE4)
			// float Fc = pow(1.0 - product, 5.0);
			// return clamp(50.0 * f0.g, 0.0, 1.0) * Fc + (1.0 - Fc) * f0;
		}

		// following functions are copies of UE4
		// for computing cook-torrance specular lighting terms
		float D_blinn(float roughness, float NdH) {
			float m = roughness * roughness;
			float m2 = m * m;
			float n = 2.0 / m2 - 2.0;
			return (n + 2.0) / (2.0 * PI) * pow(NdH, n);
		}

		float D_GGX(float roughness, float NdH) {
			float m = roughness * roughness;
			float m2 = m * m;
			float d = (NdH * m2 - NdH) * NdH + 1.0;
			return m2 / (PI * d * d);
		}

		float G_schlick(float roughness, float NdV, float NdL) {
			float k = roughness * roughness * 0.5;
			float V = NdV * (1.0 - k) + k;
			float L = NdL * (1.0 - k) + k;
			return 0.25 / max(0.0001, V * L); // avoid infinity as it screws up stuff rather royally, likely not best way tho
		}

		vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
			return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
		}

		// simple phong specular calculation with normalization
		vec3 phong_specular(vec3 V, vec3 L, vec3 N, vec3 specular, float roughness) {
			vec3 R = reflect(-L, N);
			float spec = max(0.0, dot(V, R));
			float k = 1.999 / max(0.0001, roughness * roughness);
			return min(1.0, 3.0 * 0.0398 * k) * pow(spec, min(10000.0, k)) * specular;
		}

		// simple blinn specular calculation with normalization
		vec3 blinn_specular(float NdH, vec3 specular, float roughness) {
			float k = 1.999 / max(0.0001, roughness * roughness);
			return min(1.0, 3.0 * 0.0398 * k) * pow(NdH, min(10000.0, k)) * specular;
		}

		// cook-torrance specular calculation
		vec3 cooktorrance_specular(float NdL, float NdV, float NdH, vec3 specular, float roughness) {
			// float D = D_blinn(roughness, NdH);
			float D = D_GGX(roughness, NdH);
			float G = G_schlick(roughness, NdV, NdL);
			float rim = mix(1.0 - roughness * 0.9, 1.0, NdV); // I cannot tell if this does anything at all
			return (1.0 / rim) * specular * G * D;
			// return specular * G * D;
		}
		`
	});

	const enum PBRLightingQuality {
		Phong,
		Blinn,
		CookTorrance,
	}

	registerModule({
		name: "pbr/lightResponse",
		requires: [
			"ConvertSRGB",
			"pbr/surfaceInfo",
			"pbr/materialInfo",
			"pbr/lightingMath"
		],
		provides: [
			"LightResponse",
		],
		extensions: [
			{ name: "GL_EXT_shader_texture_lod", action: "require" }
		],
		constValues: [
			{ name: "PHONG_DIFFUSE", type: SVT.Float, expr: "1.0 / 3.141592654" }
		],
		samplers: [
			{ name: "brdfLookupMap", type: TextureClass.Plain, index: 4 },
			{ name: "environmentMap", type: TextureClass.CubeMap, index: 5 },
		],
		code: `
		vec3 calcLightIBL(SurfaceInfo si, MaterialInfo mi) {
			// material properties
			float metallic = mi.metallic;
			float roughness = mi.roughness;
			float ao = mi.ao;
			vec3 F0 = mix(vec3(0.04), mi.albedo.rgb, metallic);

			// terms
			vec3 F = fresnelSchlickRoughness(max(si.NdV, 0.0), F0, roughness);
			vec3 kS = F;
			vec3 kD = 1.0 - kS;
			kD *= 1.0 - metallic;

			// sample both the pre-filter map and the BRDF lut and combine them together as per the Split-Sum approximation to get the IBL specular part.
			vec2 brdf = texture2D(brdfLookupMap, vec2(max(si.NdV, 0.0), roughness)).xy;
			vec3 irradiance = textureCubeLodEXT(environmentMap, si.N, 4.0).rgb;
			vec3 prefilteredColor = textureCubeLodEXT(environmentMap, si.reflectedV, roughness * 5.0).rgb;

			#ifdef NO_SRGB_TEXTURES
				irradiance = pow(irradiance, vec3(2.2));
				prefilteredColor = pow(prefilteredColor, vec3(2.2));
			#endif

			vec3 diffuse = irradiance * mi.albedo.rgb;
			vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);
			vec3 ambient = (kD * diffuse + specular) * ao;

			return ambient;
		}

		vec3 calcLightShared(vec3 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si, MaterialInfo mi) {
			vec3 V = si.V;
			vec3 N = si.N;
			vec3 L = -lightDirection_cam;
			#if PBR_LIGHT_QUALITY != ${PBRLightingQuality.Phong}
				vec3 H = normalize(L + V);
			#endif

			// material properties
			float metallic = mi.metallic;
			float roughness = mi.roughness;
			vec3 specularColour = mix(vec3(0.04), mi.albedo.xyz, metallic);

			float NdL = max(0.0, dot(N, L));

			// specular contribution
			#if PBR_LIGHT_QUALITY == ${PBRLightingQuality.Phong}
				vec3 specfresnel = fresnel_factor(specularColour, si.NdV);
				vec3 specref = phong_specular(V, L, N, specfresnel, roughness);
			#else
				float NdH = max(0.001, dot(N, H));
				float HdV = max(0.001, dot(H, V));
				vec3 specfresnel = fresnel_factor(specularColour, HdV);

				#if PBR_LIGHT_QUALITY == ${PBRLightingQuality.Blinn}
					vec3 specref = blinn_specular(NdH, specfresnel, roughness);
				#else
					vec3 specref = cooktorrance_specular(NdL, si.NdV, NdH, specfresnel, roughness);
				#endif
			#endif

			specref *= vec3(NdL);

			// diffuse contribition is common for all lighting models
			// vec3 diffref = (vec3(1.0) - specfresnel) * NdL * NdL; // this matches Unity rendering by ogling
			vec3 diffref = (vec3(1.0) - specfresnel) * PHONG_DIFFUSE * NdL; // original

			// direct light
			vec3 light_color = lightColour * diffuseStrength;
			vec3 reflected_light = specref * light_color;
			vec3 diffuse_light = diffref * light_color;

			// final result
			return diffuse_light * mix(mi.albedo.xyz, vec3(0.0), metallic) + reflected_light;
		}
		`
	});

	registerModule({
		name: "pbr/materialInfo",
		provides: [
			"MaterialInfo"
		],
		requires: [
			"ConvertSRGB"
		],
		constValues: [
			{ name: "MAT_ROUGHNESS", type: SVT.Int, expr: "0" },
			{ name: "MAT_METALLIC", type: SVT.Int, expr: "1" },
			{ name: "MAT_AMBIENT_OCCLUSION", type: SVT.Int, expr: "2" },
		],
		structs: [{
			name: "MaterialInfo",
			code: `
			struct MaterialInfo {
				vec4 albedo;   // premultiplied alpha
				vec3 emissive; // premultiplied intensity
				float roughness;
				float metallic;
				float ao;
				#ifdef ALPHA_CUTOFF
					float alphaCutoff;
				#endif
			};
			`}
		],
		constants: [
			{ name: "baseColour", type: SVT.Float4 },
			{ name: "emissiveData", type: SVT.Float4 },
			{ name: "materialParam", type: SVT.Float4 }
		],
		samplers: [
			{ name: "albedoMap", type: TextureClass.Plain, index: 0, ifExpr: "ALBEDO_MAP" },
			{ name: "materialMap", type: TextureClass.Plain, index: 1, ifExpr: "defined(ROUGHNESS_MAP) || defined(METALLIC_MAP) || defined(AO_MAP)" },
			{ name: "emissiveMap", type: TextureClass.Plain, index: 2, ifExpr: "EMISSIVE_MAP" },
		],
		code: `
		MaterialInfo getMaterialInfo(vec2 materialUV) {
			MaterialInfo mi;
			vec3 colour = srgbToLinear(baseColour.rgb);
			#ifdef ALBEDO_MAP
				vec3 mapColour = texture2D(albedoMap, materialUV).rgb;
				#ifdef NO_SRGB_TEXTURES
					mapColour = srgbToLinear(mapColour);
				#endif
				colour *= mapColour;
			#endif
			#ifdef VERTEX_COLOUR_TINTING
				vec3 tintColour = srgbToLinear(vertexColour_intp);
				colour *= tintColour;
			#endif
			mi.albedo = vec4(colour, 1.0); // FIXME: opacity/cutout support

			#ifdef EMISSIVE
				#ifdef EMISSIVE_MAP
					mi.emissive = texture2D(emissiveMap, materialUV).rgb;
				#else
					mi.emissive = emissiveData.rgb * emissiveData.w;
				#endif
			#else
				mi.emissive = vec3(0.0);
			#endif

			#if defined(ROUGHNESS_MAP) || defined(METALLIC_MAP) || defined(AO_MAP)
				vec3 mapRMA = texture2D(materialMap, materialUV).xyz;
				#ifdef ROUGHNESS_MAP
					mi.roughness = mapRMA[MAT_ROUGHNESS];
				#else
					mi.roughness = materialParam[MAT_ROUGHNESS];
				#endif
				#ifdef METALLIC_MAP
					mi.metallic = mapRMA[MAT_METALLIC];
				#else
					mi.metallic = materialParam[MAT_METALLIC];
				#endif
				#ifdef AO_MAP
					mi.ao = mapRMA[MAT_AMBIENT_OCCLUSION];
				#else
					mi.ao = 1.0;
				#endif
			#else
				mi.roughness = materialParam[MAT_ROUGHNESS];
				mi.metallic = materialParam[MAT_METALLIC];
				mi.ao = 1.0;
			#endif

			return mi;
		}
		`
	});

	registerModule({
		name: "pbr/surfaceInfo",
		provides: [
			"SurfaceInfo"
		],
		requires: [
			"mathUtils",
			"normalPerturbation",
			"parallaxMapping"
		],
		structs: [{
			name: "SurfaceInfo",
			code: `
			struct SurfaceInfo {
				vec3 V;  // vertex dir (cam)
				vec3 N;  // surface normal (cam)
				mat3 transNormalMatrix;
				vec3 reflectedV;
				vec2 UV; // (adjusted) main UV
				float NdV;
			};
			`
		}],
		constants: [
			{ name: "normalMatrix", type: SVT.Float3x3 }
		],
		samplers: [
			{ name: "normalHeightMap", type: TextureClass.Plain, index: 3, ifExpr: "defined(NORMAL_MAP) || defined(HEIGHT_MAP)" }
		],
		code: `
		SurfaceInfo calcSurfaceInfo() {
			SurfaceInfo si;
			si.V = normalize(-vertexPos_cam);
			si.N = normalize(vertexNormal_cam);
			#if defined(HEIGHT_MAP) || defined(NORMAL_MAP)
				mat3 TBN = cotangentFrame(si.N, vertexPos_cam, vertexUV_intp);
			#endif
			#ifdef HEIGHT_MAP
				vec3 eyeTan = normalize(inverse(TBN) * si.V);

				// basic parallax
				// float finalH = texture2D(normalHeightMap, vertexUV_intp).a;
				// finalH = finalH * 0.04 - 0.02;
				// si.UV = vertexUV_intp + (eyeTan.xy * h);

				// parallax occlusion
				float finalH = 0.0;
				si.UV = parallaxMapping(eyeTan, vertexUV_intp, finalH);
			#else
				#ifdef HAS_BASE_UV
					si.UV = vertexUV_intp;
				#endif
			#endif
			#ifdef NORMAL_MAP
				vec3 map = texture2D(normalHeightMap, si.UV).xyz * 2.0 - 1.0;
				si.N = normalize(TBN * map);
			#endif
			si.NdV = max(0.001, dot(si.N, si.V));
			si.transNormalMatrix = transpose(normalMatrix);
			si.reflectedV = si.transNormalMatrix * reflect(-si.V, si.N);
			return si;
		}
		`
	});

} // ns sd.render.effect
