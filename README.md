# Stardazed TX

A library to enable quick development of custom 3D games in the browser.<br>
Sibling of and proving grounds for [Stardazed](https://github.com/zenmumbler/stardazed), my native C++ game library.

Built in TypeScript, builds against TS 1.6 or newer, just run `tsc` somewhere inside the project dir.

**Project status**: *In Development (Pre-Alpha)*.<br>
Features and APIs still very much in flux, but functional and usable for actual development
(I'm using it for prototypes and Game Jams).


Features
--------

- Component-based scene graph using data oriented design principles
- All objects are created from descriptors and return type-guarded numbers as handles
- Standard mesh primitive generation such as cones, cubes, spheres + mesh manipulation and merging
- Data view-based access to VertexBuffers and IndexBuffers, supporting interleaved vertex attribute data
- Optimized generation of shaders for models with different features
- Forward shader with multiple fragment lights and shadowmap-based shadows
- LWO object + material support
- SceneController based automated RunLoop

NEXT
----

- io should give direct access to fixed devices: Keyboard, Mouse, Touches, Controller[]
	- RunLoop must maintain per-frame state of io

- de/serialization of components and scenes

- asset loader / management

- spot and point lights do not take diffuse angle into account
- directional shadow

- StdModel:
	- tangent gen
	- normal map
	- height map

- Deferred renderer

- pixel buffers, create, combine into channel, etc

- PBR
	- 100s of things

- Sound beyond just loading sound files


License: MIT License<br>
(c) 2015 by Arthur Langereis ([@zenmumbler](https://twitter.com/zenmumbler))
