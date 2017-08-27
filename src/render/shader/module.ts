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

	function normalizeConditionals<T extends object>(items: Conditional<T>[]): Conditional<T>[] {
		const finalExpr = items.map(t => t.ifExpr).reduce(
			(cur, next) => {
				if (cur === undefined || next === undefined || next === "") {
					return undefined;
				}
				return cur.length ? (`${cur} || (${next})`) : `(${next})`;
			}
		, "");

		return items.map(t => ({
			...(t as any), // this cast is a workaround for https://github.com/Microsoft/TypeScript/issues/10727 (will be fixed in TS 2.6)
			ifExpr: finalExpr
		}));
	}

	function normalizeExtensions(exts: Conditional<ExtensionUsage>[]) {
		// by sorting by reverse action,
		// any duplicates will have action "require" before "enable".
		// stableUnique will then pick the 1st one and  
		return container.stableUnique(exts.sort((a, b) => {
			return (
				container.stringOrder(b.action, a.action)
			);
		}));
	}

	function normalizeSamplers(samps: Conditional<SamplerSlot>[]) {
		return samps;
	}

	function normalizeConstants(cons: Conditional<ShaderConstant>[]) {
		return cons;
	}

	function normalizeConstValues(cvs: Conditional<ShaderConstValue>[]) {
		return cvs;
	}

	function normalizeStructs(structs: Conditional<ShaderStruct>[]) {
		return structs;
	}

	export function normalizeFunction(fn: ShaderFunction) {
		if (fn.extensions && fn.extensions.length > 1) {
			fn.extensions = normalizeExtensions(normalizeConditionals(fn.extensions));
		}
		if (fn.samplers && fn.samplers.length > 1) {
			fn.samplers = normalizeSamplers(normalizeConditionals(fn.samplers));
		}
		if (fn.constants && fn.constants.length > 1) {
			fn.constants = normalizeConstants(normalizeConditionals(fn.constants));
		}
		if (fn.constValues && fn.constValues.length > 1) {
			fn.constValues = normalizeConstValues(normalizeConditionals(fn.constValues));
		}
		if (fn.structs && fn.structs.length > 1) {
			fn.structs = normalizeStructs(normalizeConditionals(fn.structs));
		}
		
		return fn;
	}
		
	function mergeModule(dest: ShaderModule, source: Readonly<ShaderModule>) {
		if (source.extensions && source.extensions.length) {
			dest.extensions!.push(...source.extensions);
		}
		if (source.samplers && source.samplers.length) {
			dest.samplers!.push(...source.samplers);
		}
		if (source.constants && source.constants.length) {
			dest.constants!.push(...source.constants);
		}
		if (source.constValues && source.constValues.length) {
			dest.constValues!.push(...source.constValues);
		}
		if (source.structs && source.structs.length) {
			dest.structs!.push(...source.structs);
		}
		if (source.code) {
			dest.code += `// ------------\n${source.code}\n`;
		}
		return dest;
	}

	export function flattenFunction<Module extends ModuleBase & ShaderModule>(fn: Readonly<ShaderFunction>, resolver: ModuleResolver<Module>): ShaderFunction {
		if (! (fn.modules && fn.modules.length)) {
			return fn;
		}

		const merged: ShaderFunction = {
			extensions: fn.extensions ? fn.extensions.slice(0) : [],
			samplers: fn.samplers ? fn.samplers.slice(0) : [],
			constants: fn.constants ? fn.constants.slice(0) : [],
			constValues: fn.constValues ? fn.constValues.slice(0) : [],
			structs: fn.structs ? fn.structs.slice(0) : [],
			code: fn.code || "",
			main: fn.main
		};

		const modules = resolver.resolve(fn.modules);
		
		for (const module of modules) {
			mergeModule(merged, module);
		}

		return merged;
	}

} // ns sd.render
