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
				Object
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

				"object": FBXPropertyType.Object
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

		class Node {
			name: string;
			type: parse.FBXPropertyType;
			typeName: string;
			values: parse.FBXValue[];
			children: Node[];
			parent: Node;

			connectionsIn: Connection[];
			connectionsOut: Connection[];

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

			appendChild(node: Node) {
				assert(node.parent == null, "Can't re-parent a Node");
				node.parent = this;
				this.children.push(node);
			}

			objectName() {
				var cns = <string>this.values[1];
				return cns.split("::")[1];
			}
		}


		type ObjectSet = { [id: number]: Node };


		interface Connection {
			fromID: number;
			fromNode?: Node;
			toID: number;
			toNode?: Node;
			propName?: string;
		}


		export interface FBXDocument {
		}


		class FBXDocumentGraph {
			private globals: Node[];

			private allObjects: ObjectSet; 
			private geometryNodes: ObjectSet;
			private videoNodes: ObjectSet;
			private textureNodes: ObjectSet;
			private materialNodes: ObjectSet;
			private modelNodes: ObjectSet;

			private connections: Connection[];
			private rootNode: Node;

			constructor() {
				this.globals = [];

				this.allObjects = {};
				this.geometryNodes = {};
				this.videoNodes = {};
				this.textureNodes = {};
				this.materialNodes = {};
				this.modelNodes = {};

				this.connections = [];

				this.rootNode = new Node("RootNode", [0, "Model::RootNode", "RootNode"])
				this.allObjects[0] = this.rootNode;
			}

			globalSetting(node: Node) {
				this.globals.push(node);
			}

			addObject(node: Node) {
				var typeSetMap: { [name: string]: ObjectSet } = {
					"Geometry": this.geometryNodes,
					"Video": this.videoNodes,
					"Texture": this.textureNodes,
					"Material": this.materialNodes,
					"Model": this.modelNodes
				};

				var id = <number>node.values[0];
				var subClass = <string>node.values[2];
				var set = typeSetMap[node.name];
				assert(set != null, "Unknown object class " + node.name);

				if (node.name == "Model") {
					if (subClass != "Mesh") {
						// ignore all non-mesh models for now
						return;
					}
				}
				else if (node.name == "Video") {
					if (subClass != "Clip") {
						// ignore HLSL shaders
						return;
					}
				}

				set[id] = node;
				this.allObjects[id] = node;
			}

			addConnection(conn: Connection) {
				conn.fromNode = this.allObjects[conn.fromID];
				conn.toNode = this.allObjects[conn.toID];
				
				if (conn.fromNode && conn.toNode) {
					conn.fromNode.connectionsOut.push(conn);
					conn.toNode.connectionsIn.push(conn);
					this.connections.push(conn);
				}
			}


			private loadTextures(group: AssetGroup): Promise<AssetGroup> {
				var fileProms: Promise<Texture2D>[] = [];

				Object.keys(this.videoNodes).forEach((idStr) => {
					var vidID = +idStr;
					var fbxVideo = this.videoNodes[vidID];
					var tex: Texture2D = {
						name: fbxVideo.objectName(),
						userRef: vidID,
						useMipMaps: render.UseMipMaps.No
					};
					var fileData: ArrayBuffer = null;

					for (let c of fbxVideo.children) {
						if (c.name == "UseMipMap") {
							tex.useMipMaps = (<number>c.values[0] != 0) ? render.UseMipMaps.Yes : render.UseMipMaps.No;
						}
						else if (c.name == "RelativeFilename") {
							tex.filePath = <string>c.values[0];
						}
						else if (c.name == "Content") {
							fileData = <ArrayBuffer>c.values[0];
						}
					}

					var makeTexDesc = (img: render.TextureImageSource) => {
						return render.makeTexDesc2DFromImageSource(img, tex.useMipMaps);
					};

					if (fileData) {
						fileProms.push(new Promise((resolve, reject) => {
							var mime = mimeTypeForFilePath(tex.filePath);
							if (! mime) {
								reject("Cannot create texture, no mime-type found for file path " + tex.filePath);
							}
							else {
								loadImageFromBuffer(fileData, mime).then((img) => {
									tex.descriptor = makeTexDesc(img);
									resolve(tex);
								}, (error) => reject(error));
							}
						}));
					}
					else {
						fileProms.push(loadImage(tex.filePath).then((img) => {
							tex.descriptor = makeTexDesc(img);
							return tex;
						}));
					}
				});

				return Promise.all(fileProms).then((textures) => {
					for (var tex of textures) {
						group.addTexture(tex);
					}
					return group;
				}, () => null);
			}


			resolve(): Promise<AssetGroup> {
				return this.loadTextures(new AssetGroup())
				.then((group) => {
					for (var matID in this.materialNodes) {
						let fbxMat = this.materialNodes[matID];
						let mat = makeMaterial();
						mat.name = fbxMat.objectName();

						for (let c of fbxMat.children) {
							if (c.name == "DiffuseColor") {
								vec3.copy(mat.diffuseColour, <number[]>c.values);
							}
							else if (c.name == "SpecularColor") {
								vec3.copy(mat.specularColour, <number[]>c.values);
							}
							else if (c.name == "SpecularFactor") {
								mat.specularFactor = <number>c.values[0];
							}
							else if (c.name == "ShininessExponent") {
								mat.specularExponent = <number>c.values[0];
							}
						}

						// use only first connection for now (if it exists)
						if (fbxMat.connectionsIn.length > 0) {
							// An FBX "Texture" connects a "Video" clip to a "Material"
							// with some parameters and may also directly reference a named
							// set of UV coordinates in a "Model" used by the material...
							var texNode = fbxMat.connectionsIn[0].fromNode;
							var videoNodeID = texNode.connectionsIn[0].fromID;
							var tex2D = group.textures.find((t) => <number>t.userRef == videoNodeID);
							
							if (! (texNode && tex2D)) {
								console.warn("Could not link texture to material.");
							}
							else {
								mat.diffuseTexture = tex2D;

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

						group.addMaterial(mat);
					}

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
			private curObject: Node = null;
			private curNodeParent: Node = null;

			private knownObjects: Set<string>;

			private assets_: Promise<AssetGroup> = null;

			constructor() {
				this.doc = new FBXDocumentGraph();
				this.knownObjects = new Set<string>(["Geometry", "Video", "Texture", "Material", "Model"]);
			}


			block(name: string, values: parse.FBXValue[]): parse.FBXBlockAction {
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
						this.curObject = new Node(name, values);
						this.curNodeParent = this.curObject;
					}
					else {
						skip = true;
					}
				}
				else if (this.curNodeParent) {
					var node = new Node(name, values);
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
				var node = new Node(name, values, type, typeName);

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


	function parseFBXSource(source: string | ArrayBuffer): Promise<AssetGroup> {
		var t0 = performance.now();
 		var del = new fbx.FBX7DocumentParser();
		var parser: fbx.parse.FBXParser;
		if (typeof source === "string") {
			parser = new fbx.parse.FBXTextParser(source, del);
		}
		else {
			parser = new fbx.parse.FBXBinaryParser(source, del);
		}
		parser.parse();
		console.info("took: " + (performance.now() - t0).toFixed(1) + "ms");
		return del.assets;
	}


	export function loadFBXTextFile(filePath: string): Promise<AssetGroup> {
		return loadFile(filePath).then((text: string) => parseFBXSource(text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<AssetGroup> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXSource(data));
	}

} // ns sd.asset
