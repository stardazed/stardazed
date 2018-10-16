@stardazed/json-parser-stream
=============================
A TransformStream that transforms JSON text to actionable tokens.
Use for SAX-like streaming processing of JSON data, e.g. very large documents
or documents coming in incrementally from the network.

Part of [Stardazed](https://github.com/stardazed/stardazed).

Installation
------------
```
npm install @stardazed/json-parser-stream
pnpm install @stardazed/json-parser-stream
yarn add @stardazed/json-parser-stream
```

Usage (TypeScript)
------------------
```ts
import { JSONChunkType, JSONChunk, JSONTransformStream } from "@stardazed/json-parser-stream";

const reader = fetch("mydata.json").body
	.pipeThrough(new TextDecoderStream()) // JSONTransformStream expects strings as input
	.pipeThrough(new JSONTransformStream())
	.getReader();

while (true) {
	const { value: chunk, done } = reader.read();
	if (done) {
		break;
	}
	switch (chunk.type) {
		case JSONChunkType.KEY: /* chunk.value is the next key (inside an object) */ break;
		case JSONChunkType.NULL: break;
		case JSONChunkType.TRUE: break;
		case JSONChunkType.FALSE: break;
		case JSONChunkType.NUMBER: /* chunk.value is the number */ break;
		case JSONChunkType.STRING: /* chunk.value is the string */ break;
		case JSONChunkType.OBJECT_START: break;
		case JSONChunkType.OBJECT_END: break;
		case JSONChunkType.ARRAY_START: break;
		case JSONChunkType.ARRAY_END: break;
	}
}
```

Copyright
---------
© 2018-Present by Arthur Langereis (@zenmumbler)

License
-------
MIT
