// container - helpers to manage mostly dynamic typed arrays
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.container {

	export function copyElementRange<T>(src: ArrayLike<T>, srcOffset: number, srcCount: number, dest: MutableArrayLike<T>, destOffset: number) {
		for (let ix = 0; ix < srcCount; ++ix) {
			dest[destOffset++] = src[srcOffset++];
		}
	}


	export function fill<T>(dest: MutableArrayLike<T>, value: T, count: number, offset = 0) {
		for (let ix = 0; ix < count; ++ix) {
			dest[ix + offset] = value;
		}
	}


	export function appendArrayInPlace<T>(dest: Array<T>, source: Array<T>) {
		const MAX_BLOCK_SIZE = 65535;

		let offset = 0;
		let itemsLeft = source.length;

		if (itemsLeft <= MAX_BLOCK_SIZE) {
			dest.push.apply(dest, source);
		}
		else {
			while (itemsLeft > 0) {
				const pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
				const subSource = source.slice(offset, pushCount);
				dest.push.apply(dest, subSource);
				itemsLeft -= pushCount;
				offset += pushCount;
			}
		}
	}


	// -- single element ref, copy and set methods, mostly meant for accessors of components with MABs

	export function refIndexedVec2(data: TypedArray, index: number): TypedArray {
		return data.subarray(index * 2, (index + 1) * 2);
	}

	export function copyIndexedVec2(data: TypedArray, index: number): number[] {
		const offset = (index * 2) | 0;
		return [data[offset], data[offset + 1]];
	}

	export function setIndexedVec2(data: TypedArray, index: number, v2: Float2) {
		const offset = (index * 2) | 0;
		data[offset]     = v2[0];
		data[offset + 1] = v2[1];
	}

	export function copyVec2FromOffset(data: TypedArray, offset: number): Float2 {
		return [data[offset], data[offset + 1]];
	}

	export function setVec2AtOffset(data: TypedArray, offset: number, v2: Float2) {
		data[offset] = v2[0];
		data[offset + 1] = v2[1];
	}

	export function offsetOfIndexedVec2(index: number) { return (index * 2) | 0; }


	export function refIndexedVec3(data: TypedArray, index: number): TypedArray {
		return data.subarray(index * 3, (index + 1) * 3);
	}

	export function copyIndexedVec3(data: TypedArray, index: number): number[] {
		const offset = (index * 3) | 0;
		return [data[offset], data[offset + 1], data[offset + 2]];
	}

	export function setIndexedVec3(data: TypedArray, index: number, v3: Float3) {
		const offset = (index * 3) | 0;
		data[offset]     = v3[0];
		data[offset + 1] = v3[1];
		data[offset + 2] = v3[2];
	}

	export function copyVec3FromOffset(data: TypedArray, offset: number): Float3 {
		return [data[offset], data[offset + 1], data[offset + 2]];
	}

	export function setVec3AtOffset(data: TypedArray, offset: number, v3: Float3) {
		data[offset]     = v3[0];
		data[offset + 1] = v3[1];
		data[offset + 2] = v3[2];
	}

	export function offsetOfIndexedVec3(index: number) { return (index * 3) | 0; }


	export function refIndexedVec4(data: TypedArray, index: number): TypedArray {
		return data.subarray(index * 4, (index + 1) * 4);
	}

	export function copyIndexedVec4(data: TypedArray, index: number): number[] {
		const offset = (index * 4) | 0;
		return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
	}

	export function setIndexedVec4(data: TypedArray, index: number, v4: Float4) {
		const offset = (index * 4) | 0;
		data[offset]     = v4[0];
		data[offset + 1] = v4[1];
		data[offset + 2] = v4[2];
		data[offset + 3] = v4[3];
	}

	export function copyVec4FromOffset(data: TypedArray, offset: number): Float4 {
		return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
	}

	export function setVec4AtOffset(data: TypedArray, offset: number, v4: Float4) {
		data[offset]     = v4[0];
		data[offset + 1] = v4[1];
		data[offset + 2] = v4[2];
		data[offset + 3] = v4[3];
	}

	export function offsetOfIndexedVec4(index: number) { return (index * 4) | 0; }



	export function refIndexedMat3(data: TypedArray, index: number): TypedArray {
		return data.subarray(index * 9, (index + 1) * 9);
	}

	export function copyIndexedMat3(data: TypedArray, index: number): number[] {
		const offset = (index * 9) | 0;
		return [
			data[offset],     data[offset + 1], data[offset + 2],
			data[offset + 3], data[offset + 4], data[offset + 5],
			data[offset + 6], data[offset + 7], data[offset + 8],
		];
	}

	export function setIndexedMat3(data: TypedArray, index: number, m3: Float3x3) {
		const offset = (index * 9) | 0;
		data[offset]     = m3[0]; data[offset + 1] = m3[1]; data[offset + 2] = m3[2];
		data[offset + 3] = m3[3]; data[offset + 4] = m3[4]; data[offset + 5] = m3[5];
		data[offset + 6] = m3[6]; data[offset + 7] = m3[7]; data[offset + 8] = m3[8];
	}

	export function offsetOfIndexedMat3(index: number) { return (index * 9) | 0; }



	export function refIndexedMat4(data: TypedArray, index: number): TypedArray {
		return data.subarray(index * 16, (index + 1) * 16);
	}

	export function copyIndexedMat4(data: TypedArray, index: number): number[] {
		const offset = (index * 16) | 0;
		return [
			data[offset],      data[offset + 1],  data[offset + 2],  data[offset + 3],
			data[offset + 4],  data[offset + 5],  data[offset + 6],  data[offset + 7],
			data[offset + 8],  data[offset + 9],  data[offset + 10], data[offset + 11],
			data[offset + 12], data[offset + 13], data[offset + 14], data[offset + 15]
		];
	}

	export function setIndexedMat4(data: TypedArray, index: number, m4: Float4x4) {
		const offset = (index * 16) | 0;
		data[offset]      = m4[0];  data[offset + 1]  = m4[1];  data[offset + 2]  = m4[2];  data[offset + 3]  = m4[3];
		data[offset + 4]  = m4[4];  data[offset + 5]  = m4[5];  data[offset + 6]  = m4[6];  data[offset + 7]  = m4[7];
		data[offset + 8]  = m4[8];  data[offset + 9]  = m4[9];  data[offset + 10] = m4[10]; data[offset + 11] = m4[11];
		data[offset + 12] = m4[12]; data[offset + 13] = m4[13]; data[offset + 14] = m4[14]; data[offset + 15] = m4[15];
	}

	export function offsetOfIndexedMat4(index: number) { return (index * 16) | 0; }

} // ns sd.container
