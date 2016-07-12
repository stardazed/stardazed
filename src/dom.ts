// dom.ts - DOM helpers and interface extensions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

// interface Element {
// 	closest: (selectors: string) => Element;
// }


namespace sd.dom {

	// -- Elements

	export type ElemSelector = string | Object;

	export function $n(sel: string, base?: HTMLElement): HTMLElement[] { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
	export function $(sel: ElemSelector, base?: HTMLElement) { return (typeof (sel) == 'string') ? $n(<string>sel, base) : seq(sel); }
	export function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement { return $(sel, base)[0]; }

	export function show(sel: ElemSelector, disp?: string) { $(sel).forEach(function(el) { el.style.display = (disp != null) ? disp : "block" }); }
	export function hide(sel: ElemSelector) { $(sel).forEach(function(el) { el.style.display = "none" }); }

	export function setDisabled(sel: ElemSelector, dis: boolean) { $(sel).forEach(function(el) { el.disabled = dis; }); }
	export function enable(sel: ElemSelector) { setDisabled(sel, false); }
	export function disable(sel: ElemSelector) { setDisabled(sel, true); }

	export function closest(sourceSel: ElemSelector, sel: string): HTMLElement {
		var source = <Node>($1(sourceSel));

		if ((<Element>source).closest) {
			return <HTMLElement>(<Element>source).closest(sel);
		}

		do {
			source = source.parentNode;
			if (source.nodeType != Node.ELEMENT_NODE)
				return null;
			var elem = <HTMLElement>source;
			if (elem.matches(sel))
				return elem;
		} while (source);

		return null;
	}

	export function nextElementSibling(elem: HTMLElement): HTMLElement {
		while (elem) {
			elem = <HTMLElement>(elem.nextSibling);
			if (elem && elem.nodeType == Node.ELEMENT_NODE)
				return elem;
		}

		return null;
	}


	// -- Events

	export function on(target: ElemSelector, evt: string, handler: (ev: Event) => any) {
		$(target).forEach(function(tgt) { tgt.addEventListener(evt, handler); });
	}

	export function off(target: ElemSelector, evt: string, handler: (ev: Event) => any) {
		$(target).forEach(function(tgt) { tgt.removeEventListener(evt, handler); });
	}

} // ns sd.dom
