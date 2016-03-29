// pbrmodel - PBR model component
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

// Implementation based off:
// https://gist.github.com/galek/53557375251e1a942dfa by Nick Galko
// which in turn used certain functions from the Unreal 4 Engine Source
// as indicated by comments.

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required and implied
		VtxUV                      = 1 << 0,
		VtxColour                  = 1 << 1,

		AlbedoMap                  = 1 << 2,
		MetallicMap                = 1 << 3,
		RoughnessMap               = 1 << 4,
		AOMap                      = 1 << 5,

		NormalMap                  = 1 << 6,
		HeightMap                  = 1 << 7,


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

		// -- textures
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
		Albedo = 0, // rgb, (alpha|gloss)?
		Environment = 1,
		BRDFLookup = 2
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


		enableFeatures(disableMask: Features) {
			this.featureMask_ |= disableMask;
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

			line  ("#extension GL_EXT_shader_texture_lod : require");
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

			line  ("uniform sampler2D brdfLookupMap;");
			line  ("uniform samplerCube environmentMap;");

			line  ("const int MAT_METALLIC = 0;");
			line  ("const int MAT_ROUGHNESS = 3;");

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


			line  ("struct SurfaceInfo {");
			line  ("	vec3 V;"); // vertex dir (cam)
			line  ("	vec3 N;"); // surface normal (cam)
			line  ("	float NdV;");
			line  ("};");

			line  ("struct LightRayInfo {");
			line  ("	vec3 L;"); // light dir (cam)
			line  ("	vec3 H;"); // rel dir l to v
			line  ("	float NdL;");
			line  ("	float NdH;");
			line  ("	float HdV;");
			line  ("};");

			line  ("SurfaceInfo calcSurfaceInfo() {");
			line  ("	SurfaceInfo si;");
			line  ("	si.V = normalize(-vertexPos_cam);");
			line  ("	si.N = normalize(vertexNormal_cam);");
			line  ("	si.NdV = max(0.001, dot(si.N, si.V));");
			line  ("	return si;");
			line  ("}");

			line  ("LightRayInfo calcLightRayInfo(SurfaceInfo si, vec3 lightDirection_cam) {");
			line  ("	LightRayInfo lri;");
			line  ("	lri.L = -lightDirection_cam;");
			line  ("	lri.H = normalize(lri.L + si.V);");
			line  ("	lri.NdL = max(0.0, dot(si.N, lri.L));");
			line  ("	lri.NdH = max(0.001, dot(si.N, lri.H));");
			line  ("	lri.HdV = max(0.001, dot(lri.H, si.V));");
			line  ("	return lri;");
			line  ("}")


			line  ("mat3 transpose(mat3 m) {");
			line  ("	vec3 c0 = m[0];");
			line  ("	vec3 c1 = m[1];");
			line  ("	vec3 c2 = m[2];");
			line  ("	return mat3(vec3(c0.x, c1.x, c2.x), vec3(c0.y, c1.y, c2.y), vec3(c0.z, c1.z, c2.z));");
			line  ("}");

			// compute fresnel specular factor for given base specular and product
			// product could be NdV or VdH depending on used technique
			line("vec3 fresnel_factor(vec3 f0, float product) {");
			// line("	return mix(f0, vec3(1.0), pow(1.01 - product, 5.0));");
			line("	return f0 + (vec3(1.0) - f0) * pow(2.0, (-5.55473 * product - 6.98316) * product);");
			line("}");

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

			// simple phong specular calculation with normalization
			line("vec3 phong_specular(vec3 V, vec3 L, vec3 N, vec3 specular, float roughness) {");
			line("	vec3 R = reflect(-L, N);");
			line("	float spec = max(0.0, dot(V, R));");
			line("	float k = 1.999 / (roughness * roughness);");
			line("	return min(1.0, 3.0 * 0.0398 * k) * pow(spec, min(10000.0, k)) * specular;");
			line("}");

			// simple blinn specular calculation with normalization
			line("vec3 blinn_specular(float NdH, vec3 specular, float roughness) {");
			line("	float k = 1.999 / (roughness * roughness);");
			line("	return min(1.0, 3.0 * 0.0398 * k) * pow(NdH, min(10000.0, k)) * specular;");
			line("}");

			// cook-torrance specular calculation
			line("vec3 cooktorrance_specular(float NdL, float NdV, float NdH, vec3 specular, float roughness) {");
			// line("	float D = D_blinn(roughness, NdH);");
			line("	float D = D_GGX(roughness, NdH);");
			line("	float G = G_schlick(roughness, NdV, NdL);");
			line("	float rim = mix(1.0 - roughness * 0.9, 1.0, NdV);");
			line("	return (1.0 / rim) * specular * G * D;");
			line("}");



			// -- calcLightShared()
			line("vec3 calcLightShared(vec3 baseColour, vec4 matParam, vec4 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si) {");
			line("	vec3 L = -lightDirection_cam;");
			line("	vec3 V = si.V;");
			line("	vec3 H = normalize(L + V);");
			line("	vec3 N = si.N;");

			// material properties
			line("	float metallic = matParam[MAT_METALLIC];");
			line("	float roughness = matParam[MAT_ROUGHNESS];");
			line("	vec3 specularColour = mix(vec3(0.04), baseColour, metallic);");

			// diffuse IBL term
			line("	mat3 tnrm = transpose(normalMatrix);");
			line("	vec3 envdiff = textureCubeLodEXT(environmentMap, tnrm * N, roughness * 6.0).xyz;");

			// specular IBL term
			line("	vec3 refl = tnrm * reflect(-V, N);");
			line("	vec3 envspec = textureCubeLodEXT(environmentMap, refl, roughness * 6.0).xyz;");

			line("	float NdL = max(0.0, dot(N, L));");
			line("	float NdV = max(0.001, dot(N, V));");
			line("	float NdH = max(0.001, dot(N, H));");
			line("	float HdV = max(0.001, dot(H, V));");

			line("	vec3 specfresnel = fresnel_factor(specularColour, HdV);");
			line("	vec3 specref = cooktorrance_specular(NdL, NdV, NdH, specfresnel, roughness);");
			line("	specref *= vec3(NdL);");

			// diffuse is common for all lighting models
			line("	vec3 diffref = (vec3(1.0) - specfresnel) * PHONG_DIFFUSE * NdL;");

			// compute lighting
			line("	vec3 reflected_light = vec3(0.0);");
			line("	vec3 diffuse_light = vec3(0.0);"); // initial value == constant ambient light

			// direct light
			line("	vec3 light_color = lightColour.rgb * diffuseStrength * 2.0;");
			line("	reflected_light += specref * light_color;");
			line("	diffuse_light += diffref * light_color;");

			// environment light
			line("	vec2 brdf = texture2D(brdfLookupMap, vec2(roughness, 1.0 - NdV)).xy;");
			line("	vec3 iblspec = min(vec3(0.99), fresnel_factor(specularColour, NdV) * brdf.x + brdf.y);");
			line("	reflected_light += iblspec * envspec;");
			line("	diffuse_light += envdiff * PHONG_DIFFUSE;");

			// final result
			line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
			line("}");


			// -- calcPointLight()
			line  ("vec3 calcPointLight(int lightIx, vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightPos_cam, vec3 lightPos_world, SurfaceInfo si) {");
			line  ("	float distance = length(vertexPos_world - lightPos_world);"); // use world positions for distance as cam will warp coords
			line  ("	vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);");
			line  ("	float attenuation = 1.0 - pow(clamp(distance / lightParam[LPARAM_RANGE], 0.0, 1.0), 2.0);");
			line  ("    attenuation *= dot(si.N, -lightDirection_cam);");
			line  ("    float diffuseStrength = lightParam[LPARAM_INTENSITY] * attenuation;");
			line  ("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection_cam, si);");
			line  ("}");


			// -- calcSpotLight()
			line  ("vec3 calcSpotLight(int lightIx, vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, SurfaceInfo si) {");
			line  ("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);");
			line  ("	float spotCosAngle = dot(lightToPoint, lightDirection);");
			line  ("	float cutoff = lightParam[LPARAM_CUTOFF];");
			line  ("	if (spotCosAngle > cutoff) {");
			line  ("		vec3 light = calcPointLight(lightIx, baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, si);");
			line  ("		return light * smoothstep(cutoff, cutoff + 0.006, spotCosAngle);")
			line  ("	}");
			line  ("	return vec3(0.0);");
			line  ("}");


			// -- calcDirectionalLight()
			line  ("vec3 calcDirectionalLight(int lightIx, vec3 baseColour, vec4 matParam, vec4 lightColour, vec4 lightParam, vec3 lightDirection, SurfaceInfo si) {");
			line  ("	float diffuseStrength = lightParam[LPARAM_INTENSITY] * dot(si.N, -lightDirection);");
			line  ("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection, si);");
			line  ("}");



			// -- main()
			line  ("void main() {");

			if (feat & Features.AlbedoMap) {
				line("	vec3 baseColour = texture2D(albedoSampler, vertexUV_intp);");
			}
			else {
				line("	vec3 baseColour = baseColour.rgb;");
			}

			line("	vec4 matParam = materialParam;");
			if (feat & Features.MetallicMap) {
				line("	matParam[MAT_METALLIC] = texture2D(metallicSampler, vertexUV_intp)[MAT_METALLIC];");
			}
			if (feat & Features.RoughnessMap) {
				line("	matParam[MAT_ROUGHNESS] = texture2D(roughnessSampler, vertexUV_intp)[MAT_ROUGHNESS];");
			}


			line  ("	SurfaceInfo si = calcSurfaceInfo();");
			

			// -- calculate light arriving at the fragment
			line  ("	vec3 totalLight = vec3(0.0);");

			line  ("	for (int lightIx = 0; lightIx < MAX_FRAGMENT_LIGHTS; ++lightIx) {");
			line  ("		int type = lightTypes[lightIx];");
			line  ("		if (type == 0) break;");

			line  ("		vec3 lightPos_cam = lightPositions_cam[lightIx].xyz;");     // all array accesses must be constant or a loop index
			line  ("		vec3 lightPos_world = lightPositions_world[lightIx].xyz;");
			line  ("		vec3 lightDir_cam = lightDirections[lightIx].xyz;");        // keep w component (LDIR_BIAS)
			line  ("		vec4 lightColour = lightColours[lightIx];");
			line  ("		vec4 lightParam = lightParams[lightIx];");

			line  ("		if (type == 1) {")
			line  ("			totalLight += calcDirectionalLight(lightIx, baseColour, matParam, lightColour, lightParam, lightDir_cam, si);");
			line  ("		}");
			line  ("		else if (type == 2) {")
			line  ("			totalLight += calcPointLight(lightIx, baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, si);");
			line  ("		}");
			line  ("		else if (type == 3) {")
			line  ("			totalLight += calcSpotLight(lightIx, baseColour, matParam, lightColour, lightParam, lightPos_cam, lightPos_world, lightDir_cam, si);");
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

			return features;
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


		setBRDFLookupTexture(newLUT: render.Texture) {
			this.brdfLookupTex_ = newLUT;
		}


		private drawSingleForward(rp: render.RenderPass, proj: ProjectionSetup, modelIx: number) {
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


		draw(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup, environmentMap: render.Texture) {
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
				drawCalls += this.drawSingleForward(rp, proj, <number>iter.current);
			}

			return drawCalls;
		}
	}

} // ns sd.world
