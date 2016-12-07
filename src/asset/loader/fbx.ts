// asset/loader/fbx - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="../registry.ts" />

namespace sd.asset {

	export namespace fbx {

		export namespace parse {
			// -- shared parser types and functions

			export type FBXValue = number | string | ArrayBuffer | TypedArray;

			export const enum FBXBlockAction {
				Enter,
				Skip
			}

			export const enum FBXPropertyType {
				Unknown,

				Int,
				Double,
				Bool,
				Time,
				String,
				Vector3D,
				Vector4D,
				Object,
				Empty
			}

			const fbxTypeNameMapping: { [type: string]: FBXPropertyType } = {
				"enum": FBXPropertyType.Int,
				"int": FBXPropertyType.Int,
				"integer": FBXPropertyType.Int,

				"float": FBXPropertyType.Double,
				"double": FBXPropertyType.Double,
				"number": FBXPropertyType.Double,
				"ulonglong": FBXPropertyType.Double,
				"fieldofview": FBXPropertyType.Double,
				"fieldofviewx": FBXPropertyType.Double,
				"fieldofviewy": FBXPropertyType.Double,
				"roll": FBXPropertyType.Double,
				"opticalcenterx": FBXPropertyType.Double,
				"opticalcentery": FBXPropertyType.Double,

				"bool": FBXPropertyType.Bool,
				"visibility": FBXPropertyType.Bool,
				"visibility inheritance": FBXPropertyType.Bool,

				"ktime": FBXPropertyType.Time,

				"kstring": FBXPropertyType.String,
				"datetime": FBXPropertyType.String,

				"vector3d": FBXPropertyType.Vector3D,
				"vector": FBXPropertyType.Vector3D,
				"color": FBXPropertyType.Vector3D,
				"colorrgb": FBXPropertyType.Vector3D,
				"lcl translation": FBXPropertyType.Vector3D,
				"lcl rotation": FBXPropertyType.Vector3D,
				"lcl scaling": FBXPropertyType.Vector3D,

				"colorandalpha": FBXPropertyType.Vector4D,

				"object": FBXPropertyType.Object,
				"compound": FBXPropertyType.Empty,
				"referenceproperty": FBXPropertyType.Empty
			};

			export interface FBXProp70Prop {
				name: string;
				typeName: string;
				type: FBXPropertyType;
				values: FBXValue[];
			}

			export function interpretProp70P(pValues: FBXValue[]) {
				assert(pValues.length >= 4, "A P must have 4 or more values.");
				const typeName = <string>pValues[1];

				const result: FBXProp70Prop = {
					name: <string>pValues[0],
					typeName: typeName,
					type: fbxTypeNameMapping[typeName.toLowerCase()] || FBXPropertyType.Unknown,
					values: pValues.slice(4)
				};

				if (result.type == FBXPropertyType.Unknown) {
					console.warn(`Unknown typed prop typename: ${typeName}`);
				}
				return result;
			}

			export interface FBXParserDelegate {
				block(name: string, values: FBXValue[]): FBXBlockAction;
				endBlock(): void;

				property(name: string, values: FBXValue[]): void;
				typedProperty(name: string, type: FBXPropertyType, typeName: string, values: FBXValue[]): void;

				error(msg: string, offset: number, token?: string): void;
				completed(): void;
			}

			export interface FBXParser {
				delegate: FBXParserDelegate;
				parse(): void;
			}

		} // ns parse


		// -- Document builder

		class FBXNode {
			name: string;
			type: parse.FBXPropertyType;
			typeName: string;
			values: parse.FBXValue[];
			children: FBXNode[];
			parent: FBXNode | null;

			connectionsIn: FBXConnection[];
			connectionsOut: FBXConnection[];

			constructor(name: string, values: parse.FBXValue[], type: parse.FBXPropertyType = parse.FBXPropertyType.Unknown, typeName = "") {
				this.name = name;
				this.values = values;
				this.type = type;
				this.typeName = typeName;

				this.children = [];
				this.parent = null;
				this.connectionsIn = [];
				this.connectionsOut = [];
			}

			appendChild(node: FBXNode) {
				assert(node.parent == null, "Can't re-parent a Node");
				node.parent = this;
				this.children.push(node);
			}

			get objectName() {
				const cns = <string>this.values[1];
				return cns.split("::")[1];
			}

			get objectID() {
				return <number>this.values[0];
			}

			get objectSubClass() {
				return <string>this.values[2];
			}

			childByName(name: string) {
				return this.children.find(c => c.name == name);
			}
		}


		type FBXNodeSet = { [id: number]: FBXNode };


		interface FBXConnection {
			fromID: number;
			fromNode?: FBXNode;
			toID: number;
			toNode?: FBXNode;
			propName?: string;
		}


		export interface FBXResolveOptions {
			allowMissingTextures: boolean;
			forceMipMapsOn: boolean;
			removeUnusedBones: boolean;
		}


