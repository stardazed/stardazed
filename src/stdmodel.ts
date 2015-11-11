// stdmodel - standard model component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="numeric.ts" />
/// <reference path="stdmaterial.ts" />
/// <reference path="rendercontext.ts" />

namespace sd.world {

	const enum Feature {
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


	interface StandardGLProgram extends WebGLProgram {
		mvMatrixUniform?: WebGLUniformLocation;
		mvpMatrixUniform?: WebGLUniformLocation;
		normalMatrixUniform?: WebGLUniformLocation;
		lightNormalMatrixUniform?: WebGLUniformLocation;

		ambientSunFactorUniform?: WebGLUniformLocation;

		colourMapUniform?: WebGLUniformLocation;
		normalMapUniform?: WebGLUniformLocation;
	}


	const enum TextureBindPoint {
		Colour = 0, // rgb, (alpha|gloss)?
		Normal = 1  // xyz, height?
	}


	//  ___ _                _             _ ___ _           _ _          
	// / __| |_ __ _ _ _  __| |__ _ _ _ __| | _ (_)_ __  ___| (_)_ _  ___ 
	// \__ \  _/ _` | ' \/ _` / _` | '_/ _` |  _/ | '_ \/ -_) | | ' \/ -_)
	// |___/\__\__,_|_||_\__,_\__,_|_| \__,_|_| |_| .__/\___|_|_|_||_\___|
	//                                            |_|                     

	class StandardPipeline {
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
			if (feat & Feature.VtxColour) {
				pld.attributeNames.set(mesh.VertexAttributeRole.Colour, "vertexColour");
			}
			if (feat & Feature.VtxUV) {
				pld.attributeNames.set(mesh.VertexAttributeRole.UV, "vertexUV");
			}

			var pipeline = new render.Pipeline(this.rc, pld);
			var program = <StandardGLProgram>pipeline.program;
			
			gl.useProgram(program);

			// -- transformation matrices
			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			// -- material properties
			program.ambientSunFactorUniform = gl.getUniformLocation(program, "ambientSunFactor");

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
			if_all("attribute vec2 vertexUV;", Feature.VtxUV);
			if_all("attribute vec3 vertexColour;", Feature.VtxColour);

			// Out
			line  ("varying vec3 vertexNormal_intp;");
			if_all("varying vec3 vertexPos_cam_intp;", Feature.Specular);
			if_all("varying vec2 vertexUV_intp;", Feature.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Feature.VtxColour);

			// Uniforms
			line  ("uniform mat4 modelViewProjectionMatrix;");
			if_all("uniform mat4 modelViewMatrix;", Feature.Specular);
			line  ("uniform mat3 normalMatrix;");

			// main()
			line  ("void main() {");
			line  ("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
			line  ("	vertexNormal_intp = normalize(normalMatrix * vertexNormal);");
			if_all("	vertexPos_cam_intp = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;", Feature.Specular);
			if_all("	vertexUV_intp = vertexUV;", Feature.VtxUV);
			if_all("	vertexColour_intp = vertexColour;", Feature.VtxColour);
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
			if_all("varying vec3 vertexPos_cam_intp;", Feature.Specular);
			if_all("varying vec2 vertexUV_intp;", Feature.VtxUV);
			if_all("varying vec3 vertexColour_intp;", Feature.VtxColour);

			// Uniforms
			line  ("uniform mat3 lightNormalMatrix;");
			line  ("uniform float ambientSunFactor;");
			if_all("uniform sampler2D albedoSampler;", Feature.AlbedoMap);

			// Constants
			line  ("const vec3 sunlightColour = vec3(1, 1, 1);");

			// main()
			line  ("void main() {");
			line  ("	vec3 lightDirection = normalize(vec3(.8, .7, .4));");
			line  ("	vec3 normal = normalize(vertexNormal_intp);");
			line  ("	vec3 lightVec = normalize(lightNormalMatrix * lightDirection);");

			// specular
			if (feat & Feature.Specular) {
				line("	vec3 viewVec = normalize(-vertexPos_cam_intp);");
				line("	vec3 reflectVec = reflect(-lightVec, normal);");
				line("	float spec = max(dot(reflectVec, viewVec), 0.0);");
				line("	spec = pow(spec, 8.0); // shininess");
				line("	vec3 specContrib = sunlightColour * spec;");
			}

			// final color
			if ((feat & (Feature.VtxUV | Feature.AlbedoMap)) == (Feature.VtxUV | Feature.AlbedoMap)) {
				line("	vec3 lightColour = sunlightColour * max(ambientSunFactor, dot(lightVec, normal));");
				line("	vec3 texColour = texture2D(albedoSampler, vertexUV_intp).xyz;");
				line("	vec3 outColour = lightColour * texColour;");
			}
			else if (feat & Feature.VtxColour) {
				line("	vec3 diffColour = (sunlightColour * 0.1) + (vertexColour_intp * 0.9);");
				line("	vec3 outColour = diffColour * (ambientSunFactor + 0.5 * dot(lightVec, normal));");
			}
			else {
				line("	vec3 outColour = vec3(0.0, 1.0, 0.0);");	
			}
			if (feat & Feature.Specular) {
				line("	outColour = outColour + specContrib;");
			}
			line  ("	gl_FragColor = vec4(outColour, 1.0);");

			line  ("}");

			// console.info("------ FRAGMENT");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}
	}


	//  ___ _                _             _ __  __         _     _ __  __          
	// / __| |_ __ _ _ _  __| |__ _ _ _ __| |  \/  |___  __| |___| |  \/  |__ _ _ _ 
	// \__ \  _/ _` | ' \/ _` / _` | '_/ _` | |\/| / _ \/ _` / -_) | |\/| / _` | '_|
	// |___/\__\__,_|_||_\__,_\__,_|_| \__,_|_|  |_\___/\__,_\___|_|_|  |_\__, |_|  
	//                                                                    |___/     

	export type StandardModelInstance = Instance<StandardModelManager>;


	export class StandardModelManager {
		private stdPipeline: StandardPipeline;

		private transforms_: TransformInstance[] = [];
		private meshes_: render.Mesh[] = [];
		private textures_: render.Texture[] = [];
		private primGroupFeatures_: number[] = [];
		private count_ = 0;

		private modelViewMatrix_: Float32Array;
		private modelViewProjectionMatrix_: Float32Array;
		private normalMatrix_: Float32Array;
		private lightNormalMatrix_: Float32Array;


		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager, private materialMgr_: StandardMaterialManager) {
			this.stdPipeline = new StandardPipeline(rc);

			this.modelViewMatrix_ = mat4.create();
			this.modelViewProjectionMatrix_ = mat4.create();
			this.normalMatrix_ = mat3.create();
			this.lightNormalMatrix_ = mat3.create();
		}


		create(entity: Entity, mesh: render.Mesh, materials: StandardMaterialIndex[]): StandardModelInstance {
			var ix = ++this.count_;

			this.transforms_[ix] = this.transformMgr_.forEntity(entity);
			this.meshes_[ix] = mesh;

			// this.pipelines_[ix] = this.stdPipeline.pipelineForFeatures(this.featuresOfModel(ix));

			return new Instance<StandardModelManager>(ix);
		}


		drawAll(rp: render.RenderPass, proj: ProjectionSetup) {
			return;

			var gl = this.rc.gl;

			rp.setDepthTest(render.DepthTest.Less);

			for (var mix = 1; mix <= this.count_; ++mix) {
				// rp.setPipeline(this.pipelines_[mix]);
				rp.setTexture(this.textures_[mix], TextureBindPoint.Colour);
				rp.setMesh(this.meshes_[mix]);

				// -- uniforms
				var program = <StandardGLProgram>null;//this.pipelines_[mix].program;
				var mesh = this.meshes_[mix];

				gl.uniform1f(program.ambientSunFactorUniform, 0.7);

				var modelMatrix = this.transformMgr_.modelMatrix(this.transforms_[mix]);
				mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
				mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);

				if (program.mvpMatrixUniform) {
					gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
				}

				if (program.mvMatrixUniform) {
					gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
				}

				if (program.normalMatrixUniform) {
					math.extractNormalMatrix(this.modelViewMatrix_, this.normalMatrix_);
					gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);
				}

				if (program.lightNormalMatrixUniform) {
					math.extractNormalMatrix(proj.viewMatrix, this.lightNormalMatrix_);
					gl.uniformMatrix3fv(program.lightNormalMatrixUniform, false, this.lightNormalMatrix_);
				}

				// -- draw
				if (mesh.hasIndexBuffer)
					rp.drawIndexedPrimitives(mesh.primitiveGroups[0].fromPrimIx, mesh.primitiveGroups[0].primCount);
				else
					rp.drawPrimitives(mesh.primitiveGroups[0].fromPrimIx, mesh.primitiveGroups[0].primCount);
			}
		}
	}

} // ns.model
