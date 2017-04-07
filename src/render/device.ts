// render/device - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ResourceType {
		Texture = 1,
		Sampler,
		// RenderTarget,
		VertexLayout,
		VertexStream,
		IndexStream,
		// ConstantBuffer,
		Shader
	}

	export interface RenderResourceBase {
		readonly renderResourceType: ResourceType;
		renderResourceHandle: number;
	}

	export type RenderResource = Texture | Sampler | Shader | meshdata.VertexLayout | meshdata.VertexBuffer | meshdata.IndexBuffer;


	export class RenderResourceCommandBuffer {
		private readonly allocList_: RenderResource[] = [];
		private readonly freeList_: RenderResource[] = [];

		alloc(resource: RenderResource) {
			this.allocList_.push(resource);
		}

		free(resource: RenderResource) {
			this.freeList_.push(resource);
		}

		get allocList() { return this.allocList_; }
		get freeList() { return this.freeList_; }
	}

	export interface RenderMaterial {
		shader: Shader;
		constants: any;
	}

	export interface RenderWorld {
		localMats: any[];
		worldMats: any[];
		meshes: any[];
		materials: RenderMaterial[];
		shadowing: any[];
		reflection: any[];
	}

	export interface RenderDevice {
		readonly supportsArrayTextures: boolean;
		readonly supportsDepthTextures: boolean;

		readonly maxColourAttachments: number;

		dispatchResource(rrcb: RenderResourceCommandBuffer | RenderResourceCommandBuffer[]): void;
		dispatch(rcb: RenderCommandBuffer | RenderCommandBuffer[]): void;

		generateStandardShader(options: StandardShaderOptions): Shader;

		// -- temp
		render(proj: Float4x4, view: Float4x4, mesh: meshdata.MeshData, shader: Shader): void;
	}

} // ns sd.render
