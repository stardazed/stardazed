// render/effect/module-resolver - module dependency resolution
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.effect {

	/**
	 * Concept names start with a capital letter
	 * @internal
	 * @param name name of a module dependency
	 */
	const isConceptName = (name: string) =>
		name.charAt(0) === name.charAt(0).toUpperCase();

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

			function mergeProviders(into: BranchMap, from: BranchMap) {
				for (const cn in from) {
					if (from.hasOwnProperty(cn)) {
						if (cn in into) {
							throw new Error(`Duplicate provider for concept: ${cn}`);
						}
						into[cn] = from[cn];
					}
				}
			}
	
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
			function resolveBranch(b: Branch, path: string[] = []) {
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
			}
	
			return resolveBranch(main);
		}
	
		resolve(moduleNames: string[]) {
			const { branch, providers } = this.resolveDependencies(moduleNames);
			const resolved = this.resolveConcepts(branch, providers);
			return container.stableUnique(resolved) as Module[];
		}
	}

} // ns sd.render.effect
