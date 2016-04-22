// asset-fbx.ts - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

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
				"referenceproperty": FBXPropertyType.Empty,
			};

			export interface FBXProp70Prop {
				name: string;
				typeName: string;
				type: FBXPropertyType;
				values: FBXValue[];
			}

			export function interpretProp70P(pValues: FBXValue[]) {
				assert(pValues.length >= 4, "A P must have 4 or more values.");
				var typeName = <string>pValues[1];

				var result: FBXProp70Prop = {
					name: <string>pValues[0],
					typeName: typeName,
					type: fbxTypeNameMapping[typeName.toLowerCase()] || FBXPropertyType.Unknown,
					values: pValues.slice(4)
				};

				if (result.type == FBXPropertyType.Unknown) {
					console.warn("Unknown typed prop typename: " + typeName);
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
			parent: FBXNode;

			connectionsIn: FBXConnection[];
			connectionsOut: FBXConnection[];

			constructor(name: string, values: parse.FBXValue[], type: parse.FBXPropertyType = parse.FBXPropertyType.Unknown, typeName: string = "") {
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
				var cns = <string>this.values[1];
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
				var typeSetMap: { [name: string]: FBXNodeSet } = {
					"Geometry": this.geometryNodes,
					"Video": this.videoNodes,
					"Texture": this.textureNodes,
					"Material": this.materialNodes,
					"Model": this.modelNodes,
					"NodeAttribute": this.attributeNodes,
					"AnimationCurveNode": this.animCurveNodes,
					"AnimationCurve": this.animCurves,
					"Deformer": this.clusterNodes,
				};

				var id = node.objectID;
				var subClass = node.objectSubClass;
				var set = typeSetMap[node.name];
				assert(set != null, "Unknown object class " + node.name);

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
						set = this.skinNodes;
					}
					else if (subClass != "Cluster") {
						return;
					}
				}

				set[id] = node;
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
				var fileProms: Promise<Texture2D>[] = [];

				Object.keys(this.videoNodes).forEach((idStr) => {
					var vidID = +idStr;
					var fbxVideo = this.videoNodes[vidID];
					var tex: Texture2D = {
						name: fbxVideo.objectName,
						userRef: vidID,
						useMipMaps: options.forceMipMapsOn ? render.UseMipMaps.Yes : render.UseMipMaps.No
					};
					var fileData: ArrayBuffer = null;

					for (let c of fbxVideo.children) {
						if (c.name == "UseMipMap") {
							if (! options.forceMipMapsOn) {
								tex.useMipMaps = (<number>c.values[0] != 0) ? render.UseMipMaps.Yes : render.UseMipMaps.No;
							}
						}
						else if (c.name == "RelativeFilename") {
							tex.filePath = <string>c.values[0];
						}
						else if (c.name == "Content") {
							// TODO: handle text-embedded Content entries which are base64-encoded strings
							fileData = <ArrayBuffer>c.values[0];
						}
					}

					var makeTexDesc = (img: render.TextureImageSource) => {
						return render.makeTexDesc2DFromImageSource(img, tex.useMipMaps);
					};

					if (fileData) {
						var mime = mimeTypeForFilePath(tex.filePath);
						if (! mime) {
							let err = "Cannot create texture, no mime-type found for file path " + tex.filePath;
							if (options.allowMissingTextures) {
								console.warn(err);
							}
							else {
								fileProms.push(Promise.reject(err));
							}
						}
						else {
							fileProms.push(new Promise((resolve, reject) => {
								loadImageFromBuffer(fileData, mime).then((img) => {
									tex.descriptor = makeTexDesc(img);
									resolve(tex);
								}, (error) => {
									if (options.allowMissingTextures) {
										console.warn(error);
										resolve(null);
									}
									else {
										reject(error);
									}
								});
							}));
						}
					}
					else {
						let resolvedFilePath = resolveRelativeFilePath(tex.filePath, this.fbxFilePath);
						fileProms.push(
							loadImage(resolvedFilePath).then((img) => {
								tex.descriptor = makeTexDesc(img);
								return tex;
							}).catch((error) => {
								if (options.allowMissingTextures) {
									console.warn(error);
									return <Texture2D>null;
								}
								else {
									throw error;
								}
							})
						);
					}
				});

				return Promise.all(fileProms).then((textures) => {
					for (var tex of textures) {
						group.addTexture(tex);
					}
					return group;
				}, () => null);
			}


			private buildMaterials(group: AssetGroup, options: FBXResolveOptions) {
				for (var matID in this.materialNodes) {
					var fbxMat = this.materialNodes[matID];
					var mat = makeMaterial();
					mat.name = fbxMat.objectName;
					mat.userRef = matID;

					var haveFullDiffuse = false;

					for (const c of fbxMat.children) {
						if (c.name == "Diffuse") {
							// the Diffuse prop is DiffuseColor * DiffuseFactor
							vec3.copy(mat.diffuseColour, <number[]>c.values);
							haveFullDiffuse = true;
						}
						else if (c.name == "DiffuseColor") {
							if (!haveFullDiffuse) {
								vec3.copy(mat.diffuseColour, <number[]>c.values);
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
						var texNode = texIn.fromNode;
						var vidTexConn = texNode.connectionsIn[0];
						var vidNodeID = vidTexConn && vidTexConn.fromID;
						var tex2D = group.textures.find((t) => t && <number>t.userRef == vidNodeID);

						if (! (texNode && vidTexConn && tex2D)) {
							console.warn("Could not link texture " + texIn.fromID + " to material prop " + texIn.propName + " because link or texture is invalid.");
						}
						else {
							if (texIn.propName == "DiffuseColor") {
								mat.diffuseTexture = tex2D;
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
								console.warn("Unsupported texture property link: " + texIn.propName);
								continue;
							}

							for (let tc of texNode.children) {
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


			private makeLayerElementStream(layerElemNode: FBXNode): mesh.VertexAttributeStream {
				var valueArrayName: string, indexArrayName: string;
				var stream: mesh.VertexAttributeStream = {
					name: "",
					attr: null,
					includeInMesh: true,
					mapping: mesh.VertexAttributeMapping.Undefined
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
					stream.attr = { role: mesh.VertexAttributeRole.Normal, field: mesh.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementColor") {
					valueArrayName = "Colors";
					indexArrayName = "ColorIndex";
					stream.attr = { role: mesh.VertexAttributeRole.Colour, field: mesh.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementUV") {
					valueArrayName = "UV";
					indexArrayName = "UVIndex";
					stream.attr = { role: mesh.VertexAttributeRole.UV0 + layerElemIndex, field: mesh.VertexField.Floatx2 };
				}
				else if (layerElemNode.name == "LayerElementTangent") {
					valueArrayName = "Tangents";
					indexArrayName = "TangentsIndex";
					stream.attr = { role: mesh.VertexAttributeRole.Tangent, field: mesh.VertexField.Floatx3 };
				}
				else if (layerElemNode.name == "LayerElementMaterial") {
					valueArrayName = "Materials";
					indexArrayName = "--UNUSED--";
					stream.includeInMesh = false;
					stream.controlsGrouping = true;
					stream.attr = { role: mesh.VertexAttributeRole.Material, field: mesh.VertexField.SInt32 };
				}
				else {
					assert(false, "Unhandled layer element node");
				}

				for (var c of layerElemNode.children) {
					if (c.name == "Name") {
						stream.name = <string>c.values[0];
					}
					else if (c.name == "MappingInformationType") {
						let mappingName = <string>c.values[0];
						if (mappingName == "ByVertice") {
							stream.mapping = mesh.VertexAttributeMapping.Vertex;
						}
						else if (mappingName == "ByPolygonVertex") {
							stream.mapping = mesh.VertexAttributeMapping.PolygonVertex;
						}
						else if (mappingName == "ByPolygon") {
							stream.mapping = mesh.VertexAttributeMapping.Polygon;	
						}
						else if (mappingName == "AllSame") {
							stream.mapping = mesh.VertexAttributeMapping.SingleValue;
						}
						else {
							assert(false, "Unknown stream mapping name: " + mappingName);
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
						stream.mapping == mesh.VertexAttributeMapping.Polygon || stream.mapping == mesh.VertexAttributeMapping.SingleValue,
						"A material stream must be a single value or be applied per polygon"
					);
				}

				// invert V coordinates for direct usage in GL
				if (layerElemNode.name == "LayerElementUV") {
					let uvElements = stream.values.length;
					let uvOffset = 0;
					while (uvOffset < uvElements) {
						stream.values[uvOffset + 1] = 1.0 - stream.values[uvOffset + 1];
						uvOffset += 2;
					}
				}

				return stream;
			}


			private buildMeshes(group: AssetGroup, options: FBXResolveOptions) {
				var tStreams = 0;
				var tMeshData = 0;

				for (var geomID in this.geometryNodes) {
					var fbxGeom = this.geometryNodes[geomID];
					var sdMesh: Mesh = {
						name: fbxGeom.objectName,
						userRef: fbxGeom.objectID,
						positions: null,
						streams: []
					};
					var polygonIndexes: Int32Array = null;

					for (var c of fbxGeom.children) {
						if (c.name == "Vertices") {
							sdMesh.positions = <Float64Array>c.values[0];
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
							let strm = this.makeLayerElementStream(c);
							if (strm) {
								sdMesh.streams.push(strm);
							}
						}
					}

					// With all streams and stuff collected, create the mesh
					var t0 = performance.now();
					var mb = new mesh.MeshBuilder(sdMesh.positions, sdMesh.streams);
					var polygonIndexCount = polygonIndexes.length;
					var polygonVertexIndexArray: number[] = []
					var vertexIndexArray: number[] = []

					// Perform linear scan through polygon indexes as tris and quads can
					// be used arbitrarily, the last index of each polygon is indicated
					// by a negated index.
					for (var pvi = 0; pvi < polygonIndexCount; ++pvi) {
						var vi = polygonIndexes[pvi];
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

					var t1 = performance.now();

					sdMesh.meshData = mb.complete();
					sdMesh.indexMap = mb.indexMap;

					var t2 = performance.now();
					tStreams += (t1 - t0);
					tMeshData += (t2 - t1);

					group.addMesh(sdMesh);

					// hook up mesh to linked model
					for (let mco of fbxGeom.connectionsOut) {
						var model = mco.toNode;
						if (model.name == "Model") {
							var sdModel = this.flattenedModels.get(model.objectID);
							sdModel.mesh = sdMesh;
						}
					}
				}

				console.info("fbx streams build time " + tStreams.toFixed(1));
				console.info("fbx meshdata build time " + tMeshData.toFixed(1));
			}


			private makeLightDescriptorFromFBXLight(lightAttrNode: FBXNode): world.LightDescriptor {
				// fbx defaults
				var ld: world.LightDescriptor = {
					type: world.LightType.Point,
					colour: [1, 1, 1],

					ambientIntensity: 0,
					diffuseIntensity: 1,

					range: 1,
					cutoff: math.deg2rad(45 / 2),
					
					shadowType: world.ShadowType.None,
					shadowQuality: world.ShadowQuality.Auto,
					shadowStrength: 1
				};

				var fbxIntensity = 100;

				for (var c of lightAttrNode.children) {
					if (c.name == "LightType") {
						let fbxLightType = <number>c.values[0];
						if (fbxLightType == 0) {
							ld.type = world.LightType.Point;
						}
						else if (fbxLightType == 1) {
							ld.type = world.LightType.Directional;
						}
						else if (fbxLightType == 2) {
							ld.type = world.LightType.Spot;
						}
						else {
							console.warn("Invalid FBX light type: " + fbxLightType);
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
						ld.shadowType = world.ShadowType.Soft;
					}
				}

				// convert FBX intensity to something we can work with
				if (ld.type == world.LightType.Directional) {
					ld.diffuseIntensity = math.clamp01(fbxIntensity / 100);
				}
				else {
					ld.range = fbxIntensity / 100;
				}

				return ld;
			}


			private buildModels(group: AssetGroup, options: FBXResolveOptions) {
				for (var modelID in this.modelNodes) {
					var fbxModel = this.modelNodes[modelID];
					var sdModel = makeModel(fbxModel.objectName, fbxModel.objectID);

					// skip bones we don't care about if allowed
					if (options.removeUnusedBones) {
						let modelName = fbxModel.objectName;
						if (modelName.length > 3 && modelName.substr(-3) == "Nub") {
							continue;
						}
					}

					// get the local transform
					var preRot: Float4 = [0, 0, 0, 1];
					var postRot: Float4 = [0, 0, 0, 1];
					var localRot: Float4 = [0, 0, 0, 1];
					for (var c of fbxModel.children) {
						let vecVal = <number[]>c.values;
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
					for (var conn of fbxModel.connectionsIn) {
						var connType = conn.fromNode.name;
						var connSubType = conn.fromNode.objectSubClass;

						if (connType == "Material") {
							let mat = group.materials.find((t) => t && <number>t.userRef == conn.fromID);
							if (mat) {
								if (! sdModel.materials) {
									sdModel.materials = [];
								}
								sdModel.materials.push(mat);
							}
							else {
								console.warn("Could not connect material " + conn.fromID + " to model " + modelID);
							}
						}
						else if (connType == "NodeAttribute") {
							if (connSubType == "LimbNode" || connSubType == "Root") {
								sdModel.joint = {
									root: connSubType == "Root"
								};
							}
							else if (connSubType == "Light") {
								sdModel.light = {
									descriptor: this.makeLightDescriptorFromFBXLight(conn.fromNode)
								};
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


			private buildHierarchy(group: AssetGroup, options: FBXResolveOptions) {
				for (var conn of this.hierarchyConnections) {
					var childModel = this.flattenedModels.get(conn.fromID);
					var parentModel = this.flattenedModels.get(conn.toID);

					if (childModel && parentModel) {
						parentModel.children.push(childModel);
						assert(childModel.parent == null, "Cannot re-parent node " + childModel.userRef);
						childModel.parent = parentModel;
						if (conn.toID == 0) {
							group.addModel(childModel);
						}
					}
				}
			}


			private animPropForConnectionNames(curvePropName: string, modelPropName: string): AnimationProperty {
				var ap = AnimationProperty.None;

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


			private buildAnimations(group: AssetGroup, options: FBXResolveOptions) {
				// the number of units of time per second for a KTime value
				const KTimeUnit = 46186158000;

				for (var curveNodeID in this.animCurveNodes) {
					var fbxCurveNode = this.animCurveNodes[curveNodeID];
					if (fbxCurveNode.connectionsIn.length == 0 || fbxCurveNode.connectionsOut.length == 0) {
						continue;
					}

					// link to first out connection
					var outConn = fbxCurveNode.connectionsOut[0];
					var jointModel = this.flattenedModels.get(outConn.toID);
					if (! jointModel) {
						// likely a curve for an omitted joint
						continue;
					}

					var tracks: AnimationTrack[] = [];
					for (let inConn of fbxCurveNode.connectionsIn) {
						let curve = inConn.fromNode;
						let timesNode = curve.childByName("KeyTime");
						let valuesNode = curve.childByName("KeyValueFloat");

						if (timesNode && valuesNode) {
							let times = <TypedArray>timesNode.values[0];
							let values = <TypedArray>valuesNode.values[0];
							let count = times.length;
							assert(times.length == values.length, "Invalid animation key data");

							// determine property being animated
							var animProp = this.animPropForConnectionNames(inConn.propName, outConn.propName);

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


			private buildSkins(group: AssetGroup, options: FBXResolveOptions) {
				for (var skinNodeID in this.skinNodes) {
					var fbxSkin = this.skinNodes[skinNodeID];
					if (fbxSkin.connectionsIn.length == 0 || fbxSkin.connectionsOut.length == 0) {
						console.warn("Skin " + skinNodeID + " either has no mesh or no clusters. Skipping.");
						continue;
					}

					var sdSkin: Skin = {
						name: fbxSkin.objectName,
						userRef: fbxSkin.objectID,
						groups: []
					};

					for (var clusterConn of fbxSkin.connectionsIn) {
						var cluster = clusterConn.fromNode;
						var wvg: WeightedVertexGroup = {
							name: cluster.objectName,
							userRef: cluster.objectID,
							indexes: null,
							weights: null,
							bindPoseLocalTranslation: null,
							bindPoseLocalRotation: null,
							bindPoseLocalMatrix: null
						};

						for (let cc of cluster.children) {
							if (cc.name == "Indexes") {
								wvg.indexes = <Int32Array>(cc.values[0]);
							}
							else if (cc.name == "Weights") {
								wvg.weights = <Float64Array>(cc.values[0]);
							}
							else if (cc.name == "Transform") {
								let txmat = <Float64Array>(cc.values[0]);
								let mat33 = mat3.fromMat4([], txmat);
								let txq = quat.fromMat3([], mat33);
								let trans = [txmat[12], txmat[13], txmat[14]];

								wvg.bindPoseLocalTranslation = trans;
								wvg.bindPoseLocalRotation = txq;
								wvg.bindPoseLocalMatrix = txmat;
							}
						}

						if (! (wvg.indexes && wvg.weights && wvg.bindPoseLocalTranslation && wvg.bindPoseLocalRotation)) {
							console.warn("Incomplete cluster " + clusterConn.fromID, cluster, wvg);
						}
						else {
							for (let cinc of cluster.connectionsIn) {
								var cinNode = cinc.fromNode;
								if (cinNode.name == "Model") {
									let sdModel = this.flattenedModels.get(cinNode.objectID);

									if (sdModel) {
										if (sdModel.joint) {
											sdModel.vertexGroup = wvg;
										}
										else {
											console.warn("Model " + cinNode.objectID + " has a cluster but no joint?");
										}
									}
									else {
										console.warn("Can't connect cluster " + cluster.objectID + " to model " + cinNode.objectID);
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
				var defaults: FBXResolveOptions = {
					allowMissingTextures: true,
					forceMipMapsOn: true,
					removeUnusedBones: true
				};
				copyValues(defaults, options || {});

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
			private curObject: FBXNode = null;
			private curNodeParent: FBXNode = null;

			private knownObjects: Set<string>;

			private assets_: Promise<AssetGroup> = null;

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

				var skip = false;

				if (this.state == BuilderState.Root) {
					if (name == "GlobalSettings")
						this.state = BuilderState.GlobalSettings;
					else if (name == "Objects")
						this.state = BuilderState.Objects;
					else if (name == "Connections")
						this.state = BuilderState.Connections;
					else
						skip = true;
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
					var node = new FBXNode(name, values);
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
					if (this.state = BuilderState.Object) {
						this.doc.addObject(this.curObject);

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
				var node = new FBXNode(name, values, type, typeName);

				if (this.state == BuilderState.GlobalSettings) {
					this.doc.globalSetting(node);
				}
				else if (this.state == BuilderState.Object) {
					this.curNodeParent.appendChild(node);
				}
				else if (this.state == BuilderState.Connections) {
					assert(name == "C", "Only C properties are allowed inside Connections");
					var binding = <string>node.values[0];
					var fromID = <number>node.values[1];
					var toID = <number>node.values[2];

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
				console.info("fbx parse time " + (performance.now() - this.parseT0).toFixed(1));
				this.assets_ = this.doc.resolve();
			}


			error(msg: string, offset: number, token?: string) {
				console.warn("FBX parse error @ offset " + offset + ": " + msg, token);
			}


			get assets(): Promise<AssetGroup> {
				return this.assets_;
			}
		}

	} // ns fbx


	function parseFBXSource(filePath: string, source: string | ArrayBuffer): Promise<AssetGroup> {
		var t0 = performance.now();
 		var del = new fbx.FBX7DocumentParser(filePath);
		var parser: fbx.parse.FBXParser;
		if (typeof source === "string") {
			parser = new fbx.parse.FBXTextParser(source, del);
		}
		else {
			parser = new fbx.parse.FBXBinaryParser(source, del);
		}
		parser.parse();
		return del.assets.then(grp => {
			console.info("fbx total time: " + (performance.now() - t0).toFixed(1) + "ms");
			return grp;
		});
	}


	export function loadFBXTextFile(filePath: string): Promise<AssetGroup> {
		return loadFile(filePath).then((text: string) => parseFBXSource(filePath, text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<AssetGroup> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXSource(filePath, data));
	}


	export function loadFBXFile(filePath: string): Promise<AssetGroup> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => {
			var bytes = new Uint8Array(data);
			var ident = String.fromCharCode.apply(null, bytes.subarray(0, 20));
			if (ident == "Kaydara FBX Binary  ") {
				return parseFBXSource(filePath, data);
			}
			else {
				return parseFBXSource(filePath, convertBytesToString(bytes));
			}
		});
	}

} // ns sd.asset
