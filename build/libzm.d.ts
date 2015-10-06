/// <reference path="../defs/es6-promise.d.ts" />
declare function assert(cond: any, msg?: string): void;
declare function isArrayLike(t: any): boolean;
declare function seq<T>(t: Array<T>): Array<T>;
declare function seq(t: any): Array<any>;
declare function encodeAsQueryString(obj: Object): string;
interface HTMLElement {
    matches: (selector: string) => boolean;
}
declare type ElemSelector = string | Object;
declare function $n(sel: string, base?: HTMLElement): HTMLElement[];
declare function $(sel: ElemSelector, base?: HTMLElement): any[];
declare function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement;
declare function show(sel: ElemSelector, disp?: string): void;
declare function hide(sel: ElemSelector): void;
declare function setDisabled(sel: ElemSelector, dis: boolean): void;
declare function enable(sel: ElemSelector): void;
declare function disable(sel: ElemSelector): void;
declare function closest(sourceSel: ElemSelector, sel: string): HTMLElement;
declare function nextElementSibling(elem: HTMLElement): HTMLElement;
declare function on(target: ElemSelector, evt: string, handler: (ev: Event) => any): void;
declare function off(target: ElemSelector, evt: string, handler: (ev: Event) => any): void;
declare enum FileLoadType {
    ArrayBuffer = 0,
    Blob = 1,
    Document = 2,
    JSON = 3,
    Text = 4,
}
interface FileLoadOptions {
    tryBreakCache?: boolean;
    mimeType?: string;
    responseType?: FileLoadType;
}
declare function loadFile(filePath: string, opts?: FileLoadOptions): Promise<{}>;
