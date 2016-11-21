// mesh/meshdata.ts - convenience type to group a full mesh
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { alignUp } from "math/util";
import { PrimitiveGroup, VertexAttributeRole } from "mesh/types";
import { PositionedAttribute } from "mesh/layout";
import { VertexBuffer } from "mesh/vertexbuffer";
import { IndexBuffer, IndexElementType, bytesRequiredForIndexCount } from "mesh/indexbuffer";
import { calcVertexNormals } from "mesh/deriveddata";

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
			totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
		}
		if (this.indexBuffer) {
			totalBytes += bytesRequiredForIndexCount(elementType, indexCount);
			totalBytes = alignUp(totalBytes, BufferAlignment.SubBuffer);
		}

		assert(totalBytes > 0, "Nothing to allocate!");

		const storage = new ArrayBuffer(totalBytes);

		let byteOffset = 0;
		for (let vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
			this.vertexBuffers[vbix].suballocate(vertexBufferItemCounts[vbix], storage, byteOffset);
			byteOffset += this.vertexBuffers[vbix].bufferSizeBytes;
			byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
		}
		if (this.indexBuffer) {
			this.indexBuffer.suballocate(elementType, indexCount, storage, byteOffset);
			byteOffset += this.indexBuffer.bufferSizeBytes;
			byteOffset = alignUp(byteOffset, BufferAlignment.SubBuffer);
		}

		assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
	}


	findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | null {
		let pa: PositionedAttribute | null = null;
		let avb: VertexBuffer | null = null;

		this.vertexBuffers.forEach((vb) => {
			if (! pa) {
				pa = vb.attrByRole(role);
				if (pa) {
					avb = vb;
				}
			}
		});

		if (pa && avb) {
			return { vertexBuffer: avb, attr: pa };
		}
		return null;
	}

	// derived vertex data generation
	genVertexNormals() {
		this.vertexBuffers.forEach((vertexBuffer) => {
			if (this.indexBuffer) {
				calcVertexNormals(vertexBuffer, this.indexBuffer);
			}
		});
	}

	// void genVertexTangents();
}
