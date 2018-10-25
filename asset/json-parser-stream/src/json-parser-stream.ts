/**
 * @stardazed/json-parser-stream - a TransformStream that transforms JSON text to actionable tokens.
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { JSONStreamParser, JSONStreamParserDelegate } from "./parser";
export { JSONStreamParser, JSONStreamParserDelegate };

export const enum JSONTokenType {
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

interface JSONNumberToken {
	type: JSONTokenType.NUMBER;
	value: number;
}

interface JSONStringToken {
	type: JSONTokenType.KEY | JSONTokenType.STRING;
	value: string;
}

interface JSONDatalessToken {
	type: JSONTokenType.NULL | JSONTokenType.TRUE | JSONTokenType.FALSE | JSONTokenType.OBJECT_START | JSONTokenType.OBJECT_END | JSONTokenType.ARRAY_START | JSONTokenType.ARRAY_END;
}

export type JSONToken = JSONDatalessToken | JSONStringToken | JSONNumberToken;


class JSONTransformer implements Transformer<string, JSONToken>, JSONStreamParserDelegate {
	private parser: JSONStreamParser;
	private controller!: TransformStreamDefaultController<JSONToken>;

	constructor() {
		this.parser = new JSONStreamParser(this);
	}

	transform(chunk: string, controller: TransformStreamDefaultController<JSONToken>) {
		this.controller = controller;
		this.parser.append(chunk);
	}

	flush(controller: TransformStreamDefaultController<JSONToken>) {
		if (! (this.parser.completed && this.parser.ok)) {
			controller.error("Unexpected end of JSON stream.");
		}
	}

	key(value: string) {
		this.controller.enqueue({ type: JSONTokenType.KEY, value });
	}
	null() {
		this.controller.enqueue({ type: JSONTokenType.NULL });
	}
	true() {
		this.controller.enqueue({ type: JSONTokenType.TRUE });
	}
	false() {
		this.controller.enqueue({ type: JSONTokenType.FALSE });
	}
	number(value: number) {
		this.controller.enqueue({ type: JSONTokenType.NUMBER, value });
	}
	string(value: string) {
		this.controller.enqueue({ type: JSONTokenType.STRING, value });
	}
	objectStart() {
		this.controller.enqueue({ type: JSONTokenType.OBJECT_START });
	}
	objectEnd() {
		this.controller.enqueue({ type: JSONTokenType.OBJECT_END });
	}
	arrayStart() {
		this.controller.enqueue({ type: JSONTokenType.ARRAY_START });
	}
	arrayEnd() {
		this.controller.enqueue({ type: JSONTokenType.ARRAY_END });
	}
	error(message: string) {
		this.controller.error(message);
	}
}

export class JSONTransformStream implements StreamTransform<string, JSONToken> {
	private transformer: TransformStream<string, JSONToken>;

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
