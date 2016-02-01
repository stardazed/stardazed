// asset-fbx.ts - FBX file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export const enum FBXArrayElementType {
		SInt32,
		Float32
	}


	export interface FBXParserDelegate {
		label(name: string): void;
		string(value: string): void;
		number(value: number): void;

		openContext(): void;
		closeContext(): void;
	}


	export interface FBXData {
	}


	class FBX2013ParserDelegate implements FBXParserDelegate {
		label(name: string) {
			console.info("KEY: " + name);
		}

		string(value: string) {
			console.info("P: " + value);
		}

		number(value: number) {
			console.info("P: " + value);
		}

		openContext() {
			console.info(">>>>");
		}

		closeContext() {
			console.info("<<<<");
		}

		output(): FBXData {
			return {};
		}
	}


	function parseFBXTextSource(text: string) {
		var del = new FBX2013ParserDelegate();
		var parser = new FBXTextParser(text);

		parser.parse();		

		return del.output;
	}


	export function loadFBXTextFile(filePath: string): Promise<FBXData> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}

} // ns sd.asset
