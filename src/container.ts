// containers - helpers to manage mostly dynamic typed arrays
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />
/// <reference path="numeric.ts" />

interface ArrayBufferConstructor {
	// proposed for ES7
	transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}

if (! ArrayBuffer.transfer) {
	ArrayBuffer.transfer = function(oldBuffer: ArrayBuffer, newByteLength?: number) {
		// This placeholder implementation cannot detach `oldBuffer`'s storage
		// but `oldBuffer` is to be treated as a moved-from value in C++ terms
		// after calling transfer.

		var oldByteLength = oldBuffer.byteLength;
		newByteLength = newByteLength | 0;
		assert(newByteLength > 0);

		if (newByteLength < oldByteLength) {
			return oldBuffer.slice(0, newByteLength);
		}

		var oldBufferView = new Uint8Array(oldBuffer);
		var newBufferView = new Uint8Array(newByteLength); // also creates new ArrayBuffer
		newBufferView.set(oldBufferView);

		return newBufferView.buffer;
	}
}


