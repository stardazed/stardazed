// mesh-desc.ts - render Mesh descriptors
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="meshdata.ts"/>

namespace sd.render {

	export interface VertexBufferBinding {
		vertexBuffer: mesh.VertexBuffer;
		baseAttributeIndex: number;
		updateFrequency: BufferUpdateFrequency;
	}


	export interface IndexBufferBinding {
		indexBuffer: mesh.IndexBuffer;
		updateFrequency: BufferUpdateFrequency;
	}


	export interface MeshDescriptor {
		vertexBindings: VertexBufferBinding[];
		indexBinding: IndexBufferBinding;
		primitiveGroups: mesh.PrimitiveGroup[];
	}


	function makeMeshDescriptor(data: mesh.MeshData): MeshDescriptor {
		var curAttrIndex = 0;

		return {
			vertexBindings: data.vertexBuffers.map((vb) => {
				var attrIndex = curAttrIndex;
				curAttrIndex += vb.attributeCount;

				return {
					vertexBuffer: vb,
					baseAttributeIndex: attrIndex,
					updateFrequency: BufferUpdateFrequency.Never
				};
			}),

			indexBinding: {
				indexBuffer: data.indexBuffer,
				updateFrequency: BufferUpdateFrequency.Never
			},

			primitiveGroups: data.primitiveGroups.map((pg) => cloneStruct(pg))
		};
	}

} // ns sd.render
