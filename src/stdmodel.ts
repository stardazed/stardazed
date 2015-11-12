// stdmodel - standard model component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="numeric.ts" />
/// <reference path="stdmaterial.ts" />
/// <reference path="rendercontext.ts" />

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required
		//VtxTangent      = 0x0001,
		VtxUV           = 0x0002,
		VtxColour       = 0x0004,
		Specular        = 0x0008, // Implied true if GlossMap
		AlbedoMap       = 0x0010,
		//TranslucencyMap = 0x0020, // \__ Mutually Exclusive
		//GlossMap        = 0x0040, // /
		//NormalMap       = 0x0080, // Requires VtxTangent
		//HeightMap       = 0x0100
	}


	interface StdGLProgram extends WebGLProgram {
		mvMatrixUniform?: WebGLUniformLocation;         // mat4
		mvpMatrixUniform?: WebGLUniformLocation;        // mat4
		normalMatrixUniform?: WebGLUniformLocation;     // mat3
		lightNormalMatrixUniform?: WebGLUniformLocation;// mat3

		ambientSunFactorUniform?: WebGLUniformLocation; // float
		mainColourUniform: WebGLUniformLocation;        // vec4
		specularUniform: WebGLUniformLocation;          // vec4
		texScaleOffsetUniform: WebGLUniformLocation;    // vec4

		colourMapUniform?: WebGLUniformLocation;        // sampler2D
		normalMapUniform?: WebGLUniformLocation;        // sampler2D
	}


	const enum TextureBindPoint {
		Colour = 0, // rgb, (alpha|gloss)?
		Normal = 1  // xyz, height?
	}


	//  ___ _      _ ___ _           _ _          
	// / __| |_ __| | _ (_)_ __  ___| (_)_ _  ___ 
	// \__ \  _/ _` |  _/ | '_ \/ -_) | | ' \/ -_)
	// |___/\__\__,_|_| |_| .__/\___|_|_|_||_\___|
	//                    |_|                     

	class StdPipeline {
		private cachedPipelines_ = new Map<number, render.Pipeline>();

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
			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			// -- material properties
			program.ambientSunFactorUniform = gl.getUniformLocation(program, "ambientSunFactor");
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

			gl.useProgram(null);

			this.cachedPipelines_.set(feat, pipeline);
			return pipeline;
		}


		vertexShaderSource(feat: number) {
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
			if_all("varying vec3 vertexPos_cam_intp;", Features.Specular);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line  ("uniform mat4 modelViewProjectionMatrix;");
			if_all("uniform mat4 modelViewMatrix;", Features.Specular);
			line  ("uniform mat3 normalMatrix;");

			// main()
			line  ("void main() {");
			line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
			line  ("	vertexNormal_intp = normalize(normalMatrix * vertexNormal);");
			if_all("	vertexPos_cam_intp = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;", Features.Specular);
			if_all("	vertexUV_intp = vertexUV;", Features.VtxUV);
			if_all("	vertexColour_intp = vertexColour;", Features.VtxColour);
			line  ("}");

			// console.info("------ VERTEX");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}


		fragmentShaderSource(feat: number) {
			var source: string[] = [];
			var line = (s: string) => source.push(s);
			var if_all = (s: string, f: number) => { if ((feat & f) == f) source.push(s) };
			var if_any = (s: string, f: number) => { if ((feat & f) != 0) source.push(s) };

			line  ("precision highp float;");

			// In
			line  ("varying vec3 vertexNormal_intp;");
			if_all("varying vec3 vertexPos_cam_intp;", Features.Specular);
			if_all("varying vec2 vertexUV_intp;", Features.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Features.VtxColour);

			// Uniforms
			line  ("uniform mat3 lightNormalMatrix;");
			line  ("uniform float ambientSunFactor;");
			if_all("uniform vec4 specular;", Features.Specular);
			if_all("uniform sampler2D albedoSampler;", Features.AlbedoMap);

			// Constants
			line  ("const vec3 sunlightColour = vec3(1, 1, 1);");

			// main()
			line  ("void main() {");
			line  ("	vec3 lightDirection = normalize(vec3(.8, .7, .4));");
			line  ("	vec3 normal = normalize(vertexNormal_intp);");
			line  ("	vec3 lightVec = normalize(lightNormalMatrix * lightDirection);");

			// specular
			if (feat & Features.Specular) {
				line("	vec3 viewVec = normalize(-vertexPos_cam_intp);");
				line("	vec3 reflectVec = reflect(-lightVec, normal);");
				line("	float spec = max(dot(reflectVec, viewVec), 0.0);");
				line("	spec = pow(spec, specular.w); // shininess");
				line("	vec3 specContrib = specular.rgb * spec;");
			}

			// final color
			if ((feat & (Features.VtxUV | Features.AlbedoMap)) == (Features.VtxUV | Features.AlbedoMap)) {
				line("	vec3 lightColour = sunlightColour * max(ambientSunFactor, dot(lightVec, normal));");
				line("	vec3 texColour = texture2D(albedoSampler, vertexUV_intp).xyz;");
				line("	vec3 outColour = lightColour * texColour;");
			}
			else if (feat & Features.VtxColour) {
				line("	vec3 diffColour = (sunlightColour * 0.1) + (vertexColour_intp * 0.9);");
				line("	vec3 outColour = diffColour * (ambientSunFactor + 0.5 * dot(lightVec, normal));");
			}
			else {
				line("	vec3 outColour = vec3(0.0, 1.0, 0.0);");	
			}
			if (feat & Features.Specular) {
				line("	outColour = outColour + specContrib;");
			}
			line  ("	gl_FragColor = vec4(outColour, 1.0);");

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


	export class StdModelManager {
		private stdPipeline: StdPipeline;

		private transforms_: TransformInstance[] = [];
		private meshes_: render.Mesh[] = [];
		private materialIndexOffsets_: number[] = [];
		private groupFeatureOffsets_: number[] = [];
		private primGroupFeatures_: Features[] = [];
		private materialIndexes_: StdMaterialIndex[] = [];
		private count_ = 0;

		private modelViewMatrix_: Float32Array;
		private modelViewProjectionMatrix_: Float32Array;
		private normalMatrix_: Float32Array;
		private lightNormalMatrix_: Float32Array;


		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager, private materialMgr_: StdMaterialManager) {
			this.stdPipeline = new StdPipeline(rc);

			this.modelViewMatrix_ = mat4.create();
			this.modelViewProjectionMatrix_ = mat4.create();
			this.normalMatrix_ = mat3.create();
			this.lightNormalMatrix_ = mat3.create();
		}


		private featuresForMeshAndMaterial(mesh: render.Mesh, material: StdMaterialIndex): Features {
			var features = 0;

			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.Colour)) features |= Features.VtxColour;
			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.UV)) features |= Features.VtxUV;

			var matFlags = this.materialMgr_.flags(material);
			if (matFlags & StdMaterialFlags.usesSpecular) features |= Features.Specular;

			if (this.materialMgr_.albedoMap(material)) features |= Features.AlbedoMap;			

			return features;
		}


		create(entity: Entity, mesh: render.Mesh, materials: StdMaterialIndex[]): StdModelInstance {
			var ix = ++this.count_;

			var groups = mesh.primitiveGroups;
			var maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(materials.length >= maxLocalMatIndex - 1, "not enough StdMaterialIndexes for this mesh");

			this.transforms_[ix] = this.transformMgr_.forEntity(entity);
			this.meshes_[ix] = mesh;

			this.materialIndexOffsets_[ix] = this.materialIndexes_.length;
			this.groupFeatureOffsets_[ix] = this.primGroupFeatures_.length;
			groups.forEach((group, gix) => {
				this.materialIndexes_.push(materials[group.materialIx]);
				this.primGroupFeatures_.push(this.featuresForMeshAndMaterial(mesh, materials[group.materialIx]));
			});

			return new Instance<StdModelManager>(ix);
		}


		private drawOne(rp: render.RenderPass, proj: ProjectionSetup, mix: number) {
			var gl = this.rc.gl;

			var mesh = this.meshes_[mix];

			// -- calc transform matrices
			var modelMatrix = this.transformMgr_.modelMatrix(this.transforms_[mix]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);

			// -- draw all groups
			var materialIndexBase = this.materialIndexOffsets_[mix];
			var groupFeatureBase = this.groupFeatureOffsets_[mix];
			var primGroupCount = mesh.primitiveGroups.length;

			for (var pgIx = 0; pgIx < primGroupCount; ++pgIx) {
				var primGroup = mesh.primitiveGroups[pgIx];
				var matIndex = this.materialIndexes_[materialIndexBase + pgIx];
				var materialData = this.materialMgr_.getData(matIndex);
				var features = this.primGroupFeatures_[groupFeatureBase + pgIx];

				var pipeline = this.stdPipeline.pipelineForFeatures(features);
				rp.setPipeline(pipeline);
				rp.setMesh(mesh);

				if (features & Features.AlbedoMap) {
					rp.setTexture(materialData.albedoMap, TextureBindPoint.Colour);
				}

				// -- set transform and normal uniforms
				var program = <StdGLProgram>(pipeline.program);

				// mvp and normal matrices are always present
				gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
				math.extractNormalMatrix(this.modelViewMatrix_, this.normalMatrix_);
				gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);

				if (program.mvMatrixUniform) {
					gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
				}
				if (program.lightNormalMatrixUniform) {
					math.extractNormalMatrix(proj.viewMatrix, this.lightNormalMatrix_);
					gl.uniformMatrix3fv(program.lightNormalMatrixUniform, false, this.lightNormalMatrix_);
				}

				// -- set material uniforms
				gl.uniform1f(program.ambientSunFactorUniform, 0.7);
				if (features & Features.Specular) {
					gl.uniform4fv(program.specularUniform, materialData.specularData);
				}

				// -- draw
				if (mesh.hasIndexBuffer)
					rp.drawIndexedPrimitives(primGroup.fromPrimIx, primGroup.primCount);
				else
					rp.drawPrimitives(primGroup.fromPrimIx, primGroup.primCount);
			}
		}


		drawAll(rp: render.RenderPass, proj: ProjectionSetup) {
			var gl = this.rc.gl;

			rp.setDepthTest(render.DepthTest.Less);

			for (var mix = 1; mix <= this.count_; ++mix) {
				this.drawOne(rp, proj, mix);
			}
		}
	}

} // ns.model
