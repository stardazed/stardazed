// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("meshdata", () => {
	group("VertexBuffer", () => {
		test("construct-throws-on-invalid-count-or-stride", () => {
			const { VertexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(16);
			check.throws(Error, () => new VertexBuffer(0, 4));
			check.throws(Error, () => new VertexBuffer(4, 0));
			check.throws(Error, () => new VertexBuffer(-1, 4));
			check.throws(Error, () => new VertexBuffer(4, -1));
			check.throws(Error, () => new VertexBuffer(0, 4, storage));
			check.throws(Error, () => new VertexBuffer(4, 0, storage));
			check.throws(Error, () => new VertexBuffer(-1, 4, storage));
			check.throws(Error, () => new VertexBuffer(4, -1, storage));
		});

		test("provided-vertexCount-and-stride-stick", () => {
			const { VertexBuffer } = sd.geometry;
			const vb = new VertexBuffer(1, 12);
			check.equal(vb.vertexCount, 1);
			check.equal(vb.stride, 12);

			const vb2 = new VertexBuffer(1025, 100);
			check.equal(vb2.vertexCount, 1025);
			check.equal(vb2.stride, 100);
		});

		test("construct-without-storage-creates-one-of-fitting-size", () => {
			const { VertexBuffer } = sd.geometry;
			const vb = new VertexBuffer(128, 12);
			check.present(vb.storage);
			check.equal(vb.storage.byteLength, 128 * 12);
		});

		test("construct-without-storage-creates-zeroed-buffer", () => {
			const { VertexBuffer } = sd.geometry;
			const vb = new VertexBuffer(128, 12);
			for (let a = 0; a < 128 * 12; ++a) {
				check.equal(vb.storage[a], 0, `byte at offset ${a}`);
			}			
		});

		test("construct-with-storage-adopts-it", () => {
			const { VertexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(128 * 12);
			const vb = new VertexBuffer(128, 12, storage);
			check.equal(vb.storage, storage);
		});

		test("construct-with-storage-throws-if-too-small", () => {
			const { VertexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(16 * 12);
			check.throws(Error, () => {
				// tslint:disable-next-line:no-unused-new
				new VertexBuffer(128, 12, storage);
			});			
		});

		test("construct-with-storage-does-not-change-data", () => {
			const { VertexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(128 * 12);
			for (let a = 0; a < 128 * 12; ++a) {
				storage[a] = a & 255;
			}
			const vb = new VertexBuffer(128, 12, storage);
			for (let a = 0; a < 128 * 12; ++a) {
				check.equal(vb.storage[a], a & 255, `byte at offset ${a}`);
			}			
		});

		test("has-vertexstream-render-resourceType", () => {
			const { VertexBuffer } = sd.geometry;
			const vb = new VertexBuffer(4, 12);
			check.equal(vb.renderResourceType, sd.render.ResourceType.VertexStream);
		});

		test("sizeBytes-equals-bufferview-size", () => {
			const { VertexBuffer } = sd.geometry;
			const vb = new VertexBuffer(128, 12);
			check.equal(vb.storage.byteLength, vb.sizeBytes);
		});		
	});
});
