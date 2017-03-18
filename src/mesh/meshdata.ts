// meshdata/meshdata - mesh data
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	//  __  __        _    ___       _
	// |  \/  |___ __| |_ |   \ __ _| |_ __ _
	// | |\/| / -_|_-< ' \| |) / _` |  _/ _` |
	// |_|  |_\___/__/_||_|___/\__,_|\__\__,_|
	//

	export interface PrimitiveGroup {
		type: meshdata.PrimitiveType;
		fromElement: number;
		elementCount: number;
		materialIx: number; // mesh-local index (starting at 0); representation of Materials is external to MeshData
	}

	const enum BufferAlignment {
		SubBuffer = 8
	}

	export class MeshData {
		vertexBuffers: VertexBuffer[] = [];
		indexBuffer: IndexBuffer | null = null;
		primitiveGroups: PrimitiveGroup[] = [];

		allocateSingleStorage(vertexBufferItemCounts: number[], elementType: IndexElementType, indexCount: number) {
			assert(vertexBufferItemCounts.length === this.vertexBuffers.length, "Did not specify exactly 1 item count per VertexBuffer");

			let totalBytes = 0;
			for (let vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
				totalBytes += this.vertexBuffers[vbix].layout.bytesRequiredForVertexCount(vertexBufferItemCounts[vbix]);
				totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
			}
			if (this.indexBuffer) {
				totalBytes += bytesRequiredForIndexCount(elementType, indexCount);
				totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
			}

			assert(totalBytes > 0, "Nothing to allocate!");

			const storage = new ArrayBuffer(totalBytes);

			let byteOffset = 0;
			for (let vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
				this.vertexBuffers[vbix].suballocate(vertexBufferItemCounts[vbix], storage, byteOffset);
				byteOffset += this.vertexBuffers[vbix].bufferSizeBytes;
				byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
			}
			if (this.indexBuffer) {
				this.indexBuffer.suballocate(elementType, indexCount, storage, byteOffset);
				byteOffset += this.indexBuffer.bufferSizeBytes;
				byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
			}

			assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
		}


		findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | undefined {
			let pa: PositionedAttribute | undefined;
			let avb: VertexBuffer | null = null;

			this.vertexBuffers.forEach((vb) => {
				if (! pa) {
					pa = vb.layout.attrByRole(role);
					if (pa) {
						avb = vb;
					}
				}
			});

			if (pa && avb) {
				return { vertexBuffer: avb, attr: pa };
			}
			return undefined;
		}

		// derived vertex data generation
		genVertexNormals() {
			this.vertexBuffers.forEach((_vertexBuffer) => {
				if (this.indexBuffer) {
					// calcVertexNormals(vertexBuffer, this.indexBuffer);
				}
			});
		}
	}

} // ns sd.meshdata
