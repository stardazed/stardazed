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

	/**
	 * asserts a condition to be true or throw an error otherwise
	 * @param cond A condition that can be evaluated to true or false
	 * @param msg Error message that will be thrown if cond is false
	 */
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
			if (typeof (object as any)[name] === "object" && (object as any)[name] !== null) {
				copy[name] = cloneStructDeep((object as any)[name]);
			}
			else {
				copy[name] = (object as any)[name];
			}
		});
		return copy as T;
	}

	/**
	 * Returns the count of properties in an object.
	 * @param obj Any object
	 */
	export function propertyCount(obj: object) {
		return Object.getOwnPropertyNames(obj).length;
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

	export function capitalize(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Mix-in constructor type used for TS-style class mix-ins
	 */
	export type Constructor<T> = new (...args: any[]) => T;

	export function isIterator<T = any>(it: any): it is Iterator<T> {
		if (typeof it === "object" && it !== null) {
			return typeof it.next === "function" && it.next.length === 1;
		}
		return false;
	}
	
} // ns sd
