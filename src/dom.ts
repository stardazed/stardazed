// dom.ts - DOM helpers and interface extensions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.dom {

	// -- Elements

	export type ElemSelector = string | Node | Node[];

	export function $n(sel: string, base?: HTMLElement): HTMLElement[] { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
	export function $(sel: ElemSelector, base?: HTMLElement) {
		if (typeof sel === "string") {
			return $n(sel, base);
		}
		else if (sel instanceof Node) {
			return [sel];
		}
		else {
			return sel;
		}
	}
	export function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement { return <HTMLElement>$(sel, base)[0]; }

	export function show(sel: ElemSelector, disp?: string) { $(sel).forEach(function(el) { (<HTMLElement>el).style.display = (disp != null) ? disp : "block"; }); }
	export function hide(sel: ElemSelector) { $(sel).forEach(function(el) { (<HTMLElement>el).style.display = "none"; }); }

	export function setDisabled(sel: ElemSelector, dis: boolean) { $(sel).forEach(function(el) { (<HTMLInputElement>el).disabled = dis; }); }
	export function enable(sel: ElemSelector) { setDisabled(sel, false); }
	export function disable(sel: ElemSelector) { setDisabled(sel, true); }

	export function closest(sourceSel: ElemSelector, sel: string): HTMLElement | null {
		var source = <Node>($1(sourceSel));

		if ((<Element>source).closest) {
			return <HTMLElement>(<Element>source).closest(sel);
		}

		do {
			source = source.parentNode;
			if (source.nodeType != Node.ELEMENT_NODE) {
				return null;
			}
			const elem = <HTMLElement>source;
			const matchFn = elem.matches || elem.webkitMatchesSelector || elem.msMatchesSelector;
			if (matchFn.call(elem, sel)) {
				return elem;
			}
		} while (source);

		return null;
	}

	export function nextElementSibling(elem: HTMLElement): HTMLElement | null {
		while (elem) {
			elem = <HTMLElement>(elem.nextSibling);
			if (elem && elem.nodeType == Node.ELEMENT_NODE) {
				return elem;
			}
		}

		return null;
	}


	// -- Events

	export function on(target: ElemSelector | Window, evt: string, handler: (ev: Event) => any) {
		const list: EventTarget[] = (target instanceof Window) ? [target] : $(target);
		list.forEach(function(tgt) { tgt.addEventListener(evt, handler); });
	}

	export function off(target: ElemSelector | Window, evt: string, handler: (ev: Event) => any) {
		const list: EventTarget[] = (target instanceof Window) ? [target] : $(target);
		list.forEach(function(tgt) { tgt.removeEventListener(evt, handler); });
	}

} // ns sd.dom
