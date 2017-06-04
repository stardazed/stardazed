// render/gl1/shaders/standardshader - WebGL1 implementation of the standard shader
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	/*

	import AttrRole = meshdata.VertexAttributeRole;
	import SVT = ShaderValueType;

	function standardVertexFunction(): GL1VertexFunction {
		return {
			in: [
				{ name: "vertexPos_model", type: SVT.Float3, role: AttrRole.Position, index: 0 },
				{ name: "vertexNormal", type: SVT.Float3, role: AttrRole.Normal, index: 1 },
			],
			out: [
				// { name: "vertexPos_world", type: SVT.Float4 },
				// { name: "vertexPos_cam", type: SVT.Float3 },
				{ name: "vertexNormal_cam", type: SVT.Float3 },
			],

			constantBlocks: [
				{
					name: "default",
					constants: [
						// { name: "modelMatrix", type: SVT.Float4x4 },
						// { name: "modelViewMatrix", type: SVT.Float4x4 },
						{ name: "modelViewProjectionMatrix", type: SVT.Float4x4 },
						// { name: "normalMatrix", type: SVT.Float3x3 },
					]
				}
			],

			main: `
				vertexNormal_cam = vertexNormal;
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
				// { name: "vertexPos_world", type: SVT.Float4 },
				// { name: "vertexPos_cam", type: SVT.Float3 },
				{ name: "vertexNormal_cam", type: SVT.Float3 },
			],
			outCount: 1,

			constantBlocks: [
				// { name: "mainColour", type: "float4" }
			],

			main: `
				gl_FragColor = vec4((vertexNormal_cam / 2.0) + 0.5, 1.0);
			`
		};
	}

	export function makeStandardShader(): Shader {
		const vertexFunction = standardVertexFunction();
		const fragmentFunction = standardFragmentFunction();

		return {
			renderResourceType: ResourceType.Shader,
			renderResourceHandle: 0,

			vertexFunction,
			fragmentFunction
		};	
	}

	*/

} // ns sd.render.gl1
