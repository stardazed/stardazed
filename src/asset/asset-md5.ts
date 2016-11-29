// asset-md5.ts - MD5 file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="asset.ts" />

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
			const count = vertexes.uvs.length / 2;
			const positions = new Float32Array(count * 3);

			for (let vix = 0; vix < count; ++vix) {
				const vpos = [0, 0, 0];
				const vOff2 = vix * 2;

				const weightStart = vertexes.weightOffsetsCounts[vOff2];
				const weightEnd = weightStart + vertexes.weightOffsetsCounts[vOff2 + 1];

				for (let wix = weightStart; wix < weightEnd; ++wix) {
					const jix = weights.joints[wix];
					const joint = joints[jix];
					const bias = weights.biases[wix];
					const weightPos = container.copyIndexedVec3(weights.positions, wix);

					const weightRelPos = vec3.transformQuat([], weightPos, joint.rotation);
					vec3.add(weightRelPos, weightRelPos, joint.position);
					vec3.scaleAndAdd(vpos, vpos, weightRelPos, bias);
				}

				container.setIndexedVec3(positions, vix, vpos);
			}

			return positions;
		}


		function constructSkinnedMeshStreams(vertexes: VertexData, weights: WeightData) {
			const count = vertexes.uvs.length / 2;
			const jointIndexes = new Float32Array(count * 4);
			const weightPos0 = new Float32Array(count * 4);
			const weightPos1 = new Float32Array(count * 4);
			const weightPos2 = new Float32Array(count * 4);
			const weightPos3 = new Float32Array(count * 4);
			const weightPosArray = [weightPos0, weightPos1, weightPos2, weightPos3];

			for (let vix = 0; vix < count; ++vix) {
				const vOff2 = vix * 2;
				const vji = [-1, -1, -1, -1];

				const weightStart = vertexes.weightOffsetsCounts[vOff2];
				const weightCount = vertexes.weightOffsetsCounts[vOff2 + 1];

				for (let wi = 0; wi < 4; ++wi) {
					if (wi < weightCount) {
						const jix = weights.joints[wi + weightStart];
						const weightPos = container.copyIndexedVec3(weights.positions, wi + weightStart);
						weightPos[3] = weights.biases[wi + weightStart];

						vji[wi] = jix;
						container.setIndexedVec4(weightPosArray[wi], vix, weightPos);
					}
				}
				container.setIndexedVec4(jointIndexes, vix, vji);
			}

			const streams: meshdata.VertexAttributeStream[] = [
				{
					name: "weightPos0",
					attr: { field: meshdata.VertexField.Floatx4, role: meshdata.VertexAttributeRole.WeightedPos0 },
					mapping: meshdata.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos0
				},
				{
					name: "weightPos1",
					attr: { field: meshdata.VertexField.Floatx4, role: meshdata.VertexAttributeRole.WeightedPos1 },
					mapping: meshdata.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos1
				},
				{
					name: "weightPos2",
					attr: { field: meshdata.VertexField.Floatx4, role: meshdata.VertexAttributeRole.WeightedPos2 },
					mapping: meshdata.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos2
				},
				{
					name: "weightPos3",
					attr: { field: meshdata.VertexField.Floatx4, role: meshdata.VertexAttributeRole.WeightedPos3 },
					mapping: meshdata.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: weightPos3
				},
				{
					name: "jointIndexes",
					attr: { field: meshdata.VertexField.Floatx4, role: meshdata.VertexAttributeRole.JointIndexes },
					mapping: meshdata.VertexAttributeMapping.Vertex,
					includeInMesh: true,
					values: jointIndexes
				}
			];
			return streams;
		}


		export class MD5MeshBuilder implements parse.MD5MeshDelegate {
			private joints: Transform[] = [];
			private flatJointModels = new Map<number, Model>();
			private vertexes: VertexData | null;
			private triangles: Int32Array | null;
			private weights: WeightData | null;
			private assets_: AssetGroup;
			private curMaterial: Material;
			private meshCount_ = 0;
			private textures_ = new Map<string, Texture2D>();

			constructor(private filePath: string) {
				this.assets_ = new AssetGroup();
			}

			jointCount(_count: number) { /* ignored */ }

			beginJoints() { /* ignored */ }

			joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4) {
				const jm = makeModel(name, index);
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
					const pj = this.joints[parentIndex];
					const pjm = this.flatJointModels.get(parentIndex)!;
					pjm.children.push(jm);
					jm.parent = pjm;

					const invParentQuat = quat.invert([], pj.rotation);
					quat.mul(jm.transform.rotation, invParentQuat, jm.transform.rotation);

					const parentMat = mat4.fromRotationTranslation([], pj.rotation, pj.position);
					const invParentMat = mat4.invert([], parentMat);
					vec3.transformMat4(jm.transform.position, jm.transform.position, invParentMat);
				}
				else {
					this.assets_.addModel(jm);
				}
			}


			endJoints() { /* ignored */ }


			meshCount(_count: number) { /* ignored */ }


			beginMesh() {
				this.vertexes = null;
				this.triangles = null;
				this.weights = null;
			}


			materialName(name: string) {
				const m = makeMaterial();
				m.userRef = this.assets_.materials.length + 1;
				vec3.set(m.baseColour, 0.8, 0.8, 0.8);
				if (name) {
					if (! this.textures_.has(name)) {
						this.textures_.set(name, {
							name: name,
							url: new URL(name, this.filePath),
							useMipMaps: render.UseMipMaps.No
						});
					}
					m.albedoTexture = this.textures_.get(name);
				}
				m.flags |= MaterialFlags.isSkinned;

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
				// precondition: this.vertexes was set (vertexCount was called with non-zero count)
				const io = index * 2;
				this.vertexes!.uvs[io] = uv[0];
				this.vertexes!.uvs[io + 1] = uv[1];
				this.vertexes!.weightOffsetsCounts[io] = weightOffset;
				this.vertexes!.weightOffsetsCounts[io + 1] = weightCount;
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
				// precondition: this.triangles was set (triangleCount was called with non-zero count)
				// reverse winding order
				container.setIndexedVec3(this.triangles!, index, [indexes[0], indexes[2], indexes[1]]);
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
				// precondition: this.weights was set (weightCount was called with non-zero count)
				this.weights!.joints[index] = jointIndex;
				this.weights!.biases[index] = bias;
				container.setIndexedVec3(this.weights!.positions, index, jointPos);
			}


			endMesh() {
				if (this.vertexes && this.triangles && this.weights) {
					const positions = constructBindPosePositions(this.vertexes, this.weights, this.joints);
					const streams = constructSkinnedMeshStreams(this.vertexes, this.weights);
					streams.push({
						name: "normals",
						attr: { field: meshdata.VertexField.Floatx3, role: meshdata.VertexAttributeRole.Normal },
						mapping: meshdata.VertexAttributeMapping.Vertex,
						includeInMesh: true,
						values: new Float32Array(positions.length)
					});
					streams.push({
						name: "uvs",
						attr: { field: meshdata.VertexField.Floatx2, role: meshdata.VertexAttributeRole.UV },
						mapping: meshdata.VertexAttributeMapping.Vertex,
						includeInMesh: true,
						values: this.vertexes.uvs
					});

					const mb = new meshdata.MeshBuilder(positions, null, streams);
					let triCount = this.triangles.length / 3;
					let pvi = 0;
					let pi = 0;
					while (triCount--) {
						mb.addPolygon([pvi, pvi + 1, pvi + 2], container.copyIndexedVec3(this.triangles, pi));
						pvi += 3;
						pi += 1;
					}

					const md = mb.complete();
					md.genVertexNormals();
					this.transformNormalsIntoJointSpace(md);

					const sdMesh: Mesh = {
						name: "",
						userRef: this.meshCount_++,
						meshData: md,
						indexMap: mb.indexMap
					};
					this.assets_.addMesh(sdMesh);

					const mm = makeModel("mesh");
					mm.mesh = sdMesh;
					mm.materials = [this.curMaterial];
					this.assets_.addModel(mm);
				}
			}


			error(msg: string, offset: number, token?: string) {
				console.warn(`MD5 Mesh parse error @ offset ${offset}: ${msg}`, token);
			}


			completed() { /* ignored */ }


			private transformNormalsIntoJointSpace(md: meshdata.MeshData) {
				const normAttr = md.findFirstAttributeWithRole(meshdata.VertexAttributeRole.Normal);

				if (normAttr) {
					const weights = this.weights!;
					const joints = this.joints;
					const vertexes = this.vertexes!;
					const vertexCount = vertexes.uvs.length / 2;

					const normView = new meshdata.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);

					for (let vix = 0; vix < vertexCount; ++vix) {
						const normalRef = normView.refItem(vix);
						const finalNormal = [0, 0, 0];
						const woff = vertexes.weightOffsetsCounts[vix * 2];
						const wcnt = vertexes.weightOffsetsCounts[(vix * 2) + 1];

						for (let j = 0; j < wcnt; ++j) {
							const bias = weights.biases[woff + j];
							const joint = joints[weights.joints[woff + j]];

							// finalNormal += (normal * joint.rotation) * weight.bias;
							vec3.scaleAndAdd(finalNormal, finalNormal, vec3.transformQuat([], normalRef, quat.invert([], joint.rotation)), bias);
						}

						// update normal in-place
						vec3.copy(normalRef, finalNormal);
					}
				}
			}


			private loadTextures() {
				const fileProms: Promise<Texture2D | null>[] = [];

				this.textures_.forEach(tex => {
					if (! tex.url || tex.descriptor) {
						return;
					}

					fileProms.push(
						loadImageURL(tex.url).then(img => {
							tex.descriptor = render.makeTexDesc2DFromImageSource(img, tex.useMipMaps);
							return tex;
						}).catch(error => {
							console.warn(error);
							return null;
						})
					);
				});

				return Promise.all(fileProms).then(
					textures => {
						for (const tex of textures) {
							this.assets_.addTexture(tex);
						}
						return this.assets_;
					},
					() => null
				);
			}


			assets(): Promise<AssetGroup> {
				return this.loadTextures();
			}
		}


		// ------------------------------


		interface AnimJoint {
			name: string;
			index: number;
			parentIndex: number;
			mask: parse.MD5AnimMask;
			basePos?: Float3;
			baseRot?: Float4;
			anim?: JointAnimation;
		}


		export class MD5AnimBuilder implements parse.MD5AnimDelegate {
			private frameCount_ = 0;
			private frameRate_ = 0;
			private compCount_ = 0;
			private baseFrame_: Transform[] = [];
			private joints_: AnimJoint[] = [];

			constructor(private filePath: string) {
			}

			frameCount(count: number) { this.frameCount_ = count; }
			jointCount(_count: number) { /* ignored */ }
			frameRate(fps: number) { this.frameRate_ = fps; }
			frameComponentCount(count: number) { this.compCount_ = count; }


			private animForJoint(j: AnimJoint): JointAnimation | undefined { // FIXME: null/undef consistency
				if (j.mask == 0) {
					return undefined;
				}
				const hasPos = (j.mask & 7) != 0;
				const hasRot = (j.mask & 56) != 0;
				let components = 0;
				if (hasPos) { components += 3; }
				if (hasRot) { components += 4; }

				const buffer = new Float32Array(components * this.frameCount_);
				const tracks: TransformAnimationTrack[] = [];
				let offset = 0;

				if (hasPos) {
					tracks.push({
						field: TransformAnimationField.Translation,
						key: buffer.subarray(0, 3 * this.frameCount_)
					});
					offset += 3 * this.frameCount_;
				}
				if (hasRot) {
					tracks.push({
						field: TransformAnimationField.Rotation,
						key: buffer.subarray(offset)
					});
				}

				return {
					jointIndex: j.index,
					jointName: j.name,
					tracks: tracks
				};
			}


			beginHierarchy() { /* ignored */ }
			joint(name: string, index: number, parentIndex: number, animMask: parse.MD5AnimMask, _componentOffset: number) {
				const j: AnimJoint = {
					name: name,
					index: index,
					parentIndex: parentIndex,
					mask: animMask
				};
				j.anim = this.animForJoint(j);
				this.joints_.push(j);
			}
			endHierarchy() { /* ignored */ }


			beginBoundingBoxes() { /* ignored */ }
			bounds(_frameIndex: number, _min: Float3, _max: Float3) { /* ignored */ }
			endBoundingBoxes() { /* ignored */ }


			beginBaseFrame() { /* ignored */ }
			baseJoint(index: number, jointPos: Float3, jointRot: Float4) {
				this.joints_[index].basePos = jointPos;
				this.joints_[index].baseRot = jointRot;

				const xf = makeTransform();
				vec3.copy(xf.position, jointPos);
				quat.copy(xf.rotation, jointRot);
				this.baseFrame_.push(xf);
			}
			endBaseFrame() { /* ignored */ }


			frame(index: number, components: Float32Array) {
				let compIx = 0;

				for (let jix = 0; jix < this.joints_.length; ++jix) {
					const j = this.joints_[jix];
					if (j.mask == 0) {
						continue;
					}

					if (j.mask & 7) {
						const finalPos = vec3.copy([], j.basePos!);
						if (j.mask & parse.MD5AnimMask.PosX) {
							finalPos[0] = components[compIx++];
						}
						if (j.mask & parse.MD5AnimMask.PosY) {
							finalPos[1] = components[compIx++];
						}
						if (j.mask & parse.MD5AnimMask.PosZ) {
							finalPos[2] = components[compIx++];
						}

						container.setIndexedVec3(j.anim!.tracks[0].key, index, finalPos);
					}

					if (j.mask & 56) {
						const arrIx = ((j.mask & 7) != 0) ? 1 : 0;

						const finalRot = vec3.copy([], j.baseRot!); // only need first 3 floats
						if (j.mask & parse.MD5AnimMask.QuatX) {
							finalRot[0] = components[compIx++];
						}
						if (j.mask & parse.MD5AnimMask.QuatY) {
							finalRot[1] = components[compIx++];
						}
						if (j.mask & parse.MD5AnimMask.QuatZ) {
							finalRot[2] = components[compIx++];
						}

						parse.computeQuatW(finalRot);
						container.setIndexedVec4(j.anim!.tracks[arrIx].key, index, finalRot);
					}
				}
			}


			error(msg: string, offset: number, token?: string) {
				console.warn(`MD5 Anim parse error @ offset ${offset}: ${msg}`, token);
			}


			completed() {
				console.info("DONE", this);
			}


			assets(): AssetGroup {
				const ag = new AssetGroup();
				// the non-null assertion is necessary as the null filtering does not register
				const ja = this.joints_.map(j => j.anim!).filter(a => a != null);
				const sa: SkeletonAnimation = {
					frameCount: this.frameCount_,
					frameTime: 1 / this.frameRate_,
					name: this.filePath,
					jointAnims: ja
				};

				ag.addSkeletonAnimation(sa);

				return ag;
			}
		}

	} // ns md5


	function parseMD5MeshSource(filePath: string, source: string): Promise<AssetGroup> {
		const del = new md5.MD5MeshBuilder(filePath);
		const parser = new md5.parse.MD5MeshParser(source, del);
		parser.parse();
		return del.assets();
	}


	function parseMD5AnimSource(filePath: string, source: string): AssetGroup {
		const del = new md5.MD5AnimBuilder(filePath);
		const parser = new md5.parse.MD5AnimParser(source, del);
		parser.parse();
		return del.assets();
	}


	export function loadMD5Mesh(url: URL): Promise<AssetGroup> {
		return loadFile(url).then((text: string) => parseMD5MeshSource(url.href, text));
	}


	export function loadMD5Anim(url: URL): Promise<AssetGroup> {
		return loadFile(url).then((text: string) => parseMD5AnimSource(url.href, text));
	}


	registerFileExtension("md5mesh", "application/idsoftware-md5mesh");
	registerFileExtension("md5anim", "application/idsoftware-md5anim");
	registerURLLoaderForMIMEType("application/idsoftware-md5mesh", (url, _) => loadMD5Mesh(url));
	registerURLLoaderForMIMEType("application/idsoftware-md5anim", (url, _) => loadMD5Anim(url));

} // ns sd.asset
