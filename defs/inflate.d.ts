// Definition file for the inflate.js file
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler
// inflate.js (c) 2013 by Gildas Lormeau, part of the zip.js library
// See: https://gildas-lormeau.github.io/zip.js/

interface Inflater {
	/**
	 * Add more data to be decompressed.
	 *
	 * @param data A Uint8 view of the compressed data.
	 */
	append(data: Uint8Array): Uint8Array;

	/**
	 * Free memory used during the decompression process. (optional)
	 */
	flush(): void;
}

interface InflaterConstructor {
    new(): Inflater;
    prototype: Inflater;
}

declare var Inflater: InflaterConstructor;
