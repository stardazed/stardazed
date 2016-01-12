// core.ts - Basic type and DOM helpers
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/es6-promise.d.ts" />
/// <reference path="../defs/es6-collections.d.ts" />

function assert(cond: any, msg?: string) {
	if (! cond) {
		throw new Error(msg || "assertion failed");
	}
}


// -- Sequences (global)

function seq<T>(t: Array<T>): Array<T>;
function seq(t: any): Array<any>;

function seq(t: any): any {
	if (Array.isArray(t))
		return t;
	// try to detect a non-String ArrayLike
	if ((typeof t == "object") && ("length" in t) && (t.length > 0) && !(t instanceof String) && ('0' in Object(t)))
		return [].slice.call(t, 0);
	return [].concat(t);
}

interface Array<T> {
	// ES6 extensions
	find(callback: (element: T, index: number, array: Array<T>) => boolean, thisArg?: any): T;
}


// -- Mixins (from TS site)

function applyMixins(derivedCtor: any, baseCtors: any[]) {
	baseCtors.forEach(baseCtor => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
			derivedCtor.prototype[name] = baseCtor.prototype[name];
		})
	});
}

// Shallow clone an object. Use only for simple struct types.
function cloneStruct<T>(object: T): T {
	var copy = {};
	Object.getOwnPropertyNames(object).forEach(name => {
		(<any>copy)[name] = (<any>object)[name];
	});
	return <T>copy;
}


function copyValues(dest: any, source: any) {
	Object.getOwnPropertyNames(source).forEach(name => {
		dest[name] = source[name];
	});
}



// -- Resources (to be moved out)

function encodeAsQueryString(obj: Object): string {
	var items: string[] = [];

	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			items.push(encodeURIComponent(k) + "=" + encodeURIComponent((<any>obj)[k]));
		}
	}

	return items.join("&");
}


enum FileLoadType {
	ArrayBuffer = 1,
	Blob,
	Document,
	JSON,
	Text
}

interface FileLoadOptions {
	tryBreakCache?: boolean;
	mimeType?: string;
	responseType?: FileLoadType;
}

function loadFile(filePath: string, opts?: FileLoadOptions) {
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

	return new Promise(function(resolve, reject) {
		opts = opts || {};

		var xhr = new XMLHttpRequest();
		if (opts.tryBreakCache) {
			filePath += "?__ts=" + Date.now();
		}
		xhr.open("GET", filePath);
		if (opts.responseType) {
			xhr.responseType = responseTypeForFileLoadType(opts.responseType);
		}
		if (opts.mimeType) {
			xhr.overrideMimeType(opts.mimeType);
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;
			assert(xhr.status == 200 || xhr.status == 0);
			resolve(xhr.response);
		};

		xhr.onerror = function() {
			assert(false, filePath + " doesn't exist");
		};

		xhr.send();
	});
}
