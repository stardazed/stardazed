// asset-fbx.ts - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export type FBXFieldProp = number | string | ArrayBuffer;

	export interface FBXParserDelegate {
		field(name: string, properties: FBXFieldProp[]): void;

		provideArray(size: number): TypedArray;
		arrayFilled(array: TypedArray): void;

		openContext(): void;
		closeContext(): void;

		error(msg: string, offset: number, token?: string): void;
	}


	export interface FBXData {
	}


	class FBX2013ParserDelegate implements FBXParserDelegate {
		private curField_ = "";
		private curArray_: TypedArray = null;

		field(name: string, properties: FBXFieldProp[]) {
			console.info(name, properties);
		}

		provideArray(size: number): TypedArray {
			return new Float32Array(size);
		}

		arrayFilled(array: TypedArray) {
			console.info("Array", array);
		}

		openContext() {
			console.info(">>>>");
		}

		closeContext() {
			console.info("<<<<");
		}

		error(msg: string, offset: number, token?: string) {
		}

		output(): FBXData {
			return {};
		}
	}


	function parseFBXTextSource(text: string) {
		var del = new FBX2013ParserDelegate();
		var parser = new FBXTextParser(text, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.output;
	}


	function parseFBXBinarySource(data: ArrayBuffer) {
		var del = new FBX2013ParserDelegate();
		var parser = new FBXBinaryParser(data, del);
		var t0 = performance.now();
		parser.parse();
		console.info("time: " + (performance.now() - t0).toFixed(3));
		return del.output;
	}


	export function loadFBXTextFile(filePath: string): Promise<FBXData> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}


	export function loadFBXBinaryFile(filePath: string): Promise<FBXData> {
		return loadFile(filePath, { responseType: FileLoadType.ArrayBuffer }).then((data: ArrayBuffer) => parseFBXBinarySource(data));
	}

} // ns sd.asset
