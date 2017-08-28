// render/shader/module - shader module definition and resolution
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.shader {
	
	export interface ModuleBase {
		readonly name: string;
		readonly requires?: string[];
		readonly provides?: string[];
	}

	export interface ModuleMap {
		[name: string]: ModuleBase;
	}

	function isConceptName(name: string) {
		// concept names start with a capital letter
		return name.charAt(0) === name.charAt(0).toUpperCase();
	}

	type Branch = (ModuleBase | string)[];
	interface BranchMap {
		[name: string]: Branch;
	}

	export class ModuleResolver<Module extends ModuleBase> {
		private modules_: { [name: string]: ModuleBase | undefined; };

		constructor(modules: ModuleMap) {
			this.modules_ = modules;
		}

		private resolveDependencies(moduleNames: string[], path: string[] = []) {
			const branch: Branch = [];
			const providers: BranchMap = {};
			const revNames = moduleNames.slice(0).reverse();

			const mergeProviders = (into: BranchMap, from: BranchMap) => {
				for (const cn in from) {
					if (from.hasOwnProperty(cn)) {
						if (cn in into) {
							throw new Error(`Duplicate provider for concept: ${cn}`);
						}
						into[cn] = from[cn];
					}
				}
			};
	
			while (revNames.length > 0) {
				const modName = revNames.pop()!;
	
				if (isConceptName(modName)) {
					branch.unshift(modName);
				}
				else {
					// a normal module ref, must have been registered
					const m = this.modules_[modName];
					if (! m) {
						throw new Error(`Unknown module name: ${modName}`);
					}
	
					// create sub-branch dependency list for this module
					// merge in any providers referenced in the sub branch
					let subBranch: Branch = [m];
					if (m.requires && m.requires.length) {
						if (path.indexOf(modName) > -1) {
							throw new Error(`Dependency cycle detected: ${path.concat(modName).join(" > ")}`);
						}
						const subPath = path.concat(modName);
						const subResult = this.resolveDependencies(m.requires, subPath);
						subBranch = subResult.branch.concat(subBranch);
						mergeProviders(providers, subResult.providers);
					}
	
					if (m.provides && m.provides.length) {
						// this is a provider module
						if (path.length > 0) {
							// if this is not the top-level branch then
							// insert concept tag into referencing branch for the merge phase
							branch.unshift(m.provides[0]);
						}
	
						// assign provider branch to all provided concepts
						const newProviders: BranchMap = {};
						for (const p of m.provides) {
							newProviders[p] = subBranch;
						}
						mergeProviders(providers, newProviders);
					}
					else {
						// plain dependency, prepend its branch to current branch
						branch.unshift(...subBranch);
					}
				}
			}
	
			return { branch, providers };
		}
	
		private resolveConcepts(main: Branch, concepts: BranchMap) {
			const resolveBranch = (b: Branch, path: string[] = []) => {
				const chain: ModuleBase[] = [];
				for (const mc of b) {
					if (typeof mc === "string") {
						const c = concepts[mc];
						if (! c) {
							throw new Error(`Unresolved concept: ${mc}`);
						}
						if (path.indexOf(mc) > -1) {
							throw new Error(`Dependency cycle in concepts: ${path.concat(mc).join(" > ")}`);
						}
						chain.push(...resolveBranch(c, path.concat(mc)));
					}
					else {
						chain.push(mc);
					}
				}
				return chain;
			};
	
			return resolveBranch(main);
		}
	
		resolve(moduleNames: string[]) {
			const { branch, providers } = this.resolveDependencies(moduleNames);
			const resolved = this.resolveConcepts(branch, providers);
			return container.stableUnique(resolved) as Module[];
		}
	}

	// ----

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
				return cur.length ? (`${cur} || (${next})`) : `(${next})`;
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
		return container.stableUnique(items).map(item => container.override(item, normConditionals[item.name] as any, ["ifExpr"]));
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
	export function normalizeFunction(fn: ShaderFunction) {
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
	export function flattenFunction<Module extends ModuleBase & ShaderModule>(fn: Readonly<ShaderFunction>, resolver: ModuleResolver<Module>): ShaderFunction {
		if (! (fn.modules && fn.modules.length)) {
			return fn;
		}

		const merged: ShaderFunction = {
			extensions: fn.extensions && fn.extensions.slice(0),
			samplers: fn.samplers && fn.samplers.slice(0),
			constants: fn.constants && fn.constants.slice(0),
			constValues: fn.constValues && fn.constValues.slice(0),
			structs: fn.structs && fn.structs.slice(0),
			code: fn.code,
			main: fn.main
		};

		const modules = resolver.resolve(fn.modules);
		for (const module of modules) {
			mergeModule(merged, module);
		}

		return merged;
	}

} // ns sd.render
