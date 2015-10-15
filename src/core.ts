// core.ts - Basic type and DOM helpers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/es6-promise.d.ts" />

function assert(cond: any, msg?: string) {
	if (! cond) {
		throw new Error(msg || "assertion failed");
	}
}


// -- Mixins (from TS site)

function applyMixins(derivedCtor: any, baseCtors: any[]) {
	baseCtors.forEach(baseCtor => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
			derivedCtor.prototype[name] = baseCtor.prototype[name];
		})
	});
}


// -- Sequences

function isArrayLike(t: any) {
	return (typeof t == "object") && ("length" in t) && !(t instanceof String || t instanceof Window);
}

function seq<T>(t: Array<T>): Array<T>;
function seq(t: any): Array<any>;

function seq(t: any): any {
	if (Array.isArray(t))
		return t;
	if (isArrayLike(t))
		return [].slice.call(t, 0);
	return [t]; 
}

interface Array<T> {
	// ES6 extensions
	find(callback: (element: T, index: number, array: Array<T>) => boolean, thisArg?: any): T;
}



// -- DOM Elements

interface HTMLElement {
	matches: (selector: string) => boolean;
}

type ElemSelector = string | Object;

function $n(sel: string, base?: HTMLElement): HTMLElement[] { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
function $(sel: ElemSelector, base?: HTMLElement) { return (typeof(sel) == 'string') ? $n(<string>sel, base) : seq(sel); }
function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement { return $(sel, base)[0]; }

function show(sel: ElemSelector, disp?: string) { $(sel).forEach(function(el){ el.style.display = disp||"block" }); }
function hide(sel: ElemSelector) { $(sel).forEach(function(el){ el.style.display = "none" }); }

function setDisabled(sel: ElemSelector, dis: boolean) { $(sel).forEach(function(el){ el.disabled = dis; }); }
function enable(sel: ElemSelector) { setDisabled(sel, false); }
function disable(sel: ElemSelector) { setDisabled(sel, true); }

function closest(sourceSel: ElemSelector, sel: string): HTMLElement {
	var source = <Node>($1(sourceSel));
	do {
		source = source.parentNode;
		if (source.nodeType != Node.ELEMENT_NODE)
			return null;
		var elem = <HTMLElement>source;	
		if (elem.matches(sel))
			return elem;
	} while(source);

	return null;
}

function nextElementSibling(elem: HTMLElement): HTMLElement {
	while (elem) {
		elem = <HTMLElement>(elem.nextSibling);
		if (elem && elem.nodeType == Node.ELEMENT_NODE)
			return elem;
	}
	
	return null;
}


// -- DOM Events

function on(target: ElemSelector, evt: string, handler: (ev: Event) => any) {
	$(target).forEach(function(tgt) { tgt.addEventListener(evt, handler); });
}

function off(target: ElemSelector, evt: string, handler: (ev: Event) => any) {
	$(target).forEach(function(tgt) { tgt.removeEventListener(evt, handler); });
}


// -- Resources (to be moved out)

function encodeAsQueryString(obj: Object): string {
	var items: string[] = [];

	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			items.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
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
