// render/gl1/shaders/shadermaker - prototype shader gen
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	export type Conditional<T> = T & {
		ifExpr?: string;
	};

	export interface ShaderModule {
		dependencies?: string[];
		extensions?: ExtensionUsage[];
		textures?: Conditional<SamplerSlot>[];
		constantBlocks?: Conditional<ShaderConstantBlock>[];
		constValues?: ShaderConstValue[];
		structs?: string[];
		code?: string;
	}

	const modules: { [name: string]: ShaderModule | undefined; } = {};

	function stableUnique<T>(arr: T[]) {
		const seen = new Set<T>();
		return arr.filter(val => {
			if (seen.has(val)) {
				return false;
			}
			seen.add(val);
			return true;
		});
	}

	export function resolveModuleDependencies(moduleName: string, inoutList: string[]) {
		inoutList.unshift(moduleName);
		const module = modules[moduleName];
		if (module) {
			const deps = module.dependencies || [];
			for (const dep of deps) {
				resolveModuleDependencies(dep, inoutList);
			}
		}
		else {
			console.warn(`ShaderModule ${moduleName} not found.`);
		}
	}

	export function resolveDependencies(moduleNames: string[]) {
		const end = moduleNames.length - 1;
		const depList: string[] = [];
		for (let index = end; index >= 0; --index) {
			resolveModuleDependencies(moduleNames[index], depList);
		}
		return stableUnique(depList);
	}

	export function resolveModules(modNames: string[]): ShaderModule {
		const module: ShaderModule = {
			extensions: [],
			textures: [],
			constantBlocks: [],
			constValues: [],
			structs: [],
			code: ""
		};

		const depList = resolveDependencies(modNames);
		for (const modName of depList) {
			const depModule = modules[modName];
			if (depModule) {
				if (depModule.extensions) {
					module.extensions!.push(...depModule.extensions);
				}
				if (depModule.textures) {
					module.textures!.push(...depModule.textures);
				}
				if (depModule.constantBlocks) {
					for (const depBlock of depModule.constantBlocks) {
						let localBlock = module.constantBlocks!.find(c => c.blockName === depBlock.blockName);
						if (! localBlock) {
							localBlock = { blockName: depBlock.blockName, constants: [] };
							module.constantBlocks!.push(localBlock);
						}
						localBlock.constants.push(...depBlock.constants);
					}
				}
				if (depModule.constValues) {
					module.constValues!.push(...depModule.constValues);
				}
				if (depModule.structs) {
					module.structs!.push(...depModule.structs);
				}
				if (depModule.code) {
					module.code += `// module ${modName}\n${depModule.code}`;
				}
			}
		}

		return module;
	}


	// ----

	const enum PBRLightingQuality {
		Phong,
		Blinn,
		CookTorrance
	}

	modules.gammaConstants = {
		constValues: [
			{ name: "GAMMA", type: "float", expr: "2.2" },
			{ name: "SRGB_TO_LINEAR", type: "float3", expr: "vec3(GAMMA)" },
			{ name: "LINEAR_TO_SRGB", type: "float3", expr: "vec3(1.0 / GAMMA)" }
		]
	};

	modules.mathUtils = {
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
	};

	modules.vertexSkinning = {
		structs: [`
			struct Joint {
				vec4 rotation_joint;
				mat4 transform_model;
			};
		`],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "jointIndexOffset", type: "int" }
				]
			}
		],
		textures: [
			{ name: "jointData", type: TextureClass.Normal, index: 8 }
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
	};

	modules.parallaxMapping = {
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
	};

	modules.normalPerturbation = {
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
	};

	modules.vsmShadowMapping = {
		dependencies: ["mathUtils"],
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
	};

	modules.pbrLightingMath = {
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
	};

	modules.pbrMaterialLighting = {
		dependencies: [
			"gammaConstants",
			"surfaceInfo",
			"materialInfo",
			"pbrLightingMath"
		],
		extensions: [
			{ name: "GL_EXT_shader_texture_lod", action: "require" }
		],
		constValues: [
			{ name: "PHONG_DIFFUSE", type: "float", expr: "1.0 / 3.141592654" }
		],
		textures: [
			{ name: "brdfLookupMap", type: TextureClass.Normal, index: 4 },
			{ name: "environmentMap", type: TextureClass.CubeMap, index: 5 },
		],
		code: `
		vec3 calcLightIBL(SurfaceInfo si, MaterialInfo mi) {
			// material properties
			float metallic = mi.metallic;
			float roughness = mi.roughness;
			vec3 specularColour = mix(vec3(0.04), mi.albedo, metallic);

			// lookup brdf, diffuse and specular terms
			vec2 brdf = texture2D(brdfLookupMap, vec2(roughness, 1.0 - si.NdV)).xy;
			vec3 envdiff = textureCubeLodEXT(environmentMap, si.transNormalMatrix * si.N, 4.0).xyz;
			vec3 envspec = textureCubeLodEXT(environmentMap, si.reflectedV, roughness * 5.0).xyz;

			#ifdef NO_SRGB_TEXTURES
				envdiff = pow(envdiff, SRGB_TO_LINEAR);
				envspec = pow(envspec, SRGB_TO_LINEAR);
			#endif

			// terms
			vec3 iblspec = min(vec3(0.99), fresnel_factor(specularColour, si.NdV) * brdf.x + brdf.y);
			vec3 reflected_light = iblspec * envspec;
			vec3 diffuse_light = envdiff * PHONG_DIFFUSE;

			return diffuse_light * mix(mi.albedo, vec3(0.0), metallic) + reflected_light;
		}

		vec3 calcLightShared(vec3 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si, MaterialInfo mi) {
			vec3 V = si.V;
			vec3 N = si.N;
			vec3 L = -lightDirection_cam;
			#if PBR_LIGHT_QUALITY > ${PBRLightingQuality.Phong}
				vec3 H = normalize(L + V);
			#endif

			// material properties
			float metallic = mi.metallic;
			float roughness = mi.roughness;
			vec3 specularColour = mix(vec3(0.04), mi.albedo, metallic);

			float NdL = max(0.0, dot(N, L));
			#if PBR_LIGHT_QUALITY > ${PBRLightingQuality.Phong}
				float NdH = max(0.001, dot(N, H));
				float HdV = max(0.001, dot(H, V));
			#endif

			// specular contribution
			#if PBR_LIGHT_QUALITY == ${PBRLightingQuality.Phong}
				vec3 specfresnel = fresnel_factor(specularColour, si.NdV);
				vec3 specref = phong_specular(V, L, N, specfresnel, roughness);
			#else
				vec3 specfresnel = fresnel_factor(specularColour, HdV);

				#if PBR_LIGHT_QUALITY == ${PBRLightingQuality.Blinn}
					vec3 specref = blinn_specular(NdH, specfresnel, roughness);
				#else
					vec3 specref = cooktorrance_specular(NdL, si.NdV, NdH, specfresnel, roughness);
				#endif
			#endif

			specref *= vec3(NdL);

			// diffuse contribition is common for all lighting models
			vec3 diffref = (vec3(1.0) - specfresnel) * NdL * NdL; // this matches Unity rendering by ogling
			// originally: vec3 diffref = (vec3(1.0) - specfresnel) * PHONG_DIFFUSE * NdL;

			// direct light
			vec3 light_color = lightColour * diffuseStrength;
			vec3 reflected_light = specref * light_color;
			vec3 diffuse_light = diffref * light_color;

			// final result
			return diffuse_light * mix(mi.albedo, vec3(0.0), metallic) + reflected_light;
		}
		`
	};

	modules.lightEntry = {
		structs: [
		`
		struct LightEntry {
			vec4 colourAndType;
			vec4 positionCamAndIntensity;
			vec4 positionWorldAndRange;
			vec4 directionAndCutoff;
			vec4 shadowStrengthBias;
		};
		`
		]
	};

	modules.tiledLight = {
		dependencies: [
			"lightEntry"
		],
		textures: [
			{ name: "lightLUTSampler", type: TextureClass.Normal, index: 6 }
		],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "lightLUTParam", type: "float2" },
				]
			}
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
	};

	modules.shadowedTotalLightContrib = {
		dependencies: [
			"vsmShadowMapping",
			"surfaceInfo",
			"materialInfo"
		],
		textures: [
			{ name: "shadowSampler", type: TextureClass.Normal, index: 7, ifExpr: "SHADOW_MAP" }
		],
		constantBlocks: [
			{
				blockName: "shadow",
				constants: [
					{ name: "lightViewMatrix", type: "mat4" },
					{ name: "lightProjMatrix", type: "mat4" },
					{ name: "shadowCastingLightIndex", type: "int" }
				]
			}
		],
		code: `
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
	};

	modules.lightContrib = {
		dependencies: [
			"surfaceInfo",
			"materialInfo"
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
	};

	modules.pbrMaterialInfo = {
		dependencies: [
			"gammaConstants"
		],
		constValues: [
			{ name: "MAT_ROUGHNESS", type: "int", expr: "0" },
			{ name: "MAT_METALLIC", type: "int", expr: "1" },
			{ name: "MAT_AMBIENT_OCCLUSION", type: "int", expr: "2" },
		],
		structs: [`
			struct MaterialInfo {
				vec4 albedo;   // premultiplied alpha
				vec3 emissive; // premultiplied intensity
				float roughness;
				float metallic;
				float ao;
			};
		`],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "baseColour", type: "float4" },
					{ name: "emissiveData", type: "float4" },
					{ name: "materialParam", type: "float4" }
				]
			}
		],
		textures: [
			{ name: "albedoMap", type: TextureClass.Normal, index: 0, ifExpr: "ALBEDO_MAP" },
			{ name: "materialMap", type: TextureClass.Normal, index: 1, ifExpr: "defined(ROUGHNESS_MAP) || defined(METALLIC_MAP) || defined(AO_MAP)" },
			{ name: "emissiveMap", type: TextureClass.Normal, index: 2, ifExpr: "EMISSIVE_MAP" },
		],
		code: `
		MaterialInfo getMaterialInfo(vec2 materialUV) {
			MaterialInfo mi;
			vec3 colour = pow(baseColour.rgb, SRGB_TO_LINEAR);
			#ifdef ALBEDO_MAP
				vec3 mapColour = texture2D(albedoMap, materialUV).rgb;
				#ifdef NO_SRGB_TEXTURES
					mapColour = pow(mapColour, SRGB_TO_LINEAR);
				#endif
				colour *= mapColour;
			#endif
			#ifdef VERTEX_COLOUR_TINTING
				vec3 tintColour = pow(vertexColour_intp, SRGB_TO_LINEAR);
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
					mi.ao = mapRMA[MAT_AO];
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
	};

	modules.surfaceInfo = {
		dependencies: [
			"mathUtils",
			"normalPerturbation",
			"parallaxMapping"
		],
		structs: [`
			struct SurfaceInfo {
				vec3 V;  // vertex dir (cam)
				vec3 N;  // surface normal (cam)
				mat3 transNormalMatrix;
				vec3 reflectedV;
				vec2 UV; // (adjusted) main UV
				float NdV;
			};
		`],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "normalMatrix", type: "mat3" }
				]
			}
		],
		textures: [
			{ name: "normalHeightMap", type: TextureClass.Normal, index: 3, ifExpr: "defined(NORMAL_MAP) || defined(HEIGHT_MAP)" }
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
				si.UV = vertexUV_intp;
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
	};

	// ----

	const vsmShadowVertexFunction: GL1VertexFunction = {
		in: [
			{ name: "vertexPos_model", type: "float3", role: "position", index: 0 }
		],
		out: [
			{ name: "vertexPos_world", type: "float4" }
		],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "modelMatrix", type: "mat4" },
					{ name: "lightViewProjectionMatrix", type: "mat4" }
				]
			}
		],
		main: `
			vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
			gl_Position = lightViewProjectionMatrix * vertexPos_world;
		`
	};

	const vsmShadowFragmentFunction: GL1FragmentFunction = {
		extensions: [
			{ name: "GL_OES_standard_derivatives", action: "require" }
		],
		in: [
			{ name: "vertexPos_world", type: "float4" }
		],
		constantBlocks: [
			{
				blockName: "default",
				constants: [
					{ name: "lightViewMatrix", type: "mat4" }
				]
			}
		],
		outCount: 1,
		main: `
			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;
			float depth = clamp(length(lightPos) / 12.0, 0.0, 1.0);
			float dx = dFdx(depth);
			float dy = dFdy(depth);
			gl_FragColor = vec4(depth, depth * depth + 0.25 * (dx * dx + dy * dy), 0.0, 1.0);
		`
	};

	export const vsmShadowShader: Shader = {
		renderResourceType: ResourceType.Shader,
		renderResourceHandle: 0,
		vertexFunction: vsmShadowVertexFunction,
		fragmentFunction: vsmShadowFragmentFunction
	};

	// ----

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

	function standardVertexFunction(feat: Features): GL1VertexFunction {
		const fn: GL1VertexFunction = {
			in: [
				{ name: "vertexPos_model", type: "float3", role: "position", index: 0 },
				{ name: "vertexNormal", type: "float3", role: "normal", index: 1 },
			],
			out: [
				{ name: "vertexPos_world", type: "float4" },
				{ name: "vertexPos_cam", type: "float3" },
				{ name: "vertexNormal_cam", type: "float3" },
			],

			constantBlocks: [
				{
					blockName: "default",
					constants: [
						{ name: "modelMatrix", type: "mat4" },
						{ name: "modelViewMatrix", type: "mat4" },
						{ name: "modelViewProjectionMatrix", type: "mat4" },
						{ name: "normalMatrix", type: "mat3" },
					]
				}
			],

			main: `
				gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
				vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
				vertexNormal_cam = normalMatrix * vertexNormal;
				vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;
			`
		};

		if (feat & Features.VtxUV) {
			fn.in.push({ name: "vertexUV", type: "float2", role: "uv0", index: 2 });
			fn.out!.push({ name: "vertexUV_intp", type: "float3" });
			fn.constantBlocks![0].constants.push({ name: "texScaleOffset", type: "float4" });
			fn.main += "vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;\n";
		}

		if (feat & Features.VtxColour) {
			fn.in.push({ name: "vertexColour", type: "float3", role: "colour", index: 3 });
			fn.out!.push({ name: "vertexColour_intp", type: "float3" });
			fn.main += "vertexColour_intp = vertexColour;\n";
		}

		return fn;
	}

	function standardFragmentFunction(feat: Features): GL1FragmentFunction {
		const defines: ShaderDefine[] = [];
		const attr: ShaderAttribute[] = [
			{ name: "vertexPos_world", type: "float4" },
			{ name: "vertexPos_cam", type: "float3" },
			{ name: "vertexNormal_cam", type: "float3" },
		];
		const dependencies: string[] = [
			"surfaceInfo",
			"pbrMaterialInfo"
		];

		if (feat & Features.VtxUV) {
			attr.push({ name: "vertexUV_intp", type: "float3" });
		}
		if (feat & Features.VtxColour) {
			defines.push({ name: "VERTEX_COLOUR_TINTING" });
			attr.push({ name: "vertexColour_intp", type: "float3" });
		}

		const fn: GL1FragmentFunction = {
			defines,
			in: attr,
			outCount: 1,
			main: `
				SurfaceInfo si = calcSurfaceInfo();
				MaterialInfo mi = getMaterialInfo(si.UV);

				vec3 totalLight = calcLightIBL(baseColour, matParam, si);
				totalLight += mi.emissive;
				totalLight += totalDynamicLightContributionTiledForward(si, mi) * shadowFactor;
				totalLight *= mi.ao;

				gl_FragColor = vec4(pow(totalLight, LINEAR_TO_SRGB), 1.0);
			`
		};

		return fn;
	}

	export function makeStdShader() {
		const vertexFunction = standardVertexFunction(0);
		const fragmentFunction = standardFragmentFunction(0);

		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,
			vertexFunction,
			fragmentFunction
		};	
	}

} // ns sd.render.gl1
