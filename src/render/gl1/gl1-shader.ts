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

	function makeShader(rd: GL1RenderDevice, type: number, sourceText: string) {
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

		const vertexShader = makeShader(rd, gl.VERTEX_SHADER, shader.vertexSource);
		const fragmentShader = makeShader(rd, gl.FRAGMENT_SHADER, shader.fragmentSource);

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
