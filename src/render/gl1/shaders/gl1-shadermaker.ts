// render/gl1/shaders/shadermaker - prototype shader gen
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

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

	const LightingQualityBitShift = 2;

	const enum PBRLightingQuality {
		Phong,
		Blinn,
		CookTorrance
	}


	const shadowVertexSource = `
		attribute vec3 vertexPos_model;

		varying vec4 vertexPos_world;

		uniform mat4 modelMatrix;
		uniform mat4 lightViewProjectionMatrix;

		void main() {
			vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
			gl_Position = lightViewProjectionMatrix * vertexPos_world;
		}
	`.trim();


	const shadowFragmentSource = `
		#extension GL_OES_standard_derivatives : enable
		precision highp float;

		varying vec4 vertexPos_world;

		uniform mat4 lightViewMatrix;

		void main() {
			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;
			float depth = clamp(length(lightPos) / 12.0, 0.0, 1.0);
			float dx = dFdx(depth);
			float dy = dFdy(depth);
			gl_FragColor = vec4(depth, depth * depth + 0.25 * (dx * dy + dy * dy), 0.0, 1.0);
		}
	`.trim();


	function vertexShaderSource(feat: number) {
		const source: string[] = [];
		const line = (s: string) => source.push(s);

		/* tslint:disable:variable-name */
		const if_all = (s: string, f: number) => { if ((feat & f) == f) { source.push(s); } };
		// const if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };
		/* tslint:enable:variable-name */

		// In
		line  ("attribute vec3 vertexPos_model;");
		line  ("attribute vec3 vertexNormal;");
		if_all("attribute vec2 vertexUV;", Features.VtxUV);
		if_all("attribute vec3 vertexColour;", Features.VtxColour);

		// Out
		line  ("varying vec3 vertexNormal_cam;");
		line  ("varying vec4 vertexPos_world;");
		line  ("varying vec3 vertexPos_cam;");
		if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
		if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

		// Uniforms
		line  ("uniform mat4 modelMatrix;");
		line  ("uniform mat4 modelViewMatrix;");
		line  ("uniform mat4 modelViewProjectionMatrix;");
		line  ("uniform mat3 normalMatrix;");

		if_all("uniform vec4 texScaleOffset;", Features.VtxUV);

		// main()
		line  ("void main() {");
		line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
		line  ("	vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);");
		line  ("	vertexNormal_cam = normalMatrix * vertexNormal;");
		line  ("	vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;");
		if_all("	vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;", Features.VtxUV);
		if_all("	vertexColour_intp = vertexColour;", Features.VtxColour);
		line  ("}");

		return source.join("\n") + "\n";
	}


	const mathUtils = `
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
	`;

	const vertexSkinning = `
		attribute vec4 vertexWeightedPos0_joint;
		attribute vec4 vertexWeightedPos1_joint;
		attribute vec4 vertexWeightedPos2_joint;
		attribute vec4 vertexWeightedPos3_joint;
		attribute vec4 vertexJointIndexes;

		uniform sampler2D jointData;
		uniform int jointIndexOffset;

		struct Joint {
			vec4 rotation_joint;
			mat4 transform_model;
		};

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
		vec3 vertexPos_model = vec3(0.0);
		vec3 vertexNormal_final = vec3(0.0);
		vec4 weightedPos_joint[4];
		weightedPos_joint[0] = vertexWeightedPos0_joint + float(jointIndexOffset);
		weightedPos_joint[1] = vertexWeightedPos1_joint + float(jointIndexOffset);
		weightedPos_joint[2] = vertexWeightedPos2_joint + float(jointIndexOffset);
		weightedPos_joint[3] = vertexWeightedPos3_joint + float(jointIndexOffset);
		getTransformedVertex(weightedPos_joint, vertexPos_model, vertexNormal);
	`;

	const parallaxMapping = `
		vec2 parallaxMapping(in vec3 V, in vec2 T, out float parallaxHeight) {
			// determine optimal number of layers
			const float minLayers = 20.0;
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
			float heightFromTexture = texture2D(normalHeightMap, currentTextureCoords).a;

			// while point is above the surface
			// while(heightFromTexture > curLayerHeight) {
			for (int layerIx = 0; layerIx < 25; ++layerIx) {
				// to the next layer
				curLayerHeight += layerHeight;
				// shift of texture coordinates
				currentTextureCoords -= dtex;
				// new depth from heightmap
				heightFromTexture = texture2D(normalHeightMap, currentTextureCoords).a;

				if (heightFromTexture <= curLayerHeight) break;
			}

			// previous texture coordinates
			vec2 prevTCoords = currentTextureCoords + dtex;

			// heights for linear interpolation
			float nextH = heightFromTexture - curLayerHeight;
			float prevH = texture2D(normalHeightMap, prevTCoords).a - curLayerHeight + layerHeight;

			// proportions for linear interpolation
			float weight = nextH / (nextH - prevH);

			// interpolation of texture coordinates
			vec2 finalTexCoords = prevTCoords * weight + currentTextureCoords * (1.0 - weight);

			// interpolation of depth values
			parallaxHeight = curLayerHeight + prevH * weight + nextH * (1.0 - weight);

			// return result
			return finalTexCoords;
		}
	`;

	const normalPerturbation = `
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

		vec3 perturbNormal(vec3 N, vec3 V, vec2 uv) {
			// assume N, the interpolated vertex normal and 
			// V, the view vector (vertex to eye)
			vec3 map = texture2D(normalHeightMap, uv).xyz * 2.0 - 1.0;
			map.y = -map.y;
			mat3 TBN = cotangentFrame(N, -V, uv);
			return normalize(TBN * map);
		}
	`;

	const shadowMapping = `
		float VSM(vec2 uv, float compare, float strength, float bias) {
			vec2 moments = texture2D(shadowSampler, uv).xy;
			float p = smoothstep(compare - bias, compare, moments.x);
			float variance = max(moments.y - moments.x * moments.x, -0.001);
			float d = compare - moments.x;
			float p_max = linstep(0.2, 1.0, variance / (variance + d*d));
			return clamp(max(p, p_max), 0.0, 1.0);
		}
	`;

	const pbrLighting = `
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
			float rim = mix(1.0 - roughness * 0.9, 1.0, NdV); // I cannot tell if this does anything at 
			return (1.0 / rim) * specular * G * D;
			// return specular * G * D;
		}
	`;

	const tiledLight = `
		uniform sampler2D lightLUTSampler;
		uniform vec2 lightLUTParam;

		struct LightEntry {
			vec4 colourAndType;
			vec4 positionCamAndIntensity;
			vec4 positionWorldAndRange;
			vec4 directionAndCutoff;
			vec4 shadowStrengthBias;
		};

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
	`;

	function fragmentShaderSource(rd: GL1RenderDevice, feat: number) {
		const source: string[] = [];
		const line = (s: string) => source.push(s);

		/* tslint:disable:variable-name */
		const if_all = (s: string, f: number) => { if ((feat & f) == f) { source.push(s); } };
		const if_any = (s: string, f: number) => { if ((feat & f) != 0) { source.push(s); } };
		const if_not = (s: string, f: number) => { if ((feat & f) == 0) { source.push(s); } };
		/* tslint:enable:variable-name */

		const lightingQuality = (feat & Features.LightingQuality) >> LightingQualityBitShift;

		line  ("#extension GL_EXT_shader_texture_lod : require");
		if_any("#extension GL_OES_standard_derivatives : require", Features.NormalMap | Features.HeightMap);
		line  ("precision highp float;");

		// In
		line  ("varying vec4 vertexPos_world;");
		line  ("varying vec3 vertexNormal_cam;");
		line  ("varying vec3 vertexPos_cam;");
		if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
		if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

		// Uniforms
		line  ("uniform mat3 normalMatrix;");

		// -- material
		line  ("uniform vec4 baseColour;");
		if_all("uniform vec4 emissiveData;", Features.Emissive);
		line  ("uniform vec4 materialParam;");

		if_all("uniform sampler2D albedoMap;", Features.AlbedoMap);
		if_any("uniform sampler2D materialMap;", Features.MetallicMap | Features.RoughnessMap | Features.AOMap);
		if_any("uniform sampler2D normalHeightMap;", Features.NormalMap | Features.HeightMap);
		line  ("uniform sampler2D brdfLookupMap;");
		line  ("uniform samplerCube environmentMap;");

		line  ("const int MAT_ROUGHNESS = 0;");
		line  ("const int MAT_METALLIC = 1;");
		line  ("const int MAT_AMBIENT_OCCLUSION = 2;");

		// -- general constants
		line  ("const float PI = 3.141592654;");
		line  ("const float PHONG_DIFFUSE = 1.0 / PI;");

		// -- shadow
		if_all("uniform mat4 lightViewMatrix;", Features.ShadowMap);
		if_all("uniform mat4 lightProjMatrix;", Features.ShadowMap);
		if_all("uniform sampler2D shadowSampler;", Features.ShadowMap);
		if_all("uniform int shadowCastingLightIndex;", Features.ShadowMap);


		// -- commonly needed info
		line  ("struct SurfaceInfo {");
		line  ("	vec3 V;"); // vertex dir (cam)
		line  ("	vec3 N;"); // surface normal (cam)
		line  ("	mat3 transNormalMatrix;");
		line  ("	vec3 reflectedV;");
		line  ("	vec2 UV;"); // (adjusted) main UV
		line  ("	float NdV;");
		line  ("};");

		line  ("SurfaceInfo calcSurfaceInfo() {");
		line  ("	SurfaceInfo si;");
		line  ("	si.V = normalize(-vertexPos_cam);");
		line  ("	si.N = normalize(vertexNormal_cam);");
		if_not("	si.UV = vertexUV_intp;", Features.HeightMap);
		if_any("	mat3 TBN = cotangentFrame(si.N, vertexPos_cam, vertexUV_intp);", Features.NormalMap | Features.HeightMap);
		if (feat & Features.HeightMap) {
			// line("	float h = texture2D(normalHeightMap, vertexUV_intp).a;");
			// line("	h = h * 0.04 - 0.02;");
			line("	vec3 eyeTan = normalize(inverse(TBN) * si.V);");
			line("	float finalH = 0.0;");
			// line("	si.UV = vertexUV_intp + (eyeTan.xy * h);");
			line("	si.UV = parallaxMapping(eyeTan, vertexUV_intp, finalH);");
		}
		if (feat & Features.NormalMap) {
			line("	vec3 map = texture2D(normalHeightMap, si.UV).xyz * 2.0 - 1.0;");
			line("	si.N = normalize(TBN * map);");
		}
		line  ("	si.NdV = max(0.001, dot(si.N, si.V));");
		line  ("	si.transNormalMatrix = transpose(normalMatrix);");
		line  ("	si.reflectedV = si.transNormalMatrix * reflect(-si.V, si.N);");
		line  ("	return si;");
		line  ("}");

		// -- calcLightIBL()
		line("vec3 calcLightIBL(vec3 baseColour, vec4 matParam, SurfaceInfo si) {");

		// material properties
		line("	float metallic = matParam[MAT_METALLIC];");
		line("	float roughness = matParam[MAT_ROUGHNESS];");
		line("	vec3 specularColour = mix(vec3(0.04), baseColour, metallic);");

		// lookup brdf, diffuse and specular terms
		line("	vec2 brdf = texture2D(brdfLookupMap, vec2(roughness, 1.0 - si.NdV)).xy;");
		line("	vec3 envdiff = textureCubeLodEXT(environmentMap, si.transNormalMatrix * si.N, 4.0).xyz;");
		line("	vec3 envspec = textureCubeLodEXT(environmentMap, si.reflectedV, roughness * 5.0).xyz;");

		if (! rd.extSRGB) {
			line("	envdiff = pow(envdiff, vec3(2.2));");
			line("	envspec = pow(envspec, vec3(2.2));");
		}

		// terms
		line("	vec3 iblspec = min(vec3(0.99), fresnel_factor(specularColour, si.NdV) * brdf.x + brdf.y);");
		line("	vec3 reflected_light = iblspec * envspec;");
		line("	vec3 diffuse_light = envdiff * PHONG_DIFFUSE;");

		line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
		line("}");


		// -- calcLightShared()
		line("vec3 calcLightShared(vec3 baseColour, vec4 matParam, vec3 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si) {");
		line("	vec3 V = si.V;");
		line("	vec3 N = si.N;");
		line("	vec3 L = -lightDirection_cam;");
		if (lightingQuality > PBRLightingQuality.Phong) {
			line("	vec3 H = normalize(L + V);");
		}

		// material properties
		line("	float metallic = matParam[MAT_METALLIC];");
		line("	float roughness = matParam[MAT_ROUGHNESS];");
		line("	vec3 specularColour = mix(vec3(0.04), baseColour, metallic);");

		line("	float NdL = max(0.0, dot(N, L));");
		if (lightingQuality > PBRLightingQuality.Phong) {
			line("	float NdH = max(0.001, dot(N, H));");
			line("	float HdV = max(0.001, dot(H, V));");
		}

		// specular contribution
		if (lightingQuality == PBRLightingQuality.Phong) {
			line("	vec3 specfresnel = fresnel_factor(specularColour, si.NdV);");
			line("	vec3 specref = phong_specular(V, L, N, specfresnel, roughness);");
		}
		else {
			line("	vec3 specfresnel = fresnel_factor(specularColour, HdV);");

			if (lightingQuality == PBRLightingQuality.Blinn) {
				line("	vec3 specref = blinn_specular(NdH, specfresnel, roughness);");
			}
			else {
				line("	vec3 specref = cooktorrance_specular(NdL, si.NdV, NdH, specfresnel, roughness);");
			}
		}

		line("	specref *= vec3(NdL);");

		// diffuse contribition is common for all lighting models
		line("	vec3 diffref = (vec3(1.0) - specfresnel) * NdL * NdL;"); // this matches Unity rendering by ogling
		// originally: line("	vec3 diffref = (vec3(1.0) - specfresnel) * PHONG_DIFFUSE * NdL;");

		// direct light
		line("	vec3 light_color = lightColour * diffuseStrength;");
		line("	vec3 reflected_light = specref * light_color;");
		line("	vec3 diffuse_light = diffref * light_color;");

		// final result
		line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
		line("}");


		// -- calcPointLight()
		line  ("vec3 calcPointLight(vec3 baseColour, vec4 matParam, vec3 lightColour, float intensity, float range, vec3 lightPos_cam, vec3 lightPos_world, SurfaceInfo si) {");
		line  ("	float distance = length(vertexPos_world.xyz - lightPos_world);"); // use world positions for distance as cam will warp coords
		line  ("	vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);");
		line  ("	float attenuation = clamp(1.0 - distance / range, 0.0, 1.0);");
		line  ("	attenuation *= attenuation;");
		line  ("    float diffuseStrength = intensity * attenuation;");
		line  ("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection_cam, si);");
		line  ("}");


		// -- calcSpotLight()
		line  ("vec3 calcSpotLight(vec3 baseColour, vec4 matParam, vec3 lightColour, float intensity, float range, float cutoff, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, SurfaceInfo si) {");
		line  ("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);");
		line  ("	float spotCosAngle = dot(lightToPoint, lightDirection);");
		line  ("	if (spotCosAngle > cutoff) {");
		line  ("		vec3 light = calcPointLight(baseColour, matParam, lightColour, intensity, range, lightPos_cam, lightPos_world, si);");
		line  ("		return light * smoothstep(cutoff, cutoff + 0.01, spotCosAngle);");
		line  ("	}");
		line  ("	return vec3(0.0);");
		line  ("}");


		// -- getLightContribution()
		line  ("vec3 getLightContribution(LightEntry light, vec3 baseColour, vec4 matParam, SurfaceInfo si) {");
		line  ("	vec3 colour = light.colourAndType.xyz;");
		line  ("	float type = light.colourAndType.w;");
		line  ("	vec3 lightPos_cam = light.positionCamAndIntensity.xyz;");
		line  ("	float intensity = light.positionCamAndIntensity.w;");

		line  (`	if (type == ${entity.LightType.Directional}.0) {`);
		line  ("		return calcLightShared(baseColour, matParam, colour, intensity, light.directionAndCutoff.xyz, si);");
		line  ("	}");

		line  ("	vec3 lightPos_world = light.positionWorldAndRange.xyz;");
		line  ("	float range = light.positionWorldAndRange.w;");
		line  (`	if (type == ${entity.LightType.Point}.0) {`);
		line  ("		return calcPointLight(baseColour, matParam, colour, intensity, range, lightPos_cam, lightPos_world, si);");
		line  ("	}");

		line  ("	float cutoff = light.directionAndCutoff.w;");
		line  (`	if (type == ${entity.LightType.Spot}.0) {`);
		line  ("		return calcSpotLight(baseColour, matParam, colour, intensity, range, cutoff, lightPos_cam, lightPos_world, light.directionAndCutoff.xyz, si);");
		line  ("	}");

		line  ("	return vec3(0.0);"); // this would be bad
		line  ("}");

		// -- main()
		line  ("void main() {");
		line  ("	SurfaceInfo si = calcSurfaceInfo();");


		if (feat & Features.AlbedoMap) {
			line("	vec3 baseColour = texture2D(albedoMap, si.UV).rgb * baseColour.rgb;");
			if (! rd.extSRGB) {
				line("	baseColour = pow(baseColour, vec3(2.2));");
			}
		}
		else {
			line("	vec3 baseColour = baseColour.rgb;");
		}
		if_all("	baseColour *= vertexColour_intp;", Features.VtxColour);


		let hasRMAMap = false;
		if (feat & (Features.MetallicMap | Features.RoughnessMap | Features.AOMap)) {
			line("	vec4 matParam = texture2D(materialMap, si.UV);");
			hasRMAMap = true;
		}
		else {
			// copy roughness and metallic fixed values from param
			line("	vec4 matParam = vec4(materialParam.xy, 0, 0);");
		}

		if (hasRMAMap && (feat & Features.MetallicMap) == 0) {
			line("	matParam[MAT_METALLIC] = materialParam[MAT_METALLIC];");
		}
		if (hasRMAMap && (feat & Features.RoughnessMap) == 0) {
			line("	matParam[MAT_ROUGHNESS] = materialParam[MAT_ROUGHNESS];");
		}

		// -- calculate light arriving at the fragment
		line  ("	vec3 totalLight = calcLightIBL(baseColour, matParam, si);");
		if (feat & Features.Emissive) {
			line("	totalLight += (emissiveData.rgb * emissiveData.w);");
		}

		line  ("	vec2 fragCoord = vec2(gl_FragCoord.x, lightLUTParam.y - gl_FragCoord.y);");
		line  ("	vec2 lightOffsetCount = getLightGridCell(fragCoord);");
		line  ("	int lightListOffset = int(lightOffsetCount.x);");
		line  ("	int lightListCount = int(lightOffsetCount.y);");

		line  ("	for (int llix = 0; llix < 128; ++llix) {");
		line  ("		if (llix == lightListCount) break;"); // hack to overcome gles2 limitation where loops need constant max counters 

		line  ("		float lightIx = getLightIndex(float(lightListOffset + llix));");
		line  ("		LightEntry lightData = getLightEntry(lightIx);");
		line  ("		if (lightData.colourAndType.w <= 0.0) break;");

		line  ("		float shadowFactor = 1.0;");
		if (feat & Features.ShadowMap) {
			line("		if (int(lightIx) == shadowCastingLightIndex) {");
			line("			float shadowStrength = lightData.shadowStrengthBias.x;");
			line("			float shadowBias = lightData.shadowStrengthBias.y;");

			line("			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;");
			line("			vec4 lightDevice = lightProjMatrix * vec4(lightPos, 1.0);");
			line("			vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;");
			line("			vec2 lightUV = lightDeviceNormal * 0.5 + 0.5;");
			line("			float lightTest = clamp(length(lightPos) / 12.0, 0.0, 1.0);");
			line("			shadowFactor = VSM(lightUV, lightTest, shadowStrength, shadowBias);");
			line("		}");
		}

		line  ("		totalLight += getLightContribution(lightData, baseColour, matParam, si) * shadowFactor;");
		line  ("	}");

		if_all("	totalLight *= matParam[MAT_AMBIENT_OCCLUSION];", Features.AOMap);

		// -- final lightColour result
		line  ("	gl_FragColor = vec4(pow(totalLight, vec3(1.0 / 2.2)), 1.0);");
		line  ("}");

		return source.join("\n") + "\n";
	}

} // ns sd.render.gl1
