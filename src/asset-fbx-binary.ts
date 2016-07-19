// asset-fbx-binary.ts - FBX binary file parser
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

// Implementation partially based on research done by Campbell Barton of the Blender Foundation
// See: http://code.blender.org/2013/08/fbx-binary-file-format-specification/

/// <reference path="../defs/inflate.d.ts" />

namespace sd.asset.fbx.parse {

	interface PropertyHeader {
		offset: number;
		endOffset: number;
		valueCount: number;
		valuesSizeBytes: number;
		nameLength: number;
		name: string;
	}


	export class FBXBinaryParser {
		private bytes_: Uint8Array;
		private dataView_: DataView;
		private offset_ = 0;
		private length_ = 0;
		private version_ = 0;
		private stack_: PropertyHeader[] = [];
		private inProp70Block_ = false;

		private twoExp21 = Math.pow(2, 21);
		private twoExp32 = Math.pow(2, 32);

		constructor(data: ArrayBuffer, private delegate_: FBXParserDelegate) {
			this.length_ = data.byteLength;
			this.bytes_ = new Uint8Array(data);
			this.dataView_ = new DataView(data);
		}


		get delegate() {
			return this.delegate_;
		}


		private error(msg: string, offset?: number) {
			if (offset == null) {
				offset = this.offset_;
			}
			this.delegate_.error(msg, offset);
			this.offset_ = this.length_;
		}

		
		private inflateCompressedArray(dataBlock: TypedArray, outElementType: NumericType): TypedArray {
			// the first 2 bytes are usually 0x7801, which is a DEFLATE marker
			// the final 4 bytes are likely a checksum
			assert(dataBlock.byteLength > 6, "Compressed array data size is too small");
			var compData = new Uint8Array(dataBlock.buffer, dataBlock.byteOffset + 2, dataBlock.byteLength - 6);

			var inf = new Inflater();
			var result = inf.append(compData);
			inf.flush();
			
			assert(result.byteLength % outElementType.byteSize == 0, "Invalid aligned size of output buffer");
			return new (outElementType.arrayType)(result.buffer);
		}


		private checkFileHeader() {
			var ident = String.fromCharCode.apply(null, this.bytes_.subarray(0, 20));
			if (ident != "Kaydara FBX Binary  ") {
				this.error("Not an FBX binary file");
				return false;
			}
			if (this.dataView_.getUint16(21, true) != 0x001A) {
				this.error("Expected 0x001A marker in header");
				return false;	
			}

			this.version_ = this.dataView_.getUint32(23, true);
			if (this.version_ < 7000 || this.version_ >= 8000) {
				this.error("This parser only supports v7.x files.");
				return false;
			}

			this.offset_ = 27;
			return true;
		}


		private readFieldHeader() {
			// fixed offset header fields
			const endOffset = this.dataView_.getUint32(this.offset_, true);
			const propertyCount = this.dataView_.getUint32(this.offset_ + 4, true);
			const propertiesSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
			const nameLength = this.dataView_.getUint8(this.offset_ + 12);

			var result: PropertyHeader = {
				offset: this.offset_,
				endOffset: endOffset,
				valueCount: propertyCount,
				valuesSizeBytes: propertiesSizeBytes,
				nameLength: nameLength,
				name: nameLength > 0 ? String.fromCharCode.apply(null, this.bytes_.subarray(this.offset_ + 13, this.offset_ + 13 + nameLength)) : ""
			};

			this.offset_ += 13 + nameLength;

			return result;
		}


		private readArrayProperty(element: NumericType): TypedArray | null {
			const arrayLength = this.dataView_.getUint32(this.offset_, true);
			const encoding = this.dataView_.getUint32(this.offset_ + 4, true);
			const compressedSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
			this.offset_ += 12;

			var array: TypedArray | null = null;
			var dataSizeBytes = 0;

			if (encoding == 0) { 
				dataSizeBytes = element.byteSize * arrayLength;
				assert(dataSizeBytes < (this.length_ - this.offset_), "array length out of bounds");

				let source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
				let dest = new Uint8Array(dataSizeBytes);
				dest.set(source);
				array = new (element.arrayType)(dest.buffer);
			}
			else if (encoding == 1) {
				dataSizeBytes = compressedSizeBytes;
				assert(dataSizeBytes < (this.length_ - this.offset_), "array compressed size out of bounds");

				let source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
				array = this.inflateCompressedArray(source, element);
			}
			else {
				console.warn("Unknown array encoding encountered: " + encoding + ". Skipping array.");
				dataSizeBytes = compressedSizeBytes;
			}

			this.offset_ += dataSizeBytes;
			return array;
		}


		private convertInt64ToDouble(dv: DataView, offset: number): number {
			let vLo = dv.getUint32(offset, true);
			let vHi = dv.getInt32(offset + 4, true);

			if (vHi > this.twoExp21 || vHi < -this.twoExp21) {
				console.warn("A 64-bit int property was larger than (+/-)2^53 so it may not be accurately represented.");
			}

			return vLo + vHi * this.twoExp32;
		}


