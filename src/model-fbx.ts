// model-fbx.ts - FBX scene/model file import
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	const enum FBXArrayElementType {
		SInt32,
		Float32
	}


	interface FBXParserDelegate {
		key(name: string): void;
		property(value: string | number): void;

		openContext(): void;
		closeContext(): void;

		arrayElementTypeForKey(key: string): FBXArrayElementType;
		intArray(data: Int32Array): void;
		floatArray(data: Float32Array): void;
	}


	class FBX2013ParserDelegate implements FBXParserDelegate {
		key(name: string) {

		}

		property(value: string | number) {

		}

		openContext() {

		}

		closeContext() {

		}

		arrayElementTypeForKey(key: string): FBXArrayElementType {
			return FBXArrayElementType.Float32;
		}

		intArray(data: Int32Array) {

		}

		floatArray(data: Float32Array) {

		}

		output(): FBXData {
			return {};
		}
	}


	class FBXTextParser {
		constructor(source: string) {

		}

		parse(delegate: FBXParserDelegate) {

		}
	}


	export interface FBXData {
	}


	function parseFBXTextSource(text: string) {
		var del = new FBX2013ParserDelegate();
		var parser = new FBXTextParser(text);
		parser.parse(del);
		return del.output;
	}


	export function loadFBXTextFile(filePath: string): Promise<FBXData> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}

} // ns sd.world
