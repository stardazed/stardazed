// stdmodel - standard model component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required
		VtxUV                      = 0x000001,
		VtxColour                  = 0x000002,

		Emissive                   = 0x000004,
		Specular                   = 0x000008, // Implied true if GlossMap
		SpecularMap                = 0x000010,

		DiffuseMap                 = 0x000020,
		DiffuseAlphaIsTransparency = 0x000040, // \__ 
		DiffuseAlphaIsOpacity      = 0x000080, // =__ Mutually Exclusive
		// DiffuseAlphaIsGloss        = 0x000100, // /

		NormalMap                  = 0x000200,
		// NormalAlphaIsHeight        = 0x000400,
		// HeightMap                  = 0x000800, // Either this or NormalMap + NormalAlphaIsHeight

		ShadowMap       = 0x001000,
		SoftShadow      = 0x002000,
		Fog             = 0x004000,
		Translucency    = 0x008000,

		//Instanced      = 0x010000,
		Skinned         = 0x020000
	}


	interface StdGLProgram extends WebGLProgram {
		// -- transform
		modelMatrixUniform: WebGLUniformLocation;      // mat4
		mvMatrixUniform: WebGLUniformLocation | null;  // mat4
		mvpMatrixUniform: WebGLUniformLocation;        // mat4
		normalMatrixUniform: WebGLUniformLocation;     // mat3
		lightNormalMatrixUniform: WebGLUniformLocation | null;// mat3

		// -- skinning
		jointDataUniform: WebGLUniformLocation | null;        // sampler2D 
		jointIndexOffsetUniform: WebGLUniformLocation | null; // int

		// -- mesh material
		mainColourUniform: WebGLUniformLocation;        // vec4
		specularUniform: WebGLUniformLocation;          // vec4
		emissiveDataUniform: WebGLUniformLocation;      // vec4
		texScaleOffsetUniform: WebGLUniformLocation;    // vec4

		colourMapUniform: WebGLUniformLocation | null;        // sampler2D
		normalMapUniform: WebGLUniformLocation | null;        // sampler2D
		specularMapUniform: WebGLUniformLocation | null;      // sampler2D

		// -- lights
		lightTypeArrayUniform: WebGLUniformLocation;      // int[MAX_FRAGMENT_LIGHTS]
		lightCamPositionArrayUniform: WebGLUniformLocation;  // vec4[MAX_FRAGMENT_LIGHTS]
		lightWorldPositionArrayUniform: WebGLUniformLocation;  // vec4[MAX_FRAGMENT_LIGHTS]
		lightDirectionArrayUniform: WebGLUniformLocation; // vec4[MAX_FRAGMENT_LIGHTS]
		lightColourArrayUniform: WebGLUniformLocation;    // vec4[MAX_FRAGMENT_LIGHTS]
		lightParamArrayUniform: WebGLUniformLocation;     // vec4[MAX_FRAGMENT_LIGHTS]
		shadowCastingLightIndexUniform: WebGLUniformLocation | null; // int (-1..MAX_FRAGMENT_LIGHTS - 1)

		// -- shadow
		lightViewProjectionMatrixUniform: WebGLUniformLocation | null; // mat4
		shadowMapUniform: WebGLUniformLocation | null;        // sampler2D/Cube

		// -- fog
		fogColourUniform: WebGLUniformLocation | null;        // vec4 (rgb, 0)
		fogParamsUniform: WebGLUniformLocation | null;        // vec4 (start, depth, density, 0)
	}


	const enum TextureBindPoint {
		Colour = 0, // rgb, (alpha|gloss)?
		Normal = 1, // xyz, height?
		Specular = 2,
		Shadow = 3,
		JointData = 4
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
		private shadowPipeline_: render.Pipeline | null = null;
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
			pld.attributeNames.set(meshdata.VertexAttributeRole.Normal, "vertexNormal");
			
			if (feat & Features.Skinned) {
				pld.attributeNames.set(meshdata.VertexAttributeRole.JointIndexes, "vertexJointIndexes");
				pld.attributeNames.set(meshdata.VertexAttributeRole.WeightedPos0, "vertexWeightedPos0_joint");
				pld.attributeNames.set(meshdata.VertexAttributeRole.WeightedPos1, "vertexWeightedPos1_joint");
				pld.attributeNames.set(meshdata.VertexAttributeRole.WeightedPos2, "vertexWeightedPos2_joint");
				pld.attributeNames.set(meshdata.VertexAttributeRole.WeightedPos3, "vertexWeightedPos3_joint");
			}
			else {
				pld.attributeNames.set(meshdata.VertexAttributeRole.Position, "vertexPos_model");
			}
			if (feat & Features.VtxColour) {
				pld.attributeNames.set(meshdata.VertexAttributeRole.Colour, "vertexColour");
			}
			if (feat & Features.VtxUV) {
				pld.attributeNames.set(meshdata.VertexAttributeRole.UV, "vertexUV");
			}

			if (feat & Features.Translucency) {
				pld.depthMask = false;
				pld.blending.enabled = true;

				pld.blending.rgbBlendOp = render.BlendOperation.Add;
				pld.blending.alphaBlendOp = render.BlendOperation.Add;

				if (feat & Features.DiffuseAlphaIsOpacity) {
					pld.blending.sourceRGBFactor = render.BlendFactor.SourceAlpha;
					pld.blending.sourceAlphaFactor = render.BlendFactor.SourceAlpha;
					pld.blending.destRGBFactor = render.BlendFactor.OneMinusSourceAlpha;
					pld.blending.destAlphaFactor = render.BlendFactor.OneMinusSourceAlpha;
				}
				else {
					// fixed alpha value from Material
					pld.blending.sourceRGBFactor = render.BlendFactor.ConstantAlpha;
					pld.blending.sourceAlphaFactor = render.BlendFactor.ConstantAlpha;
					pld.blending.destRGBFactor = render.BlendFactor.OneMinusConstantAlpha;
					pld.blending.destAlphaFactor = render.BlendFactor.OneMinusConstantAlpha;

					pld.blending.constantColour[3] = 0.35;
				}
			}

			var pipeline = new render.Pipeline(this.rc, pld);
			var program = <StdGLProgram>pipeline.program;
			
			gl.useProgram(program);

			// -- transformation matrices
			program.modelMatrixUniform = gl.getUniformLocation(program, "modelMatrix")!;
			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix")!;
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix")!;
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			// -- material properties
			program.mainColourUniform = gl.getUniformLocation(program, "mainColour")!;
			program.specularUniform = gl.getUniformLocation(program, "specular")!;
			program.emissiveDataUniform = gl.getUniformLocation(program, "emissiveData")!;
			program.texScaleOffsetUniform = gl.getUniformLocation(program, "texScaleOffset")!;

			// -- texture samplers and their fixed binding indexes
			program.colourMapUniform = gl.getUniformLocation(program, "diffuseSampler");
			if (program.colourMapUniform) {
				gl.uniform1i(program.colourMapUniform, TextureBindPoint.Colour);
			}
			program.normalMapUniform = gl.getUniformLocation(program, "normalSampler");
			if (program.normalMapUniform) {
				gl.uniform1i(program.normalMapUniform, TextureBindPoint.Normal);
			}
			program.specularMapUniform = gl.getUniformLocation(program, "specularSampler");
			if (program.specularMapUniform) {
				gl.uniform1i(program.specularMapUniform, TextureBindPoint.Specular);
			}
			program.shadowMapUniform = gl.getUniformLocation(program, "shadowSampler");
			if (program.shadowMapUniform) {
				gl.uniform1i(program.shadowMapUniform, TextureBindPoint.Shadow);
			}

			// -- vertex skinning data
			program.jointDataUniform = gl.getUniformLocation(program, "jointData");
			program.jointIndexOffsetUniform = gl.getUniformLocation(program, "jointIndexOffset");
			if (program.jointDataUniform) {
				gl.uniform1i(program.jointDataUniform, TextureBindPoint.JointData);
				gl.uniform1i(program.jointIndexOffsetUniform, 0);
			}

			// -- light property arrays
			program.lightTypeArrayUniform = gl.getUniformLocation(program, "lightTypes")!;
			program.lightCamPositionArrayUniform = gl.getUniformLocation(program, "lightPositions_cam")!;
			program.lightWorldPositionArrayUniform = gl.getUniformLocation(program, "lightPositions_world")!;
			program.lightDirectionArrayUniform = gl.getUniformLocation(program, "lightDirections")!;
			program.lightColourArrayUniform = gl.getUniformLocation(program, "lightColours")!;
			program.lightParamArrayUniform = gl.getUniformLocation(program, "lightParams")!;
			program.shadowCastingLightIndexUniform = gl.getUniformLocation(program, "shadowCastingLightIndex");
			if (program.shadowCastingLightIndexUniform) {
				// if this exists, init to -1 to signify no shadow caster
				gl.uniform1i(program.shadowCastingLightIndexUniform, -1);
			}

			// -- zero out light types
			gl.uniform1iv(program.lightTypeArrayUniform, new Int32Array(MAX_FRAGMENT_LIGHTS));

			// -- shadow properties
			program.lightViewProjectionMatrixUniform = gl.getUniformLocation(program, "lightViewProjectionMatrix");

			// -- fog properties
			program.fogColourUniform = gl.getUniformLocation(program, "fogColour");
			program.fogParamsUniform = gl.getUniformLocation(program, "fogParams");

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
				pld.attributeNames.set(meshdata.VertexAttributeRole.Position, "vertexPos_model");
				// pld.writeMask.red = pld.writeMask.green = pld.writeMask.blue = pld.writeMask.alpha = false;

				this.shadowPipeline_ = new render.Pipeline(this.rc, pld);

				var program = <StdGLProgram>this.shadowPipeline_.program;
				program.mvpMatrixUniform = this.rc.gl.getUniformLocation(program, "modelViewProjectionMatrix")!;
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
			// var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };
			
			// In
			if (feat & Features.Skinned) {
				line("attribute vec4 vertexWeightedPos0_joint;");
				line("attribute vec4 vertexWeightedPos1_joint;");
				line("attribute vec4 vertexWeightedPos2_joint;");
				line("attribute vec4 vertexWeightedPos3_joint;");
				line("attribute vec4 vertexJointIndexes;");
			}
			else {
				line("attribute vec3 vertexPos_model;");
			}
			line  ("attribute vec3 vertexNormal;");
			if_all("attribute vec2 vertexUV;", Features.VtxUV);
			if_all("attribute vec3 vertexColour;", Features.VtxColour);

			// Out
			line  ("varying vec3 vertexNormal_cam;");
			line  ("varying vec3 vertexPos_world;");
			line  ("varying vec3 vertexPos_cam;");
			if_all("varying vec4 vertexPos_light;", Features.ShadowMap);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line  ("uniform mat4 modelMatrix;");
			line  ("uniform mat4 modelViewMatrix;");
			line  ("uniform mat4 modelViewProjectionMatrix;");
			if_all("uniform mat4 lightViewProjectionMatrix;", Features.ShadowMap);
			line  ("uniform mat3 normalMatrix;");

			if_all("uniform vec4 texScaleOffset;", Features.VtxUV);

			if_all("uniform sampler2D jointData;", Features.Skinned);
			if_all("uniform int jointIndexOffset;", Features.Skinned);


			// Joint structure and getIndexedJoint() getter
			if (feat & Features.Skinned) {
				// transformQuat converted from gl-matrix original
				line("vec3 transformQuat(vec3 a, vec4 q) {");
				line("	float ix = q.w * a.x + q.y * a.z - q.z * a.y;");
				line("	float iy = q.w * a.y + q.z * a.x - q.x * a.z;");
				line("	float iz = q.w * a.z + q.x * a.y - q.y * a.x;");
				line("	float iw = -q.x * a.x - q.y * a.y - q.z * a.z;");
				line("	vec3 result;");
				line("	result.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;");
				line("	result.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;");
				line("	result.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;");
				line("	return result;");
				line("}");

				line("struct Joint {");
				line("	vec4 rotation_joint;");
				line("	mat4 transform_model;");
				line("};");

				// The jointData texture is 256x256 xyzw texels.
				// Each joint takes up 8 texels that contain the Joint structure data
				// The sampler must be set up with nearest neighbour filtering and have no mipmaps
				line("Joint getIndexedJoint(float jointIndex) {");
				// line("	jointIndex += float(jointIndexOffset);");
				line("	float row = (floor(jointIndex / 32.0) + 0.5) / 256.0;");
				line("	float col = (mod(jointIndex, 32.0) * 8.0) + 0.5;");
				line("	Joint j;");
				line("	j.rotation_joint = texture2D(jointData, vec2(col / 256.0, row));");
				// rows 1,2,3 are reserved
				line("	j.transform_model[0] = texture2D(jointData, vec2((col + 4.0) / 256.0, row));");
				line("	j.transform_model[1] = texture2D(jointData, vec2((col + 5.0) / 256.0, row));");
				line("	j.transform_model[2] = texture2D(jointData, vec2((col + 6.0) / 256.0, row));");
				line("	j.transform_model[3] = texture2D(jointData, vec2((col + 7.0) / 256.0, row));");
				line("	return j;");
				line("}");
			}

			// main()
			line  ("void main() {");

			if (feat & Features.Skinned) {
				line("	vec3 vertexPos_model = vec3(0.0);");
				line("	vec3 vertexNormal_final = vec3(0.0);");

				line("	vec4 weightedPos_joint[4];");
				line("	weightedPos_joint[0] = vertexWeightedPos0_joint;");
				line("	weightedPos_joint[1] = vertexWeightedPos1_joint;");
				line("	weightedPos_joint[2] = vertexWeightedPos2_joint;");
				line("	weightedPos_joint[3] = vertexWeightedPos3_joint;");

				line("	for (int vji = 0; vji < 4; ++vji) {");
				line("		float jointIndex = vertexJointIndexes[vji];");
				line("		if (jointIndex >= 0.0) {");
				line("			Joint j = getIndexedJoint(jointIndex);");
				line("			vec4 weightedPos = weightedPos_joint[vji];");
				line("			vec3 tempPos = (j.transform_model * vec4(weightedPos.xyz, 1.0)).xyz;");
				line("			vertexPos_model += tempPos * weightedPos.w;");
				//              normal += ( joint.m_Orient * vert.m_Normal ) * weight.m_Bias;
				line("			vec3 vertexNormal_joint = transformQuat(vertexNormal, j.rotation_joint);");
				line("			vertexNormal_final += vertexNormal_joint * weightedPos.w;");
				line("		}");
				line("	}");
				line("	vertexNormal_final = normalize(vertexNormal_final);");
				// line("	vertexNormal_final = vertexNormal;");
			}
			else {
				line("	vec3 vertexNormal_final = vertexNormal;");
			}

			line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
			line  ("	vertexPos_world = (modelMatrix * vec4(vertexPos_model, 1.0)).xyz;");
			line  ("	vertexNormal_cam = normalMatrix * vertexNormal_final;");
			line  ("	vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;");
			if_all("	vertexPos_light = lightViewProjectionMatrix * modelMatrix * vec4(vertexPos_model, 1.0);", Features.ShadowMap);
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
			// var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };
			// var if_not = (s: string, f: number) => { if ((feat & f) == 0) source.push(s) };

			if_all("#extension GL_OES_standard_derivatives : require", Features.NormalMap);
			line  ("precision highp float;");

			// In
			line  ("varying vec3 vertexPos_world;");
			line  ("varying vec3 vertexNormal_cam;");
			line  ("varying vec3 vertexPos_cam;");
			if_all("varying vec4 vertexPos_light;", Features.ShadowMap);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line  ("uniform mat3 lightNormalMatrix;");

			// -- material
			line  ("uniform vec4 mainColour;");
			if_all("uniform vec4 specular;", Features.Specular);
			if_all("uniform vec4 emissiveData;", Features.Emissive);
			if_all("uniform sampler2D diffuseSampler;", Features.DiffuseMap);
			if_all("uniform sampler2D normalSampler;", Features.NormalMap);
			if_all("uniform sampler2D specularSampler;", Features.SpecularMap);
			if_all("uniform sampler2D shadowSampler;", Features.ShadowMap);
			if_all("uniform int shadowCastingLightIndex;", Features.ShadowMap);

			line  ("const int SPEC_INTENSITY = 0;");
			line  ("const int SPEC_EXPONENT = 1;");

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
			line  ("uniform vec4 lightPositions_cam[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightPositions_world[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightDirections[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightColours[MAX_FRAGMENT_LIGHTS];");
			line  ("uniform vec4 lightParams[MAX_FRAGMENT_LIGHTS];");

			// -- fog
			if (feat & Features.Fog) {
				line("const int FOGPARAM_START = 0;");
				line("const int FOGPARAM_DEPTH = 1;");
				line("const int FOGPARAM_DENSITY = 2;");

				line("uniform vec4 fogColour;");
				line("uniform vec4 fogParams;");
			}

			// initialized in main() as GLSL ES 2 does not support array initializers
			if_all("vec2 poissonDisk[16];", Features.SoftShadow);

			// -- calcLightShared()
			line  ("vec3 calcLightShared(vec3 matColour, vec4 colour, vec4 param, float diffuseStrength, vec3 lightDirection, vec3 normal_cam) {");
			line  ("	vec3 ambientContrib = colour.rgb * param[LPARAM_AMBIENT_INTENSITY];");
			if_all("	vec3 emissiveContrib = emissiveData.rgb * emissiveData.w;", Features.Emissive);
			if_all("	ambientContrib += emissiveContrib;", Features.Emissive);
			line  ("	if (diffuseStrength <= 0.0) {");
			line  ("		return ambientContrib;");
			line  ("	}");
			line  ("	float NdL = max(0.0, dot(normal_cam, -lightDirection));");
			line  ("	vec3 diffuseContrib = colour.rgb * diffuseStrength * NdL * param[LPARAM_DIFFUSE_INTENSITY];");

			if (feat & Features.Specular) {
				line("	vec3 specularContrib = vec3(0.0);");
				line("	vec3 viewVec = normalize(-vertexPos_cam);");
				line("	vec3 reflectVec = reflect(lightDirection, normal_cam);");
				line("	float specularStrength = dot(viewVec, reflectVec);");
				line("	if (specularStrength > 0.0) {");
				if (feat & Features.SpecularMap) {
					line("		vec3 specularColour = texture2D(specularSampler, vertexUV_intp).xyz;");
				}
				else {
					line("		vec3 specularColour = colour.rgb;");
				}
				line("		specularStrength = pow(specularStrength, specular[SPEC_EXPONENT]) * diffuseStrength;"); // FIXME: not too sure about this (* diffuseStrength)
				line("		specularContrib = specularColour * specularStrength * specular[SPEC_INTENSITY];");
				line("	}");
				line("	return (ambientContrib + (diffuseContrib + specularContrib)) * colour.w;"); // lightColour.w = lightAmplitude
			}
			else {
				line("	return (ambientContrib + diffuseContrib) * colour.w;");
			}
			line  ("}");


			// -- calcPointLight()
			line  ("vec3 calcPointLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightPos_cam, vec3 lightPos_world, vec3 normal_cam) {");
			line  ("	float distance = length(vertexPos_world - lightPos_world);"); // use world positions for distance as cam will warp coords
			line  ("	vec3 lightDirection = normalize(vertexPos_cam - lightPos_cam.xyz);");
			line  ("	float range = param[LPARAM_RANGE];");
			line  ("	float attenuation = clamp(1.0 - distance * distance / (range * range), 0.0, 1.0);");
			line  ("	attenuation *= attenuation;");
			line  ("	return calcLightShared(matColour, colour, param, attenuation, lightDirection, normal_cam);");
			line  ("}");


			// -- calcSpotLight()
			line  ("vec3 calcSpotLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightPos_cam, vec3 lightPos_world, vec4 lightDirection, vec3 normal_cam) {");
			line  ("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam.xyz);");
			line  ("	float spotCosAngle = dot(lightToPoint, lightDirection.xyz);");
			line  ("	float cutoff = param[LPARAM_CUTOFF];");
			line  ("	if (spotCosAngle > cutoff) {");
			line  ("		vec3 light = calcPointLight(lightIx, matColour, colour, param, lightPos_cam, lightPos_world, normal_cam);");
			line  ("		return light * smoothstep(cutoff, cutoff + 0.006, spotCosAngle);")
			line  ("	}");
			line  ("	return vec3(0.0);");
			line  ("}");


			// -- calcDirectionalLight()
			line  ("vec3 calcDirectionalLight(int lightIx, vec3 matColour, vec4 colour, vec4 param, vec4 lightDirection, vec3 normal_cam) {");
			line  ("	return calcLightShared(matColour, colour, param, 1.0, lightDirection.xyz, normal_cam);");
			line  ("}");


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
				line("	vec3 map = texture2D(normalSampler, uv).xyz * 2.0 - 1.0;");
				line("	map.y = -map.y;");
				line("	mat3 TBN = cotangentFrame(N, -V, uv);");
				line("	return normalize(TBN * map);");
				line("}");
			}


			// main()
			line  ("void main() {");
			line  ("	float fragOpacity = 1.0;");

			// -- material colour at point
			if (feat & Features.DiffuseMap) {
				if (feat & (Features.DiffuseAlphaIsTransparency | Features.DiffuseAlphaIsOpacity)) {
					line("	vec4 texColourA = texture2D(diffuseSampler, vertexUV_intp);");
					line("	vec3 texColour = texColourA.rgb;");

					if (feat & Features.DiffuseAlphaIsTransparency) {
						line("	if (texColourA.a < 0.1) {");
						line("		discard;")
						line("	}");
					}
					else {
						line("	fragOpacity = texColourA.a;")
					}
				}
				else {
					line("	vec3 texColour = texture2D(diffuseSampler, vertexUV_intp).xyz;");
				}

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
				// -- init global poisson sample array (GLSL ES 2 does not support array initializers)
				line("	poissonDisk[0] = vec2(-0.94201624, -0.39906216);");
				line("	poissonDisk[1] = vec2(0.94558609, -0.76890725);");
				line("	poissonDisk[2] = vec2(-0.094184101, -0.92938870);");
				line("	poissonDisk[3] = vec2(0.34495938, 0.29387760);");
				line("	poissonDisk[4] = vec2( -0.91588581, 0.45771432 );")
				line("	poissonDisk[5] = vec2( -0.81544232, -0.87912464 );")
				line("	poissonDisk[6] = vec2( -0.38277543, 0.27676845 );")
				line("	poissonDisk[7] = vec2( 0.97484398, 0.75648379 );")
				line("	poissonDisk[8] = vec2( 0.44323325, -0.97511554 );")
				line("	poissonDisk[9] = vec2( 0.53742981, -0.47373420 );")
				line("	poissonDisk[10] = vec2( -0.26496911, -0.41893023 );")
				line("	poissonDisk[11] = vec2( 0.79197514, 0.19090188 );")
				line("	poissonDisk[12] = vec2( -0.24188840, 0.99706507 ); ")
				line("	poissonDisk[13] = vec2( -0.81409955, 0.91437590 );")
				line("	poissonDisk[14] = vec2( 0.19984126, 0.78641367 );")
				line("	poissonDisk[15] = vec2( 0.14383161, -0.14100790 );")
			}

			// -- normal in camera space, convert from tangent space
			line  ("	vec3 normal_cam = normalize(vertexNormal_cam);");
			if_all("	normal_cam = perturbNormal(normal_cam, -vertexPos_cam, vertexUV_intp);", Features.NormalMap);

			// -- calculate light arriving at the fragment
			line  ("	vec3 totalLight = vec3(0.0);");

			line  ("	for (int lightIx = 0; lightIx < MAX_FRAGMENT_LIGHTS; ++lightIx) {");
			line  ("		int type = lightTypes[lightIx];");
			line  ("		if (type == 0) break;");

			line  ("		vec4 lightPos_cam = lightPositions_cam[lightIx];");     // all array accesses must be constant or a loop index
			line  ("		vec3 lightPos_world = lightPositions_world[lightIx].xyz;");
			line  ("		vec4 lightDir_cam = lightDirections[lightIx];");        // keep w component (LDIR_BIAS)
			line  ("		vec4 lightColour = lightColours[lightIx];");
			line  ("		vec4 lightParam = lightParams[lightIx];");

			// shadow intensity
			line  ("		float shadowFactor = 1.0;");

			if (feat & Features.ShadowMap) {
				line("		if (lightIx == shadowCastingLightIndex) {");
				line("			float shadowBias = lightDir_cam[LDIR_BIAS];"); // shadow bias stored in light direction
				line("			float fragZ = (vertexPos_light.z - shadowBias) / vertexPos_light.w;");

				if (feat & Features.SoftShadow) {
					// well, soft-ish
					line("			float strengthIncrement = lightPos_cam[LPOS_STRENGTH] / 16.0;");
					line("			for (int ssi = 0; ssi < 16; ++ssi) {");
					line("				vec2 shadowSampleCoord = (vertexPos_light.xy / vertexPos_light.w) + (poissonDisk[ssi] / 550.0);");
					line("				float shadowZ = texture2D(shadowSampler, shadowSampleCoord).z;");
					line("				if (shadowZ < fragZ) {");
					line("					shadowFactor -= strengthIncrement;");
					line("				}");
					line("			}");
				}
				else {
					line("			float shadowZ = texture2DProj(shadowSampler, vertexPos_light.xyw).z;");
					line("			if (shadowZ < fragZ) {");
					line("				shadowFactor = 1.0 - lightPos_cam[LPOS_STRENGTH];"); // shadow strength stored in light world pos
					line("			}");
				}

				line("		}"); // lightIx == shadowCastingLightIndex
			}

			line  ("		if (type == 1) {")
			line  ("			totalLight += shadowFactor * calcDirectionalLight(lightIx, matColour, lightColour, lightParam, lightDir_cam, normal_cam);");
			line  ("		}");
			line  ("		else if (type == 2) {")
			line  ("			totalLight += shadowFactor * calcPointLight(lightIx, matColour, lightColour, lightParam, lightPos_cam, lightPos_world, normal_cam);");
			line  ("		}");
			line  ("		else if (type == 3) {")
			line  ("			totalLight += shadowFactor * calcSpotLight(lightIx, matColour, lightColour, lightParam, lightPos_cam, lightPos_world, lightDir_cam, normal_cam);");
			line  ("		}");
			line  ("	}");

			// -- final colour result
			if (feat & Features.Fog) {
				line("	float fogDensity = clamp((length(vertexPos_cam) - fogParams[FOGPARAM_START]) / fogParams[FOGPARAM_DEPTH], 0.0, fogParams[FOGPARAM_DENSITY]);");
				line("	gl_FragColor = vec4(mix(totalLight * matColour, fogColour.rgb, fogDensity), 1.0);"); // TODO: make Fog and translucency mut.ex.
			}
			else {
				line("	gl_FragColor = vec4(totalLight * matColour, fragOpacity);");
			}

			line  ("}");

			// console.info("------ FRAGMENT " + feat);
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
		materials: asset.Material[];
		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}


	export const enum RenderMode {
		Forward,
		//Deferred,
		Shadow
	}


	export const enum RenderFeature {
		AlbedoMaps,
		NormalMaps,
		HeightMaps
	}


	export class StdModelManager implements ComponentManager<StdModelManager> {
		private stdPipeline_: StdPipeline;
		private materialMgr_: StdMaterialManager;

		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private shadowFlagBase_: Int32Array;
		private materialOffsetCountBase_: Int32Array;
		private primGroupOffsetBase_: Int32Array;

		private materials_: StdMaterialInstance[];

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupMaterialBase_: StdMaterialArrayView;
		private primGroupFeatureBase_: ConstEnumArrayView<Features>;

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
			private meshMgr_: MeshManager,
			private skeletonMgr_: SkeletonManager,
			private lightMgr_: LightManager
		)
		{
			this.stdPipeline_ = new StdPipeline(rc);
			this.materialMgr_ = new StdMaterialManager();

			var instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: UInt8,  count: 1 }, // enabled
				{ type: SInt32, count: 1 }, // shadowFlags
				{ type: SInt32, count: 1 }, // materialOffsetCount ([0]: offset, [1]: count)
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

			this.materials_ = [];
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.enabledBase_ = this.instanceData_.indexedFieldView(2);
			this.shadowFlagBase_ = this.instanceData_.indexedFieldView(3);
			this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
			this.primGroupOffsetBase_ = this.instanceData_.indexedFieldView(5);
		}


		private groupRebase() {
			this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
		}


		private featuresForMeshAndMaterial(mesh: MeshInstance, material: StdMaterialInstance): Features {
			var features = 0;

			const meshFeatures = this.meshMgr_.features(mesh);
			if (meshFeatures & MeshFeatures.VertexColours) features |= Features.VtxColour;
			if (meshFeatures & MeshFeatures.VertexUVs) features |= Features.VtxUV;

			var matFlags = this.materialMgr_.flags(material);
			if (matFlags & asset.MaterialFlags.usesSpecular) features |= Features.Specular;
			if (matFlags & asset.MaterialFlags.usesEmissive) features |= Features.Emissive;
			if (matFlags & asset.MaterialFlags.diffuseAlphaIsTransparency) features |= Features.DiffuseAlphaIsTransparency;

			if (matFlags & asset.MaterialFlags.isTranslucent) {
				features |= Features.Translucency;

				if (matFlags & asset.MaterialFlags.diffuseAlphaIsOpacity) {
					features |= Features.DiffuseAlphaIsOpacity;
				}
			}

			if (this.materialMgr_.diffuseMap(material)) features |= Features.DiffuseMap;
			if (this.materialMgr_.normalMap(material)) features |= Features.NormalMap;
			if (this.materialMgr_.specularMap(material)) features |= Features.SpecularMap | Features.Specular;

			if (this.materialMgr_.flags(material) & asset.MaterialFlags.isSkinned) features |= Features.Skinned;

			// Remove redundant or unused features as GL drivers can and will remove attributes that are only used in the vertex shader
			// var prePrune = features;

			// disable UV attr and DiffuseMap unless both are provided (TODO: also take other maps into account when added later)
			if ((features & (Features.VtxUV | Features.DiffuseMap)) != (Features.VtxUV | Features.DiffuseMap)) {
				features &= ~(Features.VtxUV | Features.DiffuseMap);
			}

			// disable diffusemap-dependent features if there is no diffusemap
			if (!(features & Features.DiffuseMap)) {
				features &= ~Features.DiffuseAlphaIsTransparency;
				features &= ~Features.DiffuseAlphaIsOpacity;
			}

			// if (features != prePrune) {
			// 	console.info("Filtered " + prePrune + " to " + features);
			// }
			return features;
		}


		private updatePrimGroups(modelIx: number) {
			const mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
			if (! mesh) {
				return;
			}
			const groups = this.meshMgr_.primitiveGroups(mesh);
			const materialsOffsetCount = container.copyIndexedVec2(this.materialOffsetCountBase_, modelIx);
			const materialsOffset = materialsOffsetCount[0];
			const materialCount = materialsOffsetCount[1];

			// -- check correctness of mesh against material list
			var maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(materialCount >= maxLocalMatIndex - 1, "not enough StdMaterialIndexes for this mesh");

			// -- pre-calc global material indexes and program features for each group
			var primGroupCount = this.primGroupData_.count;
			this.primGroupOffsetBase_[modelIx] = this.primGroupData_.count;

			// -- grow primitiveGroup metadata buffer if necessary
			if (this.primGroupData_.resize(primGroupCount + groups.length) == container.InvalidatePointers.Yes) {
				this.groupRebase();
			}

			// -- append metadata for each primGroup
			groups.forEach(group => {
				this.primGroupFeatureBase_[primGroupCount] = this.featuresForMeshAndMaterial(mesh, this.materials_[materialsOffset + group.materialIx]);
				this.primGroupMaterialBase_[primGroupCount] = this.materials_[materialsOffset + group.materialIx];
				primGroupCount += 1;
			});
		}


		create(entity: Entity, desc: StdModelDescriptor): StdModelInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>entity;
			this.transformBase_[ix] = <number>this.transformMgr_.forEntity(entity);
			this.enabledBase_[ix] = +true;
			this.shadowFlagBase_[ix] = 0;

			// -- save material indexes
			container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
			for (const mat of desc.materials) {
				this.materials_.push(this.materialMgr_.create(mat));
			}
			
			this.updatePrimGroups(ix);

			return ix;
		}


		destroy(_inst: StdModelInstance) {
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


		entity(inst: StdModelInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: StdModelInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}

		enabled(inst: StdModelInstance): boolean {
			return this.enabledBase_[<number>inst] != 0;
		}

		setEnabled(inst: StdModelInstance, newEnabled: boolean) {
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


		disableRenderFeature(f: RenderFeature) {
			if (f == RenderFeature.NormalMaps) {
				this.stdPipeline_.disableFeatures(Features.NormalMap);
			}
		}


		enableRenderFeature(f: RenderFeature) {
			if (f == RenderFeature.NormalMaps) {
				this.stdPipeline_.enableFeatures(Features.NormalMap);
			}
		}


		private drawSingleForward(rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, fogSpec: world.FogDescriptor | null, modelIx: number) {
			var gl = this.rc.gl;
			var drawCalls = 0;

			var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
			if (! mesh) {
				// console.warn("No mesh attached to entity of stdModel " + modelIx);
				return;
			}

			// -- calc transform matrices
			var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);

			// -- draw all groups
			var meshPrimitiveGroups = this.meshMgr_.primitiveGroups(mesh);
			var primGroupBase = this.primGroupOffsetBase_[modelIx];
			var primGroupCount = meshPrimitiveGroups.length;

			for (var pgIx = 0; pgIx < primGroupCount; ++pgIx) {
				var primGroup = meshPrimitiveGroups[pgIx];
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

				if (fogSpec) {
					features |= Features.Fog;
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
				if (features & Features.Emissive) {
					gl.uniform4fv(program.emissiveDataUniform, materialData.emissiveData);
				}
				if (features & (Features.DiffuseMap | Features.NormalMap | Features.SpecularMap)) {
					gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
				}

				// these textures are assumed to exist if their feature flag is set
				// TODO: check every time?
				if (features & Features.DiffuseMap) {
					rp.setTexture(materialData.diffuseMap!, TextureBindPoint.Colour);
				}
				if (features & Features.SpecularMap) {
					rp.setTexture(materialData.specularMap!, TextureBindPoint.Specular);
				}
				if (features & Features.NormalMap) {
					rp.setTexture(materialData.normalMap!, TextureBindPoint.Normal);
				}
				if (features & Features.Skinned) {
					rp.setTexture(this.skeletonMgr_.jointDataTexture, TextureBindPoint.JointData);
				}

				// -- light data FIXME: only update these when local light data was changed -> pos and rot can change as well
				gl.uniform1iv(program.lightTypeArrayUniform, this.lightTypeArray_);
				gl.uniform4fv(program.lightCamPositionArrayUniform, this.lightCamPositionArray_);
				gl.uniform4fv(program.lightWorldPositionArrayUniform, this.lightWorldPositionArray_);
				gl.uniform4fv(program.lightDirectionArrayUniform, this.lightDirectionArray_);
				gl.uniform4fv(program.lightColourArrayUniform, this.lightColourArray_);
				gl.uniform4fv(program.lightParamArrayUniform, this.lightParamArray_);

				// -- fog data (TODO: directly using descriptor)
				if (fogSpec) {
					gl.uniform4fv(program.fogColourUniform!, new Float32Array([fogSpec.colour[0], fogSpec.colour[1], fogSpec.colour[2], 0]));
					gl.uniform4fv(program.fogParamsUniform!, new Float32Array([fogSpec.offset, fogSpec.depth, fogSpec.density, 0]));
				}

				// -- shadow map and metadata
				if (shadow) {
					gl.uniform1i(program.shadowCastingLightIndexUniform, this.shadowCastingLightIndex_);

					rp.setTexture(shadow.shadowFBO.depthAttachmentTexture()!, TextureBindPoint.Shadow);

					mat4.multiply(this.lightViewProjectionMatrix_, shadow.lightProjection.projectionMatrix, shadow.lightProjection.viewMatrix);
					var lightBiasMat = mat4.multiply([], mat4.fromTranslation([], [.5, .5, .5]), mat4.fromScaling([], [.5, .5, .5]));
					mat4.multiply(this.lightViewProjectionMatrix_, lightBiasMat, this.lightViewProjectionMatrix_);

					gl.uniformMatrix4fv(program.lightViewProjectionMatrixUniform!, false, this.lightViewProjectionMatrix_);
				}

				// -- draw
				const indexElementType = this.meshMgr_.indexBufferElementType(mesh);
				if (indexElementType !== meshdata.IndexElementType.None) {
					rp.drawIndexedPrimitives(primGroup.type, indexElementType, primGroup.fromElement, primGroup.elementCount);
				}
				else {
					rp.drawPrimitives(primGroup.type, primGroup.fromElement, primGroup.elementCount);
				}

				drawCalls += 1;
			}

			return drawCalls;
		}


		private drawSingleShadow(rp: render.RenderPass, proj: ProjectionSetup, shadowPipeline: render.Pipeline, modelIx: number) {
			var gl = this.rc.gl;
			var program = <StdGLProgram>(shadowPipeline.program);
			var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
			rp.setMesh(mesh);

			// -- calc MVP and set
			var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);
			gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);

			// -- draw full mesh
			const uniformPrimType = this.meshMgr_.uniformPrimitiveType(mesh);
			if (uniformPrimType !== meshdata.PrimitiveType.None) {
				const totalElementCount = this.meshMgr_.totalElementCount(mesh);
				const indexElementType = this.meshMgr_.indexBufferElementType(mesh);
				if (indexElementType !== meshdata.IndexElementType.None) {
					rp.drawIndexedPrimitives(uniformPrimType, indexElementType, 0, totalElementCount);
				}
				else {
					rp.drawPrimitives(uniformPrimType, 0, totalElementCount);
				}
			}

			// -- drawcall count, always 1
			return 1;
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


		private splitModelRange(range: StdModelRange, triggerFeature: Features, cullDisabled: boolean = false) {
			var withFeature = new InstanceSet<StdModelManager>();
			var withoutFeature = new InstanceSet<StdModelManager>();

			var iter = range.makeIterator();
			while (iter.next()) {
				let modelIx = <number>iter.current;
				var enabled = this.enabledBase_[modelIx];
				if (! enabled && cullDisabled) {
					continue;
				}

				var primGroupBase = this.primGroupOffsetBase_[modelIx];
				var firstPGFeatures: Features = this.primGroupFeatureBase_[primGroupBase];

				if ((firstPGFeatures & triggerFeature) == triggerFeature) {
					withFeature.add(iter.current);
				}
				else {
					withoutFeature.add(iter.current);
				}
			}

			return {
				with: withFeature,
				without: withoutFeature
			};
		}


		splitModelRangeByTranslucency(range: StdModelRange) {
			var split = this.splitModelRange(range, Features.Translucency, true);
			return {
				opaque: split.without,
				translucent: split.with
			};
		}


		draw(range: StdModelRange, rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, fogSpec: world.FogDescriptor | null, mode: RenderMode) {
			var drawCalls = 0;

			if (mode == RenderMode.Forward) {
				let iter = range.makeIterator();
				while (iter.next()) {
					if (this.enabledBase_[<number>iter.current]) {
						drawCalls += this.drawSingleForward(rp, proj, shadow, fogSpec, <number>iter.current);
					}
				}
			}
			else if (mode == RenderMode.Shadow) {
				var shadowPipeline = this.stdPipeline_.shadowPipeline();
				rp.setPipeline(shadowPipeline);

				let iter = range.makeIterator();
				while (iter.next()) {
					if (this.enabledBase_[<number>iter.current]) {
						drawCalls += this.drawSingleShadow(rp, proj, shadowPipeline, <number>iter.current);
					}
				}
			}

			return drawCalls;
		}
	}

} // ns sd.world
