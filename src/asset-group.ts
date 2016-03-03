// asset-group.ts - AssetGroup class
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	class AssetImport {
		addMesh(mesh: Mesh) {}
		addTexture(tex: Texture2D) {}
		addMaterial(mat: Material) {}
		addModel(model: Model) {}
		addSkeletonAnimation(anim: SkeletonAnimation) {}
	}

	export class AssetGroup {
		meshes: Mesh[] = [];
		textures: Texture2D[] = [];
		materials: Material[] = [];
		models: Model[] = [];
		anims: SkeletonAnimation[] = [];

		addMesh(mesh: Mesh): number {
			this.meshes.push(mesh);
			return this.meshes.length - 1;
		}

		addTexture(tex: Texture2D): number {
			this.textures.push(tex);
			return this.textures.length - 1;
		}

		addMaterial(mat: Material): number {
			this.materials.push(mat);
			return this.materials.length - 1;
		}

		addModel(model: Model): number {
			this.models.push(model);
			return this.models.length - 1;
		}

		addSkeletonAnimation(anim: SkeletonAnimation) {
			this.anims.push(anim);
			return this.anims.length;
		}
	}

} // ns sd.asset
