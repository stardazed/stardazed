// render/core/gl1/shader - WebGL1 implementation of pipeline / shader / program
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	type GL1ModuleResolver = shader.ModuleResolver<shader.GL1Module>;

	export interface GL1VertexFunction extends VertexFunction {
		attrHash?: number;
	}

	export interface GL1ShaderConstant {
		type: ShaderValueType;
		uniform: WebGLUniformLocation;
	}

	export interface GL1ShaderData {
		program: WebGLProgram;
		combinedConstants: { readonly [name: string]: Readonly<GL1ShaderConstant> };
	}

	interface GL1SamplerSlot {
		sampler: SamplerSlot;
		uniform: WebGLUniformLocation;
	}

	const valueTypeMap = {
		attribute: makeLUT<ShaderValueType, string>(
			ShaderValueType.Int, "float",
			ShaderValueType.Int2, "vec2",
			ShaderValueType.Int3, "vec3",
			ShaderValueType.Int4, "vec4",
			ShaderValueType.Half, "float",
			ShaderValueType.Half2, "vec2",
			ShaderValueType.Half3, "vec3",
			ShaderValueType.Half4, "vec4",
			ShaderValueType.Float, "float",
			ShaderValueType.Float2, "vec2",
			ShaderValueType.Float3, "vec3",
			ShaderValueType.Float4, "vec4",
			ShaderValueType.Float2x2, "mat2",
			ShaderValueType.Float3x3, "mat3",
			ShaderValueType.Float4x4, "mat4"
		),
		varying: makeLUT<ShaderValueType, string>(
			ShaderValueType.Int, "float",
			ShaderValueType.Int2, "vec2",
			ShaderValueType.Int3, "vec3",
			ShaderValueType.Int4, "vec4",
			ShaderValueType.Half, "float",
			ShaderValueType.Half2, "vec2",
			ShaderValueType.Half3, "vec3",
			ShaderValueType.Half4, "vec4",
			ShaderValueType.Float, "float",
			ShaderValueType.Float2, "vec2",
			ShaderValueType.Float3, "vec3",
			ShaderValueType.Float4, "vec4",
			ShaderValueType.Float2x2, "mat2",
			ShaderValueType.Float3x3, "mat3",
			ShaderValueType.Float4x4, "mat4"
		),
		uniform: makeLUT<ShaderValueType, string>(
			ShaderValueType.Int, "int",
			ShaderValueType.Int2, "ivec2",
			ShaderValueType.Int3, "ivec3",
			ShaderValueType.Int4, "ivec4",
			ShaderValueType.Half, "float",
			ShaderValueType.Half2, "vec2",
			ShaderValueType.Half3, "vec3",
			ShaderValueType.Half4, "vec4",
			ShaderValueType.Float, "float",
			ShaderValueType.Float2, "vec2",
			ShaderValueType.Float3, "vec3",
			ShaderValueType.Float4, "vec4",
			ShaderValueType.Float2x2, "mat2",
			ShaderValueType.Float3x3, "mat3",
			ShaderValueType.Float4x4, "mat4"
		)
	};

	// ----

	function wrapConditionals(items: { code: string; ifExpr: string | undefined; }[]) {
		return items.map(item => (
			(item.ifExpr) ? `#if ${item.ifExpr}\n${item.code}\n#endif` : item.code
		));
	}

	function generateDefinesBlock(defines: Conditional<ShaderDefine>[] | undefined) {
		return wrapConditionals((defines || []).map(def => ({
			code: `#define ${def.name} ${def.value || ""}\n`,
			ifExpr: def.ifExpr
		}))).join("");
	}

	function generateConstValuesBlock(constVals: Conditional<ShaderConstValue>[] | undefined) {
		return wrapConditionals((constVals || []).map(cv => {
			const mappedValueType = valueTypeMap.uniform[cv.type];
			return { code: `const ${mappedValueType} ${cv.name} = ${cv.expr};\n`, ifExpr: cv.ifExpr };
		})).join("");
	}

	function generateStructsBlock(structs: Conditional<ShaderStruct>[] | undefined) {
		return wrapConditionals((structs || []).map(s => ({ code: s.code, ifExpr: s.ifExpr }))).join("\n");
	}

	function generateValueBlock(keyword: "attribute" | "varying" | "uniform", vals: Conditional<ShaderConstant>[] | undefined) {
		return wrapConditionals((vals || []).map(val => {
			const arrayPostfix = (val.length! > 0) ? `[${val.length}]` : "";
			const mappedValueType = valueTypeMap[keyword][val.type];
			return { code: `${keyword} ${mappedValueType} ${val.name}${arrayPostfix};\n`, ifExpr: val.ifExpr };
		})).join("");
	}

	function generateConstantsBlock(constants: Conditional<ShaderConstant>[] | undefined) {
		return generateValueBlock("uniform", constants);
	}

	function generateSamplerBlock(samplers: Conditional<SamplerSlot>[] | undefined) {
		return wrapConditionals((samplers || []).map(tex => {
			const mappedTextureType = (tex.type === TextureClass.Plain) ? "sampler2D" : "samplerCube";
			return { code: `uniform ${mappedTextureType} ${tex.name};\n`, ifExpr: tex.ifExpr };
		})).join("");
	}

	function generateExtensionBlock(exts: Conditional<ExtensionUsage>[] | undefined) {
		return wrapConditionals((exts || []).map(ext => ({
			code: `#extension ${ext.name} : ${ext.action}\n`,
			// by default, wrap `enable` actions in an ifdef with the
			//  extension name to avoid GLSL compile-time warnings.
			ifExpr: ext.ifExpr || (ext.action === "enable" ? ext.name : undefined)
		}))).join("");
	}

	function generateVertexSource(fn: VertexFunction, resolver: GL1ModuleResolver, defs: ShaderDefine[]) {
		// use flattenedFn for all except attributes & main
		const normalizedFn = shader.normalizeFunction(shader.flattenFunction(fn, resolver));
		
		const extensions = generateExtensionBlock(normalizedFn.extensions);
		const defines = generateDefinesBlock(defs);
		const attributes = generateValueBlock("attribute", fn.in);
		const varying = generateValueBlock("varying", fn.out);
		const constValues = generateConstValuesBlock(normalizedFn.constValues);
		const structs = generateStructsBlock(normalizedFn.structs);
		const uniforms = generateConstantsBlock(normalizedFn.constants);
		const samplers = generateSamplerBlock(normalizedFn.samplers);
		
		return `${extensions}${defines}
		${attributes}${varying}
		${constValues}${structs}
		${uniforms}${samplers}
		${fn.code || ""}
		void main() {
			${fn.main}
		}`;
	}

	function generateFragmentSource(fn: FragmentFunction, resolver: GL1ModuleResolver, defs: ShaderDefine[]) {
		const normalizedFn = shader.normalizeFunction(shader.flattenFunction(fn, resolver));

		const extensions = generateExtensionBlock(normalizedFn.extensions);
		const defines = generateDefinesBlock(defs);
		const varying = generateValueBlock("varying", fn.in);
		const constValues = generateConstValuesBlock(normalizedFn.constValues);
		const structs = generateStructsBlock(normalizedFn.structs);
		const uniforms = generateConstantsBlock(normalizedFn.constants);
		const samplers = generateSamplerBlock(normalizedFn.samplers);
		
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

	function hashString(s: string) {
		if (s.length === 0) {
			return 0;
		}

		let hash = 0, chr: number;
		for (let i = 0; i < s.length; ++i) {
			chr = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	}

	/**
	 * Calculate a numerical hash of a shader's input signature.
	 * This is used inside the render loop to quickly associate a shader
	 * with a potential VAO of a mesh.
	 * @param attrs The in attributes of a vertex function
	 */
	function calcVertexAttrHash(attrs: ShaderVertexAttribute[]) {
		const slots = attrs.map(a => ({ i: a.index, t: a.type }));
		slots.sort((a, b) => a.i - b.i); // sort indexes numerically ascending
		return hashString(slots.map(s => `${s.i}:${s.t}`).join("|"));
	}

	// ----

	export function createShader(rd: GL1RenderDevice, shader: Shader): GL1ShaderData | undefined {
		const gl = rd.gl;
		const resolver = new render.shader.ModuleResolver<render.shader.GL1Module>(render.shader.gl1Modules);

		const vertexShader = compileFunction(rd, GLConst.VERTEX_SHADER, generateVertexSource(shader.vertexFunction, resolver, shader.defines));
		const fragmentShader = compileFunction(rd, GLConst.FRAGMENT_SHADER, generateFragmentSource(shader.fragmentFunction, resolver, shader.defines));

		if (! (vertexShader && fragmentShader)) {
			return undefined;
		}

		const program = gl.createProgram()!; // TODO: handle resource allocation failure
		for (const pa of shader.vertexFunction.in) {
			gl.bindAttribLocation(program, pa.index, pa.name);
		}
		(shader.vertexFunction as GL1VertexFunction).attrHash = calcVertexAttrHash(shader.vertexFunction.in);

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (! gl.getProgramParameter(program, GLConst.LINK_STATUS)) {
			const errorLog = gl.getProgramInfoLog(program);
			console.error("Program link failed:", errorLog);
			return undefined;
		}

		// program link successful, enumerate and find uniforms
		rd.state.setProgram(program);

		const combinedConstants: { [name: string]: GL1ShaderConstant } = {};
		const allConstants = (shader.vertexFunction.constants || []).concat(shader.fragmentFunction.constants || []);
		for (const sc of allConstants) {
			if (! (sc.name in combinedConstants)) {
				const uniform = gl.getUniformLocation(program, sc.name);
				if (uniform) {
					combinedConstants[sc.name] = {
						type: sc.type,
						uniform
					};
				}
				else {
					console.error(`Shader is missing constant named ${sc.name}`, shader);
				}
			}
		}

		// link samplers to desired bind points
		const combinedSamplers: { [name: string]: GL1SamplerSlot } = {};
		const allSamplers = (shader.vertexFunction.samplers || []).concat(shader.fragmentFunction.samplers || []);
		for (const sampler of allSamplers) {
			if (sampler.name in combinedSamplers) {
				const existing = combinedSamplers[sampler.name];
				if (sampler.index !== existing.sampler.index || sampler.type !== existing.sampler.type) {
					console.error(`Shader has ambigious binding for sampler ${sampler.name}`, shader);
				}
			}
			else {
				const uniform = gl.getUniformLocation(program, sampler.name);
				if (! uniform) {
					console.warn(`Shader has missing uniform for sampler ${sampler.name}, may have been optimized out.`, shader);
				}
				else {
					combinedSamplers[sampler.name] = { sampler, uniform };
				}
			}
		}

		for (const sampName in combinedSamplers) {
			if (combinedSamplers.hasOwnProperty(sampName)) {
				const samp = combinedSamplers[sampName];
				gl.uniform1i(samp.uniform, samp.sampler.index);
			}
		}

		return {
			combinedConstants,
			program,
		};
	}

} // ns sd.render.gl1
