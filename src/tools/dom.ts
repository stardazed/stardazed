// tools/dom - DOM helpers and interface extensions
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
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
	export function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement {
		return $(sel, base)[0] as HTMLElement;
	}

	export function show(sel: ElemSelector, disp?: string): void {
		$(sel).forEach(el => {
			(el as HTMLElement).style.display = (disp != null) ? disp : "block";
		});
	}
	export function hide(sel: ElemSelector): void {
		$(sel).forEach(el => {
			(el as HTMLElement).style.display = "none";
		});
	}

	export function setDisabled(sel: ElemSelector, dis: boolean): void {
		$(sel).forEach(el => { (el as HTMLInputElement).disabled = dis; });
	}
	export function enable(sel: ElemSelector) { setDisabled(sel, false); }
	export function disable(sel: ElemSelector) { setDisabled(sel, true); }

	export function closest(sourceSel: ElemSelector, sel: string): HTMLElement | undefined {
		let source = ($1(sourceSel)) as HTMLElement | undefined;

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
			const elem = source as HTMLElement;
			const matchFn = elem.matches || elem.webkitMatchesSelector || elem.msMatchesSelector;
			if (matchFn.call(elem, sel)) {
				return elem;
			}
		} while (source);

		return undefined;
	}

	export function nextElementSibling(elem: HTMLElement): HTMLElement | undefined {
		while (elem) {
			elem = elem.nextSibling as HTMLElement;
			if (elem && elem.nodeType === Node.ELEMENT_NODE) {
				return elem;
			}
		}

		return undefined;
	}


	// -- Events

	export function on<E extends Event>(target: ElemSelector | Window, evt: string, handler: (ev: E) => any) {
		const list: EventTarget[] = (target instanceof Window) ? [target] : $(target);
		list.forEach(tgt => { tgt.addEventListener(evt, handler as (e: Event) => any); });
	}

	export function off<E extends Event>(target: ElemSelector | Window, evt: string, handler: (ev: E) => any) {
		const list: EventTarget[] = (target instanceof Window) ? [target] : $(target);
		list.forEach(tgt => { tgt.removeEventListener(evt, handler as (e: Event) => any); });
	}

} // ns sd.dom
