// render/effect/core-modules - core effect modules
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./module.ts" />

namespace sd.render.effect {

	import SVT = ShaderValueType;

	registerModule({
		name: "grading/srgb/lofi",
		provides: ["ConvertSRGB"],
		code: `
		vec3 srgbToLinear(vec3 colour) {
			return colour * colour;
		}
		vec3 linearToSRGB(vec3 colour) {
			return sqrt(colour);
		}
		`
	});

	registerModule({
		name: "grading/srgb/basic",
		provides: ["ConvertSRGB"],
		constValues: [
			{ name: "GAMMA", type: SVT.Float, expr: "2.2" },
			{ name: "SRGB_TO_LINEAR", type: SVT.Float3, expr: "vec3(GAMMA)" },
			{ name: "LINEAR_TO_SRGB", type: SVT.Float3, expr: "vec3(1.0 / GAMMA)" }
		],
		code: `
		vec3 srgbToLinear(vec3 colour) {
			return pow(colour, SRGB_TO_LINEAR);
		}
		vec3 linearToSRGB(vec3 colour) {
			return pow(colour, LINEAR_TO_SRGB);
		}
		`
	});

	registerModule({
		name: "mathUtils",
		code: `
		float linearStep(float low, float high, float v) {
			return clamp((v-low) / (high-low), 0.0, 1.0);
		}

		vec3 transformQuat(vec3 a, vec4 q) {
			float ix = q.w * a.x + q.y * a.z - q.z * a.y;
			float iy = q.w * a.y + q.z * a.x - q.x * a.z;
			float iz = q.w * a.z + q.x * a.y - q.y * a.x;
			float iw = -q.x * a.x - q.y * a.y - q.z * a.z;
			vec3 result;
			result.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
			result.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
			result.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
			return result;
		}

		mat3 transpose(mat3 m) {
			vec3 c0 = m[0];
			vec3 c1 = m[1];
			vec3 c2 = m[2];
			return mat3(vec3(c0.x, c1.x, c2.x), vec3(c0.y, c1.y, c2.y), vec3(c0.z, c1.z, c2.z));
		}

		mat3 inverse(mat3 m) {
			float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
			float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
			float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];
			float b01 = a22 * a11 - a12 * a21;
			float b11 = -a22 * a10 + a12 * a20;
			float b21 = a21 * a10 - a11 * a20;
			float det = a00 * b01 + a01 * b11 + a02 * b21;
			return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
						b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
						b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
		}
		`
	});

	registerModule({
		name: "vertexSkinning",
		structs: [{
			name: "Joint",
			code: `
			struct Joint {
				vec4 rotation_joint;
				mat4 transform_model;
			};
			`
		}],
		constants: [
			{ name: "jointIndexOffset", type: SVT.Int }
		],
		samplers: [
			{ name: "jointData", type: TextureClass.Plain, index: 8 }
		],
		code: `
		// The jointData texture is 256x256 xyzw texels.
		// Each joint takes up 8 texels that contain the Joint structure data
		// The sampler must be set up with nearest neighbour filtering and have no mipmaps
		Joint getIndexedJoint(sampler2D jointData, float jointIndex) {
			float row = (floor(jointIndex / 32.0) + 0.5) / 256.0;
			float col = (mod(jointIndex, 32.0) * 8.0) + 0.5;
			Joint j;
			j.rotation_joint = texture2D(jointData, vec2(col / 256.0, row));
			// rows 1,2,3 are reserved
			j.transform_model[0] = texture2D(jointData, vec2((col + 4.0) / 256.0, row));
			j.transform_model[1] = texture2D(jointData, vec2((col + 5.0) / 256.0, row));
			j.transform_model[2] = texture2D(jointData, vec2((col + 6.0) / 256.0, row));
			j.transform_model[3] = texture2D(jointData, vec2((col + 7.0) / 256.0, row));
			return j;
		}

		void getTransformedVertex(vec4 weightedPos_joint[4], vec4 vertexJointIndexes, out vec3 vertexPos, inout vec3 vertexNormal) {
			vec3 vertexPos_model = vec3(0.0);
			vec3 vertexNormal_final = vec3(0.0);

			for (int vji = 0; vji < 4; ++vji) {
				float jointIndex = vertexJointIndexes[vji];
				if (jointIndex >= 0.0) {
					Joint j = getIndexedJoint(jointIndex);
					vec4 weightedPos = weightedPos_joint[vji];
					vec3 tempPos = (j.transform_model * vec4(weightedPos.xyz, 1.0)).xyz;
					vertexPos_model += tempPos * weightedPos.w;
					// normal += ( joint.m_Orient * vert.m_Normal ) * weight.m_Bias;
					vec3 vertexNormal_joint = transformQuat(vertexNormal, j.rotation_joint);
					vertexNormal_final += vertexNormal_joint * weightedPos.w;
				}
			}

			vertexPos = vertexPos_model;
			vertexNormal = normalize(vertexNormal_final);
		}

		// get transformed pos/normal from uniform base info
		// vec3 vertexPos_model = vec3(0.0);
		// vec3 vertexNormal_final = vec3(0.0);
		// vec4 weightedPos_joint[4];
		// weightedPos_joint[0] = vertexWeightedPos0_joint + float(jointIndexOffset);
		// weightedPos_joint[1] = vertexWeightedPos1_joint + float(jointIndexOffset);
		// weightedPos_joint[2] = vertexWeightedPos2_joint + float(jointIndexOffset);
		// weightedPos_joint[3] = vertexWeightedPos3_joint + float(jointIndexOffset);
		// getTransformedVertex(weightedPos_joint, vertexPos_model, vertexNormal);
		`
	});

