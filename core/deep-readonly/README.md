@stardazed/deep-readonly
========================
Create a deeply immutable representation of an object. Uses `Proxy` by default
to return a readonly view on an object and falls back to `Object.freeze` where
`Proxies` aren't available.

Additional options are to create a revocable readonly view on an object and to
log warning when client code tries to modify a readonly object. Both options
only function in runtimes with `Proxy` support and are silently ignored otherwise.

Installation
------------
```
npm install @stardazed/deep-readonly
pnpm install @stardazed/deep-readonly
yarn add @stardazed/deep-readonly
```

Usage
-----
Basic usage uses the `makeDeepReadonly` function.

```js
import { makeDeepReadonly } from "@stardazed/deep-readonly";

const a = makeDeepReadonly({ x: 1, y: [2, 3] });
a.x = 10; // disallowed
a.y.push(20); // disallowed

// specify verbose: true as an option to log warnings to the console
const b = makeDeepReadonly({ x: 1, y: [2, 3] }), { verbose: true });
delete b.x; // disallowed, will log the action to console
```

If the runtime support `Proxy` objects then you can create a revocable
immutable interface to your object. This can be useful for when you 
want to control access to a timed resource for example.

```js
import { makeRevocableDeepReadonly } from "@stardazed/deep-readonly";

const myImportantThing = { ... };

const { revocable, revoke } = makeRevocableDeepReadonly(myImportantThing);

// revocable can now be used an immutable interface to myImportantThing, e.g.:
const foo = revocable.secretKey;

// after this call revocable will become unusable
revoke();

const fum = revocable.secretKey; // ERROR, throws exception
```

If you are using TypeScript and have faith in the end user, you can also just
have the compiler restrict access in your own code without having to deal
with the overhead of `Proxy` objects.

```ts
import { DeepReadonly } from "@stardazed/deep-readonly";

// if you just want the TypeScript compiler to help you deny access to objects.
interface Thing {
	a: number;
	b?: Thing;
	c: number[]; 
}

const a: Thing = { a: 1, b: { a: 2 }, c: [3, 4] };
const roa = a as DeepReadonly<Thing>;

// The type DeepReadonly<Thing> is effectively the same as:
interface DeepReadonlyThing {
	readonly a: number;
	readonly b?: DeepReadonlyThing;
	readonly c: ReadonlyArray<number>;
}
```
Keep in mind that the restrictions are only enforced by the compiler, if you want
runtime protection against changes, you must still use `makeDeepReadonly`.

Copyright
---------
© 2018 by Arthur Langereis (@zenmumbler)

License
-------
MIT
