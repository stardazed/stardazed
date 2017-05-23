// render/gl1/shader - WebGL1 implementation of pipeline / shader / program
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	export interface ExtensionUsage {
		name: string;
		action: "enable" | "require";
	}

	export interface ShaderDefine {
		name: string;
		value?: string;
	}

	export interface ShaderConstValue {
		name: string;
		type: ShaderValueType;
		expr: string;
	}

	export interface GL1VertexFunction extends VertexFunction {
		extensions?: ExtensionUsage[];
		defines?: ShaderDefine[];
		constValues?: ShaderConstValue[];
		structs?: string[];
		code?: string;
		main: string;
	}

	export interface GL1FragmentFunction extends FragmentFunction {
		extensions?: ExtensionUsage[];
		defines?: ShaderDefine[];
		constValues?: ShaderConstValue[];
		structs?: string[];
		code?: string;
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

	function generateDefinesBlock(defines: ShaderDefine[] | undefined) {
		return (defines || []).map(def => {
			return `#define ${def.name} ${def.value || ""}\n`;
		}).join("");
	}

	function generateConstValuesBlock(constVals: ShaderConstValue[] | undefined) {
		return (constVals || []).map(cv => {
			const mappedValueType = valueTypeMap.uniform[cv.type];
			return `const ${mappedValueType} ${cv.name} = ${cv.expr};\n`;
		}).join("");
	}

	function generateStructsBlock(structs: string[] | undefined) {
		return (structs || []).join("\n");
	}

	function generateValueBlock(keyword: string, vals: ShaderConstant[] | undefined) {
		return (vals || []).map(val => {
			const arrayPostfix = (val.length! > 0) ? `[${val.length}]` : "";
			const mappedValueType = valueTypeMap[keyword][val.type];
			return `${keyword} ${mappedValueType} ${val.name}${arrayPostfix};\n`;
		}).join("");
	}

	function generateConstantsBlock(blocks: ShaderConstantBlock[] | undefined) {
		return (blocks || []).map(block => generateValueBlock("uniform", block.constants)).join("");
	}

	function generateSamplerBlock(samplers: SamplerSlot[] | undefined) {
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
		const defines = generateDefinesBlock(fn.defines);
		const attributes = generateValueBlock("attribute", fn.in);
		const varying = generateValueBlock("varying", fn.out);
		const constValues = generateConstValuesBlock(fn.constValues);
		const structs = generateStructsBlock(fn.structs);
		const uniforms = generateConstantsBlock(fn.constantBlocks);
		const samplers = generateSamplerBlock(fn.samplers);
		
		return `${extensions}${defines}
		${attributes}${varying}
		${constValues}${structs}
		${uniforms}${samplers}
		${fn.code || ""}
		void main() {
			${fn.main}
		}`;
	}

	function generateFragmentSource(fn: GL1FragmentFunction) {
		const extensions = generateExtensionBlock(fn.extensions);
		const defines = generateDefinesBlock(fn.defines);
		const varying = generateValueBlock("varying", fn.in);
		const constValues = generateConstValuesBlock(fn.constValues);
		const structs = generateStructsBlock(fn.structs);
		const uniforms = generateConstantsBlock(fn.constantBlocks);
		const samplers = generateSamplerBlock(fn.samplers);
		
		return `${extensions}${defines}
		precision highp float;
		${varying}
		${constValues}${structs}
		${uniforms}${samplers}
		${fn.code || ""}
		void main() {
			${fn.main}
		}`;
	}

	function compileFunction(rd: GL1RenderDevice, type: number, sourceText: string) {
		const gl = rd.gl;
		const shader = gl.createShader(type)!; // TODO: handle resource allocation failure
		gl.shaderSource(shader, sourceText);
		gl.compileShader(shader);

		if (! gl.getShaderParameter(shader, GLConst.COMPILE_STATUS)) {
			const errorLog = gl.getShaderInfoLog(shader);
			console.error("Shader compilation failed:", errorLog);
			console.error("Source", sourceText.split("\n").map((l, i) => `${i + 1}: ${l}`).join("\n"));
			return undefined;
		}

		return shader;
	}

	// ----

	export function createProgram(rd: GL1RenderDevice, shader: Shader) {
		const gl = rd.gl;

		const vertexShader = compileFunction(rd, GLConst.VERTEX_SHADER, generateVertexSource(shader.vertexFunction as GL1VertexFunction));
		const fragmentShader = compileFunction(rd, GLConst.FRAGMENT_SHADER, generateFragmentSource(shader.fragmentFunction as GL1FragmentFunction));

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

		if (! gl.getProgramParameter(program, GLConst.LINK_STATUS)) {
			const errorLog = gl.getProgramInfoLog(program);
			console.error("Program link failed:", errorLog);
			return undefined;
		}

		return program;
	}

} // ns sd.render.gl1