	registerModule({
		name: "heightOcclusionMapping",
		provides: ["Parallax"],
		code: `
		vec2 parallaxMapping(sampler2D heightMap, in vec3 V, in vec2 T, out float parallaxHeight) {
			// determine optimal number of layers
			const float minLayers = 8.0;
			const float maxLayers = 25.0;
			float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0, 0, 1), V)));

			// height of each layer
			float layerHeight = 1.0 / numLayers;
			// current depth of the layer
			float curLayerHeight = 0.0;
			// shift of texture coordinates for each layer
			vec2 dtex = -0.01 * V.xy / V.z / numLayers;

			// current texture coordinates
			vec2 currentTextureCoords = T + (0.005 * V.xy / V.z / numLayers);

			// depth from heightmap
			float heightFromTexture = texture2D(heightMap, currentTextureCoords).w;

			// while point is above the surface
			// while(heightFromTexture > curLayerHeight) {
			for (int layerIx = 0; layerIx < 25; ++layerIx) {
				// to the next layer
				curLayerHeight += layerHeight;
				// shift of texture coordinates
				currentTextureCoords -= dtex;
				// new depth from heightmap
				heightFromTexture = texture2D(heightMap, currentTextureCoords).w;

				if (heightFromTexture <= curLayerHeight) break;
			}

			// previous texture coordinates
			vec2 prevTCoords = currentTextureCoords + dtex;

			// heights for linear interpolation
			float nextH = heightFromTexture - curLayerHeight;
			float prevH = texture2D(heightMap, prevTCoords).w - curLayerHeight + layerHeight;

			// proportions for linear interpolation
			float weight = nextH / (nextH - prevH);

			// interpolation of texture coordinates
			vec2 finalTexCoords = prevTCoords * weight + currentTextureCoords * (1.0 - weight);

			// interpolation of depth values
			parallaxHeight = curLayerHeight + prevH * weight + nextH * (1.0 - weight);

			// return result
			return finalTexCoords;
		}
		`
	});

	registerModule({
		name: "normalPerturbation",
		extensions: [{
			name: "GL_OES_standard_derivatives",
			action: "require"
		}],
		code: `
		mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {
			// get edge vectors of the pixel triangle
			vec3 dp1 = dFdx(p);
			vec3 dp2 = dFdy(p);
			vec2 duv1 = dFdx(uv);
			vec2 duv2 = dFdy(uv);
			// solve the linear system
			vec3 dp2perp = cross(dp2, N);
			vec3 dp1perp = cross(N, dp1);
			vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
			vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
			// construct a scale-invariant frame 
			float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
			return mat3(T * invmax, B * invmax, N);
		}

		vec3 perturbNormal(sampler2D normalMap, vec3 N, vec3 V, vec2 uv) {
			// assume N, the interpolated vertex normal and 
			// V, the view vector (vertex to eye)
			vec3 map = texture2D(normalMap, uv).xyz * 2.0 - 1.0;
			map.y = -map.y;
			mat3 TBN = cotangentFrame(N, -V, uv);
			return normalize(TBN * map);
		}
		`
	});

	registerModule({
		name: "basicNormalMap",
		provides: [
			"NormalMap"
		],
		samplers: [
			{ name: "normalMap", type: TextureClass.Plain, index: 1, ifExpr: "NORMAL_MAP" }
		],
		code: `
		#ifdef NORMAL_MAP
		vec3 getMappedNormal(vec2 uv) {
			return texture2D(normalMap, uv).xyz * 2.0 - 1.0;
		}
		#endif
		`
	});
	
