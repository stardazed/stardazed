/**
 * json-parser-stream/tokenizer - tokenize json text
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

const enum TokenizerMode {
	VALUE,
	DELIMITER,
	INTEGER,
	FRACTION,
	EXPONENT_SIGN,
	EXPONENT,
	STRING,
	ESCAPE,
	HEX0,
	HEX1,
	HEX2,
	HEX3,
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

export const enum TokenType {
	NULL,
	FALSE,
	TRUE,
	NUMBER,
	STRING,
	ARRAY_OPEN,
	ARRAY_CLOSE,
	OBJECT_OPEN,
	OBJECT_CLOSE,
	COMMA,
	COLON,
	ERROR
}

export interface Token {
	type: TokenType;
	data?: string | number;
}

export class JSONStreamTokenizer {
	private string_: string;
	private int_: number;
	private frac_: number;
	private fracDigits_: number;
	private exp_: number;
	private sign_: number;
	private expSign_: number;
	private expDigits_: number;
	private zeroInt_: boolean;
	private mode_: TokenizerMode;
	private storedError_: string | undefined;

	constructor() {
		this.mode_ = TokenizerMode.VALUE;
		this.string_ = "";
		this.int_ = this.frac_ = this.fracDigits_ = this.exp_ = this.expDigits_ = 0;
		this.sign_ = this.expSign_ = 1;
		this.zeroInt_ = false;
	}

	private error(message: string): Token {
		this.storedError_ = message;
		return { type: TokenType.ERROR, data: message };
	}

	private emitNumber(): Token {
		const finalNumber = this.sign_ * Math.pow(10, this.exp_ * this.expSign_) * (this.int_ + (this.frac_ * Math.pow(10, -this.fracDigits_)));
		return { type: TokenType.NUMBER, data: finalNumber };
	}

	append: (chars: string) => IterableIterator<Token> = function*(this: JSONStreamTokenizer, chars: string): IterableIterator<Token> {
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
						this.string_ = "";
						offset += 1;
						break;
					}
					if ((cc >= CharCodes.ZERO && cc <= CharCodes.NINE) || cc === CharCodes.MINUS) {
						this.mode_ = TokenizerMode.INTEGER;

						this.frac_ = this.fracDigits_ = this.exp_ = this.expDigits_ = 0;
						this.sign_ = cc === CharCodes.MINUS ? -1 : 1;
						this.expSign_ = 1;
						this.zeroInt_ = cc === CharCodes.ZERO;
						this.int_ = cc === CharCodes.MINUS ? 0 : cc - CharCodes.ZERO;
						offset += 1;
						break;
					}
					if (cc === CharCodes.T) {
						this.mode_ = TokenizerMode.TRUE1;
						offset += 1;
						break;
					}
					if (cc === CharCodes.F) {
						this.mode_ = TokenizerMode.FALSE1;
						offset += 1;
						break;
					}
					if (cc === CharCodes.N) {
						this.mode_ = TokenizerMode.NULL1;
						offset += 1;
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
						yield { type: TokenType.OBJECT_OPEN };
					}
					else if (cc === CharCodes.BRACE_CLOSE) {
						yield { type: TokenType.OBJECT_CLOSE };
					}
					else if (cc === CharCodes.BRACKET_OPEN) {
						yield { type: TokenType.ARRAY_OPEN };
					}
					else if (cc === CharCodes.BRACKET_CLOSE) {
						yield { type: TokenType.ARRAY_CLOSE };
					}
					else if (cc === CharCodes.COMMA) {
						yield { type: TokenType.COMMA };
					}
					else if (cc === CharCodes.COLON) {
						yield { type: TokenType.COLON };
					}
					else {
						return this.error(`Unexpected character "${chars[offset]}"`);
					}
					this.mode_ = TokenizerMode.VALUE;
					offset += 1;
					break;

				case TokenizerMode.INTEGER:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						if (this.zeroInt_) {
							return this.error(`Leading zeroes are not allowed in numbers`);
						}
						do {
							this.int_ *= 10;
							this.int_ += cc - CharCodes.ZERO;
							offset += 1;
							if (offset === charsLen) {
								break;
							}
							cc = chars.charCodeAt(offset);
						} while (cc >= CharCodes.ZERO && cc <= CharCodes.NINE);
					}
					else if (cc === CharCodes.PERIOD) {
						this.mode_ = TokenizerMode.FRACTION;
						offset += 1;
					}
					else if (cc === CharCodes.E || cc === CharCodes.UPPER_E) {
						this.mode_ = TokenizerMode.EXPONENT_SIGN;
						offset += 1;
					}
					else {
						yield this.emitNumber();
						this.mode_ = TokenizerMode.DELIMITER;
						break;
					}
					if (this.mode_ !== TokenizerMode.FRACTION || offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.FRACTION:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						do {
							this.frac_ *= 10;
							this.frac_ += cc - CharCodes.ZERO;
							this.fracDigits_ += 1;
							offset += 1;
							if (offset === charsLen) {
								break;
							}
							cc = chars.charCodeAt(offset);
						} while (cc >= CharCodes.ZERO && cc <= CharCodes.NINE);
					}
					if (offset === charsLen) {
						break;
					}
					if (cc === CharCodes.E || cc === CharCodes.UPPER_E) {
						this.mode_ = TokenizerMode.EXPONENT_SIGN;
						offset += 1;
						if (offset === charsLen) {
							break;
						}
						cc = chars.charCodeAt(offset);
					}
					else {
						yield this.emitNumber();
						this.mode_ = TokenizerMode.DELIMITER;
						break;
					}
					// [[fallthrough]]
				case TokenizerMode.EXPONENT_SIGN:
					this.mode_ = TokenizerMode.EXPONENT;
					if (cc === CharCodes.PLUS || cc === CharCodes.MINUS) {
						this.expSign_ = cc === CharCodes.PLUS ? 1 : -1;
						offset += 1;
						if (offset === charsLen) {
							break;
						}
						cc = chars.charCodeAt(offset);
					}
					// [[fallthrough]]
				case TokenizerMode.EXPONENT:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						do {
							this.exp_ *= 10;
							this.exp_ += cc - CharCodes.ZERO;
							this.expDigits_ += 1;
							offset += 1;
							if (offset === charsLen) {
								break;
							}
							cc = chars.charCodeAt(offset);
						} while (cc >= CharCodes.ZERO && cc <= CharCodes.NINE);
					}
					if (offset === charsLen) {
						break;
					}
					if (this.expDigits_ === 0) {
						return this.error("Non-number found after exponent indicator");
					}
					yield this.emitNumber();
					this.mode_ = TokenizerMode.DELIMITER;
					break;

				case TokenizerMode.STRING:
					if (cc !== CharCodes.QUOTE && cc !== CharCodes.BACKSLASH) {
						do {
							if (cc < 0x20) {
								return this.error("Control codes in strings must be escaped");
							}
							this.string_ += chars[offset];
							offset += 1;
							if (offset === charsLen) {
								break;
							}
							cc = chars.charCodeAt(offset);
						} while (cc !== CharCodes.QUOTE && cc !== CharCodes.BACKSLASH);
						if (offset === charsLen) {
							break;
						}
					}
					// move past the backslash or closing quote
					offset += 1;
					if (cc === CharCodes.QUOTE) {
						yield { type: TokenType.STRING, data: this.string_ };
						this.mode_ = TokenizerMode.DELIMITER;
						break;
					}
					this.mode_ = TokenizerMode.ESCAPE;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.ESCAPE:
					if (cc === CharCodes.QUOTE) {
						this.string_ += '"';
					}
					else if (cc === CharCodes.BACKSLASH) {
						this.string_ += "\\";
					}
					else if (cc === CharCodes.N) {
						this.string_ += "\n";
					}
					else if (cc === CharCodes.R) {
						this.string_ += "\r";
					}
					else if (cc === CharCodes.T) {
						this.string_ += "\t";
					}
					else if (cc === CharCodes.B) {
						this.string_ += "\b";
					}
					else if (cc === CharCodes.F) {
						this.string_ += "\f";
					}
					else if (cc === CharCodes.SLASH) {
						this.string_ += "/";
					}
					else if (cc === CharCodes.U) {
						this.mode_ = TokenizerMode.HEX0;
					}
					else {
						return this.error(`Invalid escape code "${chars[offset]}"`);
					}
					
					offset += 1;
					if (this.mode_ !== TokenizerMode.HEX0) {
						this.mode_ = TokenizerMode.STRING;
						break;
					}
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.HEX0:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						this.int_ = cc - CharCodes.ZERO;
					}
					else if (cc >= CharCodes.A && cc <= CharCodes.F) {
						this.int_ = 10 + (cc - CharCodes.A);
					}
					else if (cc >= CharCodes.UPPER_A && cc <= CharCodes.UPPER_F) {
						this.int_ = 10 + (cc - CharCodes.UPPER_A);
					}
					else {
						return this.error(`Invalid hexadecimal digit "${chars[offset]}"`);
					}
					offset += 1;
					this.mode_ += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.HEX1:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						this.int_ <<= 4;
						this.int_ += cc - CharCodes.ZERO;
					}
					else if (cc >= CharCodes.A && cc <= CharCodes.F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.A);
					}
					else if (cc >= CharCodes.UPPER_A && cc <= CharCodes.UPPER_F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.UPPER_A);
					}
					else {
						return this.error(`Invalid hexadecimal digit "${chars[offset]}"`);
					}
					offset += 1;
					this.mode_ += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.HEX2:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						this.int_ <<= 4;
						this.int_ += cc - CharCodes.ZERO;
					}
					else if (cc >= CharCodes.A && cc <= CharCodes.F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.A);
					}
					else if (cc >= CharCodes.UPPER_A && cc <= CharCodes.UPPER_F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.UPPER_A);
					}
					else {
						return this.error(`Invalid hexadecimal digit "${chars[offset]}"`);
					}
					offset += 1;
					this.mode_ += 1;
					if (offset === charsLen) {
						break;
					}
					cc = chars.charCodeAt(offset);
					// [[fallthrough]]
				case TokenizerMode.HEX3:
					if (cc >= CharCodes.ZERO && cc <= CharCodes.NINE) {
						this.int_ <<= 4;
						this.int_ += cc - CharCodes.ZERO;
					}
					else if (cc >= CharCodes.A && cc <= CharCodes.F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.A);
					}
					else if (cc >= CharCodes.UPPER_A && cc <= CharCodes.UPPER_F) {
						this.int_ <<= 4;
						this.int_ += 10 + (cc - CharCodes.UPPER_A);
					}
					else {
						return this.error(`Invalid hexadecimal digit "${chars[offset]}"`);
					}
					offset += 1;
					this.string_ += String.fromCharCode(this.int_);
					this.mode_ = TokenizerMode.STRING;
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
					yield { type: TokenType.TRUE };
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
					yield { type: TokenType.FALSE };
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
					yield { type: TokenType.NULL };
					this.mode_ = TokenizerMode.DELIMITER;
					offset += 1;
					break;
			}
		}
	}.bind(this);
}
