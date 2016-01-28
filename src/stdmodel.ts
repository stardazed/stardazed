// stdmodel - standard model component
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required
		//VtxTangent      = 0x0001,
		VtxUV           = 0x00002,
		VtxColour       = 0x00004,
		Specular        = 0x00008, // Implied true if GlossMap
		AlbedoMap       = 0x00010,
		//TranslucencyMap = 0x00020, // \__ Mutually Exclusive
		//GlossMap        = 0x00040, // /
		//NormalMap       = 0x00080, // Requires VtxTangent
		//HeightMap       = 0x00100,
		ShadowMap       = 0x01000,
		SoftShadow      = 0x02000,
		//Instancing      = 0x10000
	}


	interface StdGLProgram extends WebGLProgram {
		// -- transform
		modelMatrixUniform?: WebGLUniformLocation;      // mat4
		mvMatrixUniform?: WebGLUniformLocation;         // mat4
		mvpMatrixUniform?: WebGLUniformLocation;        // mat4
		normalMatrixUniform?: WebGLUniformLocation;     // mat3
		lightNormalMatrixUniform?: WebGLUniformLocation;// mat3

		// -- mesh material
		mainColourUniform: WebGLUniformLocation;        // vec4
		specularUniform: WebGLUniformLocation;          // vec4
		texScaleOffsetUniform: WebGLUniformLocation;    // vec4

		colourMapUniform?: WebGLUniformLocation;        // sampler2D
		normalMapUniform?: WebGLUniformLocation;        // sampler2D

		// -- lights
		lightTypeArrayUniform?: WebGLUniformLocation;      // int[MAX_FRAGMENT_LIGHTS]
		lightPositionArrayUniform?: WebGLUniformLocation;  // vec4[MAX_FRAGMENT_LIGHTS]
		lightDirectionArrayUniform?: WebGLUniformLocation; // vec4[MAX_FRAGMENT_LIGHTS]
		lightColourArrayUniform?: WebGLUniformLocation;    // vec4[MAX_FRAGMENT_LIGHTS]
		lightParamArrayUniform?: WebGLUniformLocation;     // vec4[MAX_FRAGMENT_LIGHTS]
		shadowCastingLightIndexUniform: WebGLUniformLocation; // int (-1..MAX_FRAGMENT_LIGHTS - 1)

		// -- shadow
		lightViewProjectionMatrixUniform?: WebGLUniformLocation; // mat4
		shadowMapUniform?: WebGLUniformLocation;        // sampler2D/Cube
	}


	const enum TextureBindPoint {
		Colour = 0, // rgb, (alpha|gloss)?
		Normal = 1, // xyz, height?
		Shadow = 2  
	}


	//  ___ _      _ ___ _           _ _          
	// / __| |_ __| | _ (_)_ __  ___| (_)_ _  ___ 
	// \__ \  _/ _` |  _/ | '_ \/ -_) | | ' \/ -_)
	// |___/\__\__,_|_| |_| .__/\___|_|_|_||_\___|
	//                    |_|                     

	// -- shader limits
	const MAX_FRAGMENT_LIGHTS = 4;


	class StdPipeline {
		private cachedPipelines_ = new Map<number, render.Pipeline>();
		private shadowPipeline_: render.Pipeline = null;

		constructor(private rc: render.RenderContext) {
		}


		pipelineForFeatures(feat: number) {
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
			pld.attributeNames.set(mesh.VertexAttributeRole.Position, "vertexPos_model");
			pld.attributeNames.set(mesh.VertexAttributeRole.Normal, "vertexNormal");
			if (feat & Features.VtxColour) {
				pld.attributeNames.set(mesh.VertexAttributeRole.Colour, "vertexColour");
			}
			if (feat & Features.VtxUV) {
				pld.attributeNames.set(mesh.VertexAttributeRole.UV, "vertexUV");
			}

			var pipeline = new render.Pipeline(this.rc, pld);
			var program = <StdGLProgram>pipeline.program;
			
			gl.useProgram(program);

			// -- transformation matrices
			program.modelMatrixUniform = gl.getUniformLocation(program, "modelMatrix");
			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			// -- material properties
			program.mainColourUniform = gl.getUniformLocation(program, "mainColour");
			program.specularUniform = gl.getUniformLocation(program, "specular");
			program.texScaleOffsetUniform = gl.getUniformLocation(program, "texScaleOffset");

			// -- texture samplers and their fixed binding indexes
			program.colourMapUniform = gl.getUniformLocation(program, "albedoSampler");
			if (program.colourMapUniform) {
				gl.uniform1i(program.colourMapUniform, TextureBindPoint.Colour);
			}
			program.normalMapUniform = gl.getUniformLocation(program, "normalSampler");
			if (program.normalMapUniform) {
				gl.uniform1i(program.normalMapUniform, TextureBindPoint.Normal);
			}
			program.shadowMapUniform = gl.getUniformLocation(program, "shadowSampler");
			if (program.shadowMapUniform) {
				gl.uniform1i(program.shadowMapUniform, TextureBindPoint.Shadow);
			}

			// -- light property arrays
			program.lightTypeArrayUniform = gl.getUniformLocation(program, "lightTypes");
			program.lightPositionArrayUniform = gl.getUniformLocation(program, "lightPositions");
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

			// -- shadow properties
			program.lightViewProjectionMatrixUniform = gl.getUniformLocation(program, "lightViewProjectionMatrix");

			gl.useProgram(null);

			this.cachedPipelines_.set(feat, pipeline);
			return pipeline;
		}


		shadowPipeline() {
			if (this.shadowPipeline_ == null) {
				var pld = render.makePipelineDescriptor();
				pld.depthPixelFormat = render.PixelFormat.Depth24I;
				pld.vertexShader = render.makeShader(this.rc, this.rc.gl.VERTEX_SHADER, this.shadowVertexSource);
				pld.fragmentShader = render.makeShader(this.rc, this.rc.gl.FRAGMENT_SHADER, this.shadowFragmentSource);
				pld.attributeNames.set(mesh.VertexAttributeRole.Position, "vertexPos_model");
				// pld.writeMask.red = pld.writeMask.green = pld.writeMask.blue = pld.writeMask.alpha = false;

				this.shadowPipeline_ = new render.Pipeline(this.rc, pld);

				var program = <StdGLProgram>this.shadowPipeline_.program;
				program.mvpMatrixUniform = this.rc.gl.getUniformLocation(program, "modelViewProjectionMatrix");
			}

			return this.shadowPipeline_;
		}


		private shadowVertexSource = [
			"attribute vec3 vertexPos_model;",
			"uniform mat4 modelViewProjectionMatrix;",
			"void main() {",
			"	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);",
			"}"
		].join("");


		private shadowFragmentSource = [
			"precision highp float;",
			"void main() {",
			"	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
			"}"
		].join("");


		private vertexShaderSource(feat: number) {
			var source: string[] = [];
			var line = (s: string) => source.push(s);
			var if_all = (s: string, f: number) => { if ((feat & f) == f) source.push(s) };
			var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };

			// In
			line  ("attribute vec3 vertexPos_model;");
			line  ("attribute vec3 vertexNormal;");
			if_all("attribute vec2 vertexUV;", Features.VtxUV);
			if_all("attribute vec3 vertexColour;", Features.VtxColour);

			// Out
			line  ("varying vec3 vertexNormal_intp;");
			line  ("varying vec3 vertexPos_world;");
			if_all("varying vec3 vertexPos_cam_intp;", Features.Specular);
			if_all("varying vec4 vertexPos_light_intp;", Features.ShadowMap);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line  ("uniform mat4 modelMatrix;");
			if_all("uniform mat4 modelViewMatrix;", Features.Specular);
			line  ("uniform mat4 modelViewProjectionMatrix;");
			if_all("uniform mat4 lightViewProjectionMatrix;", Features.ShadowMap);
			line  ("uniform mat3 normalMatrix;");
			if_all("uniform vec4 texScaleOffset;", Features.VtxUV);

			// main()
			line  ("void main() {");
			line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
			line  ("	vertexPos_world = (modelMatrix * vec4(vertexPos_model, 1.0)).xyz;");
			line  ("	vertexNormal_intp = normalMatrix * vertexNormal;");
			if_all("	vertexPos_cam_intp = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;", Features.Specular);
			if_all("	vertexPos_light_intp = lightViewProjectionMatrix * modelMatrix * vec4(vertexPos_model, 1.0);", Features.ShadowMap);
			if_all("	vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;", Features.VtxUV);
			if_all("	vertexColour_intp = vertexColour;", Features.VtxColour);
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

			line  ("precision highp float;");

			// In
			line  ("varying vec3 vertexPos_world;");
			line  ("varying vec3 vertexNormal_intp;");
			if_all("varying vec3 vertexPos_cam_intp;", Features.Specular);
			if_all("varying vec4 vertexPos_light_intp;", Features.ShadowMap);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line("uniform mat3 lightNormalMatrix;");

			// -- material
			line  ("uniform vec4 mainColour;");
			if_all("uniform vec4 specular;", Features.Specular);
			if_all("uniform sampler2D albedoSampler;", Features.AlbedoMap);
			if_all("uniform sampler2D shadowSampler;", Features.ShadowMap);
			if_all("uniform int shadowCastingLightIndex;", Features.ShadowMap);

			line  ("const int SPEC_INTENSITY = 0;");
			line  ("const int SPEC_EXPONENT = 1;");
			line  ("const int SPEC_COLOURMIX = 2;");

			// -- light param constants
			line  ("const int MAX_FRAGMENT_LIGHTS = " + MAX_FRAGMENT_LIGHTS + ";");
			line  ("const int LPARAM_AMBIENT_INTENSITY = 0;");
			line  ("const int LPARAM_DIFFUSE_INTENSITY = 1;");
			line  ("const int LPARAM_RANGE = 2;");
			line  ("const int LPARAM_CUTOFF = 3;");
			line  ("const int LPOS_STRENGTH = 3;");
			line  ("const int LDIR_BIAS = 3;");

			// -- lights (with 4 lights, this will take up 20 frag vector uniforms)
			line  ("uniform int lightTypes[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightPositions[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightDirections[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightColours[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightParams[MAX_FRAGMENT_LIGHTS];");

			if (feat & Features.SoftShadow) {
				// initialized in main() as GLSL ES 2 does not support array initializers
				line("vec2 poissonDisk[4];");
			}

			// -- calcLightShared()
			line  ("vec3 calcLightShared(vec3 matColour, vec4 colour, vec4 param, float diffuseStrength, vec3 lightDirection, vec3 normal_cam) {");
			line  ("	vec3 ambientContrib = colour.rgb * param[LPARAM_AMBIENT_INTENSITY];");
			line  ("	if (diffuseStrength <= 0.0) {");
			line  ("		return ambientContrib;");
			line  ("	}");
			line  ("	vec3 diffuseContrib = colour.rgb * diffuseStrength * param[LPARAM_DIFFUSE_INTENSITY];");

			if (feat & Features.Specular) {
				line("	vec3 specularContrib = vec3(0.0, 0.0, 0.0);");
				line("	vec3 viewVec = normalize(-vertexPos_cam_intp);");
				line("	vec3 reflectVec = reflect(lightDirection.xyz, normal_cam);");
				line("	float specularStrength = dot(reflectVec, viewVec);");
				line("	if (specularStrength > 0.0) {");
				line("		vec3 specularColour = mix(matColour, colour.rgb, specular[SPEC_COLOURMIX]);");
				line("		specularStrength = pow(specularStrength, specular[SPEC_EXPONENT]);");
				line("		specularContrib = specularColour * specularStrength * specular[SPEC_INTENSITY];");
				line("	}");
				line("	return (ambientContrib + (diffuseContrib + specularContrib)) * colour.w;"); // lightColour.w = lightAmplitude
			}
			else {
				line("	return (ambientContrib + diffuseContrib) * colour.w;");
			}
			line  ("}");


			// -- calcPointLight()
			line  ("vec3 calcPointLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightPos_world, vec3 normal_cam) {");

			line  ("	vec3 lightDirection = vertexPos_world - lightPos_world.xyz;");
			line  ("	float distance = length(lightDirection);");
			line  ("	lightDirection = normalize(lightDirection);");
			line  ("	float attenuation = 1.0 - pow(clamp(distance / param[LPARAM_RANGE], 0.0, 1.0), 2.0);");
			line  ("    attenuation *= dot(normal_cam, lightNormalMatrix * -lightDirection.xyz);"); // I need to reject light back-facing polies, but this is too strong
			line  ("	return calcLightShared(matColour, colour, param, attenuation, lightDirection, normal_cam);");
			line  ("}");


			// -- calcSpotLight()
			line  ("vec3 calcSpotLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightPos_world, vec4 lightDirection, vec3 normal_cam) {");
			line  ("	vec3 lightToPoint = lightNormalMatrix * normalize(vertexPos_world - lightPos_world.xyz);");
			line  ("	float spotCosAngle = dot(lightToPoint, lightDirection.xyz);");
			line  ("	float cutoff = param[LPARAM_CUTOFF];");
			line  ("	if (spotCosAngle > cutoff) {");

			// shadow intensity
			line("		float shadowFactor = 1.0;");

			if (feat & Features.ShadowMap) {
				line("		if (lightIx == shadowCastingLightIndex) {");
				line("			float shadowBias = lightDirection[LDIR_BIAS];"); // shadow bias stores in light direction
				line("			float fragZ = (vertexPos_light_intp.z - shadowBias) / vertexPos_light_intp.w;");

				if (feat & Features.SoftShadow) {
					// well, soft-ish
					line("			float strengthIncrement = lightPos_world[LPOS_STRENGTH] / 4.0;");
					line("			for (int ssi = 0; ssi < 4; ++ssi) {");
					line("				vec2 shadowSampleCoord = (vertexPos_light_intp.xy / vertexPos_light_intp.w) + (poissonDisk[ssi] / 550.0);");
					line("				float shadowZ = texture2D(shadowSampler, shadowSampleCoord).z;");
					line("				if (shadowZ < fragZ) {");
					line("					shadowFactor -= strengthIncrement;");
					line("				}");
					line("			}");
				}
				else {
					line("			float shadowZ = texture2DProj(shadowSampler, vertexPos_light_intp.xyw).z;");
					line("			if (shadowZ < fragZ) {");
					line("				shadowFactor = 1.0 - lightPos_world[LPOS_STRENGTH];"); // shadow strength stored in light world pos
					line("			}");
				}

				line("		}"); // lightIx == shadowCastingLightIndex
			}

			line  ("		vec3 light = shadowFactor * calcPointLight(lightIx, matColour, colour, param, lightPos_world, normal_cam);");
			line  ("		return light * (1.0 - (1.0 - spotCosAngle) * 1.0/(1.0 - cutoff));");
			line  ("	}");
			line  ("	return vec3(0.0, 0.0, 0.0);");
			line  ("}");


			// -- calcDirectionalLight()
			line  ("vec3 calcDirectionalLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightDirection, vec3 normal_cam) {");
			line  ("	float diffuseStrength = dot(normal_cam, -lightDirection.xyz);");
			line  ("	return calcLightShared(matColour, colour, param, diffuseStrength, lightDirection.xyz, normal_cam);");
			line  ("}");


			// main()
			line  ("void main() {");

			// -- material colour at point
			if ((feat & (Features.VtxUV | Features.AlbedoMap)) == (Features.VtxUV | Features.AlbedoMap)) {
				line("	vec3 texColour = texture2D(albedoSampler, vertexUV_intp).xyz;");

				if (feat & Features.VtxColour) {
					line("	vec3 matColour = vertexColour_intp * texColour * mainColour.rgb;");
				}
				else {
					line("	vec3 matColour = texColour * mainColour.rgb;");	
				}
			}
			else if (feat & Features.VtxColour) {
				line("	vec3 matColour = vertexColour_intp * mainColour.rgb;");
			}
			else {
				line("	vec3 matColour = mainColour.rgb;");
			}

			if (feat & Features.SoftShadow) {
				// -- init global poisson sample array (GLSL ES 2 does not support vector array initializers)
				line("	poissonDisk[0] = vec2(-0.94201624, -0.39906216);");
				line("	poissonDisk[1] = vec2(0.94558609, -0.76890725);");
				line("	poissonDisk[2] = vec2(-0.094184101, -0.92938870);");
				line("	poissonDisk[3] = vec2(0.34495938, 0.29387760);");
			}

			line  ("	vec3 normal_cam = normalize(vertexNormal_intp);");
			line  ("	vec3 totalLight = vec3(0.0, 0.0, 0.0);");

			// -- calculate light arriving at the fragment
			line  ("	for (int lightIx = 0; lightIx < MAX_FRAGMENT_LIGHTS; ++lightIx) {");
			line  ("		int type = lightTypes[lightIx];");
			line  ("		if (type == 0) break;");

			line  ("		vec4 lightPos_world = lightPositions[lightIx];");   // all array accesses must be constant or a loop index
			line  ("		vec4 lightDir = lightDirections[lightIx];");        // keep w component (LDIR_BIAS)
			line  ("		lightDir.xyz = lightNormalMatrix * lightDir.xyz;"); // FIXME: this is frag/vert invariant
			line  ("		vec4 lightColour = lightColours[lightIx];");
			line  ("		vec4 lightParam = lightParams[lightIx];");

			line  ("		if (type == 1) {")
			line  ("			totalLight += calcDirectionalLight(lightIx, matColour, lightColour, lightParam, lightDir, normal_cam);");
			line  ("		}");
			line  ("		else if (type == 2) {")
			line  ("			totalLight += calcPointLight(lightIx, matColour, lightColour, lightParam, lightPos_world, normal_cam);");
			line  ("		}");
			line  ("		else if (type == 3) {")
			line  ("			totalLight += calcSpotLight(lightIx, matColour, lightColour, lightParam, lightPos_world, lightDir, normal_cam);");
			line  ("		}");
			line  ("	}");

			// -- final colour result
			line  ("	gl_FragColor = vec4(totalLight * matColour, 1.0);");
			line  ("}");

			// console.info("------ FRAGMENT");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}
	}


	//  ___ _      _ __  __         _     _ __  __                             
	// / __| |_ __| |  \/  |___  __| |___| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// \__ \  _/ _` | |\/| / _ \/ _` / -_) | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |___/\__\__,_|_|  |_\___/\__,_\___|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                           |___/         

	export type StdModelInstance = Instance<StdModelManager>;
	export type StdModelRange = InstanceRange<StdModelManager>;
	export type StdModelSet = InstanceSet<StdModelManager>;
	export type StdModelIterator = InstanceIterator<StdModelManager>;
	export type StdModelArrayView = InstanceArrayView<StdModelManager>;

	export interface StdModelDescriptor {
		mesh: render.Mesh;
		materials: StdMaterialInstance[];

		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}


	export const enum RenderMode {
		Forward,
		//Deferred,
		Shadow
	}


	export class StdModelManager implements ComponentManager<StdModelManager> {
		private stdPipeline_: StdPipeline;

		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private shadowFlagBase_: Int32Array;
		private primGroupOffsetBase_: Int32Array;

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupMaterialBase_: TypedArray;
		private primGroupFeatureBase_: TypedArray;

		private meshes_: render.Mesh[] = [];

		// -- for light uniform updates
		private lightTypeArray_ = new Int32Array(MAX_FRAGMENT_LIGHTS);
		private lightPositionArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightDirectionArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightColourArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
		private lightParamArray_ = new Float32Array(MAX_FRAGMENT_LIGHTS * 4);
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
			private materialMgr_: StdMaterialManager,
			private lightMgr_: LightManager
		)
		{
			this.stdPipeline_ = new StdPipeline(rc);

			var instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: UInt8, count: 1 },  // enabled
				{ type: SInt32, count: 1 }, // shadowFlags
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
			this.shadowFlagBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
			this.primGroupOffsetBase_ = <Int32Array>this.instanceData_.indexedFieldView(4);
		}


		private groupRebase() {
			this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
		}


		private featuresForMeshAndMaterial(mesh: render.Mesh, material: StdMaterialInstance): Features {
			var features = 0;

			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.Colour)) features |= Features.VtxColour;
			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.UV)) features |= Features.VtxUV;

			var matFlags = this.materialMgr_.flags(material);
			if (matFlags & StdMaterialFlags.usesSpecular) features |= Features.Specular;

			if (this.materialMgr_.albedoMap(material)) features |= Features.AlbedoMap;

			// Bugfix: GL drivers can (and do) remove attributes that are only used in the vertex shader
			var prePrune = features;

			// disable UV attr and AlbedoMap unless both are provided (TODO: also take other maps into account when added later)
			if ((features & (Features.VtxUV | Features.AlbedoMap)) != (Features.VtxUV | Features.AlbedoMap)) {
				features &= ~(Features.VtxUV | Features.AlbedoMap);
			}

			// if (features != prePrune) {
			// 	console.info("Filtered " + prePrune + " to " + features);
			// }

			return features;
		}


		create(entity: Entity, desc: StdModelDescriptor): StdModelInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>entity;
			this.transformBase_[ix] = <number>this.transformMgr_.forEntity(entity);
			this.enabledBase_[ix] = +true;
			this.meshes_[ix] = desc.mesh;
			this.shadowFlagBase_[ix] = 0;

			// -- check correctness of mesh against material list
			var groups = desc.mesh.primitiveGroups;
			var maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(desc.materials.length >= maxLocalMatIndex - 1, "not enough StdMaterialIndexes for this mesh");

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


		destroy(inst: StdModelInstance) {
		}


		destroyRange(range: StdModelRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() {
			return this.instanceData_.count;
		}

		valid(inst: StdModelInstance) {
			return <number>inst <= this.count;
		}

		all(): StdModelRange {
			return new InstanceLinearRange<StdModelManager>(1, this.count);
		}

		makeSetRange(): StdModelSet {
			return new InstanceSet<StdModelManager>();
		}

		makeLinearRange(first: StdModelInstance, last: StdModelInstance): StdModelRange {
			return new InstanceLinearRange<StdModelManager>(first, last);
		}


		entity(inst: StdModelInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: StdModelInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}

		mesh(inst: StdModelInstance) {
			return this.meshes_[<number>inst];
		}

		enabled(inst: StdModelInstance): boolean {
			return this.enabledBase_[<number>inst] != 0;
		}

		setEnabled(inst: StdModelInstance, newEnabled: boolean) {
			this.enabledBase_[<number>inst] = +newEnabled;
		}


		setFragmentLights(lights: LightInstance[], shadowCasterIndex: number) {
			assert(lights.length <= MAX_FRAGMENT_LIGHTS, "too many fragment lights");

			for (var lix = 0; lix < MAX_FRAGMENT_LIGHTS; ++lix) {
				var light = lix < lights.length ? lights[lix] : null;
				var lightData = light && this.lightMgr_.getData(light);

				if (lightData) {
					assert(lightData.type != LightType.None);

					this.lightTypeArray_[lix] = lightData.type;
					container.setIndexedVec4(this.lightColourArray_, lix, lightData.colourData);
					container.setIndexedVec4(this.lightParamArray_, lix, lightData.parameterData);

					if (lightData.type != LightType.Point) {
						container.setIndexedVec4(this.lightDirectionArray_, lix, lightData.direction);
					}
					if (lightData.type != LightType.Directional) {
						container.setIndexedVec4(this.lightPositionArray_, lix, lightData.position);
					}
				}
				else {
					this.lightTypeArray_[lix] = LightType.None;
				}
			}

			// -- forward rendering supports 1 dynamic shadowing light at a time
			shadowCasterIndex |= 0;
			if (shadowCasterIndex < 0 || shadowCasterIndex >= lights.length) {
				// no shadow caster
				shadowCasterIndex = -1;
			}
			this.shadowCastingLightIndex_ = shadowCasterIndex;
		}


		private drawSingleForward(rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView, modelIx: number) {
			var gl = this.rc.gl;

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
				var matInst: StdMaterialInstance = this.primGroupMaterialBase_[primGroupBase + pgIx];
				var materialData = this.materialMgr_.getData(matInst);

				// -- features are a combo of Material features and optional shadow
				var features: Features = this.primGroupFeatureBase_[primGroupBase + pgIx];
				if (shadow) {
					features |= Features.ShadowMap;
					var shadowType = this.lightMgr_.shadowType(shadow.light);
					if (shadowType == ShadowType.Soft) {
						features |= Features.SoftShadow;
					}
				}

				var pipeline = this.stdPipeline_.pipelineForFeatures(features);
				rp.setPipeline(pipeline);
				rp.setMesh(mesh);

				// -- set transform and normal uniforms
				var program = <StdGLProgram>(pipeline.program);

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
				gl.uniform4fv(program.mainColourUniform, materialData.colourData);
				if (features & Features.Specular) {
					gl.uniform4fv(program.specularUniform, materialData.specularData);
				}
				if (features & Features.AlbedoMap) {
					rp.setTexture(materialData.albedoMap, TextureBindPoint.Colour);
					gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
				}

				// -- light data FIXME: only update these when local light data was changed -> pos and rot can change as well
				gl.uniform1iv(program.lightTypeArrayUniform, this.lightTypeArray_);
				gl.uniform4fv(program.lightPositionArrayUniform, this.lightPositionArray_);
				gl.uniform4fv(program.lightDirectionArrayUniform, this.lightDirectionArray_);
				gl.uniform4fv(program.lightColourArrayUniform, this.lightColourArray_);
				gl.uniform4fv(program.lightParamArrayUniform, this.lightParamArray_);

				// -- shadow map and metadata
				if (features & Features.ShadowMap) {
					gl.uniform1i(program.shadowCastingLightIndexUniform, this.shadowCastingLightIndex_);

					rp.setTexture(shadow.shadowFBO.depthAttachmentTexture(), TextureBindPoint.Shadow);

					mat4.multiply(this.lightViewProjectionMatrix_, shadow.lightProjection.projectionMatrix, shadow.lightProjection.viewMatrix);
					var lightBiasMat = mat4.multiply([], mat4.fromTranslation([], [.5, .5, .5]), mat4.fromScaling([], [.5, .5, .5]));
					mat4.multiply(this.lightViewProjectionMatrix_, lightBiasMat, this.lightViewProjectionMatrix_);

					gl.uniformMatrix4fv(program.lightViewProjectionMatrixUniform, false, this.lightViewProjectionMatrix_);
				}

				// -- draw
				if (mesh.hasIndexBuffer)
					rp.drawIndexedPrimitives(primGroup.fromPrimIx, primGroup.primCount);
				else
					rp.drawPrimitives(primGroup.fromPrimIx, primGroup.primCount);
			}
		}


		private drawSingleShadow(rp: render.RenderPass, proj: ProjectionSetup, shadowPipeline: render.Pipeline, modelIx: number) {
			var gl = this.rc.gl;
			var program = <StdGLProgram>(shadowPipeline.program);
			var mesh = this.meshes_[modelIx];
			rp.setMesh(mesh);

			// -- calc MVP and set
			var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);
			gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);

			// -- draw full mesh
			if (mesh.hasIndexBuffer)
				rp.drawIndexedPrimitives(0, mesh.totalPrimitiveCount);
			else
				rp.drawPrimitives(0, mesh.totalPrimitiveCount);
		}


		draw(range: StdModelRange, rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView, mode: RenderMode) {
			var gl = this.rc.gl;
			var count = this.instanceData_.count;
			var iter = range.makeIterator();

			if (mode == RenderMode.Forward) {
				rp.setDepthTest(render.DepthTest.Less);
				// rp.setFaceCulling(render.FaceCulling.Back);

				while (iter.next()) {
					this.drawSingleForward(rp, proj, shadow, <number>iter.current);
				}
			}
			else if (mode == RenderMode.Shadow) {
				var shadowPipeline = this.stdPipeline_.shadowPipeline();
				rp.setPipeline(shadowPipeline);
				rp.setDepthTest(render.DepthTest.Less);
				rp.setFaceCulling(render.FaceCulling.Front);

				while (iter.next()) {
					let inst = <number>iter.current;
					if (this.enabledBase_[inst]) {
						this.drawSingleShadow(rp, proj, shadowPipeline, inst);
					}
				}
			}

			rp.setFaceCulling(render.FaceCulling.Disabled);
		}
	}

} // ns sd.world
