Stardazed
=========

A library to enable quick development of 3D games in the browser.

Built in TypeScript, currently TS 2.6, just run `tsc` somewhere inside the project dir.

**Project status**: *In Development (Pre-Alpha)*<br>
Features and APIs still very much in flux, but functional and usable for actual development
(I'm using it for prototypes and Game Jams).

Goals
-----

_"A small but powerful alternative to tools like Unity for Desktop 3D browser games"_

There is still quite a ways to go for this to become a reality, but I've already used the library
succesfully for small projects. For the foreseeable future the library will require medium to high
technical expertise to use.

### Sub goals
- Learn about all aspects of game (engine) programming by implementing them. This is an educational project for myself.
- Minimal external dependencies, currently:
  - [veclib](https://github.com/stardazed/veclib), a fork of [gl-matrix](https://github.com/toji/gl-matrix) modified specifically for inclusion in SD
  - a custom build of [AmmoJS](https://github.com/stardazed/ammo.js), a JS compilation of [Bullet](http://bulletphysics.org/wordpress/) for the physics system
  - Inflate, a minimal JS port of the inflate algorithm to expand GZipped assets in-client
- Memory & GC efficiency: a lot of the data is kept in large linear typed arrays, not in millions of tiny objects
- Scalability: use workers, atomics and shared buffers to allow for multi-threaded rendering and game logic handling
- Powerful renderer (flexible shader setup, PBR, GI, etc.)
- Target and focus on desktop WebGL 1 & 2, mobile support is currently a lower priority

Features
--------

### Assets
- FBX asset support (geometry, materials, models, scene graph, skeletons, animations)
- OBJ/MTL asset support (geometry, materials, including extended PBR fields, tex scale and offset)
- TMX (Tiled Map Editor) support (basic grid tilemaps only)
- Of course all browser-supported image and sound file formats plus:
  - DDS image support (DXT 1, 3, 5)
  - TGA image support

### Renderer
- Metallic-setup PBR materials with normal and height map support
- Forward shader with tiled lighting and shadowmap-based VSM shadows
- Hardware vertex skinning for skinned models
- Optimized generation of shaders for models with different features

### Geometry
- Generate optimised meshes from arbitrary vertex attribute streams; groups materials, merges vertices, etc.
- Generation and modification of interleaved vertex buffers and index buffers
- Standard primitive generators for cones, cubes, spheres, etc. + geometry manipulation and merging

### Scene Graph
- Component-based scene graph using Data Oriented Design principles
- Rigged model support with animations


Development is ongoing continuously, check the
[blog](http://blog.stardazed.club/) and our
[twitter](https://twitter.com/clubstardazed) and the
[GH project page](https://github.com/stardazed/stardazed/projects/1)
to see what we're working on.

---

License: MIT License<br>
(c) 2015-Present by Arthur Langereis ([@zenmumbler](https://twitter.com/zenmumbler))
