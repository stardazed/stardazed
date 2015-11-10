// stdmodel - standard model component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="numeric.ts" />
/// <reference path="material.ts" />
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
		textureUniform?: WebGLUniformLocation;
	}


	//  ___ _                _             _ ___ _           _ _          
	// / __| |_ __ _ _ _  __| |__ _ _ _ __| | _ (_)_ __  ___| (_)_ _  ___ 
	// \__ \  _/ _` | ' \/ _` / _` | '_/ _` |  _/ | '_ \/ -_) | | ' \/ -_)
	// |___/\__\__,_|_||_\__,_\__,_|_| \__,_|_| |_| .__/\___|_|_|_||_\___|
	//                                            |_|                     

	class StandardPipeline {
		constructor(private rc: render.RenderContext) {
		}


		pipelineForFeatures(feat: number) {
			var gl = this.rc.gl;

			var vertexSource = this.vertexShaderSource(feat);
			var fragmentSource = this.fragmentShaderSource(feat);

			var pld = render.makePipelineDescriptor();
			pld.colourPixelFormats[0] = render.PixelFormat.RGBA8;
			pld.vertexShader = render.makeShader(this.rc, gl.VERTEX_SHADER, vertexSource);
			pld.fragmentShader = render.makeShader(this.rc, gl.FRAGMENT_SHADER, fragmentSource);

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

			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			program.ambientSunFactorUniform = gl.getUniformLocation(program, "ambientSunFactor");
			program.textureUniform = gl.getUniformLocation(program, "albedoSampler");

			gl.useProgram(null);

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
			line  ("	gl_FragColour = vec4(outColour, 1.0);");

			line  ("}");

			// console.info("------ FRAGMENT");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}
	}


	//  ___ _                _             _ __  __         _     _ __  __                             
	// / __| |_ __ _ _ _  __| |__ _ _ _ __| |  \/  |___  __| |___| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// \__ \  _/ _` | ' \/ _` / _` | '_/ _` | |\/| / _ \/ _` / -_) | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |___/\__\__,_|_||_\__,_\__,_|_| \__,_|_|  |_\___/\__,_\___|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                                   |___/         

	export class StandardModelManager {
		constructor(private rc: render.RenderContext, private transformMgr_: TransformManager) {
		}


		create() {
		}
	}

} // ns.model
