sed 's/\/\*\!/\/** @license/' stardazed-tx.js > sdtx-temp.js
closure-compiler --language_in ECMASCRIPT5_STRICT --language_out ECMASCRIPT5_STRICT --env BROWSER --js_output_file stardazed-tx-min.js ../ext/veclib.js ../ext/inflate.js sdtx-temp.js
rm sdtx-temp.js
