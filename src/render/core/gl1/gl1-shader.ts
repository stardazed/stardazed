// render/core/gl1/shader - WebGL1 implementation of pipeline / shader / program
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

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

	/**
	 * @internal
	 * Provide a mapping of standard shader value types to typenames
	 * used in different contexts in the shader. GL1 for example allows
	 * for ints only as uniforms, not attributes or varyings, additionally
	 * half floats are not present and mapped to normal floats.
	 */
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

	/**
	 * Wrap code blocks in preprocessor conditionals if specified.
	 * It tries to be smart and uses either an #ifdef or an #if depending
	 * on the contents of the if-expression.
	 * @internal
	 * @param items List of code blocks that are optionally conditional
	 */
	function wrapConditionals(items: { code: string; ifExpr: string | undefined; }[]) {
		return items.map(item => 
			(item.ifExpr)
				? ((item.ifExpr.indexOf("defined") > -1)
					? `#if ${item.ifExpr}\n${item.code}#endif\n`
					: `#ifdef ${item.ifExpr}\n${item.code}#endif\n`
				)
				: item.code
		);
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
		return wrapConditionals((structs || []).map(s =>
			({ code: s.code, ifExpr: s.ifExpr })
		)).join("\n");
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

	function generateVertexSource(fn: VertexFunction, defs: ShaderDefine[]) {
		const extensions = generateExtensionBlock(fn.extensions);
		const defines = generateDefinesBlock(defs);
		const attributes = generateValueBlock("attribute", fn.in);
		const varying = generateValueBlock("varying", fn.out);
		const constValues = generateConstValuesBlock(fn.constValues);
		const structs = generateStructsBlock(fn.structs);
		const uniforms = generateConstantsBlock(fn.constants);
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

	function generateFragmentSource(fn: FragmentFunction, defs: ShaderDefine[]) {
		const extensions = generateExtensionBlock(fn.extensions);
		const defines = generateDefinesBlock(defs);
		const varying = generateValueBlock("varying", fn.in);
		const constValues = generateConstValuesBlock(fn.constValues);
		const structs = generateStructsBlock(fn.structs);
		const uniforms = generateConstantsBlock(fn.constants);
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

	/**
	 * Try and create a GL1 shader resource on the RenderDevice. Will output
	 * error information and source with line numbers on failure.
	 * @internal
	 * @param rd The RenderDevice to create the shader in
	 * @param type Either GLConst.VERTEX_SHADER or GLConst.FRAGMENT_SHADER
	 * @param sourceText The full GLSL 1.0 source for this shader
	 */
	function compileFunction(rd: GL1RenderDevice, type: number, sourceText: string) {
		const gl = rd.gl;
		const shader = gl.createShader(type);
		if (! shader) {
			console.warn(`Failed to allocate a shader resource, Error: ${gl.getError()}`);
			return undefined;
		}
		gl.shaderSource(shader, sourceText);
		gl.compileShader(shader);

		if (! gl.getShaderParameter(shader, GLConst.COMPILE_STATUS)) {
			const errorLog = gl.getShaderInfoLog(shader);
			console.error("Shader compilation failed:", errorLog);
			console.info(sourceText.split("\n").map((l, i) => `${i + 1}: ${l}`).join("\n"));
			return undefined;
		}

		return shader;
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
		return container.hashString(slots.map(s => `${s.i}:${s.t}`).join("|"));
	}

	/**
	 * Resolve and allocate a full GPU representation of a Shader. Returns mappings of relevant
	 * shader resources for the render runtime.
	 * @param rd The RenderDevice to create the shader in
	 * @param rawShader A Shader definition containing (unnormalized) functions and a set of defines governing behaviour
	 */
	export function createShader(rd: GL1RenderDevice, rawShader: Shader): GL1ShaderData | undefined {
		const gl = rd.gl;

		// first fully resolve and normalize the vertex and fragment functions
		const resolver = new effect.ModuleResolver<effect.EffectModule>(effect.modules);
		const defines = rawShader.defines.filter(def => def.value !== 0);

		const vertexFn = effect.normalizeFunction(effect.flattenFunction(rawShader.vertexFunction, resolver));
		const fragmentFn = effect.normalizeFunction(effect.flattenFunction(rawShader.fragmentFunction, resolver));
		
		// create GL shaders based on normalized functions and defines 
		const vertexShader = compileFunction(rd, GLConst.VERTEX_SHADER, generateVertexSource(vertexFn, defines));
		const fragmentShader = compileFunction(rd, GLConst.FRAGMENT_SHADER, generateFragmentSource(fragmentFn, defines));
		if (! (vertexShader && fragmentShader)) {
			return undefined;
		}

		// create GL program
		const program = gl.createProgram();
		if (! program) {
			console.warn(`Failed to allocate a program resource, Error: ${gl.getError()}`);			
			return undefined;
		}

		// explicitly bind specified attributes to indexes
		for (const pa of rawShader.vertexFunction.in) {
			gl.bindAttribLocation(program, pa.index, pa.name);
		}
		// generate a hash of the attributes used for mesh VAO linkage (see render/gl1/gl1-render.ts#147)
		(rawShader.vertexFunction as GL1VertexFunction).attrHash = calcVertexAttrHash(rawShader.vertexFunction.in);

		// try and link the GL program
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
		const allConstants = (vertexFn.constants || []).concat(fragmentFn.constants || []);
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
					console.warn(`Shader is missing constant named "${sc.name}", are you using it in code?`, rawShader);
				}
			}
		}

		// enumerate and find samplers
		const combinedSamplers: { [name: string]: GL1SamplerSlot } = {};
		const allSamplers = (vertexFn.samplers || []).concat(fragmentFn.samplers || []);
		for (const sampler of allSamplers) {
			if (! (sampler.name in combinedSamplers)) {
				const uniform = gl.getUniformLocation(program, sampler.name);
				if (! uniform) {
					if (sampler.ifExpr === undefined) {
						console.warn(`Shader is missing constant for sampler "${sampler.name}", are you using it in code?`, rawShader);
					}
					// else assume it was removed by the preprocessor
				}
				else {
					combinedSamplers[sampler.name] = { sampler, uniform };
				}
			}
		}

		// link samplers to desired bind points
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
