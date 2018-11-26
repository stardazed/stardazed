/**
 * @stardazed/gltf2-parser-stream - A set of TransformStreams to transform GLTF2 files into assets
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { JSONTransformStream, JSONToken, JSONTokenType } from "@stardazed/json-parser-stream";

interface Asset {
	name: string;
}

const enum ParserMode {
	ROOT,
	BLOCK_KEY,
	ARRAY_BLOCK,
	ARRAY_ITEM,
	ASSET_BLOCK,
	SCENE_DEFAULT_INDEX,
	END
}

interface ItemTransformer extends Transformer<JSONToken, Asset> {
	ready: boolean;
}

class UnknownItemTransformer implements ItemTransformer {
	depth = 0;
	ready = false;

	transform(chunk: JSONToken, _controller: TransformStreamDefaultController<Asset>) {
		if (chunk.type === JSONTokenType.OBJECT_START || chunk.type === JSONTokenType.ARRAY_START) {
			this.depth += 1;
		}
		else if (chunk.type === JSONTokenType.OBJECT_END || chunk.type === JSONTokenType.ARRAY_END) {
			this.depth -= 1;
			if (this.depth === 0) {
				this.ready = true;
			}
		}
	}
}

class GLTF2Transformer implements Transformer<JSONToken, Asset> {
	mode = ParserMode.ROOT;
	itemTransformer: ItemTransformer | undefined;
	lastKey = "";

	transform(chunk: JSONToken, controller: TransformStreamDefaultController<Asset>) {
		if (chunk.type === JSONTokenType.KEY) {
			this.lastKey = chunk.value;
		}

		switch (this.mode) {
			case ParserMode.ROOT:
				if (chunk.type !== JSONTokenType.OBJECT_START) {
					controller.error("json root must be an object");
				}
				else {
					this.mode = ParserMode.BLOCK_KEY;
				}
				break;
			case ParserMode.BLOCK_KEY:
				if (chunk.type === JSONTokenType.KEY) {
					switch (chunk.value) {
						case "asset":
							this.mode = ParserMode.ASSET_BLOCK;
							this.itemTransformer = new UnknownItemTransformer();
							break;
						case "scene":
							this.mode = ParserMode.SCENE_DEFAULT_INDEX;
							break;
						case "scenes":
						case "nodes":
						case "cameras":
						case "meshes":
						case "buffers":
						case "bufferViews":
						case "accessors":
						case "materials":
						case "textures":
						case "images":
						case "samplers":
						case "skins":
						case "animations":
						default:
							this.mode = ParserMode.ARRAY_BLOCK;
							this.itemTransformer = new UnknownItemTransformer();
							break;
					}
				}
				else if (chunk.type === JSONTokenType.OBJECT_END) {
					this.mode = ParserMode.END;
				}
				break;
			case ParserMode.ASSET_BLOCK:
			case ParserMode.ARRAY_ITEM:
				this.itemTransformer!.transform!(chunk, controller);
				if (this.itemTransformer!.ready) {
					this.itemTransformer = undefined;
					if (this.mode === ParserMode.ASSET_BLOCK) {
						this.mode = ParserMode.BLOCK_KEY;
					}
					else {
						
					}
				}
				break;
			case ParserMode.SCENE_DEFAULT_INDEX:
				if (chunk.type !== JSONTokenType.NUMBER) {
					controller.error("expected a default scene index (integer)");
				}
				break;
		}
	}
}

export class GLTF2TransformStream implements TransformStream<string, Asset> {
	private jsonTransformer: JSONTransformStream;
	private transformer: TransformStream<JSONToken, Asset>;

	constructor() {
		this.jsonTransformer = new JSONTransformStream();
		this.transformer = new TransformStream(new GLTF2Transformer());
		this.jsonTransformer.readable.pipeThrough(this.transformer);
	}

	get readable() {
		return this.transformer.readable;
	}

	get writable() {
		return this.jsonTransformer.writable;
	}
}
