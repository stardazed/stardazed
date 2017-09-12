// io/util - some io related types and functions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.io {

	export function fileExtensionOfURL(url: URL | string): string {
		const path = (url instanceof URL) ? url.href : url;
		const lastDot = path.lastIndexOf(".");
		if (lastDot > -1) {
			return path.substr(lastDot + 1).toLowerCase();
		}
		return "";
	}

	export const localURL = (path: string) =>
		new URL(path, document.baseURI!);

	export const resolveRelativePath = (relPath: string, basePath: string) => 
		(new URL(relPath, "file:///" + basePath)).pathname.slice(1);

		
	export const enum FileLoadType {
		ArrayBuffer = 1,
		Blob,
		Document,
		JSON,
		Text
	}

	export interface FileLoadOptions {
		tryBreakCache?: boolean;
		mimeType?: string;
		responseType?: FileLoadType;
	}


	function responseTypeForFileLoadType(flt: FileLoadType) {
		switch (flt) {
			case FileLoadType.ArrayBuffer: return "arraybuffer";
			case FileLoadType.Blob: return "blob";
			case FileLoadType.Document: return "document";
			case FileLoadType.JSON: return "json";
			case FileLoadType.Text: return "text";
			default: return "";
		}
	}


	export function loadFile<R>(url: URL | string, opts?: FileLoadOptions) {
		return new Promise<R>((resolve, reject) => {
			opts = opts || {};

			const xhr = new XMLHttpRequest();
			if (opts.tryBreakCache) {
				// URLs will degrade to their href when cast to a string
				url += `?__sd=${Date.now()}`;
			}
			xhr.open("GET", (url instanceof URL) ? url.href : url);
			if (opts.responseType) {
				xhr.responseType = responseTypeForFileLoadType(opts.responseType);
			}
			if (opts.mimeType) {
				xhr.overrideMimeType(opts.mimeType);
			}

			xhr.onreadystatechange = () => {
				if (xhr.readyState !== 4) { return; }
				assert(xhr.status === 200 || xhr.status === 0);
				resolve(xhr.response);
			};

			xhr.onerror = () => {
				const message = `'${url}' doesn't exist or failed to load`;
				assert(false, message);
				reject(message);
			};

			xhr.send();
		});
	}


	export class BlobReader {
		private constructor() { /* this is a static class, maybe change to namespace or functions? */ }

		private static readerPromise<T>(): { promise: Promise<T>, reader: FileReader } {
			const reader = new FileReader();
			const promise = new Promise<T>((resolve, reject) => {
				reader.onerror = () => {
					reject(reader.error);
				};
				reader.onabort = () => {
					reject("Blob load was aborted.");
				};
				reader.onload = () => {
					resolve(reader.result);
				};
			});

			return { promise, reader };
		}

		static readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
			const pr = this.readerPromise<ArrayBuffer>();
			pr.reader.readAsArrayBuffer(blob);
			return pr.promise;
		}

		static readAsDataURL(blob: Blob): Promise<string> {
			const pr = this.readerPromise<string>();
			pr.reader.readAsDataURL(blob);
			return pr.promise;
		}

		static readAsText(blob: Blob, encoding?: string): Promise<string> {
			const pr = this.readerPromise<string>();
			pr.reader.readAsText(blob, encoding);
			return pr.promise;
		}
	}


	export function convertBytesToString(bytes: Uint8Array) {
		const maxBlockSize = 65536; // max parameter array size for use in Webkit
		const strings: string[] = [];
		let bytesLeft = bytes.length;
		let offset = 0;

		while (bytesLeft > 0) {
			const blockSize = Math.min(bytesLeft, maxBlockSize);
			const str: string = String.fromCharCode.apply(null, bytes.subarray(offset, offset + blockSize));
			strings.push(str);
			offset += blockSize;
			bytesLeft -= blockSize;
		}

		return strings.length === 1 ? strings[0] : strings.join("");
	}

} // ns sd.io
