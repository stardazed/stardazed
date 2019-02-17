/**
 * core/deep-readonly - types and helpers to create deep immutable objects
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

/**
 * A type that indicates that all fields inside a type, including
 * arrays, are readonly.
 */
export type DeepReadonly<T> =
	T extends any[] ? DeepReadonlyArray<T[number]> :
	T extends Function ? T : // tslint:disable-line:ban-types
	T extends object ? DeepReadonlyObject<T> :
	T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * Get both the names and symbols used keys in an object.
 */
function getObjectKeys<T extends object>(obj: T): (string | symbol)[] {
	let keys: (string | symbol)[] = Object.getOwnPropertyNames(obj);
	if (typeof Object.getOwnPropertySymbols === "function") {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}
	return keys;
}

/**
 * Freeze an object and its entire hierarchy of fields.
 */
function deepFreeze<T extends object>(obj: T): DeepReadonly<T> {
	if (Object.isFrozen(obj)) {
		return obj as DeepReadonly<T>;
	}
	Object.freeze(obj);

	const keys = getObjectKeys(obj);
	for (const key of keys) {
		const val = (obj as any)[key];
		if (val !== null && (typeof val === "object" || typeof val === "function")) {
			deepFreeze(val);
		}
	}

	return obj as DeepReadonly<T>;
}

/**
 * Return a proxy handler that rejects all changes and will issue
 * a console error showing what happened. console.error is used to get the callstack.
 */
function readonlyProxyHandler<T extends object>(verbose: boolean): ProxyHandler<T> {
	return {
		setPrototypeOf(target: T, proto: any) {
			if (verbose) {
				console.error("Tried to set prototype to ", proto, " on readonly object ", target);
			}
			return false;
		},
		set(target, key, value) {
			if (verbose) {
				console.error("Tried to set key ", key, " to value ", value, " on readonly object ", target);
			}
			return false;
		},
		deleteProperty(target, key) {
			if (verbose) {
				console.error("Tried to delete key ", key, " on readonly object ", target);
			}
			return false;
		},
		defineProperty(target, key, _desc) {
			if (verbose) {
				console.error("Tried to define key ", key, " on readonly object ", target);
			}
			return false;
		}
	};
}

function readonlyProxy<T extends object>(obj: T, verbose: boolean): DeepReadonly<T> {
	return new Proxy(obj, readonlyProxyHandler<T>(verbose)) as DeepReadonly<T>;
}

function revocableReadonlyProxy<T extends object>(obj: T, verbose: boolean) {
	return Proxy.revocable(obj as DeepReadonly<T>, readonlyProxyHandler<DeepReadonly<T>>(verbose));
}

const proxiesSupported = ("Proxy" in window) && typeof ((window as any).Proxy) === "function";

export interface DeepReadonlyOptions {
	/**
	 * Complain in the console when client code tries to change a DeepReadonly object.
	 * Only used when proxies are supported.
	 */
	verbose: boolean;
}

/**
 * Return a deep immutable version of a provided object.
 * Note that the object itself *may* be left unchanged and mutabke so always
 * use the returned object after calling this function.
 * @param obj The object to make deeply immutable
 * @param options 
 */
export function makeDeepReadonly<T extends object>(obj: T, { verbose = false }: DeepReadonlyOptions): DeepReadonly<T> {
	if (proxiesSupported) {
		return readonlyProxy(obj, verbose);
	}
	return deepFreeze(obj);
}

/**
 * Make an object fully readonly and return a revoke handler that
 * can be used to invalidate access to the readonly object.
 * Revoking only works on browsers that support Proxies.
 */
export function makeRevocableDeepReadonly<T extends object>(obj: T, { verbose = false }: DeepReadonlyOptions) {
	if (proxiesSupported) {
		const rp = revocableReadonlyProxy(obj, verbose);
		return {
			revoke: rp.revoke,
			revocable: rp.proxy
		};
	}
	return {
		revoke() { /* does nothing */ },
		revocable: deepFreeze(obj) as DeepReadonly<T>
	};
}

} // ns sd
