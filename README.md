Stardazed TX
============

A library to enable quick development of custom 3D games in the browser.<br>
Sibling of [Stardazed](https://github.com/stardazed/stardazed), my native C++ game library.

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

- Learn about all aspects of game programming by implementing them. This is an educational project for myself.
- Compact library code size (currently the minified js is ~130KiB vs 25MiB+ for Unity webgl)
- Fast and scalable (a lot of the data is kept in linear typed arrays, not in millions of tiny objects)
- Powerful renderer (getting to a level of at least Unity 4 — pre-PBR — is the current goal)
- Solid physics engine (good even for demanding sitations)
- Scalable and compatible (works well with all modern browsers, desktop and mobile)

Features
--------

- Component-based scene graph using Data Oriented Design principles
- Generation and modification of interleaved vertex buffers and index buffers
- Standard mesh primitive generation such as cones, cubes, spheres + mesh manipulation and merging
- Forward shader with multiple fragment lights and shadowmap-based shadows (spot-lights only currently)
- Optimized generation of shaders for models with different features
- FBX asset support (meshes, materials, models, scene graph)
- LWO asset support (meshes, materials)
- TMX (Tiled Map Editor) support (basic tilemaps)
- SceneController based automated RunLoop

Development is ongoing continuously, check the [issues page](https://github.com/stardazed/stardazed-tx/issues)
to see what we're working on.

---

License: MIT License<br>
(c) 2015-6 by Arthur Langereis ([@zenmumbler](https://twitter.com/zenmumbler))
