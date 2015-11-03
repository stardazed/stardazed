// stdshader - standard shader program gen and usage
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="numeric.ts" />
/// <reference path="material.ts" />

namespace sd.model {

	const enum Dependency {
		None     = 0,
		Normal   = 1,
		UV       = 2,
		Color    = 4,
		Specular = 8,
	}

	interface Parameter {
		name: string;
		type: string;
		dependencies: number;
	}

	interface Snippet {
		dependencies: number;
		text: string[];
	}

	const attributes: Parameter[] = [
		{ name: "vertexPos_model", type: "vec3", dependencies: 0 },
		{ name: "vertexNormal", type: "vec3", dependencies: Dependency.Normal },
		{ name: "vertexUV", type: "vec2", dependencies: Dependency.UV },
		{ name: "vertexColor", type: "vec3", dependencies: Dependency.Color },
	];

	const varyings: Parameter[] = [
		{ name: "vertexPos_cam_intp", type: "vec3", dependencies: Dependency.Specular },
		{ name: "vertexNormal_intp", type: "vec3", dependencies: Dependency.Normal },
		{ name: "vertexUV_intp", type: "vec2", dependencies: Dependency.UV },
		{ name: "vertexColor_intp", type: "vec3", dependencies: Dependency.Color },
	];

	const vertexUniforms: Parameter[] = [
		{ name: "modelViewProjectionMatrix", type: "mat4", dependencies: 0 },
		{ name: "modelViewMatrix", type: "mat4", dependencies: Dependency.Specular }, 
		{ name: "normalMatrix", type: "mat3", dependencies: Dependency.Normal }
	];

	const vertexMain: Snippet[] = [
		{
			dependencies: 0,
			text: ["gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);"]
		},
		{
			dependencies: Dependency.Specular,
			text: ["vertexPos_cam_intp = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;"]
		},
		{
			dependencies: Dependency.Normal,
			text: ["vertexNormal_intp = normalize(normalMatrix * vertexNormal);"]
		},
		{
			dependencies: Dependency.UV,
			text: ["vertexUV_intp = vertexUV;"]
		},
		{
			dependencies: Dependency.Color,
			text: ["vertexColor_intp = vertexColor;"]
		}
	];


	export class StandardShader {
		constructor(private gl_: WebGLRenderingContext, private materialMgr_: MaterialManager) {
		}

		private parameterBlockForDepencies(prefix: string, params: Parameter[], dependencies: number) {
			return params
				.filter((p) => (p.dependencies & dependencies) == p.dependencies)
				.map((p) => prefix + " " + p.type + " " + p.name + ";");
		}

		private snippetBlockForDepencies(prefix: string, snippets: Snippet[], dependencies: number) {
			return snippets
				.filter((s) => (s.dependencies & dependencies) == s.dependencies)
				.map((s) => s.text.map((l) => prefix + l).join("\n"));
		}

		vertexShaderSourceForDependencies(dependencies: number) {
			var source: string[] = [];

			source = source.concat(this.parameterBlockForDepencies("attribute", attributes, dependencies));
			source = source.concat(this.parameterBlockForDepencies("uniform", vertexUniforms, dependencies));
			source = source.concat(this.parameterBlockForDepencies("varying", varyings, dependencies));
			source.push("void main() {");
			source = source.concat(this.snippetBlockForDepencies("\t", vertexMain, dependencies));
			source.push("}", "");

			return source.join("\n");
		}
	}

} // ns.model

/*
// -- uniform data

uniform mat3 lightNormalMatrix;
uniform vec3 lightDirection;


// -- Materials 

struct Material {
	vec4 mainColour;         // rgb: colour, a: 1
	vec4 specularColour;     // rgb: colour, a: exp
	vec4 textureScaleOffset; // xy: scale, zw: offset
};

uniform sampler2D albedoSampler;
uniform sampler2D normalSampler;


// -- varyings

varying vec3 vertexPos_cam_intp;
varying vec3 vertexNormal_intp;
varying vec2 vertexDiffuseUV_intp;


void main() {
	//	vec4 albedoTexel = texture(albedoSampler, vertexDiffuseUV_intp);
	//	if (albedoTexel.a == 0) discard;
	vec3 lightVec = normalize(lightNormalMatrix * lightDirection);

	// renormalize interpolated normal
	vec3 normal = normalize(vertexNormal_intp);
	
	// specular
	vec3 viewVec = normalize(-vertexPos_cam_intp);
	vec3 reflectVec = reflect(-lightVec, normal);

	float spec = max(dot(reflectVec, viewVec), 0.0);
	spec = pow(spec, mat.specularColour.w); // shininess

	// light component contribitions
	vec3 specContrib = mat.specularColour.xyz * spec;
	vec3 diffContrib = mat.mainColour.xyz * max(0.05, dot(lightVec, normal));// * albedoTexel.xyz;
	vec3 lightContribution = diffContrib + specContrib;

	gl_FragColor = vec4(lightContribution, 1.0);
}
*/