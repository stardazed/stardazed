// render/gl1/shaders/standardshader - WebGL1 implementation of the standard shader
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	function standardVertexFunction(): GL1VertexFunction {
		return {
			in: [
				{ name: "vertexPos_model", type: "float3", role: "position", index: 0 },
				{ name: "vertexNormal", type: "float3", role: "normal", index: 1 },
			],
			out: [
				// { name: "vertexPos_world", type: "float4" },
				// { name: "vertexPos_cam", type: "float3" },
				// { name: "vertexNormal_cam", type: "float3" },
			],

			constants: [
				// { name: "modelMatrix", type: "mat4" },
				// { name: "modelViewMatrix", type: "mat4" },
				{ name: "modelViewProjectionMatrix", type: "mat4" },
				// { name: "normalMatrix", type: "mat3" },
			],

			main: `
				gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);
				// vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);
				// vertexNormal_cam = normalMatrix * vertexNormal;
				// vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;
			`
		};
	}

	function standardFragmentFunction(): GL1FragmentFunction {
		return {
			in: [
				// { name: "vertexPos_world", type: "float4" },
				// { name: "vertexPos_cam", type: "float3" },
				// { name: "vertexNormal_cam", type: "float3" },
			],
			outCount: 1,

			constants: [
				// { name: "mainColour", type: "float4" }
			],

			main: `
				gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
			`
		};
	}

	export function makeStandardShader(_options: StandardShaderOptions): Shader {
		const vertexFunction = standardVertexFunction();
		const fragmentFunction = standardFragmentFunction();

		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,

			vertexFunction,
			fragmentFunction
		};	
	}

} // ns sd.render.gl1
