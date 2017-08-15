// entity/meshrenderer - associate meshes with materials and render metadata
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export type MeshRendererInstance = Instance<MeshRendererComponent>;
	export type MeshRendererRange = InstanceRange<MeshRendererComponent>;
	export type MeshRendererSet = InstanceSet<MeshRendererComponent>;
	export type MeshRendererIterator = InstanceIterator<MeshRendererComponent>;
	export type MeshRendererArrayView = InstanceArrayView<MeshRendererComponent>;

	export interface MeshRendererDescriptor {
		materials: render.EffectData[];
		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}

	export const enum MeshRendererFlags {
		Enabled = 1,
		CastsShadows = 2,
		AcceptsShadows = 4
	}

	function flagsForDescriptor(desc: MeshRendererDescriptor) {
		let flags = MeshRendererFlags.Enabled;
		if (desc.castsShadows) {
			flags |= MeshRendererFlags.CastsShadows;
		}
		if (desc.acceptsShadows) {
			flags |= MeshRendererFlags.AcceptsShadows;
		}
		return flags;
	}

	export class MeshRendererComponent implements Component<MeshRendererComponent> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private flagsBase_: ConstEnumArrayView<MeshRendererFlags>;
		private materialOffsetCountBase_: Int32Array;

		private materials_: render.EffectData[];

		constructor() {
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: UInt8,  count: 1 }, // flags
				{ type: SInt32, count: 2 }, // materialOffsetCount ([0]: offset, [1]: count)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);

			this.rebase();

			this.materials_ = [];
		}

		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.flagsBase_ = this.instanceData_.indexedFieldView(1);
			this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(2);
		}

		create(entity: Entity, desc: MeshRendererDescriptor): MeshRendererInstance {
			if (this.instanceData_.extend() === container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const ix = this.instanceData_.count;

			this.entityBase_[ix] = entity as number;
			this.flagsBase_[ix] = flagsForDescriptor(desc);

			// -- save material indexes
			assert(desc.materials.length > 0, "Must specify at least 1 material.");
			container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
			for (const mat of desc.materials) {
				this.materials_.push(mat);
			}

			return ix;
		}

		destroy(inst: MeshRendererInstance) {
			const ix = inst as number;
			this.entityBase_[ix] = 0;
			this.flagsBase_[ix] = 0;
			container.setIndexedVec2(this.materialOffsetCountBase_, ix, [0, 0]);
		}

		destroyRange(range: MeshRendererRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() {
			return this.instanceData_.count;
		}

		valid(inst: MeshRendererInstance) {
			return inst > 0 && inst <= this.count && this.entityBase_[inst as number] !== 0;
		}

		all(): MeshRendererRange {
			return new InstanceLinearRange<MeshRendererComponent>(1, this.count);
		}

		// -- supply cmdbuf with renderjobs
		render(range: MeshRendererRange, cmdBuf: render.RenderCommandBuffer) {
			const iter = range.makeIterator();
			while (iter.next()) {
				cmdBuf.render({} as render.RenderJob, 0);
			}
		}

		// -- single instance accessors
		entity(inst: MeshRendererInstance): Entity {
			return this.entityBase_[inst as number];
		}

		enabled(inst: MeshRendererInstance): boolean {
			return (this.flagsBase_[inst as number] & MeshRendererFlags.Enabled) !== 0;
		}

		setEnabled(inst: MeshRendererInstance, newEnabled: boolean) {
			if (newEnabled) {
				this.flagsBase_[inst as number] &= ~MeshRendererFlags.Enabled;
			}
			else {
				this.flagsBase_[inst as number] |= MeshRendererFlags.Enabled;
			}
		}

		castsShadows(inst: MeshRendererInstance): boolean {
			return (this.flagsBase_[inst as number] & MeshRendererFlags.CastsShadows) !== 0;
		}

		setCastsShadows(inst: MeshRendererInstance, newCasts: boolean) {
			if (newCasts) {
				this.flagsBase_[inst as number] &= ~MeshRendererFlags.CastsShadows;
			}
			else {
				this.flagsBase_[inst as number] |= MeshRendererFlags.CastsShadows;
			}
		}

		acceptsShadows(inst: MeshRendererInstance): boolean {
			return (this.flagsBase_[inst as number] & MeshRendererFlags.AcceptsShadows) !== 0;
		}

		setAcceptsShadows(inst: MeshRendererInstance, newAccepts: boolean) {
			if (newAccepts) {
				this.flagsBase_[inst as number] &= ~MeshRendererFlags.AcceptsShadows;
			}
			else {
				this.flagsBase_[inst as number] |= MeshRendererFlags.AcceptsShadows;
			}
		}

		materials(inst: MeshRendererInstance): render.EffectData[] {
			const ocbIndex = (inst as number) * 2;
			const offset = this.materialOffsetCountBase_[ocbIndex];
			const count = this.materialOffsetCountBase_[ocbIndex + 1];
			return this.materials_.slice(offset, offset + count);
		}
	}

} // ns sd.world
