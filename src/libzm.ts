// libzm - all I need to be street
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/es6-promise.d.ts" />

function assert(cond: any, msg?: string) {
	if (! cond) {
		throw new Error(msg || "assertion failed");
	}
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



// -- Data

function encodeAsQueryString(obj: Object): string {
	var items: string[] = [];

	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			items.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
		}
	}
	
	return items.join("&");
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


// -- Resources

interface FileLoadOptions {
	xml?: boolean;
	tryBreakCache?: boolean;
	mimeType?: string;
}


function loadFile(filePath: string, opts?: FileLoadOptions) {
	return new Promise(function(resolve, reject) {
		opts = opts || {};

		var xhr = new XMLHttpRequest();
		if (opts.tryBreakCache) {
			filePath += "?__ts=" + Date.now();
		}
		xhr.open("GET", filePath);
		if (opts.mimeType) {
			xhr.overrideMimeType(opts.mimeType);
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;
			assert(xhr.status == 200 || xhr.status == 0);

			if (opts.xml)
				resolve(xhr.responseXML);
			else
				resolve(xhr.responseText);
		};

		xhr.onerror = function() {
			assert(false, filePath + " doesn't exist");
		};

		xhr.send();
	});
}
