// render/effect/legacy-modules - legacy material effect modules
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./module.ts" />

namespace sd.render.effect {
	
	import SVT = ShaderValueType;
	
	registerModule({
		name: "legacy/colourResponse",
		requires: [
			"legacy/surfaceInfo",
			"legacy/materialInfo",
		],
		samplers: [
			{ name: "specularSampler", type: TextureClass.Plain, index: 2, ifExpr: "SPECULAR_MAP" }
		],
		provides: [
			"ColourResponse"
		],
		code: `
		vec3 calcLightShared(vec3 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si, MaterialInfo mi) {
			float NdL = max(0.0, dot(si.N, -lightDirection_cam));
			vec3 diffuseContrib = lightColour * diffuseStrength * NdL;
		
		#ifdef SPECULAR
			vec3 specularContrib = vec3(0.0);
			vec3 viewVec = normalize(si.V);
			vec3 reflectVec = reflect(lightDirection_cam, si.N);
			float specularStrength = dot(viewVec, reflectVec);
			if (specularStrength > 0.0) {
			#ifdef SPECULAR_MAP
				vec3 specularColour = texture2D(specularSampler, si.UV).rgb * mi.specularFactor.rgb;
			#else
				vec3 specularColour = mi.specularFactor.rgb;
			#endif
				specularStrength = pow(specularStrength, mi.specularFactor.a) * diffuseStrength; // FIXME: not too sure about this (* diffuseStrength)
				specularContrib = specularColour * specularStrength;
				diffuseContrib += specularContrib;
			}
		#endif

			return diffuseContrib;
		}
		`
	});

	registerModule({
		name: "legacy/surfaceInfo",
		requires: [
			// "mathUtils",
			"normalPerturbation",
			"NormalMap"
		],
		provides: [
			"SurfaceInfo"
		],
		structs: [{
			name: "SurfaceInfo",
			code: `
			struct SurfaceInfo {
				vec3 V;  // vertex dir (cam)
				vec3 N;  // surface normal (cam)
			#ifdef HAS_BASE_UV
				vec2 UV; // (adjusted) main UV
			#endif
			};
			`
		}],
		constants: [
			{ name: "normalMatrix", type: SVT.Float3x3 }
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
				// <-- adjust uv using heightmap
				si.UV = vertexUV_intp;
			#elif defined(HAS_BASE_UV)
				si.UV = vertexUV_intp;
			#endif
			#ifdef NORMAL_MAP
				vec3 mapNormal = getMappedNormal(si.UV);
				// mapNormal.y = -mapNormal.y;
				si.N = normalize(TBN * mapNormal);
			#endif
			return si;
		}
		`
	});

	registerModule({
		name: "legacy/materialInfo",
		requires: [
			"ConvertSRGB",			
		],
		provides: [
			"MaterialInfo"
		],
		constants: [
			{ name: "baseColour", type: SVT.Float4 },
			{ name: "specularFactor", type: SVT.Float4, ifExpr: "SPECULAR" },
		],
		samplers: [
			{ name: "albedoMap", type: TextureClass.Plain, index: 0, ifExpr: "ALBEDO_MAP" },
		],
		structs: [
			{
				name: "MaterialInfo",
				code: `
				struct MaterialInfo {
					vec4 albedo;
					vec4 specularFactor;
				};
				`
			}
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
			mi.albedo = vec4(colour, 1.0);

			#ifdef SPECULAR
			mi.specularFactor = specularFactor;
			#endif
			return mi;
		}
		`
	});

} // ns sd.render.effect
