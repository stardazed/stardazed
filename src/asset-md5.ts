// asset-md5.ts - MD5 file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export namespace md5 {

		interface VertexData {
			uvs: Float32Array;
			weightOffsetsCounts: Int32Array;
		}


		interface WeightData {
			joints: Int32Array;
			biases: Float32Array;
			positions: Float32Array;
		}


		function constructBindPosePositions(vertexes: VertexData, weights: WeightData, joints: Transform[]) {
			var count = vertexes.uvs.length / 2;
			var positions = new Float32Array(count * 3);

			for (var vix = 0; vix < count; ++vix) {
				var vpos = [0, 0, 0];
				var vOff2 = vix * 2;

				var weightStart = vertexes.weightOffsetsCounts[vOff2];
				var weightEnd = weightStart + vertexes.weightOffsetsCounts[vOff2 + 1];

				for (var wix = weightStart; wix < weightEnd; ++wix) {
					var jix = weights.joints[wix];
					var joint = joints[jix];
					var bias = weights.biases[wix];
					var weightPos = container.copyIndexedVec3(weights.positions, wix);

					var weightRelPos = vec3.transformQuat([], weightPos, joint.rotation);
					vec3.add(weightRelPos, weightRelPos, joint.position);
					vec3.scaleAndAdd(vpos, vpos, weightRelPos, bias);
				}

				container.setIndexedVec3(positions, vix, vpos);
			}

			return positions;
		}


		function constructJointDataTexture(joints: Transform[]): Texture2D {
			var texData = new Float32Array(256 * 256 * 4);
			for (var ji = 0; ji < joints.length; ++ji) {
				var j = joints[ji];
				var pos = [j.position[0], j.position[1], j.position[2], 0];
				var texelBaseIndex = ji * 8;

				var xform = mat4.fromRotationTranslation([], j.rotation, j.position);

				container.setIndexedVec4(texData, texelBaseIndex, pos);
				container.setIndexedVec4(texData, texelBaseIndex + 1, j.rotation);
				container.setIndexedVec4(texData, texelBaseIndex + 2, j.rotation);
				container.setIndexedMat4(texData, (ji * 2) + 1, xform);
			}

			var td = render.makeTexDesc2D(render.PixelFormat.RGBA32F, 256, 256, render.UseMipMaps.No);
			td.pixelData = [texData];
			td.sampling.magFilter = render.TextureSizingFilter.Nearest;
			td.sampling.minFilter = render.TextureSizingFilter.Nearest;
			td.sampling.repeatS = render.TextureRepeatMode.ClampToEdge;
			td.sampling.repeatT = render.TextureRepeatMode.ClampToEdge;

			return {
				name: "jointData",
				userRef: 1000,
				descriptor: td,
				useMipMaps: render.UseMipMaps.No
			};
		}


		function constructSkinnedMeshStreams(vertexes: VertexData, weights: WeightData) {
			var count = vertexes.uvs.length / 2;
			var jointIndexes = new Float32Array(count * 4);
			var weightPos0 = new Float32Array(count * 4);
			var weightPos1 = new Float32Array(count * 4);
			var weightPos2 = new Float32Array(count * 4);
			var weightPos3 = new Float32Array(count * 4);
			var weightPosArray = [weightPos0, weightPos1, weightPos2, weightPos3];

			for (var vix = 0; vix < count; ++vix) {
				var vOff2 = vix * 2;
				var vji = [-1, -1, -1, -1];

				var weightStart = vertexes.weightOffsetsCounts[vOff2];
				var weightCount = vertexes.weightOffsetsCounts[vOff2 + 1];

				for (var wi = 0; wi < 4; ++wi) {
					if (wi < weightCount) {
						var jix = weights.joints[wi + weightStart];
						var weightPos = container.copyIndexedVec3(weights.positions, wi + weightStart);
						weightPos[3] = weights.biases[wi + weightStart];
						
						vji[wi] = jix;
						container.setIndexedVec4(weightPosArray[wi], vix, weightPos);
					}
				}
				container.setIndexedVec4(jointIndexes, vix, vji);
			}

			var streams: mesh.VertexAttributeStream[] = [
				{
					name: "weightPos0",
					attr: { field: mesh.VertexField.Floatx4, role: mesh.VertexAttributeRole.WeightedPos0 },
					mapping: mesh.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos0
				},
				{
					name: "weightPos1",
					attr: { field: mesh.VertexField.Floatx4, role: mesh.VertexAttributeRole.WeightedPos1 },
					mapping: mesh.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos1
				},
				{
					name: "weightPos2",
					attr: { field: mesh.VertexField.Floatx4, role: mesh.VertexAttributeRole.WeightedPos2 },
					mapping: mesh.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos2
				},
				{
					name: "weightPos3",
					attr: { field: mesh.VertexField.Floatx4, role: mesh.VertexAttributeRole.WeightedPos3 },
					mapping: mesh.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos3
				},
				{
					name: "jointIndexes",
					attr: { field: mesh.VertexField.Floatx4, role: mesh.VertexAttributeRole.JointIndexes },
					mapping: mesh.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: jointIndexes
				}
			];
			return streams;
		}


		export class MD5MeshBuilder implements parse.MD5MeshDelegate {
			private joints: Transform[] = [];
			private flatJointModels = new Map<number, Model>();
			private vertexes: VertexData;
			private triangles: Int32Array;
			private weights: WeightData;
			private assets_: AssetGroup;
			private curMaterial: Material;
			private meshCount_ = 0;
			private jointDataTexture_: Texture2D = null;

			constructor(private filePath: string) {
				this.assets_ = new AssetGroup();
			}

			jointCount(count: number) {
			}

			beginJoints() {
			}

			joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4) {
				var jm = makeModel(name, index);
				jm.joint = { root: parentIndex == -1 };
				this.joints.push({
					position: modelPos,
					rotation: modelRot,
					scale: [1, 1, 1]
				});
				this.flatJointModels.set(index, jm);

				vec3.copy(jm.transform.position, modelPos);
				quat.copy(jm.transform.rotation, modelRot);
				
				if (parentIndex > -1) {
					var pj = this.joints[parentIndex];
					var pjm = this.flatJointModels.get(parentIndex);
					pjm.children.push(jm);
					jm.parent = pjm;

					var invParentQuat = quat.invert([], pj.rotation);
					quat.mul(jm.transform.rotation, invParentQuat, jm.transform.rotation);

					var parentMat = mat4.fromRotationTranslation([], pj.rotation, pj.position);
					var invParentMat = mat4.invert([], parentMat);
					vec3.transformMat4(jm.transform.position, jm.transform.position, invParentMat);
				}
				else {
					this.assets_.addModel(jm);
				}
			}

			endJoints() {
				this.jointDataTexture_ = constructJointDataTexture(this.joints);
			}

			meshCount(count: number) {
			}

			beginMesh() {
				this.vertexes = null;
				this.triangles = null;
				this.weights = null;
			}

			materialName(name: string) {
				var m = makeMaterial();
				vec3.set(m.diffuseColour, 0.8, 0.8, 0.8);
				if (name) {
					m.diffuseTexture = {
						name: name,
						filePath: name,
						useMipMaps: render.UseMipMaps.No
					};
				}
				m.jointDataTexture = this.jointDataTexture_;
				
				this.assets_.addMaterial(m);
				this.curMaterial = m;
			}

			vertexCount(count: number) {
				if (count == 0) {
					this.vertexes = null;
				}
				else {
					this.vertexes = {
						uvs: new Float32Array(count * 2),
						weightOffsetsCounts: new Int32Array(count * 2)
					};
				}
			}

			vertex(index: number, uv: Float2, weightOffset: number, weightCount: number) {
				var io = index * 2;
				this.vertexes.uvs[io] = uv[0];
				this.vertexes.uvs[io + 1] = uv[1];
				this.vertexes.weightOffsetsCounts[io] = weightOffset;
				this.vertexes.weightOffsetsCounts[io + 1] = weightCount;
			}

			triangleCount(count: number) {
				if (count == 0) {
					this.triangles = null;
				}
				else {
					this.triangles = new Int32Array(count * 3);
				}
			}

			triangle(index: number, indexes: Float3) {
				container.setIndexedVec3(this.triangles, index, indexes);
			}

			weightCount(count: number) {
				if (count == 0) {
					this.weights = null;
				}
				else {
					this.weights = {
						joints: new Int32Array(count),
						biases: new Float32Array(count),
						positions: new Float32Array(count * 3)
					};
				}
			}

			weight(index: number, jointIndex: number, bias: number, jointPos: Float3) {
				this.weights.joints[index] = jointIndex;
				this.weights.biases[index] = bias;
				container.setIndexedVec3(this.weights.positions, index, jointPos);
			}

			endMesh() {
				if (this.vertexes && this.triangles && this.weights) {
					var positions = constructBindPosePositions(this.vertexes, this.weights, this.joints);
					var streams = constructSkinnedMeshStreams(this.vertexes, this.weights);
					streams.push({
						name: "normals",
						attr: { field: mesh.VertexField.Floatx3, role: mesh.VertexAttributeRole.Normal },
						mapping: mesh.VertexAttributeMapping.Vertex,
						includeInMesh: true,
						values: new Float32Array(positions.length)
					});
					streams.push({
						name: "uvs",
						attr: { field: mesh.VertexField.Floatx2, role: mesh.VertexAttributeRole.UV },
						mapping: mesh.VertexAttributeMapping.Vertex,
						includeInMesh: true,
						values: this.vertexes.uvs
					});

					var mb = new mesh.MeshBuilder(positions, streams);
					mb.nextGroup(0);
					var triCount = this.triangles.length / 3;
					var pvi = 0;
					var pi = 0;
					while (triCount--) {
						mb.addPolygon([pvi, pvi + 1, pvi + 2], container.copyIndexedVec3(this.triangles, pi));
						pvi += 3;
						pi += 1;
					}

					var md = mb.complete();
					md.genVertexNormals();
					var sdMesh: Mesh = {
						name: "",
						userRef: this.meshCount_++,
						meshData: md,
						indexMap: mb.indexMap,
						positions: positions,
						streams: streams
					};
					this.assets_.addMesh(sdMesh);

					var mm = makeModel("mesh");
					mm.mesh = sdMesh;
					mm.materials = [this.curMaterial];
					this.assets_.addModel(mm);
				}
			}

			error(msg: string, offset: number, token?: string) {
				console.warn("MD5 Mesh parse error @ offset " + offset + ": " + msg, token);
			}

			completed() {
			}

			private loadTextures() {
				// var fileProms: Promise<Texture2D>[] = [];

				// this.assets_.materials.forEach(mat => {
				// 	if (!(mat.diffuseTexture && mat.diffuseTexture.filePath)) {
				// 		return;
				// 	}

				// 	let resolvedFilePath = resolveRelativeFilePath(mat.diffuseTexture.filePath, this.filePath);
				// 	fileProms.push(
				// 		loadImage(resolvedFilePath).then((img) => {
				// 			mat.diffuseTexture.descriptor = render.makeTexDesc2DFromImageSource(img, mat.diffuseTexture.useMipMaps);
				// 			return mat.diffuseTexture;
				// 		}).catch((error) => {
				// 			console.warn(error);
				// 			return <Texture2D>null;
				// 		})
				// 	);
				// });

				// return Promise.all(fileProms).then((textures) => {
				// 	for (var tex of textures) {
				// 		this.assets_.addTexture(tex);
				// 	}
				// 	return group;
				// }, () => null);
			}

			assets() {
				return this.assets_;
			}
		}

	} // ns md5


	function parseMD5MeshSource(filePath: string, source: string): AssetGroup {
		var t0 = performance.now();
		var del = new md5.MD5MeshBuilder(filePath);
		var parser = new md5.parse.MD5MeshParser(source, del);
		parser.parse();
		// return del.assets.then(grp => {
		// 	console.info("fbx total time: " + (performance.now() - t0).toFixed(1) + "ms");
		// 	return grp;
		// });
		return del.assets();
	}
	

	export function loadMD5Mesh(filePath: string) {
		return loadFile(filePath).then((text: string) => parseMD5MeshSource(filePath, text));
	}

} // ns sd.asset
