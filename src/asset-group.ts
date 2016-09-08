// asset-group.ts - AssetGroup class
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export class AssetGroup {
		meshes: Mesh[] = [];
		textures: (Texture2D | null)[] = []; // FIXME: handling of optional textures
		materials: Material[] = [];
		models: Model[] = [];
		anims: SkeletonAnimation[] = [];

		addMesh(mesh: Mesh): number {
			this.meshes.push(mesh);
			return this.meshes.length - 1;
		}

		addTexture(tex: Texture2D | null): number { // FIXME: handling of optional textures
			this.textures.push(tex);
			return this.textures.length - 1;
		}

		addMaterial(mat: Material): number {
			console.info("Add material: ", mat);
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
