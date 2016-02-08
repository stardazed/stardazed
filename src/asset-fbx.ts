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

			export const enum FBXValueType {
				Invalid,

				Int,
				Double,
				Bool,
				Time,
				String,
				Vector3D,
				Object,

				Compound
			}

			const fbxTypeNameMapping: { [type: string]: FBXValueType } = {
				"enum": FBXValueType.Int,
				"int": FBXValueType.Int,
				"integer": FBXValueType.Int,

				"double": FBXValueType.Double,
				"number": FBXValueType.Double,
				"ulonglong": FBXValueType.Double,

				"bool": FBXValueType.Bool,
				"visibility": FBXValueType.Bool,
				"visibility inheritance": FBXValueType.Bool,

				"ktime": FBXValueType.Time,

				"kstring": FBXValueType.String,
				"datetime": FBXValueType.String,

				"vector3d": FBXValueType.Vector3D,
				"vector": FBXValueType.Vector3D,
				"color": FBXValueType.Vector3D,
				"colorrgb": FBXValueType.Vector3D,
				"lcl translation": FBXValueType.Vector3D,
				"lcl rotation": FBXValueType.Vector3D,
				"lcl scaling": FBXValueType.Vector3D,

				"object": FBXValueType.Object,
				"compound": FBXValueType.Compound
			};

			export interface FBXProp70Prop {
				name: string;
				typeName: string;
				type: FBXValueType;
				values: FBXValue[];
			}

			export function interpretProp70P(pValues: FBXValue[]) {
				assert(pValues.length >= 4, "A P must have 4 or more values.");

				var result: FBXProp70Prop = {
					name: <string>pValues[0],
					typeName: <string>pValues[1],
					type: fbxTypeNameMapping[(<string>pValues[1]).toLowerCase()] || FBXValueType.Invalid,
					values: pValues.slice(4)
				};

				assert(result.type != FBXValueType.Invalid, "Unknown Prop70 type: " + result.typeName);
				return result;
			}

			export interface FBXParserDelegate {
				block(name: string, values: FBXValue[]): FBXBlockAction;
				endBlock(): void;

				property(name: string, values: FBXValue[]): void;
				typedProperty(name: string, type: FBXValueType, typeName: string, values: FBXValue[]): void;

				error(msg: string, offset: number, token?: string): void;
			}

			export interface FBXParser {
				delegate: FBXParserDelegate;
				parse(): void;
			}

		} // ns parse


		// -- FBX Document data

		export const enum FBXObjectType {
			None,

			Geometry,
			Model,
			Material,
			Video,
			Texture,
			NodeAttribute
		}

		function fbxObjectTypeForName(typeName: string) {
			switch (typeName) {
				case "Geometry": return FBXObjectType.Geometry;
				case "Model": return FBXObjectType.Model;
				case "Material": return FBXObjectType.Material;
				case "Video": return FBXObjectType.Video;
				case "Texture": return FBXObjectType.Texture;
				case "NodeAttribute": return FBXObjectType.NodeAttribute;
			}

			return FBXObjectType.None;
		}

		export interface FBXObject {
			type: FBXObjectType;
			id: number;
			name: string;
			class: string;
			subClass: string;
		}

		export const enum FBXGeometryStreamType {
			Normal = 1,
			UV,
			MaterialIndex,
			TextureIndex
		}

		export const enum FBXGeometryStreamMappingType {
			PerVertex = 1,
			PerPolygonvertex,
			PerPolygon,
			AllSame
		}

		export const enum FBXGeometryStreamReferenceType {
			Direct = 1,
			IndexToDirect = 2
		}

		export interface FBXGeometryStream {
			name: string;
			index: number;
			type: FBXGeometryStreamMappingType;
			mappingType: FBXGeometryStreamMappingType;
			referenceType: FBXGeometryStreamReferenceType;
			dataArray?: TypedArray;
			indexArray?: TypedArray;
		}

		export interface FBXGeometry extends FBXObject {
			vertexCount: number;
			triangleCount: number;

			positions: TypedArray;
			triangleIndexes: TypedArray;

			streams: FBXGeometryStream[];
		}

		export interface FBXModel extends FBXObject {
			localPosition: Float3;
			localRotation: Float4;
			localScaling: Float3;
		}

		export interface FBXMeshModel extends FBXModel {
			geometry: FBXGeometry;
			materials: Material[];
		}

		export interface FBXMaterial extends FBXObject {
			material: Material;
		}

		export interface FBXLightAttr extends FBXObject {
			colour: Float3;
			intensity: number;
		}

		export interface FBXLightModel extends FBXModel {
			light: FBXLightAttr;
		}

		export interface FBXCameraAttr extends FBXObject {
			clearColour: Float3;
			fov: number;
			nearZ: number;
			farZ: number;
		}

		export interface FBXCameraModel extends FBXModel {
			camera: FBXCameraAttr;
		}

		export interface FBXMarkerAttr extends FBXObject {
			colour: Float3;
		}

		export interface FBXMarkerModel extends FBXModel {
			marker: FBXMarkerAttr;
		}

		export interface FBXVideo extends FBXObject {
			useMipMap: boolean;
			filePath: string;
			texture?: FBXTexture;
			textureData?: ArrayBuffer;
		}

		export interface FBXTexture extends FBXObject {
			uvStreamName: string;
			uvScale: Float2;
			uvOffset: Float2;
		}

		export interface FBXDocument {
			geometries: FBXGeometry[];
			lightAttrs: FBXLightAttr[];
			cameraAttrs: FBXCameraAttr[];
			markerAttrs: FBXMarkerAttr[];

			meshes: FBXMeshModel[];
			lights: FBXLightModel[];
			cameras: FBXCameraModel[];
			markers: FBXMarkerModel[];

			materials: FBXMaterial[];
			clips: FBXVideo[];
			textures: FBXTexture[];
		}


		function makeFBXObject(name: string, values: parse.FBXValue[]): FBXObject {
			assert(values.length == 3 &&
				typeof values[0] == "number" &&
				typeof values[1] == "string" &&
				typeof values[2] == "string");

			var classAndName = (<string>values[1]).split("::");
			assert(values.length == 2);

			var o: FBXObject = {
				type: fbxObjectTypeForName(name),
				id: <number>values[0],
				name: classAndName[1],
				"class": classAndName[0],
				subClass: <string>values[2]
			};

			switch (o.type) {
				case FBXObjectType.Geometry:
					{
						let g = <FBXGeometry>(o);
						g.vertexCount = 0;
						g.triangleCount = 0;
						g.positions = null;
						g.triangleIndexes = null;
						g.streams = [];
					}
					break;
				case FBXObjectType.Material:
					{
						let m = <FBXMaterial>(o);
						m.material = makeMaterial();
					}
					break;
				case FBXObjectType.Model:
					{
						let m = <FBXModel>(o);
						m.localPosition = [0, 0, 0];
						m.localRotation = [0, 0, 0];
						m.localScaling = [1, 1, 1];

						if (o.subClass == "Mesh") {
							let mm = <FBXMeshModel>(m);
							mm.geometry = null;
							mm.materials = [];
						}
						else if (o.subClass == "Light") {
							let lm = <FBXLightModel>(m);
							lm.light = null;
						}
						else if (o.subClass == "Camera") {
							let cm = <FBXCameraModel>(m);
							cm.camera = null;
						}
						else if (o.subClass == "Marker") {
							let mm = <FBXMarkerModel>(o);
							mm.marker = null;
						}
					}
					break;
				case FBXObjectType.NodeAttribute:
					{
						if (o.subClass == "Light") {
							let la = <FBXLightAttr>(o);
							la.colour = [0, 0, 0];
							la.intensity = 0;
						}
						else if (o.subClass == "Camera") {
							let ca = <FBXCameraAttr>(o);
							ca.clearColour = [0, 0, 0];
							ca.nearZ = 1;
							ca.farZ = 1000;
							ca.fov = 45;
						}
						else if (o.subClass == "Marker") {
							let ma = <FBXMarkerAttr>(o);
							ma.colour = [0, 0, 0];
						}
					}
					break;
				case FBXObjectType.Texture:
					{
						let t = <FBXTexture>(o);
						t.uvOffset = [0, 0];
						t.uvScale = [1, 1];
						t.uvStreamName = "";
					}
					break;
				case FBXObjectType.Video:
					{
						let v = <FBXVideo>(o);
						v.filePath = "";
						v.texture = null;
						v.textureData = null;
					}
					break;
			}

			return o;
		}


		// -- Document builder

		const enum Section {
			Root,

			GlobalSettings,
			Objects,
			Connections
		}


		export class FBX7DocumentBuilder implements parse.FBXParserDelegate {
			private doc: FBXDocument;
			private section = Section.Root;
			private object: FBXObject = null;
			private depth = 0;

			constructor() {
				this.doc = {
					geometries: [],
					lightAttrs: [],
					cameraAttrs: [],
					markerAttrs: [],

					meshes: [],
					lights: [],
					cameras: [],
					markers: [],

					materials: [],
					clips: [],
					textures: []
				};
			}


			block(name: string, values: parse.FBXValue[]): parse.FBXBlockAction {
				console.info("BLK: " + name, values);
				var skip = false;
				if (this.section == Section.Root) {
					if (name == "GlobalSettings")
						this.section = Section.GlobalSettings;
					else if (name == "Objects")
						this.section = Section.Objects;
					else if (name == "Connections")
						this.section = Section.Connections;
					else
						skip = true;
				}
				else if (this.section == Section.Objects) {
					if (this.depth == 1) {
						if (name == "Geometry") {
							this.object = makeFBXObject(name, values);
						}
					}
				}

				if (! skip) {
					this.depth++;
					return parse.FBXBlockAction.Enter;
				}
				return parse.FBXBlockAction.Skip;
			}


			endBlock() {
				console.info("/BLK");
				this.depth--;
				if (this.depth == 0) {
					this.section = Section.Root;
				}
			}


			property(name: string, values: parse.FBXValue[]) {
				console.info("Prop: " + name, values);
				if (name == "Content") {
					var str = convertBytesToString(new Uint8Array(<ArrayBuffer>values[0]));
					var b64 = btoa(str);
					str = "data:image/png;base64," + b64;
					var img = new Image();
					img.src = str;
				}
			}


			typedProperty(name: string, type: parse.FBXValueType, typeName: string, values: parse.FBXValue[]) {
				console.info("Typed Prop: " + name + " " + typeName + " (" + type + ")", values);
			}


			error(msg: string, offset: number, token?: string) {
				console.warn("FBX parse error @ offset " + offset + ": " + msg, token);
			}


			get document(): FBXDocument {
				return this.doc;
			}
		}

	} // ns fbx


	function parseFBXSource(source: string | ArrayBuffer): fbx.FBXDocument {
 		var del = new fbx.FBX7DocumentBuilder();
		var parser: fbx.parse.FBXParser;
		if (typeof source === "string") {
			parser = new fbx.parse.FBXTextParser(source, del);
		}
		else {
			parser = new fbx.parse.FBXBinaryParser(source, del);
		}
		parser.parse();
		return del.document;
	}


	export function loadFBXTextFile(filePath: string): Promise<fbx.FBXDocument> {
		return loadFile(filePath).then((text: string) => parseFBXSource(text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<fbx.FBXDocument> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXSource(data));
	}

} // ns sd.asset
