// libzm.js - all I need to be street
// (c) 2015 by Arthur Langereis - @zenmumbler

function assert(cond, msg) {
	if (! cond) {
		throw new Error(msg || "assertion failed");
	}
}


// -- Sequences

function isArrayLike(t) { return (typeof t == "object") && ("length" in t) && !(t instanceof String || t instanceof Window); }
function seq(t) { return (Array.isArray(t)) ? t : (isArrayLike(t) ? [].slice.call(t, 0) : [t]); }


// -- Data

function encodeAsQueryString(obj) {
	var items = [];

	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			items.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
		}
	}
	
	return items.join("&");
}


// -- DOM Elements

function $n(sel, base) { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
function $(sel, base) { return (typeof(sel) == 'string') ? $n(sel, base) : seq(sel); }
function $1(sel, base) { return $(sel, base)[0]; }

function show(sel, disp) { $(sel).forEach(function(el){ el.style.display = disp||"block" }); }
function hide(sel) { $(sel).forEach(function(el){ el.style.display = "none" }); }

function setDisabled(sel,dis) { $(sel).forEach(function(el){ el.disabled = dis; }); }
function enable(sel) { setDisabled(sel, false); }
function disable(sel) { setDisabled(sel, true); }

function conformsTo(element, sel) {
	element = $1(element);
	var frag = document.createDocumentFragment();
	frag.appendChild(element.cloneNode(false));
	return !!($1(sel, frag));
}

function closest(source, sel) {
	source = $1(source);
	do {
		source = source.parentNode;
		if (source.nodeType != Node.ELEMENT_NODE)
			return null;
		if (conformsTo(source, sel))
			return source;
	} while(source);

	return null;
}

function nextElementSibling(node) {
	while (node) {
		node = node.nextSibling;
		if (node && node.nodeType == Node.ELEMENT_NODE)
			return node;
	}
	
	return null;
}


// -- DOM Events

function on(target, evt, handler) {
	assert(typeof target == "string" || typeof target == "object", "bad target param");
	assert(typeof evt == "string", "bad evtName param");
	assert(typeof handler == "function", "bad handler param");

	$(target).forEach(function(tgt) { tgt.addEventListener(evt, handler); });
}

function off(target, evt, handler) {
	assert(typeof target == "string" || typeof target == "object", "bad target param");
	assert(typeof evt == "string", "bad evtName param");
	assert(typeof handler == "function", "bad handler param");

	$(target).forEach(function(tgt) { tgt.removeEventListener(evt, handler); });
}