		class FBXDocumentGraph {
			private globals: FBXNode[];

			private allObjects: FBXNodeSet;
			private geometryNodes: FBXNodeSet;
			private videoNodes: FBXNodeSet;
			private textureNodes: FBXNodeSet;
			private materialNodes: FBXNodeSet;
			private modelNodes: FBXNodeSet;
			private attributeNodes: FBXNodeSet;
			private animCurves: FBXNodeSet;
			private animCurveNodes: FBXNodeSet;
			private skinNodes: FBXNodeSet;
			private clusterNodes: FBXNodeSet;

			private connections: FBXConnection[];
			private hierarchyConnections: FBXConnection[];
			private flattenedModels: Map<number, Model>;
			private bumpedMaterials: Material[];
			private rootNode: FBXNode;

			constructor(private fbxFilePath: string) {
				this.globals = [];

				this.allObjects = {};
				this.geometryNodes = {};
				this.videoNodes = {};
				this.textureNodes = {};
				this.materialNodes = {};
				this.modelNodes = {};
				this.attributeNodes = {};
				this.animCurves = {};
				this.animCurveNodes = {};
				this.skinNodes = {};
				this.clusterNodes = {};

				this.connections = [];
				this.hierarchyConnections = [];
				this.flattenedModels = new Map<number, Model>();
				this.bumpedMaterials = [];

				this.rootNode = new FBXNode("Model", [0, "Model::RootNode", "RootNode"]);
				this.allObjects[0] = this.rootNode;
				this.modelNodes[0] = this.rootNode;
				this.flattenedModels.set(0, makeModel("RootNode", 0));
			}


			globalSetting(node: FBXNode) {
				this.globals.push(node);
			}


			addObject(node: FBXNode) {
				const typeSetMap: { [name: string]: FBXNodeSet } = {
					"Geometry": this.geometryNodes,
					"Video": this.videoNodes,
					"Texture": this.textureNodes,
					"Material": this.materialNodes,
					"Model": this.modelNodes,
					"NodeAttribute": this.attributeNodes,
					"AnimationCurveNode": this.animCurveNodes,
					"AnimationCurve": this.animCurves,
					"Deformer": this.clusterNodes
				};

				const id = node.objectID;
				const subClass = node.objectSubClass;
				let nodeSet = typeSetMap[node.name];
				assert(nodeSet != null, `Unknown object class ${node.name}`);

				if (node.name == "Model") {
					if (subClass != "Mesh" && subClass != "Root" && subClass != "LimbNode" && subClass != "Null" && subClass != "Light") {
						// ignore non-mesh, non-light, non-skeletal models
						return;
					}
				}
				else if (node.name == "Geometry") {
					if (subClass != "Mesh") {
						// only interpret mesh geometries for now (no NURBS based ones)
						return;
					}
				}
				else if (node.name == "Video") {
					if (subClass != "Clip") {
						// ignore HLSL shaders
						return;
					}
				}
				else if (node.name == "NodeAttribute") {
					if (subClass != "Root" && subClass != "LimbNode" && subClass != "Light") {
						// ignore non-skeleton, non-light attr nodes
						return;
					}
				}
				else if (node.name == "Deformer") {
					if (subClass == "Skin") {
						nodeSet = this.skinNodes;
					}
					else if (subClass != "Cluster") {
						return;
					}
				}

				nodeSet[id] = node;
				this.allObjects[id] = node;
			}


			addConnection(conn: FBXConnection) {
				conn.fromNode = this.allObjects[conn.fromID];
				conn.toNode = this.allObjects[conn.toID];

				if (conn.fromNode && conn.toNode) {
					conn.fromNode.connectionsOut.push(conn);
					conn.toNode.connectionsIn.push(conn);
					this.connections.push(conn);
				}
			}


