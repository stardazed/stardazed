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


	/**
	 * Deep clone an object. Use only for simple struct types.
	 * @param object The object to clone
	 */
	export function cloneStructDeep<T extends object>(object: T): T {
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


	/**
	 * Create an immutable object that acts as a lookup table with numerical keys, such as (const) enum values.
	 * @param keyVals Alternating key, value pairs
	 */
	export function makeLUT<A extends number, B>(...keyVals: (A | B)[]): { readonly [k: number]: Readonly<B>; } {
		const lut: { [k: number]: B; } = {};
		const count = keyVals.length;
		for (let i = 0; i < count; i += 2) {
			lut[keyVals[i] as number] = keyVals[i + 1] as B;
		}
		return Object.freeze(lut);
	}

} // ns sd
