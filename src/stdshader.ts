// stdshader - standard shader program gen and usage
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="numeric.ts" />
/// <reference path="material.ts" />

namespace sd.model {

	const enum Feature {
		// VtxPosition and VtxNormal are required
		//VtxTangent      = 0x0001,
		VtxUV           = 0x0002,
		VtxColor        = 0x0004,
		Specular        = 0x0008, // Implied true if GlossMap
		AlbedoMap       = 0x0010,
		//TranslucencyMap = 0x0020, // \__ Mutually Exclusive
		//GlossMap        = 0x0040, // /
		//NormalMap       = 0x0080, // Requires VtxTangent
		//HeightMap       = 0x0100
	}


	export interface StandardGLProgram extends WebGLProgram {
		vertexPositionAttribute: number;
		vertexNormalAttribute: number;
		vertexUVAttribute?: number;
		vertexColorAttribute?: number;

		mvMatrixUniform?: WebGLUniformLocation;
		mvpMatrixUniform?: WebGLUniformLocation;
		normalMatrixUniform?: WebGLUniformLocation;
		lightNormalMatrixUniform?: WebGLUniformLocation;

		ambientSunFactorUniform?: WebGLUniformLocation;

		textureUniform?: WebGLUniformLocation;
	}


	export class StandardShader {
		constructor(private gl_: WebGLRenderingContext, private materialMgr_: MaterialManager) {
		}

		private makeShader(type: number, sourceText: string) {
			var shader = this.gl_.createShader(type);
			this.gl_.shaderSource(shader, sourceText);
			this.gl_.compileShader(shader);

			if (! this.gl_.getShaderParameter(shader, this.gl_.COMPILE_STATUS)) {
				var errorLog = this.gl_.getShaderInfoLog(shader);
				alert("COMPILE FAILED\n\n" + errorLog);
				console.error("Shader compilation failed:", errorLog);
				console.error("Source", sourceText);
				assert(false, "bad shader");
			}

			return shader;
		}

		programForFeatures(feat: number) {
			var gl = this.gl_;

			var vertexSource = this.vertexShaderSource(feat);
			var fragmentSource = this.fragmentShaderSource(feat);
			var vertexShader = this.makeShader(gl.VERTEX_SHADER, vertexSource);
			var fragmentShader = this.makeShader(gl.FRAGMENT_SHADER, fragmentSource);

			var program = <StandardGLProgram>gl.createProgram();
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			if (! gl.getProgramParameter(program, gl.LINK_STATUS)) {
				var errorLog = gl.getProgramInfoLog(program);
				alert("LINK FAILED\n\n" + errorLog);
				console.error("Program link failed:", errorLog);
				console.error("Vertex Source", vertexSource);
				console.error("Fragment Source", fragmentSource);
				assert(false, "bad program");
			}

			gl.useProgram(program);

			program.vertexPositionAttribute = gl.getAttribLocation(program, "vertexPos_model");
			program.vertexNormalAttribute = gl.getAttribLocation(program, "vertexNormal");
			program.vertexColorAttribute = gl.getAttribLocation(program, "vertexColor");
			program.vertexUVAttribute = gl.getAttribLocation(program, "vertexUV");

			program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
			program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
			program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
			program.lightNormalMatrixUniform = gl.getUniformLocation(program, "lightNormalMatrix");

			program.ambientSunFactorUniform = gl.getUniformLocation(program, "ambientSunFactor");
			program.textureUniform = gl.getUniformLocation(program, "albedoSampler");

			gl.useProgram(null);

			return program;
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
			if_all("attribute vec3 vertexColor;", Feature.VtxColor);

			// Out
			line  ("varying vec3 vertexNormal_intp;");
			if_all("varying vec3 vertexPos_cam_intp;", Feature.Specular);
			if_all("varying vec2 vertexUV_intp;", Feature.VtxUV);
			if_all("varying vec3 vertexColor_intp;", Feature.VtxColor);

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
			if_all("	vertexColor_intp = vertexColor;", Feature.VtxColor);
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
			if_all("varying vec3 vertexColor_intp;", Feature.VtxColor);

			// Uniforms
			line  ("uniform mat3 lightNormalMatrix;");
			line  ("uniform float ambientSunFactor;");
			if_all("uniform sampler2D albedoSampler;", Feature.AlbedoMap);

			// Constants
			line  ("const vec3 sunlightColor = vec3(1, 1, 1);");

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
				line("	vec3 specContrib = sunlightColor * spec;");
			}

			// final color
			if ((feat & (Feature.VtxUV | Feature.AlbedoMap)) == (Feature.VtxUV | Feature.AlbedoMap)) {
				line("	vec3 lightColor = sunlightColor * max(ambientSunFactor, dot(lightVec, normal));");
				line("	vec3 texColor = texture2D(albedoSampler, vertexUV_intp).xyz;");
				line("	vec3 outColor = lightColor * texColor;");
			}
			else if (feat & Feature.VtxColor) {
				line("	vec3 diffColor = (sunlightColor * 0.1) + (vertexColor_intp * 0.9);");
				line("	vec3 outColor = diffColor * (ambientSunFactor + 0.5 * dot(lightVec, normal));");
			}
			else {
				line("	vec3 outColor = vec3(0.0, 1.0, 0.0);");	
			}
			if (feat & Feature.Specular) {
				line("	outColor = outColor + specContrib;");
			}
			line  ("	gl_FragColor = vec4(outColor, 1.0);");

			line  ("}");

			// console.info("------ FRAGMENT");
			// source.forEach((s) => console.info(s));

			return source.join("\n") + "\n";
		}
	}

} // ns.model
