// core - common helpers and types
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

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


	// Shallow clone an object. Use only for simple struct types.
	export function cloneStruct<T>(object: T): T {
		const copy = {};
		Object.getOwnPropertyNames(object).forEach(name => {
			(<any>copy)[name] = (<any>object)[name];
		});
		return <T>copy;
	}


	// Deep clone an object. Use only for simple struct types.
	export function cloneStructDeep<T>(object: T): T {
		const copy = {};
		Object.getOwnPropertyNames(object).forEach(name => {
			if (typeof (<any>object)[name] === "object") {
				(<any>copy)[name] = cloneStructDeep((<any>object)[name]);
			}
			else {
				(<any>copy)[name] = (<any>object)[name];
			}
		});
		return <T>copy;
	}


	export function copyValues(dest: any, source: any) {
		Object.getOwnPropertyNames(source).forEach(name => {
			dest[name] = source[name];
		});
	}

} // ns sd
