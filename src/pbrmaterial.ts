// pbrmaterial - PBR model material data
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	//  ___ ___ ___ __  __      _           _      _ __  __                             
	// | _ \ _ ) _ \  \/  |__ _| |_ ___ _ _(_)__ _| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | _ / _ \   / |\/| / _` |  _/ -_) '_| / _` | | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_| |___/_|_\_|  |_\__,_|\__\___|_| |_\__,_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                                    |___/         

	export interface PBRMaterialDescriptor {
		baseColour: Float3;             // v3, single colour or tint for diffuse
		metallic: number;               // 0..1
		roughness: number;              // 0..1
	}


	export function makePBRMaterialDescriptor(): PBRMaterialDescriptor {
		return {
			baseColour: vec3.copy([], math.Vec3.one),
			metallic: 0,
			roughness: 0
		};
	}


	export interface PBRMaterialData {
		colourData: Float32Array;     // rgb, 0
		materialParam: Float32Array;  // metallic, roughness, 0, 0
	}


	const enum MetallicElem {
		Metallic = 0,
		Roughness = 1
	}


	export type PBRMaterialInstance = Instance<PBRMaterialManager>;
	export type PBRMaterialRange = InstanceRange<PBRMaterialManager>;
	export type PBRMaterialSet = InstanceSet<PBRMaterialManager>;
	export type PBRMaterialIterator = InstanceIterator<PBRMaterialManager>;
	export type PBRMaterialArrayView = InstanceArrayView<PBRMaterialManager>;
 

	export class PBRMaterialManager implements ComponentManager<PBRMaterialManager> {
		private instanceData_: container.MultiArrayBuffer;

		private baseColourBase_: TypedArray;
		private metallicBase_: TypedArray;

		private tempVec4 = new Float32Array(4);

		constructor() {
			const initialCapacity = 256;

			var fields: container.MABField[] = [
				{ type: Float, count: 4 },  // baseColour[3], 0
				{ type: Float, count: 4 },  // metallic, roughness, 0, 0
			];

			this.instanceData_ = new container.MultiArrayBuffer(initialCapacity, fields);
			this.rebase();
		}


		private rebase() {
			this.baseColourBase_ = this.instanceData_.indexedFieldView(0);
			this.metallicBase_ = this.instanceData_.indexedFieldView(1);
		}


		create(desc: PBRMaterialDescriptor): PBRMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var matIndex = this.instanceData_.count; // entry 0 is reserved as nullptr-like

			vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
			container.setIndexedVec4(this.baseColourBase_, matIndex, this.tempVec4);
			vec4.set(this.tempVec4, desc.metallic, desc.roughness, 0, 0);
			container.setIndexedVec4(this.metallicBase_, matIndex, this.tempVec4);

			return matIndex;
		}


		destroy(inst: PBRMaterialInstance) {
			var matIndex = <number>inst;

			container.setIndexedVec4(this.baseColourBase_, matIndex, math.Vec4.zero);
			container.setIndexedVec4(this.metallicBase_, matIndex, math.Vec4.zero);
		}


		destroyRange(range: PBRMaterialRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}



		get count() { return this.instanceData_.count; }

		valid(inst: PBRMaterialInstance) {
			return <number>inst <= this.count;
		}

		all(): PBRMaterialRange {
			return new InstanceLinearRange<PBRMaterialManager>(1, this.count);
		}


		// -- individual element field accessors
		baseColour(inst: PBRMaterialInstance): Float3 {
			var offset = <number>inst * 4;
			return [
				this.baseColourBase_[offset],
				this.baseColourBase_[offset + 1],
				this.baseColourBase_[offset + 2]
			];
		}

		setBaseColour(inst: PBRMaterialInstance, newColour: Float3) {
			var offset = <number>inst * 4;
			this.baseColourBase_[offset]     = newColour[0];
			this.baseColourBase_[offset + 1] = newColour[1];
			this.baseColourBase_[offset + 2] = newColour[2];
		}


		metallic(inst: PBRMaterialInstance): number {
			return this.metallicBase_[(<number>inst * 4) + MetallicElem.Metallic];
		}

		setMetallic(inst: PBRMaterialInstance, newMetallic: number) {
			this.metallicBase_[(<number>inst * 4) + MetallicElem.Metallic] = newMetallic;
		}


		roughness(inst: PBRMaterialInstance): number {
			return this.metallicBase_[(<number>inst * 4) + MetallicElem.Roughness];
		}

		setRoughness(inst: PBRMaterialInstance, newRoughness: number) {
			this.metallicBase_[(<number>inst * 4) + MetallicElem.Roughness] = newRoughness;
		}


		// direct data views to set uniforms with in PBRModelMgr
		getData(inst: PBRMaterialInstance): PBRMaterialData {
			var matIndex = <number>inst;

			return {
				colourData: <Float32Array>container.refIndexedVec4(this.baseColourBase_, matIndex),
				materialParam: <Float32Array>container.refIndexedVec4(this.metallicBase_, matIndex),
			};
		}
	}

} // ns sd.world
