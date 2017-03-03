// core/util - common helpers and types
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./numeric.ts" />


interface Console {
	// Safari-specific debugging extension
	takeHeapSnapshot(): void;
}


namespace sd {

	export function assert(cond: any, msg?: string) {
		if (! cond) {
			console.error(msg || "assertion failed");
			throw new Error(msg || "assertion failed");
		}
	}


	// Deep clone an object. Use only for simple struct types.
	export function cloneStructDeep<T>(object: T): T {
		const copy: any = {};
		Object.getOwnPropertyNames(object).forEach(name => {
			if (typeof (object as any)[name] === "object") {
				copy[name] = cloneStructDeep((object as any)[name]);
			}
			else {
				copy[name] = (object as any)[name];
			}
		});
		return copy as T;
	}

} // ns sd
