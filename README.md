# peacock.js
An in progress Canvas based 2D graphics library with some built in game logic.

Currently the main render.js includes most of the graphics logic, and what little game logic (player control of an avatar, box collision, basic bounce physics) is contained in the index.html demo document.

# Currently Supported Features:
1. Offscreen object culling. The render loop works by calculating position first, and then drawing, by only drawing those objects in view the loop attempts to optimize the render process (keeping us close to 60 frames per second)

2. Rendering of animated sprite frames at an independant framerate. The flame sprite in the demo "index.html" runs at roughly 30fps, or half the main render framerate.

3. Locking the view to an object. You can lock the view to an object within the bounds of the playspace. The view will follow the object as it moves, without allowing the view to leave the defined bounds, following the object if it moves back away from the bounds.

4. Registration of user defined functions to be executed every frame.

# Features in the demo that will be wrapped into the main library:
1. Player movement. As demonstrated by the sphere. (Controlled via the arrow keys)

2. Box based collision. Both the rotating box and the player avatar use some basic box collision to enable the basic bouncing physics on the box and keeping the player within the bounds of the play space.

3. Momentum and a very very basic rotation physics model.

# Planned Features
1. Z-Index drawing priority. Right now z-index is defined solely by what order objects are pushed into the render. I would like to add support for z-index layers, and the ability for objects to move between them based on their logic.

2. Sphere collision and a momentum based physics system with variable gravity (possibly on a per area basis)

3. Support for multiple canvas layers (to support things like UI)

4. A Particle system with emitters.
