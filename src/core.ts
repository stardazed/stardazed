// core.ts - common helpers and types
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/es6-promise.d.ts" />
/// <reference path="../defs/es6-collections.d.ts" />

interface Array<T> {
	// ES6 extensions
	find(callback: (element: T, index: number, array: Array<T>) => boolean, thisArg?: any): T | undefined;
	findIndex(callback: (element: T, index: number, array: Array<T>) => boolean, thisArg?: any): number;
}


interface Console {
	takeHeapSnapshot(): void;
}


namespace sd {

	export function assert(cond: any, msg?: string) {
		if (! cond) {
			console.error(msg || "assertion failed");
			throw new Error(msg || "assertion failed");
		}
	}


	// -- Sequences (global)

	export function seq<T>(t: ArrayLike<T>): Array<T>;
	export function seq(t: any): Array<any>;

	export function seq(t: any): any {
		if (Array.isArray(t))
			return t;
		// try to detect a non-String ArrayLike
		if ((typeof t == "object") && ("length" in t) && (t.length > 0) && !(t instanceof String) && ('0' in Object(t)))
			return [].slice.call(t, 0);
		return [].concat(t);
	}


	export function convertBytesToString(bytes: Uint8Array) {
		var strings: string[] = [];

		var bytesLeft = bytes.length;
		var offset = 0;
		const maxBlockSize = 65536; // max parameter array size for use in Webkit

		while (bytesLeft > 0) {
			let blockSize = Math.min(bytesLeft, maxBlockSize);
			let str: string = String.fromCharCode.apply(null, bytes.subarray(offset, offset + blockSize));
			strings.push(str);
			offset += blockSize;
			bytesLeft -= blockSize;
		}

		return strings.length == 1 ? strings[0] : strings.join("");
	}


	// -- Mixins (from TS site)

	export function applyMixins(derivedCtor: any, baseCtors: any[]) {
		baseCtors.forEach(baseCtor => {
			Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
				derivedCtor.prototype[name] = baseCtor.prototype[name];
			})
		});
	}

	// Shallow clone an object. Use only for simple struct types.
	export function cloneStruct<T>(object: T): T {
		var copy = {};
		Object.getOwnPropertyNames(object).forEach(name => {
			(<any>copy)[name] = (<any>object)[name];
		});
		return <T>copy;
	}


	// Deep clone an object. Use only for simple struct types.
	export function cloneStructDeep<T>(object: T): T {
		var copy = {};
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


	// helper class for easy logged timing of multi-step processes
	export class PerfTimer {
		private t0_: number;
		private lastT_: number;
		private stepSums_ = new Map<string, number>();

		constructor(private name_: string) {
			this.t0_ = this.lastT_ = performance.now();
		}

		step(stepName: string) {
			const curT = performance.now();
			const diffT = curT - this.lastT_;
			this.lastT_ = curT;

			this.stepSums_.set(name, diffT + (this.stepSums_.get(stepName) || 0));

			console.info("Perf [" + this.name_ + "] " + stepName + ": " + diffT.toFixed(1));
		}

		end() {
			const curT = performance.now();
			const diffT = curT - this.t0_;

			this.stepSums_.forEach((totalStepT, stepName) => {
				console.info("Perf TOTAL [" + this.name_ + "] " + stepName + ": " + totalStepT.toFixed(1));
			});
			console.info("Perf TOTAL: " + diffT.toFixed(1));
		}
	}


} // ns sd
