// meshdata/meshdata - mesh data
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	//   ___ _ _         _   ___       __  __
	//  / __| (_)___ _ _| |_| _ )_  _ / _|/ _|___ _ _
	// | (__| | / -_) ' \  _| _ \ || |  _|  _/ -_) '_|
	//  \___|_|_\___|_||_\__|___/\_,_|_| |_| \___|_|
	//

	export interface ClientBuffer {
		readonly bufferSizeBytes: number;
		readonly bufferLocalOffsetBytes: number;
		readonly buffer: ArrayBuffer | null;
		bufferView(): ArrayBufferView | null;
	}


	// --- TriangleProxy and TriangleView

	export interface Triangle {
		readonly [index: number]: number;
	}

	export interface MutableTriangle {
		[index: number]: number;
	}

	export interface TriangleProxy {
		index(index: 0 | 1 | 2): number;
		a(): number;
		b(): number;
		c(): number;
	}

	export interface MutableTriangleProxy extends TriangleProxy {
		setIndex(index: 0 | 1 | 2, newValue: number): void;
		setA(newValue: number): void;
		setB(newValue: number): void;
		setC(newValue: number): void;
	}

	export interface TriangleView {
		readonly count: number;
		readonly mutable: boolean;

		forEach(callback: (proxy: TriangleProxy) => void): void;
		forEachMutable?(callback: (proxy: MutableTriangleProxy) => void): void;

		refItem(triangleIndex: number): Triangle;
		refItemMutable?(triangleIndex: number): MutableTriangle;

		subView(fromTriangle: number, triangleCount: number): TriangleView;
	}


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


		findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | null {
			let pa: PositionedAttribute | null = null;
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
	}

} // ns sd.meshdata
