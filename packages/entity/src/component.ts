/**
 * entity/component - component class interface
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Instance, InstanceRange } from "./instance";

export interface Component<C> {
	readonly count: number;

	valid(inst: Instance<C>): boolean;

	destroy(inst: Instance<C>): void;
	destroyRange(range: InstanceRange<C>): void;

	all(): InstanceRange<C>;
}
