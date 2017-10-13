// entity/mesh - Mesh component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	//  __  __        _    
	// |  \/  |___ __| |_  
	// | |\/| / -_|_-< ' \ 
	// |_|  |_\___/__/_||_|
	//                     

	export const enum MeshFeatures {
		VertexPositions = 1,
		VertexNormals = 2,
		VertexTangents = 4,
		VertexUVs = 8,
		VertexColours = 16,
		VertexWeights = 32,
		Indexes = 64
	}

	export const enum MeshShapeType {
		Plane,
		Box,
		Capsule,
		Cylinder,
		Spheroid,
		Cone,
		ConvexMesh,
		ConcaveMesh
	}

	export type MeshInstance = Instance<MeshComponent>;
	export type MeshRange = InstanceRange<MeshComponent>;
	export type MeshSet = InstanceSet<MeshComponent>;
	export type MeshIterator = InstanceIterator<MeshComponent>;
	export type MeshArrayView = InstanceArrayView<MeshComponent>;


	export class MeshComponent implements Component<MeshComponent> {
		private instanceData_: container.MultiArrayBuffer;
		private featuresBase_: ConstEnumArrayView<MeshFeatures>;
		private shapeBase_: ConstEnumArrayView<MeshShapeType>;
		private indexElementTypeBase_: ConstEnumArrayView<meshdata.IndexElementType>;
		private uniformPrimTypeBase_: ConstEnumArrayView<meshdata.PrimitiveType>;
		private totalElementCountBase_: Int32Array;
		private subMeshOffsetCountBase_: Int32Array;

		private subMeshData_: container.MultiArrayBuffer;
		private smPrimTypeBase_: ConstEnumArray32View<meshdata.PrimitiveType>;
		private smFromElementBase_: Int32Array;
		private smElementCountBase_: Int32Array;
		private smMaterialBase_: Int32Array;

		private entityMap_: Map<Entity, MeshInstance>;
		private assetMeshMap_: WeakMap<meshdata.MeshData, MeshInstance>;
		private meshes_: meshdata.MeshData[];

		constructor() {
			const instanceFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // features
				{ type: SInt32, count: 1 }, // shape
				{ type: SInt32, count: 1 }, // indexElementType (None if no indexBuffer)
				{ type: SInt32, count: 1 }, // uniformPrimType (None if not uniform over all groups)
				{ type: SInt32, count: 1 }, // totalElementCount
				{ type: SInt32, count: 2 }, // subMeshOffsetCount ([0]: offset, [1]: count)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instanceFields);
			this.rebaseInstances();

			const smFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // primType
				{ type: SInt32, count: 1 }, // fromElement
				{ type: SInt32, count: 1 }, // elementCount
				{ type: SInt32, count: 1 }, // materialIx - mesh-local zero-based material indexes
			];
			this.subMeshData_ = new container.MultiArrayBuffer(4096, smFields);
			this.rebaseSubMeshes();

			this.entityMap_ = new Map<Entity, MeshInstance>();
			this.assetMeshMap_ = new WeakMap<meshdata.MeshData, MeshInstance>();
			this.meshes_ = [];
		}

		rebaseInstances() {
			this.featuresBase_ = this.instanceData_.indexedFieldView(0);
			this.shapeBase_ = this.instanceData_.indexedFieldView(1);
			this.indexElementTypeBase_ = this.instanceData_.indexedFieldView(2);
			this.uniformPrimTypeBase_ = this.instanceData_.indexedFieldView(3);
			this.totalElementCountBase_ = this.instanceData_.indexedFieldView(4);
			this.subMeshOffsetCountBase_ = this.instanceData_.indexedFieldView(5);
		}

		rebaseSubMeshes() {
			this.smPrimTypeBase_ = this.subMeshData_.indexedFieldView(0);
			this.smFromElementBase_ = this.subMeshData_.indexedFieldView(1);
			this.smElementCountBase_ = this.subMeshData_.indexedFieldView(2);
			this.smMaterialBase_ = this.subMeshData_.indexedFieldView(3);
		}


		create(mesh: meshdata.MeshData, shape = MeshShapeType.ConcaveMesh): MeshInstance {
			if (this.assetMeshMap_.has(mesh)) {
				return this.assetMeshMap_.get(mesh)!;
			}

			// -- ensure space in instance and dependent arrays
			if (this.instanceData_.extend() === container.InvalidatePointers.Yes) {
				this.rebaseInstances();
			}
			const instance = this.instanceData_.count;

			let meshFeatures: MeshFeatures = 0;

			// -- set the appropriate mesh feature flags based on available attributes
			for (const layout of mesh.layout.layouts) {
				for (const attr of layout.attributes) {
					switch (attr.role) {
						case meshdata.VertexAttributeRole.Position: meshFeatures |= MeshFeatures.VertexPositions; break;
						case meshdata.VertexAttributeRole.Normal: meshFeatures |= MeshFeatures.VertexNormals; break;
						case meshdata.VertexAttributeRole.Tangent: meshFeatures |= MeshFeatures.VertexTangents; break;
						case meshdata.VertexAttributeRole.UV0: meshFeatures |= MeshFeatures.VertexUVs; break; // UV1,2,3 can only occur alongside UV0
						case meshdata.VertexAttributeRole.Colour: meshFeatures |= MeshFeatures.VertexColours; break;
						case meshdata.VertexAttributeRole.WeightedPos0: meshFeatures |= MeshFeatures.VertexWeights; break;
						default: break;
					}
				}
			}

			// -- allocate gpu index buffer if present and cache some index info as it is accessed frequently
			if (mesh.indexBuffer) {
				meshFeatures |= MeshFeatures.Indexes;
				this.indexElementTypeBase_[instance] = mesh.indexBuffer.indexElementType;
			}
			else {
				this.indexElementTypeBase_[instance] = meshdata.IndexElementType.None;
			}

			// -- cache submesh metadata
			const subMeshCount = mesh.subMeshes.length;
			assert(subMeshCount > 0, "No submeshes present in meshData");
			let subMeshIndex = this.subMeshData_.count;
			if (this.subMeshData_.resize(subMeshIndex + subMeshCount) === container.InvalidatePointers.Yes) {
				this.rebaseSubMeshes();
			}
			container.setIndexedVec2(this.subMeshOffsetCountBase_, instance, [subMeshIndex, subMeshCount]);

			let totalElementCount = 0;
			let sharedPrimType = mesh.subMeshes[0].type;

			for (const subMesh of mesh.subMeshes) {
				this.smPrimTypeBase_[subMeshIndex] = subMesh.type;
				this.smFromElementBase_[subMeshIndex] = subMesh.fromElement;
				this.smElementCountBase_[subMeshIndex] = subMesh.elementCount;
				this.smMaterialBase_[subMeshIndex] = subMesh.materialIx;

				totalElementCount += subMesh.elementCount;
				if (subMesh.type !== sharedPrimType) {
					sharedPrimType = meshdata.PrimitiveType.None;
				}
				subMeshIndex += 1;
			}

			// -- store mesh features accumulated during the creation process
			this.featuresBase_[instance] = meshFeatures;
			this.shapeBase_[instance] = shape;
			this.uniformPrimTypeBase_[instance] = sharedPrimType;
			this.totalElementCountBase_[instance] = totalElementCount;

			// -- remember that we've already instantiated this asset
			this.assetMeshMap_.set(mesh, instance);
			this.meshes_[instance] = mesh;

			return instance;
		}


		linkToEntity(inst: MeshInstance, ent: Entity) {
			this.entityMap_.set(ent, inst);
		}

		removeFromEntity(_inst: MeshInstance, ent: Entity) {
			this.entityMap_.delete(ent);
		}

		forEntity(ent: Entity): MeshInstance {
			return this.entityMap_.get(ent) || 0;
		}

		destroy(_inst: MeshInstance) {
			// TODO: remove mesh from all instances (add a reverse map->entities map?)
			// TODO: zero+free all array segments
		}

		destroyRange(range: MeshRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() { return this.instanceData_.count; }

		valid(inst: MeshInstance) {
			return inst <= this.count;
		}

		all(): MeshRange {
			return new InstanceLinearRange<MeshComponent>(1, this.count);
		}

		// -- single instance getters

		mesh(inst: MeshInstance) {
			return this.meshes_[inst as number];
		}

		subMeshCount(inst: MeshInstance) {
			const offsetCount = container.copyIndexedVec2(this.subMeshOffsetCountBase_, inst as number);
			return offsetCount[1];
		}

		subMeshes(inst: MeshInstance) {
			const subMeshes: meshdata.SubMesh[] = [];
			const meshIx = inst as number;
			const offsetCount = container.copyIndexedVec2(this.subMeshOffsetCountBase_, meshIx);

			for (let smix = 0; smix < offsetCount[1]; ++smix) {
				const smOffset = smix + offsetCount[0];

				subMeshes.push({
					type: this.smPrimTypeBase_[smOffset],
					fromElement: this.smFromElementBase_[smOffset],
					elementCount: this.smElementCountBase_[smOffset],
					materialIx: this.smMaterialBase_[smOffset]
				});
			}
			return subMeshes;
		}

		features(inst: MeshInstance): MeshFeatures { return this.featuresBase_[inst as number]; }
		shape(inst: MeshInstance): MeshShapeType { return this.shapeBase_[inst as number]; }

		indexBufferElementType(inst: MeshInstance): meshdata.IndexElementType { return this.indexElementTypeBase_[inst as number]; }
		uniformPrimitiveType(inst: MeshInstance) { return this.uniformPrimTypeBase_[inst as number]; }
		totalElementCount(inst: MeshInstance) { return this.totalElementCountBase_[inst as number]; }
	}

} // ns sd.entity
