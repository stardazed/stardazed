// asset-fbx-text.ts - FBX text file tokenizer and parser
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	const enum TokenType {
		Invalid = 1,
		EOF,

		Label,
		String,
		Number,
		ArrayCount,

		OpenContext,
		CloseContext,
		Comma
	}


	interface Token {
		type: TokenType;
		offset: number;
		val?: string | number;
	}


	function valid(token: Token) {
		return token.type != TokenType.Invalid && token.type != TokenType.EOF;
	}


	class FBXTextTokenizer {
		private offset = -1;
		private length = 0;
		private lastChar = "";

		constructor(private source: string) {
			this.length = source.length;
		}

		private nextChar() {
			this.offset++;
			if (this.offset < this.length) {
				this.lastChar = this.source[this.offset];
			}
			else {
				this.lastChar = null;
			}

			// console.info('> ' + this.lastChar);
			return this.lastChar;
		}


		private skipWS() {
			var c: string;
			while (c = this.nextChar()) {
				if (c != ' ' && c != '\t' && c != '\r' && c != '\n')
					break;
			}
		}


		private skipToLineEnd() {
			var c: string;
			while (c = this.nextChar()) {
				if (c == '\r' || c == '\n')
					break;
			}
		}


		nextToken(): Token {
			this.skipWS();
			if (this.offset >= this.length) {
				this.offset = this.length;
				return {
					type: TokenType.EOF,
					offset: this.length
				};
			}

			var tokenStart = this.offset;
			var tokenEnd = 0;
			var c = this.lastChar;

			var invalid = (): Token => { return {
				type: TokenType.Invalid,
				offset: tokenStart,
				val: this.source.substring(tokenStart, tokenEnd + 1)
			}; };


			if (c == ';') {
				// single-line comment
				this.skipToLineEnd();
				return this.nextToken();
			}
			else if (c == '"') {
				// string literal, there are no escape sequences or other fanciness
				while (c = this.nextChar()) {
					if (c == '"' || c == '\r' || c == '\n')
						break;
				}
				tokenEnd = this.offset;

				if (c != '"') {
					return invalid();
				}
				else {
					return {
						type: TokenType.String,
						offset: tokenStart,
						val: this.source.substring(tokenStart + 1, tokenEnd)
					};
				}
			}
			else if (c == ',') {
				return {
					type: TokenType.Comma,
					offset: tokenStart
				};
			}
			else if (c == '{') {
				return {
					type: TokenType.OpenContext,
					offset: tokenStart
				};
			}
			else if (c == '}') {
				return {
					type: TokenType.CloseContext,
					offset: tokenStart
				};
			}
			else {
				// find end of token based on break-chars
				let firstChar = c;
				while (c = this.nextChar()) {
					if (c == ' ' || c == '\t' || c == '\r' || c == '\n' || c == ',' || c == '{' || c == '}')
						break;
				}

				// rewind 1 pos to allow non-ws breaking chars to be separate tokens
				tokenEnd = this.offset;
				this.offset--;
				let token = this.source.substring(tokenStart, tokenEnd);

				// console.info("token: ", tokenStart, tokenEnd, token);

				if ((firstChar >= 'A' && firstChar <= 'Z') || (firstChar >= 'a' && firstChar <= 'z')) {
					// A non-quoted string starting with alphabetic character can only be a Label...
					// ...except for the "Shading" property which has an unquoted string (T or Y) as a value
					if (token == "T" || token == "Y") {
						return {
							type: TokenType.String,
							offset: tokenStart,
							val: token
						};
					}
					if (token.length < 2 || (token[token.length - 1] != ':')) {
						return invalid();
					}

					// TODO: verify only correct chars used in label [a-zA-Z0-9]
					return {
						type: TokenType.Label,
						offset: tokenStart,
						val: token.substr(0, token.length - 1)
					};
				}
				else if (firstChar == '*' || firstChar == '-' || (firstChar >= '0' && firstChar <= '9')) {
					if (firstChar == '*') {
						if (token.length < 2) {
							return invalid();
						}
						else {
							let count = parseFloat(token.substr(1));
							if (isNaN(count) || count != (count | 0) || count < 1) {
								return invalid();
							}
							return {
								type: TokenType.ArrayCount,
								offset: tokenStart,
								val: count | 0
							};
						}
					}
					else {
						let number = parseFloat(token);
						if (isNaN(number)) {
							return invalid();
						}
						return {
							type: TokenType.Number,
							offset: tokenStart,
							val: number
						};
					}
				}
				else {
					return invalid();
				}
			}
		}
	}


	const enum Expect {
		Key				 = 0x0001,
		Value            = 0x0002,
		Comma            = 0x0004,
		Open             = 0x0008,
		Close            = 0x0010,
		ArrayCount       = 0x0020,

		ValueOrOpen      = Value | Open,
		CommaOrOpenOrKey = Key | Open | Comma
	}


	export class FBXTextParser {
		private tokenizer_: FBXTextTokenizer;
		private expect_ = Expect.Key;
		private expectNextKey_: string = null;
		private eof_ = false;
		private depth_ = 0;

		constructor(text: string) {
			this.tokenizer_ = new FBXTextTokenizer(text);
		}

		private unexpected(t: Token) {
			console.error("Unexpected (" + this.expect_ + ") or invalid token: ", t);
			this.eof_ = true;
		}

		parse() {
			var token: Token;
			do {
				token = this.tokenizer_.nextToken();	

				switch (token.type) {
					case TokenType.Label:
						if (this.expect_ & Expect.Key) {
							if (this.expectNextKey_ == null || this.expectNextKey_ == token.val) {
								// <-- report field name
								console.info("F: " + token.val);
								this.expect_ = Expect.ValueOrOpen;
							}
							else {
								this.unexpected(token);
							}
						}
						else {
							this.unexpected(token);
						}
						break;

					case TokenType.String:
					case TokenType.Number:
						if ((this.expectNextKey_ != null) && (this.expect_ & Expect.Value)) {
							// <-- report prop
							console.info("P: " + token.val);
							this.expect_ = Expect.CommaOrOpenOrKey;
							if (this.depth_ > 0) {
								this.expect_ |= Expect.Close;
							}
						}
						else {
							this.unexpected(token);
						}
						break;

					case TokenType.ArrayCount:
						if ((this.expectNextKey_ != null) && (this.expect_ == Expect.ValueOrOpen)) {
							// <-- report array count
							this.expect_ = Expect.Open;
							this.expectNextKey_ = "a";
						}
						else {
							this.unexpected(token);
						}

						break;

					case TokenType.OpenContext:
						if (this.expect_ & Expect.Open) {
							// <-- report open context
							console.info(">>>>");
							this.depth_++;
							this.expect_ = Expect.Key;
						}
						else {
							this.unexpected(token);
						}
						break;

					case TokenType.CloseContext:
						if ((this.expectNextKey_ != null) && (this.expect_ & Expect.Close)) {
							// <-- report close context
							console.info("<<<<");
							this.depth_--;
							this.expect_ = Expect.Key;
						}
						else {
							this.unexpected(token);
						}
						break;

					case TokenType.Comma:
						if ((this.expectNextKey_ != null) && (this.expect_ & Expect.Comma)) {
							this.expect_ = Expect.Value;
						}
						else {
							this.unexpected(token);
						}
						break;

					case TokenType.Invalid:
						this.unexpected(token);
						break;

					case TokenType.EOF:
						this.eof_ = true;
						break;

				}
			} while (!this.eof_);
		}
	}

} // sd.asset
