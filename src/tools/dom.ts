// tools/dom - DOM helpers and interface extensions
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

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

	export function closest(sourceSel: ElemSelector, sel: string): HTMLElement | undefined {
		let source = <HTMLElement | undefined>($1(sourceSel));

		if (! source) {
			return undefined;
		}

		if (source.closest) {
			return source.closest(sel) as HTMLElement;
		}

		do {
			source = source.parentNode ? source.parentNode as HTMLElement : undefined;
			if (!source || source.nodeType !== Node.ELEMENT_NODE) {
				return undefined;
			}
			const elem = <HTMLElement>source;
			const matchFn = elem.matches || elem.webkitMatchesSelector || elem.msMatchesSelector;
			if (matchFn.call(elem, sel)) {
				return elem;
			}
		} while (source);

		return undefined;
	}

	export function nextElementSibling(elem: HTMLElement): HTMLElement | undefined {
		while (elem) {
			elem = <HTMLElement>(elem.nextSibling);
			if (elem && elem.nodeType == Node.ELEMENT_NODE) {
				return elem;
			}
		}

		return undefined;
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
