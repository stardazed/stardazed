// asset-fbx.ts - FBX asset file import
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

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


	export interface FBXData {
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


	const enum FBXTextParserState {
		Normal,
		Array,
		Error,
		EOF
	}


	class FBXTextParser {
		private offset = 0;
		private length = 0;
		private state = FBXTextParserState.Normal;

		private arrayElementType: FBXArrayElementType;
		private arrayLength = 0;
		private arrayPosition = 0;
		private arrayItem: Int32Array | Float32Array;

		private lastKey = "";
		private contextDepth = 0;

		constructor(private source: string, private delegate: FBXParserDelegate) {
			this.length = source.length;
		}


		private skipWS() {
			while (this.offset < this.length) {
				var c = this.source[this.offset];
				if (c != ' ' && c != '\t')
					break;
				this.offset++;
			}

			if (this.offset == this.length)
				this.state = FBXTextParserState.EOF;
		}


		private skipEndLine() {
			while (this.offset < this.length) {
				var c = this.source[this.offset];
				if (c != '\r' && c != '\n')
					break;
				this.offset++;
			}

			if (this.offset == this.length)
				this.state = FBXTextParserState.EOF;
		}


		private skipToNextLine() {
			while (this.offset < this.length) {
				var c = this.source[this.offset];
				if (c == '\r' || c == '\n')
					break;
				this.offset++;
			}

			this.skipEndLine();
		}


		private parseKey() {
			var keyStartOffset = this.offset;

			while (this.offset < this.length) {
				var c = this.source[this.offset];

				// single-line comment
				if (c == ';') {
					if (this.offset == keyStartOffset) {
						this.skipToNextLine();
					}
					else {
						this.state = FBXTextParserState.Error;
						return null;
					}
				}

				if (c != ':' && c != '\r' && c != '\n') {
					this.offset++;
				}
				else {
					if (c != ':') {
						this.state = FBXTextParserState.Error;
						return null;
					}
					else {
						var keyEndOffset = this.offset;
						if (keyEndOffset - keyStartOffset < 1) {
							this.state = FBXTextParserState.Error;
							return null;
						}

						// get string and push offset past the : character
						var keyStr = this.source.substring(keyStartOffset, keyEndOffset);
						this.offset++;
						if (this.offset == this.length) {
							this.state = FBXTextParserState.EOF;
						}
						return keyStr;
					}
				}
			}

			this.state = FBXTextParserState.EOF;
			return null;
		}


		private parseStringProperty() {
			this.offset++;
			if (this.offset == this.length) {
				this.state = FBXTextParserState.Error;
				return null;
			}

			var stringStartOffset = this.offset;
			var stringEndOffset = stringStartOffset;
			var c = this.source[this.offset];

			while (this.offset < this.length && c != '\r' && c != '\n') {
				c = this.source[this.offset];

				// there are no escape sequences or anything like that
				if (c == '"') {
					stringEndOffset = this.offset;
					break;
				}
				this.offset++;
			}

			if (stringEndOffset == stringStartOffset) {
				this.state = FBXTextParserState.Error;
				return null;
			}

			var string = this.source.substring(stringStartOffset, stringEndOffset);
			this.offset++; // move past closing quote
			if (this.offset == this.length) {
				this.state = FBXTextParserState.EOF;
			}
			return string;
		}


		private parseIntProperty() {
			var intStartOffset = this.offset;
			var intEndOffset = intStartOffset;
			var c = this.source[this.offset];

			while (this.offset < this.length) {
				c = this.source[this.offset];

				if (c == '\r' || c == '\n' || c == ',') {
					intEndOffset = this.offset;
					break;
				}
				else if (c != '-' && (c < '0' || c > '9')) {
					this.state = FBXTextParserState.Error;
					return null;
				}
				this.offset++;
			}

			// number was at end of file (TODO: likely an error)
			if (intEndOffset == intStartOffset) {
				intEndOffset = this.offset;
			}

			var intString = this.source.substring(intStartOffset, intEndOffset);
			return parseInt(intString);
		}


		private parseProperty(): string | number {
			var c = this.source[this.offset];
			if (c == '"') {
				return this.parseStringProperty();
			}
			else if (c == '-' || (c >= '0' && c <= '9')) {
				return this.parseIntProperty();
			}
			else {
				this.state = FBXTextParserState.Error;
				return null;
			}
		}


		private parseNormalLine() {
			this.skipWS();
			if (this.state == FBXTextParserState.EOF) {
				return;
			}

			// context close brace
			if (this.source[this.offset] == '}') {
				this.contextDepth--;
				if (this.contextDepth < 0) {
					this.state = FBXTextParserState.Error;
					return;
				}
				this.delegate.closeContext();
				this.skipToNextLine(); // TODO: error on any non-ws chars after the }
			}
			else {
				// or a new field, starting with a key
				var key = this.parseKey();
				if (!key) {
					return;
				}
				this.delegate.key(key);
				this.lastKey = key;

				// then one or more properties
				while (this.state == FBXTextParserState.Normal) {
					this.skipWS();

					if (this.state == FBXTextParserState.Normal) {
						var c = this.source[this.offset];

						if (c == '{') {
							this.contextDepth++;
							this.delegate.openContext();
							this.skipToNextLine(); // TODO: error on any non-ws chars after the {
						}
						else if (c == '\r' || c == '\n') {
							this.skipEndLine();
							return;
						}
						else {
							var prop = this.parseProperty();
							if (prop) {
								this.delegate.property(prop);

								if (this.source[this.offset] == ',') {
									this.offset++;
								}
								else {
									// TODO: check for stuff before end of line
									this.skipToNextLine();
									return;
								}
							}
						}
					}
				}
			}
		}


		private parseArrayLine() {
			this.skipWS();
			if (this.state == FBXTextParserState.EOF) {
				return;
			}

			// if this is the first array line, we need to skip past the "a:" key
			if (this.source[this.offset] == 'a') {
				this.offset++;
				if ((this.offset < this.length) && (this.source[this.offset] == ':')) {
					this.offset++;
				}
				else {
					this.state = FBXTextParserState.Error;
					return;
				}

				this.skipWS();
				if (this.state == FBXTextParserState.EOF) {
					return;
				}
			}

			// read values until the end of the line, track count
			var c = this.source[this.offset];
			while (c != '\r' && c != '\n') {
				var numStartOffset = this.offset;
				this.offset++;

				while (this.offset < this.length) {
					c = this.source[this.offset];

					if (c == ',' || c == '\r' || c == '\n') {
						var numEndOffset = this.offset;

						if (numEndOffset - numStartOffset > 1) {
							var numString = this.source.substring(numStartOffset, numEndOffset);
							var num = this.arrayElementType == FBXArrayElementType.Float32 ? parseFloat(numString) : parseInt(numString);

							// if beyond the end of the array or in case of a number parse error, error out
							if (isNaN(num)) {
								this.state = FBXTextParserState.Error;
								return;
							}
							if (this.arrayPosition >= this.arrayLength) {
								this.state = FBXTextParserState.Error;
								return;
							}

							// append number to end of array and set state back to Normal if at end
							this.arrayItem[this.arrayPosition] = num;
							this.arrayPosition++;
							if (this.arrayPosition == this.arrayLength) {
								// pass array to delegate
								if (this.arrayElementType == FBXArrayElementType.Float32) {
									this.delegate.floatArray(this.arrayItem);
								}
								else {
									this.delegate.intArray(this.arrayItem);
								}

								this.state = FBXTextParserState.Normal;
							}
						}
					}

					if (c != '\r' && c != '\n') {
						this.offset++;
					}
					else {
						break;
					}
				}
			}

			this.skipEndLine();
		}


		parse() {
			this.offset = 0;
			this.state = (this.offset == this.length) ? FBXTextParserState.EOF : FBXTextParserState.Normal;

			while (this.state != FBXTextParserState.Error && this.state != FBXTextParserState.EOF) {
				if (this.state == FBXTextParserState.Normal)
					this.parseNormalLine();
				else
					this.parseArrayLine();
			}
		}
	}


	function parseFBXTextSource(text: string) {
		var del = new FBX2013ParserDelegate();
		var parser = new FBXTextParser(text, del);
		parser.parse();
		return del.output;
	}


	export function loadFBXTextFile(filePath: string): Promise<FBXData> {
		return loadFile(filePath).then((text: string) => parseFBXTextSource(text));
	}

} // ns sd.world