	registerModule({
		name: "vsmShadowMapping",
		requires: ["mathUtils"],
		code: `
		float VSM(sampler2D shadowMap, vec2 uv, float compare, float strength, float bias) {
			vec2 moments = texture2D(shadowMap, uv).xy;
			float p = smoothstep(compare - bias, compare, moments.x);
			float variance = max(moments.y - moments.x * moments.x, -0.001);
			float d = compare - moments.x;
			float p_max = linearStep(0.2, 1.0, variance / (variance + d*d));
			return clamp(max(p, p_max), 0.0, 1.0);
		}
		`
	});

	registerModule({
		name: "lightEntry",
		structs: [{
			name: "LightEntry",
			code: `
			struct LightEntry {
				vec4 colourAndType;
				vec4 positionCamAndIntensity;
				vec4 positionWorldAndRange;
				vec4 directionAndCutoff;
				vec4 shadowStrengthBias;
			};
			`
		}]
	});

	registerModule({
		name: "tiledLight",
		requires: [
			"lightEntry"
		],
		samplers: [
			{ name: "lightLUTSampler", type: TextureClass.Plain, index: 6 }
		],
		constants: [
			{ name: "lightLUTParam", type: SVT.Float2 },
		],
		code: `
		LightEntry getLightEntry(float lightIx) {
			float row = (floor(lightIx / 128.0) + 0.5) / 512.0;
			float col = (mod(lightIx, 128.0) * 5.0) + 0.5;
			LightEntry le;
			le.colourAndType = texture2D(lightLUTSampler, vec2(col / 640.0, row));
			le.positionCamAndIntensity = texture2D(lightLUTSampler, vec2((col + 1.0) / 640.0, row));
			le.positionWorldAndRange = texture2D(lightLUTSampler, vec2((col + 2.0) / 640.0, row));
			le.directionAndCutoff = texture2D(lightLUTSampler, vec2((col + 3.0) / 640.0, row));
			le.shadowStrengthBias = texture2D(lightLUTSampler, vec2((col + 4.0) / 640.0, row));
			return le;
		}

		float getLightIndex(float listIndex) {
			float liRow = (floor(listIndex / 2560.0) + 256.0 + 0.5) / 512.0;
			float rowElementIndex = mod(listIndex, 2560.0);
			float liCol = (floor(rowElementIndex / 4.0) + 0.5) / 640.0;
			float element = floor(mod(rowElementIndex, 4.0));
			vec4 packedIndices = texture2D(lightLUTSampler, vec2(liCol, liRow));
			// gles2: only constant index accesses allowed
			if (element < 1.0) return packedIndices[0];
			if (element < 2.0) return packedIndices[1];
			if (element < 3.0) return packedIndices[2];
			return packedIndices[3];
		}

		vec2 getLightGridCell(vec2 fragCoord) {
			vec2 lightGridPos = vec2(floor(fragCoord.x / 32.0), floor(fragCoord.y / 32.0));
			float lightGridIndex = (lightGridPos.y * lightLUTParam.x) + lightGridPos.x;
			float lgRow = (floor(lightGridIndex / 1280.0) + 256.0 + 240.0 + 0.5) / 512.0;
			float rowPairIndex = mod(lightGridIndex, 1280.0);
			float lgCol = (floor(rowPairIndex / 2.0) + 0.5) / 640.0;
			float pair = floor(mod(rowPairIndex, 2.0));

			// gles2: only constant index accesses allowed
			vec4 cellPair = texture2D(lightLUTSampler, vec2(lgCol, lgRow));
			if (pair < 1.0) return cellPair.xy;
			return cellPair.zw;
		}
		`
	});

