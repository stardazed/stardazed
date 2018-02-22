// render/core/gl1/tools - WebGL1 device utility types
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	export function encodeResourceHandle(type: ResourceType, index: number) {
		return (type << 24) | index;
	}

	export function decodeResourceHandle(handle: number) {
		const index = handle & 0x00FFFFFF;
		const type = (handle >> 24) as ResourceType;
		return { type, index };
	}

	export class ReusableResourceArray<C extends RenderResourceBase, R> {
		readonly resources: (R | undefined)[] = [];
		private freedIndexes_: number[] = [];
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

} // ns sd.render.gl1
