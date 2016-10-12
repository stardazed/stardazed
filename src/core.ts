// core.ts - common helpers and types
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

			console.info(`Perf [${this.name_}] ${stepName}: ${diffT.toFixed(1)}`);
		}

		end() {
			const curT = performance.now();
			const diffT = curT - this.t0_;

			this.stepSums_.forEach((totalStepT, stepName) => {
				console.info(`Perf TOTAL [${this.name_}] ${stepName}: ${totalStepT.toFixed(1)}`);
			});
			console.info(`Perf TOTAL: ${diffT.toFixed(1)}`);
		}
	}

} // ns sd