			private loadTextures(group: AssetGroup, options: FBXResolveOptions): Promise<AssetGroup> {
				const fileProms: Promise<Texture2D | null>[] = [];

				Object.keys(this.videoNodes).forEach((idStr) => {
					const vidID = +idStr;
					const fbxVideo = this.videoNodes[vidID];
					const tex: Texture2D = {
						name: fbxVideo.objectName,
						userRef: vidID,
						useMipMaps: options.forceMipMapsOn ? render.UseMipMaps.Yes : render.UseMipMaps.No
					};
					let fileData: ArrayBuffer | null = null;

					for (const c of fbxVideo.children) {
						if (c.name == "UseMipMap") {
							if (! options.forceMipMapsOn) {
								tex.useMipMaps = (<number>c.values[0] != 0) ? render.UseMipMaps.Yes : render.UseMipMaps.No;
							}
						}
						else if (c.name == "RelativeFilename") {
							tex.url = new URL(<string>c.values[0], this.fbxFilePath);
						}
						else if (c.name == "Content") {
							// TODO: handle text-embedded Content entries which are base64-encoded strings
							fileData = <ArrayBuffer>c.values[0];
						}
					}

					const makeTexDesc = (img: render.TextureImageSource) => {
						return render.makeTexDesc2DFromImageSource(img, tex.useMipMaps);
					};

					if (fileData) {
						const mime = tex.url ? mimeTypeForURL(tex.url) : "";
						if (! mime) {
							const err = `Cannot create texture, no mime-type found for file path ${tex.url}`;
							if (options.allowMissingTextures) {
								console.warn(err);
							}
							else {
								fileProms.push(Promise.reject(err));
							}
						}
						else {
							fileProms.push(new Promise<Texture2D | null>((resolve, reject) => {
								loadImageFromBuffer(fileData!, mime!).then(
									img => {
										tex.descriptor = makeTexDesc(img);
										resolve(tex);
									},
									error => {
										if (options.allowMissingTextures) {
											console.warn(error);
											resolve(null);
										}
										else {
											reject(error);
										}
									}
								);
							}));
						}
					}
					else if (tex.url) {
						fileProms.push(
							loadImageURL(tex.url).then(img => {
								tex.descriptor = makeTexDesc(img);
								return tex;
							}).catch((error) => {
								if (options.allowMissingTextures) {
									console.warn(error);
									return null;
								}
								else {
									throw error;
								}
							})
						);
					}
					else {
						const err = `Texture ${tex.userRef} did not have relative filename or content.`;
						if (options.allowMissingTextures) {
							console.warn(err);
						}
						else {
							fileProms.push(Promise.reject(err));
						}
					}
				});

				return Promise.all(fileProms).then(
					textures => {
						for (const tex of textures) {
							group.addTexture(tex);
						}
						return group;
					},
					() => null
				);
			}


			private buildMaterials(group: AssetGroup, _options: FBXResolveOptions) {
				for (const matID in this.materialNodes) {
					const fbxMat = this.materialNodes[matID];
					const mat = makeMaterial();
					mat.name = fbxMat.objectName;
					mat.userRef = matID;

					let haveFullDiffuse = false;

					for (const c of fbxMat.children) {
						if (c.name == "Diffuse") {
							// the Diffuse prop is DiffuseColor * DiffuseFactor
							vec3.copy(mat.baseColour, <number[]>c.values);
							haveFullDiffuse = true;
						}
						else if (c.name == "DiffuseColor") {
							if (! haveFullDiffuse) {
								vec3.copy(mat.baseColour, <number[]>c.values);
							}
						}
						else if (c.name == "SpecularColor") {
							vec3.copy(mat.specularColour, <number[]>c.values);
						}
						else if (c.name == "SpecularFactor") {
							mat.specularIntensity = <number>c.values[0];
						}
						else if (c.name == "ShininessExponent") {
							mat.specularExponent = <number>c.values[0];
						}
						else if (c.name == "EmissiveColor") {
							vec3.copy(mat.emissiveColour, <number[]>c.values);
						}
						else if (c.name == "EmissiveFactor") {
							mat.emissiveIntensity = <number>c.values[0];
						}
						else if (c.name == "Opacity") {
							mat.opacity = math.clamp01(<number>c.values[0]);
						}
					}

					for (const texIn of fbxMat.connectionsIn) {
						// An FBX "Texture" connects a "Video" clip to a "Material"
						// with some parameters and may also directly reference a named
						// set of UV coordinates in a "Model" used by the material...
						const texNode = texIn.fromNode!;
						const vidTexConn = texNode.connectionsIn[0];
						const vidNodeID = vidTexConn && vidTexConn.fromID;
						const tex2D = group.textures.find((t) => !!t && <number>t.userRef == vidNodeID);

						if (! (texNode && vidTexConn && tex2D)) {
							console.warn(`Could not link texture ${texIn.fromID} to material prop ${texIn.propName} because link or texture is invalid.`);
						}
						else {
							if (texIn.propName == "DiffuseColor") {
								mat.albedoTexture = tex2D;
							}
							else if (texIn.propName == "SpecularColor") {
								mat.specularTexture = tex2D;
							}
							else if (texIn.propName == "NormalMap") {
								mat.normalTexture = tex2D;
							}
							else if (texIn.propName == "Bump") {
								mat.heightTexture = tex2D;
							}
							else if (texIn.propName == "TransparentColor") {
								mat.transparencyTexture = tex2D;
							}
							else {
								console.warn(`Unsupported texture property link: ${texIn.propName}`);
								continue;
							}

							for (const tc of texNode.children) {
								if (tc.name == "ModelUVTranslation") {
									vec2.copy(mat.textureOffset, <number[]>tc.values);
								}
								else if (tc.name == "ModelUVScaling") {
									vec2.copy(mat.textureScale, <number[]>tc.values);
								}
							}
						}
					}

					if (mat.normalTexture) {
						this.bumpedMaterials.push(mat);
					}

					group.addMaterial(mat);
				}
			}


