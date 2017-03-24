// render/gl1/shader - WebGL1 implementation of pipeline / shader / program
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

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

	// [AL]: a very simple approach to attribute index assignment
	// which is fine for current (non-skinned) shaders

	export interface PositionedAttributeSlot extends ShaderVertexAttribute {
		index: number;
	}

	function attributeIndexForRole(role: ShaderAttributeRole) {
		switch (role) {
			case "position": return 0;
			case "normal": return 1;
			case "tangent": return 4;
			case "colour": return 3;
			case "material": return 5;

			// UV sets
			case "uv0": return 2;
			case "uv1": return 6;
			case "uv2": return 7;
			case "uv3": return 8;

			// skinned mesh (NOT YET SUPPORTED)
			case "weightedPos0": return -1;
			case "weightedPos1": return -1;
			case "weightedPos2": return -1;
			case "weightedPos3": return -1;
			case "jointIndexes": return -1;
		}

		return -1;
	}

	export function positionAttributes(attrs: ShaderVertexAttribute[]): PositionedAttributeSlot[] {
		return attrs.map(a => ({
			...a,
			index: attributeIndexForRole(a.role)
		}));
	}

	// ----

	function gl1MakeShader(rd: GL1RenderDevice, type: number, sourceText: string) {
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

	export function gl1MakeProgram(rd: GL1RenderDevice, desc: Shader) {
		const gl = rd.gl;
		const posAttrs = positionAttributes(desc.vertexIn);

		const vertexShader = gl1MakeShader(rd, gl.VERTEX_SHADER, desc.vertexSource);
		const fragmentShader = gl1MakeShader(rd, gl.FRAGMENT_SHADER, desc.fragmentSource);

		if (! (vertexShader && fragmentShader)) {
			return undefined;
		}

		const program = gl.createProgram()!; // TODO: handle resource allocation failure
		for (const pa of posAttrs) {
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

} // ns sd.render
