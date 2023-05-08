Stardazed
=========
A library to enable quick development of 3D games in the browser.

Project status
--------------
*In Development (Pre-Alpha)*

Features and APIs still very much in flux, but functional and usable for actual development
(I'm using it for prototypes and Game Jams).

⚠️ **Important**: Currently the project is being reworked internally and is not in a usable state.

Project Goal
------------
_"A web-native, modular and comprehensive 3D game creation platform"_

There is still quite a ways to go for this to become a reality, but I've already used the library
succesfully for small projects. For the foreseeable future the library will require medium to high
technical expertise to use.

Stardazed is an educational project for myself and the design and feature set currently directly corresponds
to my interests. For example, I'm focusing on desktop WebGL 1 & 2, mobile support is currently not a priority.

### Sub goals
- Learn about all aspects of game (engine) programming by implementing them.
- Learn about build systems, large project design and modularity in the context of the web platform.
- Memory & GC efficiency: a lot of the data is kept in large linear typed arrays, not in millions of tiny objects
- Scalability: use workers, ~~atomics and shared buffers~~ to allow for kinda multi-threaded rendering and game logic handling
- Solid but performant code using TypeScript, linting and (runtime) function contracts that can be omitted in release builds
- Flexible and modular shader programming (composable shaders and features like PBR, GI, etc.)
- Network-oriented project design with streaming, partial assets, fallback shaders, etc.
- Minimal external dependencies and small code footprint

License
-------
MIT

© 2015-Present by [@zenmumbler](https://mastodon.gamedev.place/@zenmumbler)
