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


	class FBX7DocumentBuilder implements FBXParserDelegate {
		private doc: FBXDocument;

		constructor() {
		}

		field(name: string, properties: FBXFieldProp[]) {
		}

		arrayProperty(array: TypedArray) {
		}

		openContext() {
		}

		closeContext() {
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
