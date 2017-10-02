// render/effect/module - shader module definition
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect {

	export interface ModuleBase {
		readonly name: string;
		readonly requires?: string[];
		readonly provides?: string[];
	}

	export interface ModuleMap {
		[name: string]: ModuleBase;
	}

	export type EffectModule = ModuleBase & ShaderModule;
	export const modules: { [name: string]: EffectModule; } = {};

	export const registerModule = (mod: EffectModule) => {
		assert(modules[mod.name] !== undefined, `Effect module named "${mod.name}" already registered.`);
		modules[mod.name] = mod;
	};


	/**
	 * Reduce a set of if-expressions to either an empty expression or
	 * the intersection of each of the expressions.
	 * @internal
	 * @param exprs Array of optional shader macro if-expressions
	 */
	function reduceConditionalExpressions(exprs: (string | undefined)[] | undefined) {
		if (exprs === undefined) {
			return undefined;
		}
		return exprs.reduce(
			(cur, next) => {
				if (cur === undefined || next === undefined || next === "") {
					return undefined;
				}
				return cur.length ? (`${cur} || ${next}`) : `${next}`;
			}
			, "");
	}

	/**
	 * Reduce the if-expressions for each group of statements, returning a
	 * map of named, reduced if-expressions.
	 * @internal
	 * @param items List of Conditionally applied shader structures
	 */
	function normalizeGroupedConditionals<T extends Conditional<object>>(groups: container.GroupedItems<T>) {
		return container.mapObject(groups, (collated) => ({
			ifExpr: reduceConditionalExpressions(collated.ifExpr)
		}));
	}

	/**
	 * Returns whether each group has only a single value for each specified field.
	 * @internal
	 * @param groups Grouped objects with arrays of values for each field
	 * @param uniqueFields The fieldnames to check for uniqueness
	 */
	function checkAllGroupsUnique<T extends object, K extends keyof T>(groups: container.GroupedItems<T>, uniqueFields: K[]) {
		for (const name in groups) {
			if (groups.hasOwnProperty(name)) {
				const collated = groups[name];
				for (const k of uniqueFields) {
					if (collated[k] && (collated[k].length !== 1)) {
						return false;
					}
				}
			}
		}
		return true;
	}

	/**
	 * Reduce a set of ungrouped conditional, named structures to a single definition per named structure.
	 * @internal
	 * @param kind a type name of the items provided (human-readable)
	 * @param items A set of ungrouped conditional, named structures
	 * @param uniqueFields The names of the fields in each structure that will be checked for uniqueness
	 */
	function normalizeUniqueConditionalGroups<T extends Conditional<{name: string}>, K extends keyof T>(kind: string, items: T[], uniqueFields: T[K][]) {
		const groups = container.groupFieldsBy("name", items);
		if (! checkAllGroupsUnique(groups, uniqueFields)) {
			throw new Error(`Ambiguous ${kind} configuration in shader`);
		}
		const normConditionals = normalizeGroupedConditionals(groups);
		return container.stableUnique(items, it => it.name)
			.map(item => container.override(item, normConditionals[item.name] as any, ["ifExpr"]));
	}

	function normalizeExtensions(exts: Conditional<ExtensionUsage>[]) {
		const groups = container.groupFieldsBy("name", exts);

		// By sorting by the actions in reverse order, they will have any "require" values before "enable".
		// By then picking the 1st one, we end up with the strictest indicated requirement.
		const flattened = container.mapObject(groups, (g, name) => ({
			name,
			action: g.action.sort((a, b) => container.stringOrder(b, a))[0],
			ifExpr: reduceConditionalExpressions(g.ifExpr)
		}));

		// Object.values is still a little too new
		return Object.keys(flattened).map(k => flattened[k]);
	}

	/**
	 * Normalize (in-place) each of a Function's arrays of statements so that
	 * for each named item in each array, there is only a single definition.
	 * @throws {Error} Throws an error if normalization fails.
	 * @param fn The ShaderFunction to normalize / reduce
	 */
	export function normalizeFunction<Func extends ShaderFunction>(fn: Func) {
		if (fn.extensions && fn.extensions.length > 1) {
			fn.extensions = normalizeExtensions(fn.extensions);
		}
		if (fn.samplers && fn.samplers.length > 1) {
			fn.samplers = normalizeUniqueConditionalGroups("Sampler", fn.samplers, ["type", "index"]);
		}
		if (fn.constants && fn.constants.length > 1) {
			fn.constants = normalizeUniqueConditionalGroups("Constant", fn.constants, ["type", "length"]);
		}
		if (fn.constValues && fn.constValues.length > 1) {
			fn.constValues = normalizeUniqueConditionalGroups("ConstValue", fn.constValues, ["type", "expr"]);
		}
		if (fn.structs && fn.structs.length > 1) {
			fn.structs = normalizeUniqueConditionalGroups("Struct", fn.structs, ["code"]);
		}
		return fn;
	}

	/**
	 * Merge all fields and code from a source module into a destination module.
	 * @internal
	 * @param dest Module that will receive all data from source
	 * @param source Module whose data will be merged into dest
	 * @returns The destination module
	 */
	function mergeModule(dest: ShaderModule, source: Readonly<ShaderModule>) {
		if (source.extensions && source.extensions.length) {
			dest.extensions = dest.extensions ? dest.extensions.concat(source.extensions) : source.extensions.slice(0);
		}
		if (source.samplers && source.samplers.length) {
			dest.samplers = dest.samplers ? dest.samplers.concat(source.samplers) : source.samplers.slice(0);
		}
		if (source.constants && source.constants.length) {
			dest.constants = dest.constants ? dest.constants.concat(source.constants) : source.constants.slice(0);
		}
		if (source.constValues && source.constValues.length) {
			dest.constValues = dest.constValues ? dest.constValues.concat(source.constValues) : source.constValues.slice(0);
		}
		if (source.structs && source.structs.length) {
			dest.structs = dest.structs ? dest.structs.concat(source.structs) : source.structs.slice(0);
		}
		if (source.code) {
			dest.code = (dest.code || "") + `// ------------\n${source.code}\n`;
		}
		return dest;
	}

	/**
	 * If a ShaderFunction uses modules, returns a new ShaderFunction will modules resolved and merged into a single Function.
	 * The returned function is not yet normalized and may thus contain duplicate definitions for any of its substructures.
	 * @param fn The ShaderFunction to flatten
	 * @param resolver The ModuleResolver instance to use for module resolution
	 */
	export function flattenFunction<Func extends ShaderFunction>(fn: Readonly<Func>, resolver: ModuleResolver<EffectModule>): Func {
		if (! (fn.modules && fn.modules.length)) {
			return fn;
		}

		const merged: Func = {
			...fn as any,
			extensions: fn.extensions && fn.extensions.slice(0),
			samplers: fn.samplers && fn.samplers.slice(0),
			constants: fn.constants && fn.constants.slice(0),
			constValues: fn.constValues && fn.constValues.slice(0),
			structs: fn.structs && fn.structs.slice(0),
		};

		const modules = resolver.resolve(fn.modules as string[]);
		for (const module of modules) {
			mergeModule(merged, module);
		}

		return merged;
	}

} // ns sd.render.effect
