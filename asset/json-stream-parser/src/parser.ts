/**
 * json-stream-parser/parser - parse tokens as a json document
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { JSONStreamTokenizer, JSONToken, JSONTokenType } from "./tokenizer";

const enum ParserMode {
	DOCUMENT,
	END_OF_DOCUMENT,
	ARRAY_ELEMENT,
	ARRAY_NEXT_OR_END,
	OBJECT_KEY,
	OBJECT_COLON,
	OBJECT_ELEMENT,
	OBJECT_NEXT_OR_END,
	ERROR
}

export interface JSONStreamParserDelegate {
	key(label: string): void;

	null(): void;
	true(): void;
	false(): void;

	number(value: number): void;
	string(value: string): void;

	objectStart(): void;
	objectEnd(): void;

	arrayStart(): void;
	arrayEnd(): void;

	error(message: string): void;
}

export class JSONStreamParser {
	private tokenizer_: JSONStreamTokenizer;
	private delegate_: JSONStreamParserDelegate;
	private modeStack_: ParserMode[];
	private storedError_: string;

	constructor(delegate: JSONStreamParserDelegate) {
		this.delegate_ = delegate;
		this.modeStack_ = [ParserMode.DOCUMENT];
		this.tokenizer_ = new JSONStreamTokenizer();
		this.storedError_ = "";
	}

	private error(message: string) {
		this.storedError_ = message;
		this.delegate_.error(message);
		return ParserMode.ERROR;
	}

	private process(mode: ParserMode, token: JSONToken) {
		if (token.type === JSONTokenType.ERROR) {
			return this.error(token.data as string);
		}
		switch (mode) {
			case ParserMode.DOCUMENT:
			case ParserMode.ARRAY_ELEMENT:
			case ParserMode.OBJECT_ELEMENT:
				switch (token.type) {
					case JSONTokenType.NULL:
						this.delegate_.null();
						break;
					case JSONTokenType.FALSE:
						this.delegate_.false();
						break;
					case JSONTokenType.TRUE:
						this.delegate_.true();
						break;
					case JSONTokenType.NUMBER:
						this.delegate_.number(token.data as number);
						break;
					case JSONTokenType.STRING:
						this.delegate_.string(token.data as string);
						break;
					case JSONTokenType.ARRAY_OPEN:
						this.delegate_.arrayStart();
						this.modeStack_.push(mode + 1);
						return ParserMode.ARRAY_ELEMENT;
					case JSONTokenType.OBJECT_OPEN:
						this.delegate_.objectStart();
						this.modeStack_.push(mode + 1);
						return ParserMode.OBJECT_KEY;
					case JSONTokenType.ARRAY_CLOSE:
						if (mode === ParserMode.ARRAY_ELEMENT) {
							this.delegate_.arrayEnd();
							return this.modeStack_.pop()!;
						}
						// [[fallthrough]]
					default:
						return this.error(`Expected a JSON value`);
				}
				return mode + 1;
			case ParserMode.OBJECT_KEY:
				if (token.type === JSONTokenType.STRING) {
					this.delegate_.key(token.data as string);
					return ParserMode.OBJECT_COLON;
				}
				if (token.type === JSONTokenType.OBJECT_CLOSE) {
					this.delegate_.objectEnd();
					return this.modeStack_.pop()!;
				}
				return this.error(`Expected a value key`);
			case ParserMode.OBJECT_COLON:
				if (token.type === JSONTokenType.COLON) {
					return ParserMode.OBJECT_ELEMENT;
				}
				return this.error(`Expected ':'`);
			case ParserMode.ARRAY_NEXT_OR_END:
				if (token.type === JSONTokenType.COMMA) {
					return ParserMode.ARRAY_ELEMENT;
				}
				if (token.type === JSONTokenType.ARRAY_CLOSE) {
					this.delegate_.arrayEnd();
					return this.modeStack_.pop()!;
				}
				return this.error(`Expected ',' or ']'`);
			case ParserMode.OBJECT_NEXT_OR_END:
				if (token.type === JSONTokenType.COMMA) {
					return ParserMode.OBJECT_KEY;
				}
				if (token.type === JSONTokenType.OBJECT_CLOSE) {
					this.delegate_.objectEnd();
					return this.modeStack_.pop()!;
				}
				return this.error(`Expected ',' or '}'`);
		}
		return mode;
	}

	append(chars: string) {
		let mode = this.modeStack_.pop()!;
		if (mode === ParserMode.ERROR) {
			this.delegate_.error(this.storedError_);
		}
		else {
			const tokenizer = this.tokenizer_.append(chars);
			do {
				const { value: token, done } = tokenizer.next();
				if (token === undefined) {
					break;
				}
				if (mode === ParserMode.END_OF_DOCUMENT) {
					mode = this.error(`Unexpected data after end of document.`);
					break;
				}
				mode = this.process(mode, token);
				if (done || mode === ParserMode.ERROR) {
					break;
				}
			} while (true);
		}
		this.modeStack_.push(mode);
	}
	
	get completed() {
		return this.modeStack_.length === 1 && this.modeStack_[0] === ParserMode.END_OF_DOCUMENT;
	}

	get ok() {
		return this.modeStack_.length > 0 && this.modeStack_[this.modeStack_.length - 1] !== ParserMode.ERROR;
	}
}
