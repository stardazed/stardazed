// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

group("geometry", () => {
	group("IndexBuffer", () => {
		test("construct-throws-on-invalid-elementType-or-indexCount", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(16);
			check.throws(Error, () => new IndexBuffer(IndexElementType.None, 4));
			check.throws(Error, () => new IndexBuffer(IndexElementType.UInt8, 0));
			check.throws(Error, () => new IndexBuffer(999, 4), "non-enum IET");
			check.throws(Error, () => new IndexBuffer(IndexElementType.UInt8, -1));
			check.throws(Error, () => new IndexBuffer(IndexElementType.None, 4, storage));
			check.throws(Error, () => new IndexBuffer(IndexElementType.UInt8, 0, storage));
			check.throws(Error, () => new IndexBuffer(-1, 4, storage), "non-enum IET");
			check.throws(Error, () => new IndexBuffer(IndexElementType.UInt8, -1, storage));
		});

		test("provided-elementType-and-indexCount-stick", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const ib = new IndexBuffer(IndexElementType.UInt8, 300);
			check.equal(ib.indexElementType, IndexElementType.UInt8);
			check.equal(ib.indexCount, 300);

			const ib2 = new IndexBuffer(IndexElementType.UInt16, 3);
			check.equal(ib2.indexElementType, IndexElementType.UInt16);
			check.equal(ib2.indexCount, 3);

			const ib3 = new IndexBuffer(IndexElementType.UInt32, 1);
			check.equal(ib3.indexElementType, IndexElementType.UInt32);
			check.equal(ib3.indexCount, 1);
		});

		test("construct-without-storage-creates-one-of-fitting-size", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const ib = new IndexBuffer(IndexElementType.UInt32, 48);
			check.present(ib.storage);
			check.equal(ib.storage.byteLength, 4 * 48);
		});

		test("construct-without-storage-creates-zeroed-buffer", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const ib = new IndexBuffer(IndexElementType.UInt16, 20);
			for (let a = 0; a < 2 * 20; ++a) {
				check.equal(ib.storage[a], 0, `byte at offset ${a}`);
			}			
		});

		test("construct-with-storage-adopts-it", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(4 * 128);
			const ib = new IndexBuffer(IndexElementType.UInt32, 128, storage);
			check.equal(ib.storage, storage);
		});

		test("construct-with-storage-throws-if-too-small", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(4 * 100);
			check.throws(Error, () => {
				// tslint:disable-next-line:no-unused-new
				new IndexBuffer(IndexElementType.UInt32, 128, storage);
			});			
		});

		test("construct-with-storage-does-not-change-data", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const storage = new Uint8ClampedArray(2 * 256);
			for (let a = 0; a < 2 * 256; ++a) {
				storage[a] = a & 255;
			}
			const ib = new IndexBuffer(IndexElementType.UInt16, 256, storage);
			for (let a = 0; a < 2 * 256; ++a) {
				check.equal(ib.storage[a], a & 255, `byte at offset ${a}`);
			}			
		});

		test("sizeBytes-equals-bufferview-size", () => {
			const { IndexElementType, IndexBuffer } = sd.geometry;
			const ib = new IndexBuffer(IndexElementType.UInt16, 257);
			check.equal(ib.storage.byteLength, ib.sizeBytes);
		});

		group("typedBasePtr", () => {
			let ib8: sd.geometry.IndexBuffer;
			let ib16: sd.geometry.IndexBuffer;
			let ib32: sd.geometry.IndexBuffer;

			const compareRanges = (
				a: sd.NumArray, aFrom: number,
				b: sd.NumArray, bFrom: number,
				count: number, prefix: string
			) => {
				for (let ix = 0; ix < count; ++ix) {
					check.equal(a[aFrom + ix], b[bFrom + ix], `${prefix} byte ${ix}`);
				}
			};

			before(() => {
				const { IndexElementType, IndexBuffer } = sd.geometry;
				ib8 = new IndexBuffer(IndexElementType.UInt8, 384);
				ib16 = new IndexBuffer(IndexElementType.UInt16, 384);
				ib32 = new IndexBuffer(IndexElementType.UInt32, 384);

				// fill arrays with arbitrary data
				for (let k = 0; k < ib32.storage.byteLength; ++k) {
					if (k < ib8.storage.byteLength) { ib8.storage[k] = k; }
					if (k < ib16.storage.byteLength) { ib16.storage[k] = k; }
					ib32.storage[k] = k;
				}
			});

			test("throws-on-range-error", () => {
				check.throws(Error, () => ib8.typedBasePtr(0, 385), "U8 0, 385");
				check.throws(Error, () => ib8.typedBasePtr(200, 185), "U8 200, 185");
				check.throws(Error, () => ib8.typedBasePtr(-1, 1), "U8 -1, 1");
				check.throws(Error, () => ib8.typedBasePtr(-10, 400), "U8 -10, 400");

				check.throws(Error, () => ib16.typedBasePtr(0, 385), "U16 0, 257");
				check.throws(Error, () => ib16.typedBasePtr(200, 185), "U16 200, 185");
				check.throws(Error, () => ib16.typedBasePtr(-1, 1), "U16 -1, 1");
				check.throws(Error, () => ib16.typedBasePtr(-1, 400), "U16 -1, 400");

				check.throws(Error, () => ib32.typedBasePtr(0, 385), "U32 0, 257");
				check.throws(Error, () => ib32.typedBasePtr(200, 185), "U32 200, 185");
				check.throws(Error, () => ib32.typedBasePtr(-1, 1), "U32 -1, 1");
				check.throws(Error, () => ib32.typedBasePtr(-1, 400), "U32 -1, 400");
			});

			test("returns-exact-sized-section-of-proper-type-UInt8", () => {
				const view = ib8.typedBasePtr(0, 384);
				const checkView = ib8.storage.subarray(0, 384);
				check.equal(view.BYTES_PER_ELEMENT, 1, "must be Uint8 view");
				check.equal(view.byteLength, 384);
				compareRanges(view, 0, checkView, 0, 384, "full");

				const view2 = ib8.typedBasePtr(250, 33);
				const checkView2 = ib8.storage.subarray(250, 383);
				check.equal(view2.BYTES_PER_ELEMENT, 1, "must be Uint8 view");
				check.equal(view2.byteLength, 33);
				compareRanges(view2, 0, checkView2, 0, 33, "part");
			});

			test("returns-exact-sized-section-of-proper-type-UInt16", () => {
				const view = ib16.typedBasePtr(0, 384);
				const checkView = new Uint16Array(ib16.storage.buffer, 0, 384);
				check.equal(view.BYTES_PER_ELEMENT, 2, "must be Uint16 view");
				check.equal(view.byteLength, 2 * 384);
				compareRanges(view, 0, checkView, 0, 384, "full");

				const view2 = ib16.typedBasePtr(100, 33);
				const checkView2 = new Uint16Array(ib16.storage.buffer, 2 * 100, 33);
				check.equal(view2.BYTES_PER_ELEMENT, 2, "must be Uint16 view");
				check.equal(view2.byteLength, 2 * 33);
				compareRanges(view2, 0, checkView2, 0, 33, "part");
			});

			test("returns-exact-sized-section-of-proper-type-UInt32", () => {
				const view = ib32.typedBasePtr(0, 384);
				const checkView = new Uint32Array(ib32.storage.buffer, 0, 384);
				check.equal(view.BYTES_PER_ELEMENT, 4, "must be Uint32 view");
				check.equal(view.byteLength, 4 * 384);
				compareRanges(view, 0, checkView, 0, 384, "full");

				const view2 = ib32.typedBasePtr(100, 33);
				const checkView2 = new Uint32Array(ib32.storage.buffer, 4 * 100, 33);
				check.equal(view2.BYTES_PER_ELEMENT, 4, "must be Uint32 view");
				check.equal(view2.byteLength, 4 * 33);
				compareRanges(view2, 0, checkView2, 0, 33, "part");
			});
		});
	});
});
