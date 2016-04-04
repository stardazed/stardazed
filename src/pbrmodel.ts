// pbrmodel - PBR model component and Pipeline
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

// Implementation based off:
// https://gist.github.com/galek/53557375251e1a942dfa by Nick Galko
// which in turn used certain functions from the Unreal 4 Engine Source
// as indicated by comments.
// Normal perturbation method by Christian Schüler
// http://www.thetenthplanet.de/archives/1180

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required and implied
		VtxUV                      = 1 << 0,
		VtxColour                  = 1 << 1,

		LightingQuality            = 1 << 2 | 1 << 3,  // 2-bit number, higher is better

		AlbedoMap                  = 1 << 4,  // RGB channels of Albedo
		RoughnessMap               = 1 << 5,  // R channel of RMA
		MetallicMap                = 1 << 6,  // G channel of RMA
		AOMap                      = 1 << 7,  // B channel of RMA

		NormalMap                  = 1 << 8,  // RGB channels of NormalHeight
		HeightMap                  = 1 << 9,  // A channel of NormalHeight
	}

	const LightingQualityBitShift = 2;

	export const enum PBRLightingQuality {
		Phong,
		Blinn,
		CookTorrance
	}


	interface PBRGLProgram extends WebGLProgram {
		// -- transform
		modelMatrixUniform?: WebGLUniformLocation;       // mat4
		mvMatrixUniform?: WebGLUniformLocation;          // mat4
		mvpMatrixUniform?: WebGLUniformLocation;         // mat4
		normalMatrixUniform?: WebGLUniformLocation;      // mat3
		lightNormalMatrixUniform?: WebGLUniformLocation; // mat3

		// -- mesh material
		baseColourUniform: WebGLUniformLocation;         // vec4
		materialUniform: WebGLUniformLocation;           // vec4
		texScaleOffsetUniform: WebGLUniformLocation;     // vec4

		// -- textures
		albedoMapUniform: WebGLUniformLocation;
		rmaMapUniform: WebGLUniformLocation;
		normalHeightMapUniform: WebGLUniformLocation;

		environmentMapUniform: WebGLUniformLocation;
		brdfLookupMapUniform: WebGLUniformLocation;

		// -- lights
		lightTypeArrayUniform?: WebGLUniformLocation;          // int[MAX_FRAGMENT_LIGHTS]
		lightCamPositionArrayUniform?: WebGLUniformLocation;   // vec4[MAX_FRAGMENT_LIGHTS]
		lightWorldPositionArrayUniform?: WebGLUniformLocation; // vec4[MAX_FRAGMENT_LIGHTS]
		lightDirectionArrayUniform?: WebGLUniformLocation;     // vec4[MAX_FRAGMENT_LIGHTS]
		lightColourArrayUniform?: WebGLUniformLocation;        // vec4[MAX_FRAGMENT_LIGHTS]
		lightParamArrayUniform?: WebGLUniformLocation;         // vec4[MAX_FRAGMENT_LIGHTS]
		shadowCastingLightIndexUniform: WebGLUniformLocation;  // int (-1..MAX_FRAGMENT_LIGHTS - 1)
	}


	const enum TextureBindPoint {
		Albedo = 0,
		Specular = 1,
		RMA = 2,
		NormalHeight = 3,
		Environment = 4,
		BRDFLookup = 5
	}


	//  ___ ___ ___ ___ _           _ _          
	// | _ \ _ ) _ \ _ (_)_ __  ___| (_)_ _  ___ 
	// |  _/ _ \   /  _/ | '_ \/ -_) | | ' \/ -_)
	// |_| |___/_|_\_| |_| .__/\___|_|_|_||_\___|
	//                   |_|                     

	// -- shader limits
	const MAX_FRAGMENT_LIGHTS = 4;


	class PBRPipeline {
		private cachedPipelines_ = new Map<number, render.Pipeline>();
		private shadowPipeline_: render.Pipeline = null;
		private featureMask_: Features = 0x7fffffff;

		constructor(private rc: render.RenderContext) {
		}


		disableFeatures(disableMask: Features) {
			this.featureMask_ &= ~disableMask;
		}


		enableFeatures(enableMask: Features) {
			this.featureMask_ |= enableMask;
		}


		enableAllFeatures() {
			this.featureMask_ = 0x7fffffff;
		}


		pipelineForFeatures(feat: number) {
			feat &= this.featureMask_;

			var cached = this.cachedPipelines_.get(feat);
			if (cached)
				return cached;

			var gl = this.rc.gl;

			var vertexSource = this.vertexShaderSource(feat);
			var fragmentSource = this.fragmentShaderSource(feat);

			var pld = render.makePipelineDescriptor();
			pld.colourPixelFormats[0] = render.PixelFormat.RGBA8;
			pld.vertexShader = render.makeShader(this.rc, gl.VERTEX_SHADER, vertexSource);
			pld.fragmentShader = render.makeShader(this.rc, gl.FRAGMENT_SHADER, fragmentSource);

			// -- mandatory and optional attribute arrays
			pld.attributeNames.set(mesh.VertexAttributeRole.Normal, "vertexNormal");
			
			pld.attributeNames.set(mesh.VertexAttributeRole.Position, "vertexPos_model");
			if (feat & Features.VtxColour) {
				pld.attributeNames.set(mesh.VertexAttributeRole.Colour, "vertexColour");
			}
			if (feat & Features.VtxUV) {
				pld.attributeNames.set(mesh.VertexAttributeRole.UV, "vertexUV");
			}

			var pipeline = new render.Pipeline(this.rc, pld);
			var program = <PBRGLProgram>pipeline.program;
			
			gl.useProgram(program);

			// -- transformation matrices
			program.modelMatrixUniform = gl.getUniformLocation(program, "modelMatrix");
			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			// -- material properties
			program.baseColourUniform = gl.getUniformLocation(program, "baseColour");
			program.materialUniform = gl.getUniformLocation(program, "materialParam");
			program.texScaleOffsetUniform = gl.getUniformLocation(program, "texScaleOffset");

			// -- material textures
			if (feat & Features.AlbedoMap) {
				program.albedoMapUniform = gl.getUniformLocation(program, "albedoMap");
				if (program.albedoMapUniform) {
					gl.uniform1i(program.albedoMapUniform, TextureBindPoint.Albedo);
				}
			}
			if (feat & (Features.MetallicMap | Features.RoughnessMap)) {
				program.rmaMapUniform = gl.getUniformLocation(program, "rmaMap");
				if (program.rmaMapUniform) {
					gl.uniform1i(program.rmaMapUniform, TextureBindPoint.RMA);
				}
			}
			if (feat & (Features.NormalMap | Features.HeightMap | feat & Features.AOMap)) {
				program.normalHeightMapUniform = gl.getUniformLocation(program, "normalHeightMap");
				if (program.normalHeightMapUniform) {
					gl.uniform1i(program.normalHeightMapUniform, TextureBindPoint.NormalHeight);
				}
			}

			// -- reflection & LUT textures
			program.environmentMapUniform = gl.getUniformLocation(program, "environmentMap");
			if (program.environmentMapUniform) {
				gl.uniform1i(program.environmentMapUniform, TextureBindPoint.Environment);
			}
			program.brdfLookupMapUniform = gl.getUniformLocation(program, "brdfLookupMap");
			if (program.brdfLookupMapUniform) {
				gl.uniform1i(program.brdfLookupMapUniform, TextureBindPoint.BRDFLookup);
			}

			// -- light property arrays
			program.lightTypeArrayUniform = gl.getUniformLocation(program, "lightTypes");
			program.lightCamPositionArrayUniform = gl.getUniformLocation(program, "lightPositions_cam");
			program.lightWorldPositionArrayUniform = gl.getUniformLocation(program, "lightPositions_world");
			program.lightDirectionArrayUniform = gl.getUniformLocation(program, "lightDirections");
			program.lightColourArrayUniform = gl.getUniformLocation(program, "lightColours");
			program.lightParamArrayUniform = gl.getUniformLocation(program, "lightParams");
			program.shadowCastingLightIndexUniform = gl.getUniformLocation(program, "shadowCastingLightIndex");
			if (program.shadowCastingLightIndexUniform) {
				// if this exists, init to -1 to signify no shadow caster
				gl.uniform1i(program.shadowCastingLightIndexUniform, -1);
			}

			// -- zero out light types
			gl.uniform1iv(program.lightTypeArrayUniform, new Int32Array(MAX_FRAGMENT_LIGHTS));

			gl.useProgram(null);

			this.cachedPipelines_.set(feat, pipeline);
			return pipeline;
		}


		private vertexShaderSource(feat: number) {
			var source: string[] = [];
			var line = (s: string) => source.push(s);
			var if_all = (s: string, f: number) => { if ((feat & f) == f) source.push(s) };
			var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };
			
			// In
			line  ("attribute vec3 vertexPos_model;");
			line  ("attribute vec3 vertexNormal;");
			if_all("attribute vec2 vertexUV;", Features.VtxUV);

			// Out
			line  ("varying vec3 vertexNormal_cam;");
			line  ("varying vec3 vertexPos_world;");
			line  ("varying vec3 vertexPos_cam;");
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);

			// Uniforms
			line  ("uniform mat4 modelMatrix;");
			line  ("uniform mat4 modelViewMatrix;");
			line  ("uniform mat4 modelViewProjectionMatrix;");
			line  ("uniform mat3 normalMatrix;");

			if_all("uniform vec4 texScaleOffset;", Features.VtxUV);


			// main()
			line  ("void main() {");
			line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
			line  ("	vertexPos_world = (modelMatrix * vec4(vertexPos_model, 1.0)).xyz;");
			line  ("	vertexNormal_cam = normalMatrix * vertexNormal;");
			line  ("	vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;");
			if_all("	vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;", Features.VtxUV);
			line  ("}");

			// console.info("------ VERTEX");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}


		private fragmentShaderSource(feat: number) {
			var source: string[] = [];
			var line = (s: string) => source.push(s);
			var if_all = (s: string, f: number) => { if ((feat & f) == f) source.push(s) };
			var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };
			var if_not = (s: string, f: number) => { if ((feat & f) == 0) source.push(s) };

			var lightingQuality = (feat & Features.LightingQuality) >> LightingQualityBitShift;

			line  ("#extension GL_EXT_shader_texture_lod : require");
			if_all("#extension GL_OES_standard_derivatives : require", Features.NormalMap);
			line  ("precision highp float;");

			// In
			line  ("varying vec3 vertexPos_world;");
			line  ("varying vec3 vertexNormal_cam;");
			line  ("varying vec3 vertexPos_cam;");
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);

			// Uniforms
			line  ("uniform mat3 normalMatrix;");
			line  ("uniform mat3 lightNormalMatrix;");

			// -- material
			line  ("uniform vec4 baseColour;");
			line  ("uniform vec4 materialParam;");

			if_all("uniform sampler2D albedoMap;", Features.AlbedoMap);
			if_any("uniform sampler2D rmaMap;", Features.MetallicMap | Features.RoughnessMap | Features.AOMap);
			if_any("uniform sampler2D normalHeightMap;", Features.NormalMap | Features.HeightMap);
			if_all("uniform sampler2D ambientOcclusionMap;", Features.AOMap);
			line  ("uniform sampler2D brdfLookupMap;");
			line  ("uniform samplerCube environmentMap;");

			line  ("const int MAT_ROUGHNESS = 0;");
			line  ("const int MAT_METALLIC = 1;");
			line  ("const int MAT_AMBIENT_OCCLUSION = 2;");

			// -- light param constants
			line  ("const int MAX_FRAGMENT_LIGHTS = " + MAX_FRAGMENT_LIGHTS + ";");
			line  ("const int LPARAM_INTENSITY = 1;");
			line  ("const int LPARAM_RANGE = 2;");
			line  ("const int LPARAM_CUTOFF = 3;");
			line  ("const int LPOS_STRENGTH = 3;");
			line  ("const int LDIR_BIAS = 3;");

			// -- general constants
			line("const float PI = 3.141592654;");
			line("const float PHONG_DIFFUSE = 1.0 / PI;");

			// -- lights (with 4 lights, this will take up 20 frag vector uniforms)
			line  ("uniform int lightTypes[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightPositions_cam[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightPositions_world[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightDirections[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightColours[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightParams[MAX_FRAGMENT_LIGHTS];");


			// -- utility
			line("mat3 transpose(mat3 m) {");
			line("	vec3 c0 = m[0];");
			line("	vec3 c1 = m[1];");
			line("	vec3 c2 = m[2];");
			line("	return mat3(vec3(c0.x, c1.x, c2.x), vec3(c0.y, c1.y, c2.y), vec3(c0.z, c1.z, c2.z));");
			line("}");


			// -- commonly needed info
			line  ("struct SurfaceInfo {");
			line  ("	vec3 V;"); // vertex dir (cam)
			line  ("	vec3 N;"); // surface normal (cam)
			line  ("	mat3 transNormalMatrix;");
			line  ("	vec3 reflectedV;");
			line  ("	float NdV;");
			line  ("};");

			// -- normal perturbation
			if (feat & Features.NormalMap) {
				line("mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {");
				line("	// get edge vectors of the pixel triangle");
				line("	vec3 dp1 = dFdx(p);");
				line("	vec3 dp2 = dFdy(p);");
				line("	vec2 duv1 = dFdx(uv);");
				line("	vec2 duv2 = dFdy(uv);");
				line("	// solve the linear system");
				line("	vec3 dp2perp = cross(dp2, N);");
				line("	vec3 dp1perp = cross(N, dp1);");
				line("	vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;");
				line("	vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;");
				line("	// construct a scale-invariant frame ");
				line("	float invmax = inversesqrt(max(dot(T, T), dot(B, B)));");
				line("	return mat3(T * invmax, B * invmax, N);");
				line("}");

				line("vec3 perturbNormal(vec3 N, vec3 V, vec2 uv) {");
				line("	// assume N, the interpolated vertex normal and ");
				line("	// V, the view vector (vertex to eye)");
				line("	vec3 map = texture2D(normalHeightMap, uv).xyz * 2.0 - 1.0;");
				line("	map.y = -map.y;");
				line("	mat3 TBN = cotangentFrame(N, -V, uv);");
				line("	return normalize(TBN * map);");
				line("}");
			}

			line  ("SurfaceInfo calcSurfaceInfo() {");
			line  ("	SurfaceInfo si;");
			line  ("	si.V = normalize(-vertexPos_cam);");
			line  ("	si.N = normalize(vertexNormal_cam);");
			if_any("	si.N = perturbNormal(si.N, -vertexPos_cam, vertexUV_intp);", Features.NormalMap);
			line  ("	si.NdV = max(0.001, dot(si.N, si.V));");
			line  ("	si.transNormalMatrix = transpose(normalMatrix);");
			line  ("	si.reflectedV = si.transNormalMatrix * reflect(-si.V, si.N);");
			line  ("	return si;");
			line  ("}");


			// compute fresnel specular factor for given base specular and product
			// product could be NdV or VdH depending on used technique
			line("vec3 fresnel_factor(vec3 f0, float product) {");

			// method A
			// line("	return mix(f0, vec3(1.0), pow(1.01 - product, 5.0));");

			// method B (from Brian Karis' paper)
			line("	return f0 + (vec3(1.0) - f0) * pow(2.0, (-5.55473 * product - 6.98316) * product);");

			// method C (UE4)
			// line("	float Fc = pow(1.0 - product, 5.0);");
			// line("	return clamp(50.0 * f0.g, 0.0, 1.0) * Fc + (1.0 - Fc) * f0;");
			line("}");


			if (lightingQuality >= PBRLightingQuality.CookTorrance) {
				// following functions are copies of UE4
				// for computing cook-torrance specular lighting terms
				line("float D_blinn(float roughness, float NdH) {");
				line("	float m = roughness * roughness;");
				line("	float m2 = m * m;");
				line("	float n = 2.0 / m2 - 2.0;");
				line("	return (n + 2.0) / (2.0 * PI) * pow(NdH, n);");
				line("}");

				line("float D_GGX(float roughness, float NdH) {");
				line("	float m = roughness * roughness;");
				line("	float m2 = m * m;");
				line("	float d = (NdH * m2 - NdH) * NdH + 1.0;");
				line("	return m2 / (PI * d * d);");
				line("}");

				line("float G_schlick(float roughness, float NdV, float NdL) {");
				line("	float k = roughness * roughness * 0.5;");
				line("	float V = NdV * (1.0 - k) + k;");
				line("	float L = NdL * (1.0 - k) + k;");
				line("	return 0.25 / (V * L);");
				line("}");
			}

			if (lightingQuality == PBRLightingQuality.Phong) {
				// simple phong specular calculation with normalization
				line("vec3 phong_specular(vec3 V, vec3 L, vec3 N, vec3 specular, float roughness) {");
				line("	vec3 R = reflect(-L, N);");
				line("	float spec = max(0.0, dot(V, R));");
				line("	float k = 1.999 / (roughness * roughness);");
				line("	return min(1.0, 3.0 * 0.0398 * k) * pow(spec, min(10000.0, k)) * specular;");
				line("}");
			}
			else if (lightingQuality == PBRLightingQuality.Blinn) {
				// simple blinn specular calculation with normalization
				line("vec3 blinn_specular(float NdH, vec3 specular, float roughness) {");
				line("	float k = 1.999 / (roughness * roughness);");
				line("	return min(1.0, 3.0 * 0.0398 * k) * pow(NdH, min(10000.0, k)) * specular;");
				line("}");
			}
			else {
				// cook-torrance specular calculation
				line("vec3 cooktorrance_specular(float NdL, float NdV, float NdH, vec3 specular, float roughness) {");
				// line("	float D = D_blinn(roughness, NdH);");
				line("	float D = D_GGX(roughness, NdH);");
				line("	float G = G_schlick(roughness, NdV, NdL);");
				// line("	float rim = mix(1.0 - roughness * 0.9, 1.0, NdV);"); // I cannot tell if this does anything at all
				// line("	return (1.0 / rim) * specular * G * D;");
				line("	return specular * G * D;");
				line("}");
			}


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

			// terms
			line("	vec3 iblspec = min(vec3(0.99), fresnel_factor(specularColour, si.NdV) * brdf.x + brdf.y);");
			line("	vec3 reflected_light = iblspec * envspec;");
			line("	vec3 diffuse_light = envdiff * PHONG_DIFFUSE;");

			line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
			line("}");


			// -- calcLightShared()
			line("vec3 calcLightShared(vec3 baseColour, vec4 matParam, vec4 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si) {");
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
			line("	vec3 diffref = (vec3(1.0) - specfresnel) * PHONG_DIFFUSE * NdL;");

			// direct light
			line("	vec3 light_color = lightColour.rgb * diffuseStrength;");
			line("	vec3 reflected_light = specref * light_color;");
			line("	vec3 diffuse_light = diffref * light_color;");

			// final result
			line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
			line("}");


			// -- calcPointLight()
			line  ("vec3 calcPointLight(vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightPos_cam, vec3 lightPos_world, SurfaceInfo si) {");
			line  ("	float distance = length(vertexPos_world - lightPos_world);"); // use world positions for distance as cam will warp coords
			line  ("	vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);");
			line  ("	float attenuation = 1.0 - pow(clamp(distance / lightParam[LPARAM_RANGE], 0.0, 1.0), 2.0);");
			line  ("    attenuation *= dot(si.N, -lightDirection_cam);");
			line  ("    float diffuseStrength = lightParam[LPARAM_INTENSITY] * attenuation;");
			line  ("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection_cam, si);");
			line  ("}");


			// -- calcSpotLight()
			line  ("vec3 calcSpotLight(vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, SurfaceInfo si) {");
			line  ("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);");
			line  ("	float spotCosAngle = dot(lightToPoint, lightDirection);");
			line  ("	float cutoff = lightParam[LPARAM_CUTOFF];");
			line  ("	if (spotCosAngle > cutoff) {");
			line  ("		vec3 light = calcPointLight(baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, si);");
			line  ("		return light * smoothstep(cutoff, cutoff + 0.006, spotCosAngle);")
			line  ("	}");
			line  ("	return vec3(0.0);");
			line  ("}");


			// -- calcDirectionalLight()
			line  ("vec3 calcDirectionalLight(vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightDirection, SurfaceInfo si) {");
			line  ("	float diffuseStrength = lightParam[LPARAM_INTENSITY] * dot(si.N, -lightDirection);");
			line  ("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection, si);");
			line  ("}");


			// -- main()
			line  ("void main() {");

			if (feat & Features.AlbedoMap) {
				line("	vec3 baseColour = texture2D(albedoMap, vertexUV_intp).rgb * baseColour.rgb;");
			}
			else {
				line("	vec3 baseColour = baseColour.rgb;");
			}

			var hasRMAMap = false;
			if (feat & (Features.MetallicMap | Features.RoughnessMap | Features.AOMap)) {
				line("	vec4 matParam = texture2D(rmaMap, vertexUV_intp);");
				hasRMAMap = true;
			}
			else {
				line("	vec4 matParam = materialParam;");
			}

			if (hasRMAMap && (feat & Features.MetallicMap) == 0) {
				line("	matParam[MAT_METALLIC] = materialParam[MAT_METALLIC];");
			}
			if (hasRMAMap && (feat & Features.RoughnessMap) == 0) {
				line("	matParam[MAT_ROUGHNESS] = materialParam[MAT_ROUGHNESS];");
			}

			// -- calculate light arriving at the fragment
			line  ("	SurfaceInfo si = calcSurfaceInfo();");
			line  ("	vec3 totalLight = calcLightIBL(baseColour, matParam, si);");

			line  ("	for (int lightIx = 0; lightIx < MAX_FRAGMENT_LIGHTS; ++lightIx) {");
			line  ("		int type = lightTypes[lightIx];");
			line  ("		if (type == 0) break;");

			line  ("		vec3 lightPos_cam = lightPositions_cam[lightIx].xyz;");
			line  ("		vec3 lightPos_world = lightPositions_world[lightIx].xyz;");
			line  ("		vec3 lightDir_cam = lightDirections[lightIx].xyz;");
			line  ("		vec4 lightColour = lightColours[lightIx];");
			line  ("		vec4 lightParam = lightParams[lightIx];");

			line  ("		if (type == 1) {")
			line  ("			totalLight += calcDirectionalLight(baseColour, matParam, lightColour, lightParam, lightDir_cam, si);");
			line  ("		}");
			line  ("		else if (type == 2) {")
			line  ("			totalLight += calcPointLight(baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, si);");
			line  ("		}");
			line  ("		else if (type == 3) {")
			line  ("			totalLight += calcSpotLight(baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, lightDir_cam, si);");
			line  ("		}");
			line  ("	}");

			// -- final lightColour result
			line  ("	gl_FragColor = vec4(totalLight, 1.0);");
			line  ("}");

			return source.join("\n") + "\n";
		}
	}


	//  ___ ___ ___ __  __         _     _ __  __                             
	// | _ \ _ ) _ \  \/  |___  __| |___| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// |  _/ _ \   / |\/| / _ \/ _` / -_) | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_| |___/_|_\_|  |_\___/\__,_\___|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                          |___/         

	export type PBRModelInstance = Instance<PBRModelManager>;
	export type PBRModelRange = InstanceRange<PBRModelManager>;
	export type PBRModelSet = InstanceSet<PBRModelManager>;
	export type PBRModelIterator = InstanceIterator<PBRModelManager>;
	export type PBRModelArrayView = InstanceArrayView<PBRModelManager>;


	export interface PBRModelDescriptor {
		mesh: render.Mesh;
		materials: PBRMaterialInstance[];

		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}


	export class PBRModelManager implements ComponentManager<PBRModelManager> {
		private pbrPipeline_: PBRPipeline;

		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private primGroupOffsetBase_: Int32Array;

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupMaterialBase_: TypedArray;
		private primGroupFeatureBase_: TypedArray;

		private meshes_: render.Mesh[] = [];
		private brdfLookupTex_: render.Texture = null;

		// -- for light uniform updates
		private lightTypeArray_ = new Int32Array(MAX_FRAGMENT_LIGHTS);
		private lightCamPositionArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightWorldPositionArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightDirectionArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightColourArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightParamArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private activeLights_: LightInstance[] = [];
		private shadowCastingLightIndex_ = -1;

		// -- for temp calculations
		private modelViewMatrix_ = mat4.create();
		private modelViewProjectionMatrix_ = mat4.create();
		private normalMatrix_ = mat3.create();
		private lightNormalMatrix_ = mat3.create();
		private lightViewProjectionMatrix_ = mat4.create();


		constructor(
			private rc: render.RenderContext,
			private transformMgr_: TransformManager,
			private materialMgr_: PBRMaterialManager,
			private lightMgr_: LightManager
		)
		{
			this.pbrPipeline_ = new PBRPipeline(rc);

			var instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: UInt8, count: 1 },  // enabled
				{ type: SInt32, count: 1 }, // primGroupOffset (offset into primGroupMaterials_ and primGroupFeatures_)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);

			var groupFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // material
				{ type: SInt32, count: 1 }, // features
			];
			this.primGroupData_ = new container.MultiArrayBuffer(2048, groupFields);

			this.rebase();
			this.groupRebase();

			this.loadBRDFLUTTexture();
		}


		private loadBRDFLUTTexture() {
			var img = new Image();
			img.onload = () => {
				var td = render.makeTexDesc2DFromImageSource(img, render.UseMipMaps.No);
				td.sampling.repeatS = render.TextureRepeatMode.ClampToEdge;
				td.sampling.repeatT = render.TextureRepeatMode.ClampToEdge;
				this.brdfLookupTex_ = new render.Texture(this.rc, td);
			};
			img.onerror = (ev) => {
				console.error("Could not load embedded BRDF LUT texture.", ev);
			};
			img.src = brdfPNGString;
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.enabledBase_ = <Uint8Array>this.instanceData_.indexedFieldView(2);
			this.primGroupOffsetBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
		}


		private groupRebase() {
			this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
		}


		private featuresForMeshAndMaterial(mesh: render.Mesh, material: PBRMaterialInstance): Features {
			var features = 0;

			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.Colour)) features |= Features.VtxColour;
			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.UV)) features |= Features.VtxUV;

			var matFlags = this.materialMgr_.flags(material);

			if (this.materialMgr_.albedoMap(material)) {
				features |= Features.AlbedoMap;
			}

			if ((matFlags & PBRMaterialFlags.NormalMap) && this.materialMgr_.normalHeightMap(material)) {
				features |= Features.NormalMap;
			}

			return features;
		}


		setRenderFeatureEnabled(feature: RenderFeature, enable: boolean) {
			var mask: Features = 0;

			if (feature == RenderFeature.NormalMaps) {
				mask |= Features.NormalMap;
			}

			if (enable) {
				this.pbrPipeline_.enableFeatures(mask);
			}
			else {
				this.pbrPipeline_.disableFeatures(mask);
			}
		}


		create(entity: Entity, desc: PBRModelDescriptor): PBRModelInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>entity;
			this.transformBase_[ix] = <number>this.transformMgr_.forEntity(entity);
			this.enabledBase_[ix] = +true;
			this.meshes_[ix] = desc.mesh;

			// -- check correctness of mesh against material list
			var groups = desc.mesh.primitiveGroups;
			var maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(desc.materials.length >= maxLocalMatIndex - 1, "not enough PBRMaterialIndexes for this mesh");

			// -- pre-calc global material indexes and program features for each group
			var primGroupCount = this.primGroupData_.count;
			this.primGroupOffsetBase_[ix] = this.primGroupData_.count;

			// -- grow primitiveGroup metadata buffer when necessary
			if (this.primGroupData_.resize(primGroupCount + groups.length) == container.InvalidatePointers.Yes) {
				this.groupRebase();
			}

			// -- append metadata for each primGroup
			groups.forEach((group, gix) => {
				this.primGroupFeatureBase_[primGroupCount] = this.featuresForMeshAndMaterial(desc.mesh, desc.materials[group.materialIx]);
				this.primGroupMaterialBase_[primGroupCount] = <number>desc.materials[group.materialIx];
				++primGroupCount;
			});

			return ix;
		}


		destroy(inst: PBRModelInstance) {
		}


		destroyRange(range: PBRModelRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() {
			return this.instanceData_.count;
		}

		valid(inst: PBRModelInstance) {
			return <number>inst <= this.count;
		}

		all(): PBRModelRange {
			return new InstanceLinearRange<PBRModelManager>(1, this.count);
		}


		entity(inst: PBRModelInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: PBRModelInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}

		mesh(inst: PBRModelInstance) {
			return this.meshes_[<number>inst];
		}

		enabled(inst: PBRModelInstance): boolean {
			return this.enabledBase_[<number>inst] != 0;
		}

		setEnabled(inst: PBRModelInstance, newEnabled: boolean) {
			this.enabledBase_[<number>inst] = +newEnabled;
		}


		setActiveLights(lights: LightInstance[], shadowCasterIndex: number) {
			this.activeLights_ = lights.slice(0);

			// -- 1 dynamic shadowing light at a time
			shadowCasterIndex |= 0;
			if (shadowCasterIndex < 0 || shadowCasterIndex >= lights.length) {
				// no shadow caster
				shadowCasterIndex = -1;
			}
			this.shadowCastingLightIndex_ = shadowCasterIndex;
		}


		private drawSingleForward(rp: render.RenderPass, proj: ProjectionSetup, lightingQuality: PBRLightingQuality, modelIx: number) {
			var gl = this.rc.gl;
			var drawCalls = 0;

			var mesh = this.meshes_[modelIx];

			// -- calc transform matrices
			var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);

			// -- draw all groups
			var primGroupBase = this.primGroupOffsetBase_[modelIx];
			var primGroupCount = mesh.primitiveGroups.length;

			for (var pgIx = 0; pgIx < primGroupCount; ++pgIx) {
				var primGroup = mesh.primitiveGroups[pgIx];
				var matInst: PBRMaterialInstance = this.primGroupMaterialBase_[primGroupBase + pgIx];
				var materialData = this.materialMgr_.getData(matInst);

				// -- features are a combo of Material features and optional shadow
				var features: Features = this.primGroupFeatureBase_[primGroupBase + pgIx];
				features |= lightingQuality << LightingQualityBitShift;
				var pipeline = this.pbrPipeline_.pipelineForFeatures(features);
				rp.setPipeline(pipeline);
				rp.setMesh(mesh);

				// -- set transform and normal uniforms
				var program = <PBRGLProgram>(pipeline.program);

				// model, mvp and normal matrices are always present
				gl.uniformMatrix4fv(program.modelMatrixUniform, false, <Float32Array>modelMatrix);
				gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
				mat3.normalFromMat4(this.normalMatrix_, this.modelViewMatrix_);
				gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);

				if (program.mvMatrixUniform) {
					gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
				}

				if (program.lightNormalMatrixUniform) {
					mat3.normalFromMat4(this.lightNormalMatrix_, proj.viewMatrix);
					gl.uniformMatrix3fv(program.lightNormalMatrixUniform, false, this.lightNormalMatrix_);
				}

				// -- set material uniforms
				gl.uniform4fv(program.baseColourUniform, materialData.colourData);
				gl.uniform4fv(program.materialUniform, materialData.materialParam);

				if (features & Features.VtxUV) {
					gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
				}
				if (features & Features.AlbedoMap) {
					rp.setTexture(materialData.albedoMap, TextureBindPoint.Albedo);
				}
				if (features & Features.NormalMap) {
					rp.setTexture(materialData.normalHeightMap, TextureBindPoint.NormalHeight);
				}

				// -- light data FIXME: only update these when local light data was changed -> pos and rot can change as well
				gl.uniform1iv(program.lightTypeArrayUniform, this.lightTypeArray_);
				gl.uniform4fv(program.lightCamPositionArrayUniform, this.lightCamPositionArray_);
				gl.uniform4fv(program.lightWorldPositionArrayUniform, this.lightWorldPositionArray_);
				gl.uniform4fv(program.lightDirectionArrayUniform, this.lightDirectionArray_);
				gl.uniform4fv(program.lightColourArrayUniform, this.lightColourArray_);
				gl.uniform4fv(program.lightParamArrayUniform, this.lightParamArray_);

				// -- draw
				if (mesh.hasIndexBuffer)
					rp.drawIndexedPrimitives(primGroup.fromPrimIx, primGroup.primCount);
				else
					rp.drawPrimitives(primGroup.fromPrimIx, primGroup.primCount);

				drawCalls += 1;
			}

			return drawCalls;
		}


		updateLightData(proj: ProjectionSetup) {
			var lights = this.activeLights_;

			var viewNormalMatrix = mat3.normalFromMat4([], proj.viewMatrix);

			for (var lix = 0; lix < MAX_FRAGMENT_LIGHTS; ++lix) {
				var light = lix < lights.length ? lights[lix] : null;
				var lightData = light && this.lightMgr_.getData(light, proj.viewMatrix, viewNormalMatrix);

				if (lightData) {
					assert(lightData.type != LightType.None);

					this.lightTypeArray_[lix] = lightData.type;
					container.setIndexedVec4(this.lightColourArray_, lix, lightData.colourData);
					container.setIndexedVec4(this.lightParamArray_, lix, lightData.parameterData);

					if (lightData.type != LightType.Point) {
						container.setIndexedVec4(this.lightDirectionArray_, lix, lightData.direction);
					}
					if (lightData.type != LightType.Directional) {
						container.setIndexedVec4(this.lightCamPositionArray_, lix, lightData.position_cam);
						container.setIndexedVec4(this.lightWorldPositionArray_, lix, lightData.position_world);
					}
				}
				else {
					this.lightTypeArray_[lix] = LightType.None;
				}
			}
		}


		draw(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup, lightingQuality: PBRLightingQuality, environmentMap: render.Texture) {
			if (! this.brdfLookupTex_) {
				return;
			}

			var gl = this.rc.gl;
			var count = this.instanceData_.count;
			var drawCalls = 0;

			rp.setTexture(environmentMap, TextureBindPoint.Environment);
			rp.setTexture(this.brdfLookupTex_, TextureBindPoint.BRDFLookup);

			let iter = range.makeIterator();
			while (iter.next()) {
				drawCalls += this.drawSingleForward(rp, proj, lightingQuality, < number > iter.current);
			}

			return drawCalls;
		}
	}


	// -- embedded brdf lookup texture as base64-encoded PNG
	const brdfPNGString = "data:image/png;base64,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";

} // ns sd.world
