@stardazed/json-stream-parser
=============================
A TransformStream that transforms JSON text to JavaScript values.
Use for SAX-like streaming processing of JSON data, e.g. very large documents
or documents coming in incrementally from the network.

👉 Just use plain `JSON.parse()` calls if you have small-ish full JSON documents.

Part of [Stardazed](https://github.com/stardazed/stardazed).

Installation
------------
```
npm install @stardazed/json-stream-parser
pnpm install @stardazed/json-stream-parser
yarn add @stardazed/json-stream-parser
```

Copyright
---------
© 2018-Present by Arthur Langereis (@zenmumbler)

License
-------
MIT