			private makeLayerElementStream(layerElemNode: FBXNode): meshdata.VertexAttributeStream | null {
				let valueArrayName: string, indexArrayName: string;
				const stream: meshdata.VertexAttributeStream = {
					name: "",
					includeInMesh: true,
					mapping: meshdata.VertexAttributeMapping.Undefined
				};

				const layerElemIndex = <number>layerElemNode.values[0];
				if (layerElemIndex > 0) {
					if (layerElemNode.name != "LayerElementUV") {
						console.warn("FBX: ignoring non-UV geometry LayerElement with index > 0", layerElemNode);
						return null;
					}
					else if (layerElemIndex > 3) {
						console.warn("FBX: ignoring UV geometry LayerElement with index > 3", layerElemNode);
						return null;
					}
				}

				// Determine array key names as they are obviously not consistent
				if (layerElemNode.name == "LayerElementNormal") {
					valueArrayName = "Normals";
					indexArrayName = "NormalsIndex";
					stream.attr = { role: meshdata.VertexAttributeRole.Normal, field: meshdata.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementColor") {
					valueArrayName = "Colors";
					indexArrayName = "ColorIndex";
					stream.attr = { role: meshdata.VertexAttributeRole.Colour, field: meshdata.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementUV") {
					valueArrayName = "UV";
					indexArrayName = "UVIndex";
					stream.attr = { role: meshdata.VertexAttributeRole.UV0 + layerElemIndex, field: meshdata.VertexField.Floatx2 };
				}
				else if (layerElemNode.name == "LayerElementTangent") {
					valueArrayName = "Tangents";
					indexArrayName = "TangentsIndex";
					stream.attr = { role: meshdata.VertexAttributeRole.Tangent, field: meshdata.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementMaterial") {
					valueArrayName = "Materials";
					indexArrayName = "--UNUSED--";
					stream.includeInMesh = false;
					stream.controlsGrouping = true;
					stream.attr = { role: meshdata.VertexAttributeRole.Material, field: meshdata.VertexField.SInt32 };
				}
				else {
					assert(false, "Unhandled layer element node");
					valueArrayName = "--UNHANDLED--";
					indexArrayName = "--UNHANDLED--";
				}

				for (const c of layerElemNode.children) {
					if (c.name == "Name") {
						stream.name = <string>c.values[0];
					}
					else if (c.name == "MappingInformationType") {
						const mappingName = <string>c.values[0];
						if (mappingName == "ByVertice") {
							stream.mapping = meshdata.VertexAttributeMapping.Vertex;
						}
						else if (mappingName == "ByPolygonVertex") {
							stream.mapping = meshdata.VertexAttributeMapping.PolygonVertex;
						}
						else if (mappingName == "ByPolygon") {
							stream.mapping = meshdata.VertexAttributeMapping.Polygon;
						}
						else if (mappingName == "AllSame") {
							stream.mapping = meshdata.VertexAttributeMapping.SingleValue;
						}
						else {
							assert(false, `Unknown stream mapping name: ${mappingName}`);
						}
					}
					else if (c.name == valueArrayName) {
						stream.values = <TypedArray>c.values[0];
					}
					else if (c.name == indexArrayName) {
						stream.indexes = <TypedArray>c.values[0];
					}
				}

				// check material stream applicability
				if (layerElemNode.name == "LayerElementMaterial") {
					assert(
						stream.mapping == meshdata.VertexAttributeMapping.Polygon || stream.mapping == meshdata.VertexAttributeMapping.SingleValue,
						"A material stream must be a single value or be applied per polygon"
					);
				}

				// invert V coordinates for direct usage in GL
				if (layerElemNode.name == "LayerElementUV") {
					const uvElements = stream.values!;
					assert(uvElements, "LayerElementUV without values is invalid!"); // FIXME: change error handling
					const uvElementCount = uvElements.length;
					let uvOffset = 0;
					while (uvOffset < uvElementCount) {
						uvElements[uvOffset + 1] = 1.0 - uvElements[uvOffset + 1];
						uvOffset += 2;
					}
				}

				return stream;
			}


			private buildMeshes(group: AssetGroup, _options: FBXResolveOptions) {
				let tStreams = 0;
				let tMeshData = 0;

				for (const geomID in this.geometryNodes) {
					const fbxGeom = this.geometryNodes[geomID];
					const streams: meshdata.VertexAttributeStream[] = [];
					let positions: Float64Array | undefined;
					let polygonIndexes: Int32Array | null = null;

					for (const c of fbxGeom.children) {
						if (c.name == "Vertices") {
							positions = <Float64Array>c.values[0];
						}
						else if (c.name == "PolygonVertexIndex") {
							polygonIndexes = <Int32Array>c.values[0];
						}
						else if (c.name == "LayerElementNormal" ||
							c.name == "LayerElementTangent" ||
							c.name == "LayerElementColor" ||
							c.name == "LayerElementUV" ||
							c.name == "LayerElementMaterial")
						{
							const strm = this.makeLayerElementStream(c);
							if (strm) {
								streams.push(strm);
							}
						}
					}

					// sanity check mesh pre-requisites
					if (! (positions && polygonIndexes)) {
						console.warn("FBXGeom ", fbxGeom, "is unsuitable for use.");
						continue;
					}

					// With all streams and stuff collected, create the mesh
					const t0 = performance.now();
					const mb = new meshdata.MeshBuilder(positions, null, streams);
					const polygonIndexCount = polygonIndexes.length;
					let polygonVertexIndexArray: number[] = [];
					let vertexIndexArray: number[] = [];

					// Perform linear scan through polygon indexes as tris and quads can
					// be used arbitrarily, the last index of each polygon is indicated
					// by a negated index.
					for (let pvi = 0; pvi < polygonIndexCount; ++pvi) {
						const vi = polygonIndexes[pvi];
						polygonVertexIndexArray.push(pvi);

						if (vi < 0) {
							vertexIndexArray.push(~vi);
							mb.addPolygon(polygonVertexIndexArray, vertexIndexArray);

							// next polygon							
							polygonVertexIndexArray = [];
							vertexIndexArray = [];
						}
						else {
							vertexIndexArray.push(vi);
						}
					}

					const t1 = performance.now();

					const meshAsset: Mesh = {
						name: fbxGeom.objectName,
						userRef: fbxGeom.objectID,
						meshData: mb.complete(),
						indexMap: mb.indexMap
					};

					const t2 = performance.now();
					tStreams += (t1 - t0);
					tMeshData += (t2 - t1);

					group.addMesh(meshAsset);

					// hook up mesh to linked model
					for (const mco of fbxGeom.connectionsOut) {
						const model = mco.toNode;
						if (model && model.name == "Model") {
							const sdModel = this.flattenedModels.get(model.objectID)!; // TODO: verify
							sdModel.mesh = meshAsset;
						}
					}
				}

				console.info(`fbx streams build time ${tStreams.toFixed(1)}`);
				console.info(`fbx meshdata build time ${tMeshData.toFixed(1)}`);
			}


			private makeLightAssetFromFBXLight(lightAttrNode: FBXNode): asset.Light {
				// fbx defaults
				const ld: asset.Light = {
					name: lightAttrNode.name,
					userRef: lightAttrNode.objectID,

					type: asset.LightType.Point,
					colour: [1, 1, 1],

					intensity: 1,

					range: 1,
					cutoff: math.deg2rad(45 / 2),

					shadowType: asset.ShadowType.None,
					shadowQuality: asset.ShadowQuality.Auto,
					shadowStrength: 1
				};

				let fbxIntensity = 100;

				for (const c of lightAttrNode.children) {
					if (c.name == "LightType") {
						const fbxLightType = <number>c.values[0];
						if (fbxLightType == 0) {
							ld.type = asset.LightType.Point;
						}
						else if (fbxLightType == 1) {
							ld.type = asset.LightType.Directional;
						}
						else if (fbxLightType == 2) {
							ld.type = asset.LightType.Spot;
						}
						else {
							console.warn(`Invalid FBX light type: ${fbxLightType}`);
						}
					}
					else if (c.name == "Color") {
						vec3.copy(ld.colour, <number[]>c.values);
					}
					else if (c.name == "Intensity") {
						fbxIntensity = <number>c.values[0];
					}
					else if (c.name == "OuterAngle") {
						ld.cutoff = math.deg2rad(<number>c.values[0] / 2);
					}
					else if (c.name == "CastShadows") {
						ld.shadowType = asset.ShadowType.Soft;
					}
				}

				// convert FBX intensity to something we can work with
				if (ld.type == asset.LightType.Directional) {
					ld.intensity = math.clamp01(fbxIntensity / 100);
				}
				else {
					ld.range = fbxIntensity / 100;
				}

				return ld;
			}


			private buildModels(group: AssetGroup, options: FBXResolveOptions) {
				for (const modelID in this.modelNodes) {
					const fbxModel = this.modelNodes[modelID];
					const sdModel = makeModel(fbxModel.objectName, fbxModel.objectID);

					// skip bones we don't care about if allowed
					if (options.removeUnusedBones) {
						const modelName = fbxModel.objectName;
						if (modelName.length > 3 && modelName.substr(-3) == "Nub") {
							continue;
						}
					}

					// get the local transform
					let preRot: Float4 = [0, 0, 0, 1];
					let postRot: Float4 = [0, 0, 0, 1];
					let localRot: Float4 = [0, 0, 0, 1];
					for (const c of fbxModel.children) {
						const vecVal = <number[]>c.values;
						if (c.name == "Lcl Translation") {
							vec3.copy(sdModel.transform.position, vecVal);
						}
						else if (c.name == "Lcl Scaling") {
							vec3.copy(sdModel.transform.scale, vecVal);
						}
						else if (c.name == "Lcl Rotation") {
							localRot = quat.fromEuler(math.deg2rad(vecVal[2]), math.deg2rad(vecVal[1]),	math.deg2rad(vecVal[0]));
						}
						else if (c.name == "PreRotation") {
							preRot = quat.fromEuler(math.deg2rad(vecVal[2]), math.deg2rad(vecVal[1]), math.deg2rad(vecVal[0]));
						}
						else if (c.name == "PostRotation") {
							postRot = quat.fromEuler(math.deg2rad(vecVal[2]), math.deg2rad(vecVal[1]), math.deg2rad(vecVal[0]));
						}
					}

					sdModel.transform.rotation = quat.mul([], quat.mul([], preRot, localRot), postRot);


					// add linked components
					for (const conn of fbxModel.connectionsIn) {
						if (! conn.fromNode) {
							console.error("Invalid model in-connection", conn);
							continue;
						}

						const connType = conn.fromNode.name;
						const connSubType = conn.fromNode.objectSubClass;

						if (connType == "Material") {
							const mat = group.materials.find((t) => t && <number>t.userRef == conn.fromID);
							if (mat) {
								if (! sdModel.materials) {
									sdModel.materials = [];
								}
								sdModel.materials.push(mat);
							}
							else {
								console.warn(`Could not connect material ${conn.fromID} to model ${modelID}`);
							}
						}
						else if (connType == "NodeAttribute") {
							if (connSubType == "LimbNode" || connSubType == "Root") {
								sdModel.joint = {
									root: connSubType == "Root"
								};
							}
							else if (connSubType == "Light") {
								sdModel.light = this.makeLightAssetFromFBXLight(conn.fromNode);
							}
						}
						else if (connType == "Model") {
							// model hierarchy is connected in the next step as FBX gives no guarantees that
							// models are created in a bottom-up manner
							this.hierarchyConnections.push(conn);
						}
					}

					this.flattenedModels.set(sdModel.userRef, sdModel);
				}
			}


			private buildHierarchy(group: AssetGroup, _options: FBXResolveOptions) {
				for (const conn of this.hierarchyConnections) {
					const childModel = this.flattenedModels.get(conn.fromID);
					const parentModel = this.flattenedModels.get(conn.toID);

					if (childModel && parentModel) {
						parentModel.children.push(childModel);
						assert(childModel.parent == null, `Cannot re-parent node ${childModel.userRef}`);
						childModel.parent = parentModel;
						if (conn.toID == 0) {
							group.addModel(childModel);
						}
					}
				}
			}


			private animPropForConnectionNames(curvePropName: string, modelPropName: string): AnimationProperty {
				let ap = AnimationProperty.None;

				if (modelPropName == "Lcl Translation") {
					if (curvePropName == "d|X") { ap = AnimationProperty.TranslationX; }
					else if (curvePropName == "d|Y") { ap = AnimationProperty.TranslationY; }
					else if (curvePropName == "d|Z") { ap = AnimationProperty.TranslationZ; }
				}
				else if (modelPropName == "Lcl Rotation") {
					if (curvePropName == "d|X") { ap = AnimationProperty.RotationX; }
					else if (curvePropName == "d|Y") { ap = AnimationProperty.RotationY; }
					else if (curvePropName == "d|Z") { ap = AnimationProperty.RotationZ; }
				}
				else if (modelPropName == "Lcl Scaling") {
					if (curvePropName == "d|X") { ap = AnimationProperty.ScaleX; }
					else if (curvePropName == "d|Y") { ap = AnimationProperty.ScaleY; }
					else if (curvePropName == "d|Z") { ap = AnimationProperty.ScaleZ; }
				}

				return ap;
			}


			private buildAnimations(_group: AssetGroup, _options: FBXResolveOptions) {
				// the number of units of time per second for a KTime value
				const KTimeUnit = 46186158000;

				for (const curveNodeID in this.animCurveNodes) {
					const fbxCurveNode = this.animCurveNodes[curveNodeID];
					if (fbxCurveNode.connectionsIn.length == 0 || fbxCurveNode.connectionsOut.length == 0) {
						continue;
					}

					// link to first out connection
					const outConn = fbxCurveNode.connectionsOut[0];
					if (! (outConn && outConn.propName)) {
						continue;
					}

					const jointModel = this.flattenedModels.get(outConn.toID);
					if (! jointModel) {
						// likely a curve for an omitted joint
						continue;
					}

					const tracks: AnimationTrack[] = [];
					for (const inConn of fbxCurveNode.connectionsIn) {
						const curve = inConn.fromNode;
						if (! (curve && inConn.propName)) {
							console.error("AnimationCurve in-connection is invalid!", inConn);
							continue;
						}

						const timesNode = curve.childByName("KeyTime");
						const valuesNode = curve.childByName("KeyValueFloat");

						if (timesNode && valuesNode) {
							const times = <TypedArray>timesNode.values[0];
							const values = <TypedArray>valuesNode.values[0];
							const count = times.length;
							assert(times.length == values.length, "Invalid animation key data");

							// determine property being animated
							const animProp = this.animPropForConnectionNames(inConn.propName, outConn.propName);

							// convert KTime values to seconds in place
							for (let t = 0; t < count; ++t) {
								times[t] /= KTimeUnit;
							}

							// convert rotation angles to radians
							if (animProp >= AnimationProperty.RotationX && animProp <= AnimationProperty.RotationZ) {
								for (let t = 0; t < count; ++t) {
									values[t] = math.deg2rad(values[t]);
								}
							}

							tracks.push({
								animationName: "Take 001",
								property: animProp,
								key: {
									times: times,
									values: values
								}
							});
						}
					}

					if (tracks.length) {
						jointModel.animations = (jointModel.animations || []).concat(tracks);
					}
				}
			}


			private buildSkins(_group: AssetGroup, _options: FBXResolveOptions) {
				for (const skinNodeID in this.skinNodes) {
					const fbxSkin = this.skinNodes[skinNodeID];
					if (fbxSkin.connectionsIn.length == 0 || fbxSkin.connectionsOut.length == 0) {
						console.warn(`Skin ${skinNodeID} either has no mesh or no clusters. Skipping.`);
						continue;
					}

					const sdSkin: Skin = {
						name: fbxSkin.objectName,
						userRef: fbxSkin.objectID,
						groups: []
					};

					for (const clusterConn of fbxSkin.connectionsIn) {
						const cluster = clusterConn.fromNode;
						if (! cluster) {
							console.error("Skin cluster connection is invalid", fbxSkin);
							continue;
						}

						const wvg: WeightedVertexGroup = {
							name: cluster.objectName,
							userRef: cluster.objectID,
							indexes: null,
							weights: null,
							bindPoseLocalTranslation: null,
							bindPoseLocalRotation: null,
							bindPoseLocalMatrix: null
						};

						for (const cc of cluster.children) {
							if (cc.name == "Indexes") {
								wvg.indexes = <Int32Array>(cc.values[0]);
							}
							else if (cc.name == "Weights") {
								wvg.weights = <Float64Array>(cc.values[0]);
							}
							else if (cc.name == "Transform") {
								const txmat = <Float64Array>(cc.values[0]);
								const mat33 = mat3.fromMat4([], txmat);
								const txq = quat.fromMat3([], mat33);
								const trans = [txmat[12], txmat[13], txmat[14]];

								wvg.bindPoseLocalTranslation = trans;
								wvg.bindPoseLocalRotation = txq;
								wvg.bindPoseLocalMatrix = txmat;
							}
						}

						if (! (wvg.indexes && wvg.weights && wvg.bindPoseLocalTranslation && wvg.bindPoseLocalRotation)) {
							console.warn(`Incomplete cluster ${clusterConn.fromID}`, cluster, wvg);
						}
						else {
							for (const cinc of cluster.connectionsIn) {
								const cinNode = cinc.fromNode;
								if (! cinNode) {
									console.error("Cluster in-connection Model is invalid", cluster);
									continue;
								}

								if (cinNode.name == "Model") {
									const sdModel = this.flattenedModels.get(cinNode.objectID);

									if (sdModel) {
										if (sdModel.joint) {
											sdModel.vertexGroup = wvg;
										}
										else {
											console.warn(`Model ${cinNode.objectID} has a cluster but no joint?`);
										}
									}
									else {
										console.warn(`Can't connect cluster ${cluster.objectID} to non-existent model ${cinNode.objectID}`);
									}
								}
							}

							sdSkin.groups.push(wvg);
						}
					}

					// group.addSkin(sdSkin);
				}
			}


			resolve(options?: FBXResolveOptions): Promise<AssetGroup> {
				const defaults: FBXResolveOptions = {
					allowMissingTextures: true,
					forceMipMapsOn: true,
					removeUnusedBones: true,
					...options
				};

				return this.loadTextures(new AssetGroup(), defaults)
				.then((group) => {
					this.buildMaterials(group, defaults);
					this.buildModels(group, defaults);
					this.buildHierarchy(group, defaults);
					this.buildSkins(group, defaults);
					this.buildAnimations(group, defaults);
					this.buildMeshes(group, defaults);

					console.info("Doc", this);
					return group;
				});
			}
		}


		const enum BuilderState {
			Root,
			GlobalSettings,
			Objects,
			Object,
			Connections
		}


		export class FBX7DocumentParser implements parse.FBXParserDelegate {
			private doc: FBXDocumentGraph;
			private state = BuilderState.Root;

			private depth = 0;
			private curObject: FBXNode | null = null;
			private curNodeParent: FBXNode | null = null;

			private knownObjects: Set<string>;

			private assets_: Promise<AssetGroup> | null = null;

			private parseT0 = 0;

			constructor(filePath: string) {
				this.doc = new FBXDocumentGraph(filePath);
				this.knownObjects = new Set<string>([
					"Geometry", "Video", "Texture", "Material", "Model", "NodeAttribute",
					"AnimationCurve", "AnimationCurveNode", "Deformer"
				]);
			}


			block(name: string, values: parse.FBXValue[]): parse.FBXBlockAction {
				if (this.parseT0 == 0) {
					this.parseT0 = performance.now();
				}

				let skip = false;

				if (this.state == BuilderState.Root) {
					if (name == "GlobalSettings") {
						this.state = BuilderState.GlobalSettings;
					}
					else if (name == "Objects") {
						this.state = BuilderState.Objects;
					}
					else if (name == "Connections") {
						this.state = BuilderState.Connections;
					}
					else {
						skip = true;
					}
				}
				else if (this.state == BuilderState.Objects) {
					if (this.knownObjects.has(name)) {
						this.state = BuilderState.Object;
						this.curObject = new FBXNode(name, values);
						this.curNodeParent = this.curObject;
					}
					else {
						skip = true;
					}
				}
				else if (this.curNodeParent) {
					const node = new FBXNode(name, values);
					this.curNodeParent.appendChild(node);
					this.curNodeParent = node;
				}

				if (! skip) {
					this.depth++;
					return parse.FBXBlockAction.Enter;
				}
				return parse.FBXBlockAction.Skip;
			}


			endBlock() {
				this.depth--;
				if (this.depth == 1) {
					if (this.state == BuilderState.Object) {
						this.doc.addObject(this.curObject!);

						this.curObject = null;
						this.curNodeParent = null;
						this.state = BuilderState.Objects;
					}
				}
				else if (this.depth == 0) {
					this.state = BuilderState.Root;
				}
				else if (this.curNodeParent) {
					this.curNodeParent = this.curNodeParent.parent;
					assert(this.curNodeParent != null);
				}
			}


			property(name: string, values: parse.FBXValue[]) {
				this.typedProperty(name, parse.FBXPropertyType.Unknown, "", values);
			}


			typedProperty(name: string, type: parse.FBXPropertyType, typeName: string, values: parse.FBXValue[]) {
				const node = new FBXNode(name, values, type, typeName);

				if (this.state == BuilderState.GlobalSettings) {
					this.doc.globalSetting(node);
				}
				else if (this.state == BuilderState.Object) {
					this.curNodeParent!.appendChild(node);
				}
				else if (this.state == BuilderState.Connections) {
					assert(name == "C", "Only C properties are allowed inside Connections");
					const binding = <string>node.values[0];
					const fromID = <number>node.values[1];
					const toID = <number>node.values[2];

					if (binding == "OO") {
						this.doc.addConnection({ fromID: fromID, toID: toID });
					}
					else if (binding == "OP") {
						this.doc.addConnection({ fromID: fromID, toID: toID, propName: <string>node.values[3] });
					}
					else {
						console.warn("Don't know what to do with connection: ", node.values);
					}
				}
			}


			completed() {
				const parseTime = (performance.now() - this.parseT0).toFixed(1);
				console.info(`fbx parse time ${parseTime}`);
				this.assets_ = this.doc.resolve();
			}


			error(msg: string, offset: number, token?: string) {
				console.warn(`FBX parse error @ offset ${offset}: ${msg}`, token);
			}


			get assets(): Promise<AssetGroup> {
				return this.assets_ || Promise.reject("No assets have been created yet.");
			}
		}

	} // ns fbx


	function parseFBXSource(filePath: string, source: string | ArrayBuffer): Promise<AssetGroup> {
		const t0 = performance.now();
		const del = new fbx.FBX7DocumentParser(filePath);
		let parser: fbx.parse.FBXParser;
		if (typeof source === "string") {
			parser = new fbx.parse.FBXTextParser(source, del);
		}
		else {
			parser = new fbx.parse.FBXBinaryParser(source, del);
		}
		parser.parse();
		return del.assets.then(grp => {
			const totalTime = (performance.now() - t0).toFixed(1);
			console.info(`fbx total time: ${totalTime}ms`);
			return grp;
		});
	}


	export function loadFBXTextFile(url: URL): Promise<AssetGroup> {
		return loadFile(url).then((text: string) => parseFBXSource(url.href, text));
	}


	export function loadFBXBinaryFile(url: URL): Promise<AssetGroup> {
		return loadFile(url, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXSource(url.href, data));
	}

	export function loadFBXFile(url: URL): Promise<AssetGroup> {
		return loadFile(url, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => {
			// Check the first 20 bytes of the file against the binary FBX identifier
			const ident = convertBytesToString(new Uint8Array(data, 0, 20));
			if (ident === "Kaydara FBX Binary  ") {
				return parseFBXSource(url.href, data);
			}
			else {
				const blob = new Blob([data], { type: "text/plain" });
				return BlobReader.readAsText(blob).then(source => {
					return parseFBXSource(url.href, source);
				});
			}
		});
	}


	registerFileExtension("fbx", "application/fbx");
	registerURLLoaderForMIMEType("application/fbx", (url, _) => loadFBXFile(url));

} // ns sd.asset
