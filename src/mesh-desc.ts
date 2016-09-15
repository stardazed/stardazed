// mesh-desc.ts - render Mesh descriptors
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="meshdata.ts"/>

namespace sd.render {

	export interface VertexBufferBinding {
		vertexBuffer: mesh.VertexBuffer;
		updateFrequency: BufferUpdateFrequency;
		// TODO: add instancing divisor counts for each attrib
	}


	export interface IndexBufferBinding {
		indexBuffer: mesh.IndexBuffer | null;
		updateFrequency: BufferUpdateFrequency;
	}


	export interface MeshDescriptor {
		vertexBindings: VertexBufferBinding[];
		indexBinding: IndexBufferBinding;
		primitiveGroups: mesh.PrimitiveGroup[];

		// -- explicit type used when there is no indexBuffer, ignored otherwise
		primitiveType: mesh.PrimitiveType;
	}


	export function makeMeshDescriptor(data: mesh.MeshData): MeshDescriptor {
		return {
			vertexBindings: data.vertexBuffers.map((vb) => ({
				vertexBuffer: vb,
				updateFrequency: BufferUpdateFrequency.Never
			})),

			indexBinding: {
				indexBuffer: data.indexBuffer,
				updateFrequency: BufferUpdateFrequency.Never
			},

			primitiveGroups: data.primitiveGroups.map((pg) => cloneStruct(pg)),

			// mandatory if no indexBuffer is provided, ignored otherwie
			primitiveType: mesh.PrimitiveType.None
		};
	}

} // ns sd.render