		private readValues(header: PropertyHeader): FBXValue[] {
			var count = header.valueCount;
			var values: FBXValue[] = [];
			var firstPropOffset = this.offset_;

			while (count--) {
				let val: FBXValue | null;
				let type = String.fromCharCode(this.bytes_[this.offset_]);
				let propLen: number;
				this.offset_ += 1;

				switch (type) {
					// String and data
					case 'S':
						// [[fallthrough]]
					case 'R':
						propLen = this.dataView_.getUint32(this.offset_, true);
						if (propLen > 0) {
							let propData = this.bytes_.subarray(this.offset_ + 4, this.offset_ + 4 + propLen);
							if (type == 'S') {
								let str = convertBytesToString(propData);

								// In binary FBX, the :: separating a name and a classname is replaced with a 0x0001 sequence
								// and the order is reversed from the text version. name::class
								// We normalise this value with the text version considered to be canonical.
								str = str.split("\x00\x01").reverse().join("::");

								val = str;
							}
							else {
								val = propData.buffer.slice(this.offset_ + 4, this.offset_ + 4 + propLen);
							}
						}
						else {
							val = "";
						}
						this.offset_ += 4 + propLen;
						break;

					// Signed integer
					case 'C':
						val = this.dataView_.getInt8(this.offset_);
						this.offset_ += 1;
						break;
					case 'Y':
						val = this.dataView_.getInt16(this.offset_, true);
						this.offset_ += 2;
						break;
					case 'I':
						val = this.dataView_.getInt32(this.offset_, true);
						this.offset_ += 4;
						break;
					case 'L':
						val = this.convertInt64ToDouble(this.dataView_, this.offset_);
						this.offset_ += 8;
						break;

					// Floating point
					case 'F':
						val = this.dataView_.getFloat32(this.offset_, true);
						this.offset_ += 4;
						break;
					case 'D':
						val = this.dataView_.getFloat64(this.offset_, true);
						this.offset_ += 8;
						break;

					// Integer arrays
					case 'b':
						val = this.readArrayProperty(UInt8);
						break;
					case 'i':
						val = this.readArrayProperty(SInt32);
						break;
					case 'l':
						{
							// read array as doubles for proper size and alignment
							let doubles = this.readArrayProperty(Double);

							if (doubles) {
								// reinterpret array as a double-length list of int32s and convert in-place
								let view = new DataView(doubles.buffer);
								for (let di = 0; di < doubles.length; ++di) {
									let v = this.convertInt64ToDouble(view, di * 8);
									doubles[di] = v;
								}
							}

							val = doubles;
						}
						break;

					case 'f':
						val = this.readArrayProperty(Float);
						break;
					case 'd':
						val = this.readArrayProperty(Double);
						break;

					default:
						console.warn("Unknown property type: " + type + ". Skipping further properties for this field.");
						count = 0;
						val = 0;
						this.offset_ = firstPropOffset + header.valuesSizeBytes;
						break;
				}

				if (val !== null) {
					values.push(val);
				}
			}

			assert(this.offset_ - header.valuesSizeBytes == firstPropOffset);
			return values;
		}


		parse() {
			if (! this.checkFileHeader()) {
				return;
			}

			while (this.offset_ < this.length_) {
				var hdr = this.readFieldHeader();
				if (hdr.endOffset == 0) {
					// end of scope marker
					if (this.stack_.length > 0) {
						var closing = this.stack_.pop()!; // above check asserts succesful pop()
						assert(closing.endOffset == this.offset_, "Offset mismatch at end of scope");
						if (this.inProp70Block_) {
							assert(closing.name == "Properties70", "Invalid parser state, assumed closing a Prop70 but was closing a " + closing.name);
							this.inProp70Block_ = false;
						}
						else {
							this.delegate_.endBlock();
						}
					}
					else {
						// we're done here, there is some footer data left, but we don't know what it's for
						this.delegate_.completed();
						return;
					}
				}
				else {
					let values = this.readValues(hdr);
					if (hdr.endOffset != this.offset_) {
						let blockAction = FBXBlockAction.Enter;

						if (hdr.name == "Properties70") {
							this.inProp70Block_ = true;
						}
						else {
							blockAction = this.delegate_.block(hdr.name, values);
						}

						if (blockAction == FBXBlockAction.Enter) {
							this.stack_.push(hdr);
						}
						else {
							// skip the entire block
							this.offset_ = hdr.endOffset;
						}
					}
					else {
						if (this.inProp70Block_) {
							assert(hdr.name == "P", "Only P properties are allowed in a Properties70 block.");
							let p70p = interpretProp70P(values);
							this.delegate_.typedProperty(p70p.name, p70p.type, p70p.typeName, p70p.values);
						}
						else {
							this.delegate_.property(hdr.name, values);
						}
					}
				}
			}

			this.error("Unexpected EOF at nesting depth " + this.stack_.length);
		}
	}

} // sd.asset.fbx.parse
