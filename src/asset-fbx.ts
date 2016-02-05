// asset-fbx.ts - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export namespace fbx {

		// -- FBX Document data

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

		export interface FBXGeometry {
			vertexCount: number;
			triangleCount: number;

			positions: TypedArray;
			triangleIndexes: TypedArray;

			streams: FBXGeometryStream[];
		}

		export interface FBXModel {
			localPosition: Float3;
			localRotation: Float4;
			localScaling: Float3;
		}

		export interface FBXMeshModel extends FBXModel {
			geometry: FBXGeometry;
			materials: Material[];
		}

		export interface FBXLightAttr {
			colour: Float3;
			intensity: number;
		}

		export interface FBXLightModel extends FBXModel {
			light: FBXLightAttr;
		}

		export interface FBXCameraAttr {
			clearColour: Float3;
			fov: number;
			nearZ: number;
			farZ: number;
		}

		export interface FBXCameraModel {
			camera: FBXCameraAttr;
		}

		export interface FBXDocument {
			geometries: FBXGeometry[];
			lightAttrs: FBXLightAttr[];
			cameraAttrs: FBXCameraAttr[];

			meshes: FBXMeshModel[];
			lights: FBXLightModel[];
			cameras: FBXCameraModel[];

			materials: Material[];
			textures: Texture2D[];
		}


		// -- Parser related types and functions

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

		export function normalizeFBXType(fbxType: string): FBXValueType {
			return fbxTypeNameMapping[fbxType.toLowerCase()] || FBXValueType.Invalid;
		}

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
				type: normalizeFBXType(<string>pValues[1]),
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


		// -- Document builder

		const enum FBXSection {
			Root,

			Header,
			GlobalSettings,
			Objects,
			Connections
		}


		export class FBX7DocumentBuilder implements FBXParserDelegate {
			private doc: FBXDocument;
			private section: FBXSection = FBXSection.Root;

			constructor() {
				this.doc = {
					geometries: [],
					lightAttrs: [],
					cameraAttrs: [],

					meshes: [],
					lights: [],
					cameras: [],

					materials: [],
					textures: []
				};
			}


			block(name: string, values: FBXValue[]): FBXBlockAction {
				console.info("BLK: " + name, values);
				return (name == "Definitions") ? FBXBlockAction.Skip : FBXBlockAction.Enter;
			}

			property(name: string, values: FBXValue[]) {
				console.info("Prop: " + name, values);
			}

			typedProperty(name: string, type: FBXValueType, typeName: string, values: FBXValue[]) {
				console.info("Typed Prop: " + name + " " + typeName + " (" + type + ")", values);
			}

			endBlock() {
				console.info("/BLK");
			}


			error(msg: string, offset: number, token?: string) {
				console.warn("FBX parse error @ offset " + offset + ": " + msg, token);
			}


			get document(): FBXDocument {
				return this.doc;
			}
		}

	} // ns fbx


	function parseFBXTextSource(text: string) {
		var del = new fbx.FBX7DocumentBuilder();
		var parser = new fbx.FBXTextParser(text, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.document;
	}


	function parseFBXBinarySource(data: ArrayBuffer) {
		var del = new fbx.FBX7DocumentBuilder();
		var parser = new fbx.FBXBinaryParser(data, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.document;
	}


	export function loadFBXTextFile(filePath: string): Promise<fbx.FBXDocument> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<fbx.FBXDocument> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXBinarySource(data));
	}

} // ns sd.asset.fbx
