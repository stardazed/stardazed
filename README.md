Stardazed TX
============

A library to enable quick development of custom 3D games in the browser.<br>
All code runs in the browser, the library does *not* have or need a server component.

Built in TypeScript, builds against TS 2.1 or newer, just run `tsc` somewhere inside the project dir.

**Project status**: *In Development (Pre-Alpha)*<br>
Features and APIs still very much in flux, but functional and usable for actual development
(I'm using it for prototypes and Game Jams).

Goals
-----

_"A small but powerful alternative to tools like Unity for 3D browser games"_

There is still quite a ways to go for this to become a reality, but I've already used the library
succesfully for small projects. For the foreseeable future the library will require medium to high
technical expertise to use.

### Sub goals
- Learn about all aspects of game programming by implementing them. This is an educational project for myself.
- Compact library code size (currently the minified js incl. all dependencies is ~330KiB vs 25MiB+ for Unity webgl)
- Fast and scalable (a lot of the data is kept in linear typed arrays, not in millions of tiny objects)
- Powerful renderer (Metallic and Specular setup PBR support, limited GI)
- Solid physics engine (good even for demanding sitations)
- Scalable and compatible (works well with all modern browsers, desktop and mobile)

Features
--------

### Assets
- FBX asset support (meshes, materials, models, scene graph, skeletons, animations)
- MD5 asset support (meshes, skeletons, animations)
- OBJ/MTL asset support (meshes, materials)
- TMX (Tiled Map Editor) support (basic tilemaps)
- Of course all browser-supported image and sound file formats
  - TGA file support for Chrome and Firefox (Safari has a built-in loader)

### Renderer
- Metallic-setup PBR materials with RMA, normal, height and albedo map support
- Forward shader with tiled lighting and shadowmap-based VSM shadows
- Hardware vertex skinning for skinned models
- Optimized generation of shaders for models with different features

### Geometry
- Generate optimised meshes from arbitrary vertex attribute streams; groups materials, merges vertices, etc.
- Generation and modification of interleaved vertex buffers and index buffers
- Standard mesh primitive generation such as cones, cubes, spheres, etc. + mesh manipulation and merging

### Scene Graph
- Component-based scene graph using Data Oriented Design principles
- Rigged model support with animations


Development is ongoing continuously, check the
[blog](http://blog.stardazed.club/) and our
[twitter](https://twitter.com/clubstardazed) and the
[GH project page](https://github.com/stardazed/stardazed-tx/projects/1)
to see what we're working on.

---

License: MIT License<br>
(c) 2015-Present by Arthur Langereis ([@zenmumbler](https://twitter.com/zenmumbler))
