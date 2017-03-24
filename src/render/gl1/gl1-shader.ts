// render/gl1/shader - WebGL1 implementation of pipeline / shader / program
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	export interface ExtensionUsage {
		name: string;
		action: "enable" | "require";
	}

	export interface GL1VertexFunction extends VertexFunction {
		extensions?: ExtensionUsage[];
		main: string;
	}

	export interface GL1FragmentFunction extends FragmentFunction {
		extensions?: ExtensionUsage[];
		main: string;
	}

	const valueTypeMap: { [k: string]: { [t: string]: string } } = {
		attribute: {
			int: "float",
			int2: "vec2",
			int3: "vec3",
			int4: "vec4",
			float: "float",
			float2: "vec2",
			float3: "vec3",
			float4: "vec4",
			mat2: "mat2",
			mat3: "mat3",
			mat4: "mat4"
		},
		varying: {
			int: "float",
			int2: "vec2",
			int3: "vec3",
			int4: "vec4",
			float: "float",
			float2: "vec2",
			float3: "vec3",
			float4: "vec4",
			mat2: "mat2",
			mat3: "mat3",
			mat4: "mat4"
		},
		uniform: {
			int: "int",
			int2: "ivec2",
			int3: "ivec3",
			int4: "ivec4",
			float: "float",
			float2: "vec2",
			float3: "vec3",
			float4: "vec4",
			mat2: "mat2",
			mat3: "mat3",
			mat4: "mat4"
		}
	};

	function generateValueBlock(keyword: string, vals: ShaderConstant[] | undefined) {
		return (vals || []).map(val => {
			const arrayPostfix = (val.length! > 0) ? `[${val.length}]` : "";
			const mappedValueType = valueTypeMap[keyword][val.type];
			return `${keyword} ${mappedValueType} ${val.name}${arrayPostfix};\n`;
		}).join("");
	}

	function generateSamplerBlock(samplers: TextureSlot[] | undefined) {
		return (samplers || []).map(tex => {
			const mappedTextureType = (tex.type === TextureClass.Normal) ? "sampler2D" : "samplerCube";
			return `uniform ${mappedTextureType} ${tex.name};\n`;
		}).join("");
	}

	function generateExtensionBlock(exts: ExtensionUsage[] | undefined) {
		return (exts || []).map(ext =>
			`#extension ${ext.name} : ${ext.action}\n`
		).join("");
	}

	function generateVertexSource(fn: GL1VertexFunction) {
		const extensions = generateExtensionBlock(fn.extensions);
		const attributes = generateValueBlock("attribute", fn.in);
		const varying = generateValueBlock("varying", fn.out);
		const uniforms = generateValueBlock("uniform", fn.constants);
		const samplers = generateSamplerBlock(fn.textures);
		
		return `${extensions}${attributes}${varying}${uniforms}${samplers}
		void main() {
			${fn.main}
		}`;
	}

	function generateFragmentSource(fn: GL1FragmentFunction) {
		const extensions = generateExtensionBlock(fn.extensions);
		const varying = generateValueBlock("varying", fn.in);
		const uniforms = generateValueBlock("uniform", fn.constants);
		const samplers = generateSamplerBlock(fn.textures);
		
		return `${extensions}
		precision highp float;
		${varying}${uniforms}${samplers}
		void main() {
			${fn.main}
		}`;
	}

	function compileFunction(rd: GL1RenderDevice, type: number, sourceText: string) {
		const gl = rd.gl;
		const shader = gl.createShader(type)!; // TODO: handle resource allocation failure
		gl.shaderSource(shader, sourceText);
		gl.compileShader(shader);

		if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const errorLog = gl.getShaderInfoLog(shader);
			console.error("Shader compilation failed:", errorLog);
			console.error("Source", sourceText);
			return undefined;
		}

		return shader;
	}

	// ----

	export function makeProgram(rd: GL1RenderDevice, shader: Shader) {
		const gl = rd.gl;

		const vertexShader = compileFunction(rd, gl.VERTEX_SHADER, generateVertexSource(shader.vertexFunction as GL1VertexFunction));
		const fragmentShader = compileFunction(rd, gl.FRAGMENT_SHADER, generateFragmentSource(shader.fragmentFunction as GL1FragmentFunction));

		if (! (vertexShader && fragmentShader)) {
			return undefined;
		}

		const program = gl.createProgram()!; // TODO: handle resource allocation failure
		for (const pa of shader.vertexFunction.in) {
			gl.bindAttribLocation(program, pa.index, pa.name);
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (! gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const errorLog = gl.getProgramInfoLog(program);
			console.error("Pipeline link failed:", errorLog);
			return undefined;
		}

		return program;
	}

} // ns sd.render.gl1
