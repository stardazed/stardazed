Stardazed TX
============

A library to enable quick development of custom 3D games in the browser.<br>
Sibling of and proving grounds for [Stardazed](https://github.com/stardazed/stardazed), my native C++ game library.

Built in TypeScript, builds against TS 1.6 or newer, just run `tsc` somewhere inside the project dir.

**Project status**: *In Development (Pre-Alpha)*<br>
Features and APIs still very much in flux, but functional and usable for actual development
(I'm using it for prototypes and Game Jams).

Goals
-----

_"A small but powerful alternative for tools like Unity for 3D browser games"_

There is still quite a ways to go for this to become a reality, but I've already used the library
succesfully for small projects. For the foreseeable future the library will require medium to high
technical expertise to use.

### Sub goals

- Compact library code size (currently the minified js is ~130KiB vs 25MiB+ for Unity webgl)
- Fast and scalable (a lot of the data is kept in linear typed arrays, not in millions of tiny objects)
- Powerful renderer (getting to a level of at least Unity 4 — pre-PBR — is the current goal)
- Solid physics engine (good even for demanding sitations)
- Scalable and compatible (works well with all modern browsers, desktop and mobile)
- Learn about all aspects of game programming by implementing them. An educational project for myself.

Features
--------

- Component-based scene graph using Data Oriented Design principles
- Standard mesh primitive generation such as cones, cubes, spheres + mesh manipulation and merging
- Data view-based access to VertexBuffers and IndexBuffers, supporting interleaved vertex attribute data
- Optimized generation of shaders for models with different features
- Forward shader with multiple fragment lights and shadowmap-based shadows
- LWO object + material support
- SceneController based automated RunLoop

Development is ongoing continuously, check the [issues page](https://github.com/stardazed/stardazed-tx/issues)
to see what we're working on.

---

License: MIT License<br>
(c) 2015-6 by Arthur Langereis ([@zenmumbler](https://twitter.com/zenmumbler))
