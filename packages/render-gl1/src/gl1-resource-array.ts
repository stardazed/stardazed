/**
 * render-gl1/resource-array - Hashed render resource array
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { RenderResourceBase, ResourceType } from "@stardazed/render";

export function encodeResourceHandle(type: ResourceType, index: number) {
	return (type << 24) | index;
}

export function decodeResourceHandle(handle: number) {
	const index = handle & 0x00FFFFFF;
	const type = (handle >>> 24) as ResourceType;
	return { type, index };
}

export class ReusableResourceArray<C extends RenderResourceBase, R> {
	private readonly resources: (R | undefined)[] = [];
	private readonly freedIndexes_: number[] = [];
	private nextIndex_ = 1;

	constructor(public readonly resourceType: ResourceType) {}

	insert(clientResource: C, resource: R) {
		let index: number;
		if (this.freedIndexes_.length) {
			index = this.freedIndexes_.pop()!;
		}
		else {
			index = this.nextIndex_;
			this.nextIndex_ += 1;
		}

		this.resources[index] = resource;
		clientResource.renderResourceHandle = encodeResourceHandle(this.resourceType, index);
		return index;
	}

	getByHandle(handle: number): R | undefined {
		const { index } = decodeResourceHandle(handle);
		return this.resources[index];
	}

	find(clientResource: C): R | undefined {
		const { index } = decodeResourceHandle(clientResource.renderResourceHandle);
		return this.resources[index];
	}

	findMultiple(clientResources: C[]): (R | undefined)[] {
		return clientResources.map(cr => {
			const { index } = decodeResourceHandle(cr.renderResourceHandle);
			return this.resources[index];
		});
	}

	remove(clientResource: C) {
		const { index } = decodeResourceHandle(clientResource.renderResourceHandle!);
		clientResource.renderResourceHandle = 0;

		this.resources[index] = undefined;
		this.freedIndexes_.push(index);
		return index;
	}
}
