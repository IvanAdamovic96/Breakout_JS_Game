# Brick Breaker Game

Brick Breaker is a classic arcade game where the player controls a pallet to bounce a ball and destroy bricks. The goal is to destroy all the bricks without losing all lives.

## 🛠 Game Architecture: Entity-Component-System (ECS)
This game uses the **Entity-Component-System (ECS)** architectural pattern. ECS is a modular and flexible approach to game development that enables easy management of complex systems.
- **Entity:** Abstract objects that represent different elements of the game, such as balls, bricks, pallets and particles. Entities are just "containers" without logic.
- **Component:** A set of attributes or data that define entities, such as `Position', `Velocity', `Ball', `Brick', `Paddle' and `Particle'.
- **System:** Functions that contain logic for processing specific aspects of the game, such as collisions, rendering, movement or particle generation.

This architecture enables:
1. **Modularity:** Adding new functionality becomes easy — just add new systems or components.
2. **Efficiency:** Systems process only entities with required components, reducing complexity.
3. **Code reuse:** Systems are decoupled from specific entities, so they can be easily ported to other projects.

### 🧩 Implementation of ECS in this game
- **Entities:**  
  - Ball (`Ball`): Has components `Position`, `Velocity`, and `Ball`.
  - Bricks (`Brick`): They have components `Position`, `Size`, and `Status`.
  - Palette (`Paddle'): Has `Position' and `Size' components.
  - Particles (`Particle`): They have components `Position` and `Particle`.

- **Components:**
  - `Position': Defines the x and y coordinates.
  - `Velocity`: Defines the velocity (`vx`, `vy`) of the entity.
  - `Status': Indicates whether the brick is active.
  - `Particle': Contains data on the speed and duration of the particle.

- **Systems:**
  - `renderSystem`: Renders entities to Canvas.
  - `movementSystem`: Updates entity positions based on their `Velocity` components.
  - `collisionSystem`: Detects collisions between ball, bricks and pallet.
  - `particleSystem`: Manages particles, updates their positions and removes them when their duration expires.


### 🛠 How ECS works in practice
All entities and systems are combined in the main game loop using a higher-order function:

```javascript
const updateGame = (entities, systems) =>
    systems.reduce((currentEntities, system) => system(currentEntities), entities);
```



## 🔥Characteristics
- Dynamic ball and bounce physics.
- Palette control using the arrow keys on the keyboard.
- Generation of particles when destroying bricks.
- Points and lives system.
- Victory screen when all bricks are destroyed.
- "Game Over" screen when there are no lives left.

## 🛠 Technologies
- **HTML5 Canvas** for game drawing.
- **JavaScript** for game logic and entity management.
- **CSS** for basic styling.

## 📂 Project structure
- **index.html**: Main HTML file.
- **style.css**: Styling of the game.
- **script.js**: Game logic, including entities and systems.

## 🎮 Demo
![image](https://github.com/user-attachments/assets/8f99ee4f-474f-41f8-ba60-b87a5c4c76f8)