	registerModule({
		name: "shadowedTotalLightContrib",
		requires: [
			"vsmShadowMapping",
			"lightEntry",
			"lightContrib",
			"SurfaceInfo",
			"MaterialInfo",
		],
		samplers: [
			{ name: "shadowSampler", type: TextureClass.Plain, index: 7, ifExpr: "SHADOW_MAP" }
		],
		constants: [
			{ name: "lightViewMatrix", type: SVT.Float4x4 },
			{ name: "lightProjMatrix", type: SVT.Float4x4 },
			{ name: "shadowCastingLightIndex", type: SVT.Int, ifExpr: "SHADOW_MAP" }
		],
		code: `
		#ifdef SHADOW_MAP
		float lightVSMShadowFactor(LightEntry lightData) {
			float shadowStrength = lightData.shadowStrengthBias.x;
			float shadowBias = lightData.shadowStrengthBias.y;
			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;
			vec4 lightDevice = lightProjMatrix * vec4(lightPos, 1.0);
			vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;
			vec2 lightUV = lightDeviceNormal * 0.5 + 0.5;
			float lightTest = clamp(length(lightPos) / 12.0, 0.0, 1.0);
			shadowFactor = VSM(shadowSampler, lightUV, lightTest, shadowStrength, shadowBias);
		}
		#endif

		vec3 totalDynamicLightContributionTiledForward(SurfaceInfo si, MaterialInfo mi) {
			vec3 totalLight = vec3(0.0);
			vec2 fragCoord = vec2(gl_FragCoord.x, lightLUTParam.y - gl_FragCoord.y);
			vec2 lightOffsetCount = getLightGridCell(fragCoord);
			int lightListOffset = int(lightOffsetCount.x);
			int lightListCount = int(lightOffsetCount.y);

			for (int llix = 0; llix < 128; ++llix) {
				if (llix == lightListCount) break; // hack to overcome gles2 limitation where loops need constant max counters

				float lightIx = getLightIndex(float(lightListOffset + llix));
				LightEntry lightData = getLightEntry(lightIx);
				if (lightData.colourAndType.w <= 0.0) break;

				vec3 lightContrib = getLightContribution(lightData, si, mi);

				#ifdef SHADOW_MAP
					if (int(lightIx) == shadowCastingLightIndex) {
						lightContrib *= lightVSMShadowFactor(lightData);
					}
				#endif

				totalLight += lightContrib;
			}

			return totalLight;
		}
		`
	});

	registerModule({
		name: "lightContrib",
		requires: [
			"SurfaceInfo",
			"MaterialInfo",
			"ColourResponse",
			"lightEntry"
		],
		code: `
		vec3 calcPointLight(vec3 lightColour, float intensity, float range, vec3 lightPos_cam, vec3 lightPos_world, SurfaceInfo si, MaterialInfo mi) {
			float distance = length(vertexPos_world.xyz - lightPos_world); // use world positions for distance as cam will warp coords
			vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);
			float attenuation = clamp(1.0 - distance / range, 0.0, 1.0);
			attenuation *= attenuation;
			float diffuseStrength = intensity * attenuation;
			return calcLightShared(lightColour, diffuseStrength, lightDirection_cam, si, mi);
		}

		vec3 calcSpotLight(vec3 lightColour, float intensity, float range, float cutoff, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, SurfaceInfo si, MaterialInfo mi) {
			vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);
			float spotCosAngle = dot(lightToPoint, lightDirection);
			if (spotCosAngle > cutoff) {
				vec3 light = calcPointLight(lightColour, intensity, range, lightPos_cam, lightPos_world, si, mi);
				return light * smoothstep(cutoff, cutoff + 0.01, spotCosAngle);
			}
			return vec3(0.0);
		}

		vec3 getLightContribution(LightEntry light, SurfaceInfo si, MaterialInfo mi) {
			vec3 colour = light.colourAndType.xyz;
			float type = light.colourAndType.w;
			vec3 lightPos_cam = light.positionCamAndIntensity.xyz;
			float intensity = light.positionCamAndIntensity.w;

			if (type == ${entity.LightType.Directional}.0) {
				return calcLightShared(colour, intensity, light.directionAndCutoff.xyz, si, mi);
			}

			vec3 lightPos_world = light.positionWorldAndRange.xyz;
			float range = light.positionWorldAndRange.w;
			if (type == ${entity.LightType.Point}.0) {
				return calcPointLight(colour, intensity, range, lightPos_cam, lightPos_world, si, mi);
			}

			float cutoff = light.directionAndCutoff.w;
			if (type == ${entity.LightType.Spot}.0) {
				return calcSpotLight(colour, intensity, range, cutoff, lightPos_cam, lightPos_world, light.directionAndCutoff.xyz, si, mi);
			}

			return vec3(0.0); // we should never get here
		}
		`
	});

	registerModule({
		name: "fog/depth/linear",
		provides: ["DepthFog"],

		constants: [
			{ name: "fogColour", type: SVT.Float4 },
			{ name: "fogParams", type: SVT.Float4 },
		],

		constValues: [
			{ name: "FOGPARAM_START", type: SVT.Int, expr: "0" },
			{ name: "FOGPARAM_DEPTH", type: SVT.Int, expr: "1" },
			{ name: "FOGPARAM_DENSITY", type: SVT.Int, expr: "2" },
		],

		code: `
		float fogDensity(float testDepth) {
			return clamp((testDepth - fogParams[FOGPARAM_START]) / fogParams[FOGPARAM_DEPTH], 0.0, fogParams[FOGPARAM_DENSITY]);
		}

		vec3 applyDepthFog(vec3 colour, float fragZ) {
			return mix(colour, fogColour.rgb, fogDensity(fragZ));
		}
		`
	});

} // ns sd.render.effect
