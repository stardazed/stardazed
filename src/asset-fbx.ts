// asset-fbx.ts - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export interface FBXDocument {
	}	


	export type FBXFieldProp = number | string | ArrayBuffer;

	export interface FBXParserDelegate {
		field(name: string, properties: FBXFieldProp[]): void;
		arrayProperty(array: TypedArray): void;

		openContext(): void;
		closeContext(): void;

		error(msg: string, offset: number, token?: string): void;
	}


	interface FBXNode {
		name: string;
		properties: FBXFieldProp[];
		fields: { [name: string]: FBXTypedProperty };
		array?: TypedArray;
	}


	interface FBXObject extends FBXNode {
		id: number;
		class: string;
		subClass: string;
	}


	interface FBXTypedProperty {
		type: string;
		values: (FBXFieldProp | TypedArray)[];
	}


	const enum FBXSection {
		None,

		Header,
		GlobalSettings,
		Objects,
		Connections,

		Ignored
	}


	class FBX7DocumentBuilder implements FBXParserDelegate {
		private doc: FBXDocument;
		private objects: Map<number, FBXObject>;
		private stack: FBXNode[] = [];
		private section: FBXSection = FBXSection.None;
		private curNode: FBXNode = null;
		private insideProp70 = false;

		constructor() {
			this.objects = new Map<number, FBXObject>();
		}


		private get curParent() {
			if (this.stack.length == 0) {
				return null;
			}

			return this.stack[this.stack.length - 1];
		}


		private appendNodeAsField(node: FBXNode) {
			var parent = this.curParent;
			assert(parent != null);

			// parent.fields[node.name] = {
			// 	type: 
			// };
		}

		field(name: string, properties: FBXFieldProp[]) {
			if (this.stack.length == 0) {
				switch (name) {
					case "HeaderExtension": this.section = FBXSection.Header; break;
					case "GlobalSettings": this.section = FBXSection.GlobalSettings; break;
					case "Objects": this.section = FBXSection.Objects; break;
					case "Connections": this.section = FBXSection.Connections; break;
					default: this.section = FBXSection.Ignored; break;
				}
			}
			else {
				if (name == "Properties70") {
					this.insideProp70 = true;
				}
				else {
					if (this.insideProp70) {
						assert(name == "P", "Expected only P properties in a Properties70 context, got:" + name);
						assert(this.curNode.fields[name] == null, "Duplicate typed field " + name);
						assert(properties.length > 4, "A P must have 4 strings followed by at least 1 data value");

						this.curNode.fields[<string>(properties[0])] = {
							type: <string>(properties[1]),
							values: <(number | string)[]>(properties.slice(4))
						};
					}
					else {
						if (this.curNode) {
							this.appendNodeAsField(this.curNode);
						}
						this.curNode = { name: name, properties: properties, fields: {} };
					}
				}
			}
		}

		arrayProperty(array: TypedArray) {
			this.curNode.array = array;
		}

		openContext() {
			if (! this.insideProp70) {
				this.stack.push(this.curNode);
				this.curNode = null;
			}
		}

		closeContext() {
			if (this.insideProp70) {
				this.insideProp70 = false;
			}
			else {
				if (this.curNode) {
					this.appendNodeAsField(this.curNode);
					this.curNode = null;
				}

				if (this.stack.length == 0) {
					this.section = FBXSection.None;
				}
			}
		}

		error(msg: string, offset: number, token?: string) {
			console.warn("FBX Error @ offset " + offset + ": " + msg);
		}

		get document(): FBXDocument {
			return this.doc;
		}
	}


	function parseFBXTextSource(text: string) {
		var del = new FBX7DocumentBuilder();
		var parser = new FBXTextParser(text, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.document;
	}


	function parseFBXBinarySource(data: ArrayBuffer) {
		var del = new FBX7DocumentBuilder();
		var parser = new FBXBinaryParser(data, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.document;
	}


	export function loadFBXTextFile(filePath: string): Promise<FBXDocument> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<FBXDocument> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXBinarySource(data));
	}

} // ns sd.asset
