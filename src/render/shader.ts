// render/shader - Shader resource
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ShaderValueType {
		Int,
		Int2,
		Int3,
		Int4,
		Float,
		Float2,
		Float3,
		Float4,
		Mat2x2,
		Mat3x3,
		Mat4x4
	}

	export interface TextureSlot {
		name: string;
		type: TextureClass;
	}

	export interface UniformSlot {
		name: string;
		type: ShaderValueType;
		length: number;
	}

	export interface AttributeSlot {
		name: string;
		type: ShaderValueType;
		role: meshdata.VertexAttributeRole;
	}

	export interface Shader extends RenderResourceBase {
		textures: TextureSlot[];
		uniforms: UniformSlot[];
		attributes: AttributeSlot[];

		vertexFunction: string;
		fragmentFunction: string;
	}

} // ns sd.render
