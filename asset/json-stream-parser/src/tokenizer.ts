/**
 * json-stream-parser/tokenizer - tokenize json text
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

const enum TokenizerMode {
	VALUE,
	DELIMITER,
	INTEGER,
	FRACTION,
	EXPONENT,
	STRING,
	TRUE1,
	TRUE2,
	TRUE3,
	FALSE1,
	FALSE2,
	FALSE3,
	FALSE4,
	NULL1,
	NULL2,
	NULL3,
	ERROR
}

const enum CharCodes {
	// digits
	ZERO = 48,
	ONE = 49,
	NINE = 57,

	// letters
	T = 116,
	R = 114,
	U = 117,
	E = 101,
	F = 102,
	A = 97,
	L = 108,
	S = 115,
	N = 110,
	B = 98,
	UPPER_A = 65,
	UPPER_E = 69,
	UPPER_F = 70,

	// punctuation and numeral modifiers
	PERIOD = 46,
	COMMA = 44,
	MINUS = 45,
	PLUS = 43,
	QUOTE = 34,
	BACKSLASH = 92,
	SLASH = 47,
	BRACE_OPEN = 123,
	BRACE_CLOSE = 125,
	BRACKET_OPEN = 91,
	BRACKET_CLOSE = 93,
	COLON = 58,

	// whitespace
	TAB = 9,
	LINE_FEED = 10,
	CARRIAGE_RETURN = 13,
	SPACE = 32
}

function isWhiteSpace(cc: number) {
	return cc === CharCodes.TAB || cc === CharCodes.LINE_FEED ||
		cc === CharCodes.CARRIAGE_RETURN || cc === CharCodes.SPACE;
}

export interface JSONStreamTokenizerDelegate {
	nullValue(): void;
	falseValue(): void;
	trueValue(): void;
	numberValue(num: number): void;
	stringValue(str: string): void;

	arrayOpen(): void;
	arrayClose(): void;

	objectOpen(): void;
	objectClose(): void;

	nextElement(): void;
	elementValue(): void;

	error(message: string): void;
}

export class JSONStreamTokenizer {
	private delegate_: JSONStreamTokenizerDelegate;
	private token_: string;
	private int_: string;
	private frac_: string;
	private exp_: string;
	private negative_: boolean;
	private mode_: TokenizerMode;
	private storedError_: string | undefined;

	constructor(delegate: JSONStreamTokenizerDelegate) {
		this.delegate_ = delegate;
		this.mode_ = TokenizerMode.VALUE;
		this.token_ = "";
		this.int_ = this.frac_ = this.exp_ = "";
		this.negative_ = false;
	}

	private error(message: string) {
		this.storedError_ = message;
		this.delegate_.error(message);
	}

	append(chars: string) {
		if (this.storedError_ !== undefined) {
			return this.error(this.storedError_);
		}

		let offset = 0;
		const charsLen = chars.length;
		while (offset < charsLen) {
			let cc = chars.charCodeAt(offset);
			switch (this.mode_) {
				case TokenizerMode.VALUE:
					if (cc === CharCodes.QUOTE) {
						this.mode_ = TokenizerMode.STRING;
						this.token_ = "";
						break;
					}
					if ((cc >= CharCodes.ZERO && cc <= CharCodes.NINE) || cc === CharCodes.MINUS) {
						this.mode_ = TokenizerMode.INTEGER;
						this.int_ = chars[offset];
						this.frac_ = "";
						this.exp_ = "";
						this.negative_ = cc === CharCodes.MINUS;
						break;
					}
					if (cc === CharCodes.T) {
						this.mode_ = TokenizerMode.TRUE1;
						break;
					}
					if (cc === CharCodes.F) {
						this.mode_ = TokenizerMode.FALSE1;
						break;
					}
					if (cc === CharCodes.N) {
						this.mode_ = TokenizerMode.NULL1;
						break;
					}
					// [[fallthrough]]
				case TokenizerMode.DELIMITER:
					if (cc === CharCodes.TAB || cc === CharCodes.LINE_FEED || cc === CharCodes.CARRIAGE_RETURN || cc === CharCodes.SPACE) {
						do {
							offset += 1;
							if (offset === charsLen) {
								break;
							}
							cc = chars.charCodeAt(offset);
						} while (cc === CharCodes.TAB || cc === CharCodes.LINE_FEED || cc === CharCodes.CARRIAGE_RETURN || cc === CharCodes.SPACE);
						break;
					}
					if (cc === CharCodes.BRACE_OPEN) {
						this.delegate_.objectOpen();
					}
					else if (cc === CharCodes.BRACE_CLOSE) {
						this.delegate_.objectClose();
					}
					else if (cc === CharCodes.BRACKET_OPEN) {
						this.delegate_.arrayOpen();
					}
					else if (cc === CharCodes.BRACKET_CLOSE) {
						this.delegate_.arrayClose();
					}
					else if (cc === CharCodes.COMMA) {
						this.delegate_.nextElement();
					}
					else if (cc === CharCodes.COLON) {
						this.delegate_.elementValue();
					}
					else {
						this.error(`Unexpected character "${chars[offset]}"`);
						offset -= 1; // keep offset at current char after break
					}
					offset += 1;
					break;

				case TokenizerMode.INTEGER:
					break;
				case TokenizerMode.FRACTION:
					break;
				case TokenizerMode.EXPONENT:
					break;

				case TokenizerMode.STRING:
					break;

				case TokenizerMode.TRUE1:
					if (cc !== CharCodes.R) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.TRUE2:
					if (cc !== CharCodes.U) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.TRUE3:
					if (cc !== CharCodes.E) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.delegate_.trueValue();
					this.mode_ = TokenizerMode.DELIMITER;
					offset += 1;
					break;

				case TokenizerMode.FALSE1:
					if (cc !== CharCodes.A) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.FALSE2:
					if (cc !== CharCodes.L) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.FALSE3:
					if (cc !== CharCodes.S) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.FALSE4:
					if (cc !== CharCodes.E) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.delegate_.falseValue();
					this.mode_ = TokenizerMode.DELIMITER;
					offset += 1;
					break;

				case TokenizerMode.NULL1:
					if (cc !== CharCodes.U) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					cc = chars.charCodeAt(offset);
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.NULL2:
					if (cc !== CharCodes.L) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ += 1;
					offset += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.NULL3:
					if (cc !== CharCodes.L) {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.delegate_.nullValue();
					this.mode_ = TokenizerMode.DELIMITER;
					break;
			}
		}
	}
}
