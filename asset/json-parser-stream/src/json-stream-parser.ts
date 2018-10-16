/**
 * @stardazed/json-parser-stream - a TransformStream that transforms JSON text to its structural parts.
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { JSONStreamParser, JSONStreamParserDelegate } from "./parser";
import { Transformer, TransformStream, StreamTransform, TransformStreamDefaultController } from "@stardazed/streams";

export const enum JSONChunkType {
	KEY,
	NULL,
	TRUE,
	FALSE,
	NUMBER,
	STRING,
	OBJECT_START,
	OBJECT_END,
	ARRAY_START,
	ARRAY_END
}

interface JSONNumberChunk {
	type: JSONChunkType.NUMBER;
	value: number;
}

interface JSONStringChunk {
	type: JSONChunkType.KEY | JSONChunkType.STRING;
	value: string;
}

interface JSONDatalessChunk {
	type: JSONChunkType.NULL | JSONChunkType.TRUE | JSONChunkType.FALSE | JSONChunkType.OBJECT_START | JSONChunkType.OBJECT_END | JSONChunkType.ARRAY_START | JSONChunkType.ARRAY_END;
}

export type JSONChunk = JSONDatalessChunk | JSONStringChunk | JSONNumberChunk;


class JSONTransformer implements Transformer<string, JSONChunk>, JSONStreamParserDelegate {
	private parser: JSONStreamParser;
	private controller!: TransformStreamDefaultController<JSONChunk>;

	constructor() {
		this.parser = new JSONStreamParser(this);
	}

	transform(chunk: string, controller: TransformStreamDefaultController<JSONChunk>) {
		this.controller = controller;
		this.parser.append(chunk);
	}

	flush(controller: TransformStreamDefaultController<JSONChunk>) {
		if (! (this.parser.completed && this.parser.ok)) {
			controller.error("Unexpected end of JSON stream.");
		}
	}

	key(value: string) {
		this.controller.enqueue({ type: JSONChunkType.KEY, value });
	}
	null() {
		this.controller.enqueue({ type: JSONChunkType.NULL });
	}
	true() {
		this.controller.enqueue({ type: JSONChunkType.TRUE });
	}
	false() {
		this.controller.enqueue({ type: JSONChunkType.FALSE });
	}
	number(value: number) {
		this.controller.enqueue({ type: JSONChunkType.NUMBER, value });
	}
	string(value: string) {
		this.controller.enqueue({ type: JSONChunkType.STRING, value });
	}
	objectStart() {
		this.controller.enqueue({ type: JSONChunkType.OBJECT_START });
	}
	objectEnd() {
		this.controller.enqueue({ type: JSONChunkType.OBJECT_END });
	}
	arrayStart() {
		this.controller.enqueue({ type: JSONChunkType.ARRAY_START });
	}
	arrayEnd() {
		this.controller.enqueue({ type: JSONChunkType.ARRAY_END });
	}
	error(message: string) {
		this.controller.error(message);
	}
}

export class JSONTransformStream implements StreamTransform<string, JSONChunk> {
	private transformer: TransformStream<string, JSONChunk>;

	constructor() {
		this.transformer = new TransformStream(new JSONTransformer());
	}

	get readable() {
		return this.transformer.readable;
	}

	get writable() {
		return this.transformer.writable;
	}
}
