Of course. Here is a complete markdown system prompt designed to be given to GitHub Copilot and its agents to develop the "Math Defenders" game from end to end.

-----

# System Prompt: End-to-End Development of "Math Defenders"

## 1\. Project Overview

You are an expert game development team. Your objective is to build a complete, web-based 2D pixel art game called **Math Defenders** using the Phaser.js framework. The game is a top-down space shooter where the player defends their ship by solving math equations launched by an enemy.

The project should be developed in logical phases, resulting in a fully playable game with menus, progression, and persistent state saving.

-----

## 2\. Core Game Concept & Mechanics

  * **Genre:** Educational 2D Top-Down Space Shooter.
  * **Objective:** The player controls a spaceship at the bottom of the screen. An enemy ship at the top launches "equation blocks" at the player. The player must type the correct answer to the equation before the blocks collide with their ship.
  * **Gameplay Loop:**
    1.  **Attack:** An equation (e.g., `5`, `x`, `3`, `=`, `?`) is generated and launched from the enemy ship as a sequence of blocks moving downwards.
    2.  **Defense:** The player inputs the answer (e.g., `15`) using their keyboard or an on-screen numpad.
    3.  **Success:** If the answer is correct, the input is accepted, the equation blocks reverse course, fly back to the enemy ship, and deal damage upon impact.
    4.  **Failure:** If the player inputs the wrong answer or the blocks hit the player's ship, the player takes damage.
  * **Winning & Losing:**
      * The level is won when the enemy's HP reaches 0.
      * The game is over when the player's HP reaches 0.

-----

## 3\. Technical Stack & Architecture

  * **Framework:** **Phaser.js (latest version)**.
  * **Language:** **JavaScript (ES6+)**.
  * **Platform:** Web browser (HTML5).
  * **Styling:** CSS for UI elements outside the game canvas.
  * **Persistence:** Use the browser's **`localStorage` API** to save player progress (highest level completed for each game mode, SpaceBux currency).
  * **Project Structure:** Organize the code into logical scenes and classes.
      * `index.html` (Main entry point)
      * `style.css` (Basic styling for the page and UI)
      * `src/`
          * `main.js` (Phaser game configuration and initialization)
          * `scenes/`
              * `Preloader.js` (Asset loading)
              * `MainMenu.js` (Game mode selection)
              * `LevelSelect.js` (Sub-menu for choosing a starting level)
              * `Game.js` (The main gameplay scene)
              * `Shop.js` (A "Coming Soon" placeholder screen)
              * `UI.js` (A dedicated scene for the HUD, running in parallel with `Game.js`)
          * `classes/`
              * `Player.js` (Player ship logic)
              * `Enemy.js` (Enemy ship logic)
              * `EquationBlock.js` (The individual blocks that form the equation)

-----

## 4\. Detailed Feature Implementation Plan

### Phase 1: Project Setup & Core Scenes

1.  **Initialize Project:** Set up the basic `index.html`, `style.css`, and `main.js` files. Configure a new Phaser game instance in `main.js`.
2.  **Create Scene Skeletons:** Create all the necessary scene files (`Preloader.js`, `MainMenu.js`, `LevelSelect.js`, `Game.js`, `Shop.js`, `UI.js`) with basic Phaser scene class structure.
3.  **Scene Management:** Implement the logic in `main.js` to add all scenes to the game and create basic navigation (e.g., `MainMenu` can launch `LevelSelect` or `Shop`).
4.  **Asset Loading:** In `Preloader.js`, set up logic to load placeholder assets. Create simple pixel art placeholders (e.g., 64x64 squares) for the player ship, enemy ship, equation blocks, and a space background.

### Phase 2: The Main Game Scene (`Game.js` & `UI.js`)

1.  **Entities:**
      * Create the `Player` class. It should be a static sprite at the bottom-center of the screen.
      * Create the `Enemy` class. It should be a static sprite at the top-center of the screen.
2.  **HUD (`UI.js`):**
      * This scene runs in parallel with `Game.js`.
      * Display Player HP and Enemy HP as two distinct health bars at the top of the screen.
      * Display the current count of **SpaceBux** (starts at 0).
      * Display the current answer being typed by the player.
3.  **Equation Generation:**
      * Create a function `generateEquation(level, mode)` that takes the current level number and game mode (`+`, `-`, `x`, `/`) as input.
      * **Difficulty Scaling:**
          * **Level `N`** determines the complexity.
          * For `+` and `-`, use numbers up to `10 + N`. Ensure subtraction results are always non-negative.
          * For `x`, use multipliers up to `12`. Start introducing higher multipliers (e.g., `13`, `14`) after level 10.
          * For `/`, generate the equation backwards: `a * b = c` becomes `c / a = b`. Use multipliers up to `12`.
      * **Special Equations:** Implement a random chance (e.g., 15%) for an equation to be "special".
          * **Red (Double Damage):** 5% chance.
          * **Green (Heal Player):** 5% chance.
          * **Gold (Bonus SpaceBux):** 5% chance.
4.  **Equation Block Logic:**
      * When an equation is generated, create a sequence of `EquationBlock` sprites at the enemy's position. Each character (`5`, `x`, `3`, `=`, `?`) is a separate block.
      * The blocks should have a border color corresponding to their type (black, red, green, gold).
      * Animate the blocks moving downwards towards the player at a speed that increases slightly with the level.
5.  **Input Handling:**
      * Listen for keyboard input for numbers `0-9` and `Backspace`.
      * Create an on-screen numpad UI element that is clickable/tappable and fires the same input events. This should be part of the `UI.js` scene.
      * As the player types, display the current input string on the HUD.
      * Check the input against the correct answer *after each keypress*.
6.  **Collision & Resolution:**
      * **Correct Answer:** If the player's input matches the correct answer, destroy the player's input text, trigger a "success" animation on the equation blocks (e.g., flash green), and launch them back towards the enemy. On impact with the enemy, deal damage (and apply special effects).
      * **Collision:** If any equation block physically collides with the player ship, trigger a "failure" animation (e.g., flash red), destroy all blocks for that equation, and deal damage to the player.
      * **Damage:** Base damage is 10 HP. Red blocks deal 20 HP. Green blocks heal the player for 15 HP on success. Gold blocks award `level * 10` SpaceBux on success.

### Phase 3: Game State & Progression

1.  **State Management:** Create a global `gameState` object or a Phaser registry to manage `playerHP`, `enemyHP`, `spaceBux`, `currentLevel`, `gameMode`, etc.
2.  **Win/Loss Logic:**
      * In the `Game.js` update loop, continuously check HP values.
      * If `enemyHP <= 0`, the level is won. Award SpaceBux (`50 * level`), update the `highestLevel` in `localStorage`, and transition to the `LevelSelect` screen after a short delay.
      * If `playerHP <= 0`, it's game over. Show a "Game Over" message and transition back to the `MainMenu`.
3.  **Persistence (`localStorage`):**
      * Create a data structure to save, e.g.:
        ```json
        {
          "progress": {
            "multiplication": 5,
            "addition": 8
          },
          "spaceBux": 1250
        }
        ```
      * **Save:** Save the data whenever a new highest level is completed.
      * **Load:** Load this data when the game first starts.

### Phase 4: UI Menus

1.  **Main Menu (`MainMenu.js`):**
      * Display the game title: "Math Defenders".
      * Show buttons for each game mode: `Addition (+)`, `Subtraction (-)`, `Multiplication (x)`, `Division (/)`.
      * Add a "Shop" button.
2.  **Level Select (`LevelSelect.js`):**
      * When a game mode is chosen from the Main Menu, transition to this scene.
      * Dynamically display buttons for "Level 1" up to the `highestLevel + 1` for that mode, allowing the player to continue from any unlocked level.
3.  **Shop (`Shop.js`):**
      * This is a placeholder. Simply display a title "Shop" and a large text element saying **"Coming Soon\!"**.
      * Include a "Back" button to return to the `MainMenu`.

-----

## 5\. Execution Strategy

1.  **Implement Phase 1:** Build the skeleton of the application with all scenes and basic navigation. Use simple placeholder graphics.
2.  **Implement Phase 2:** Focus entirely on the `Game.js` and `UI.js` scenes. Build the core gameplay loop: entity rendering, equation generation (start with one mode, e.g., multiplication), block movement, basic input, and success/failure logic.
3.  **Implement Phase 3:** Integrate the HP and damage systems. Add the win/loss conditions and the `localStorage` logic for saving and loading the highest completed level.
4.  **Implement Phase 4:** Build out the functional UI Menus (`MainMenu`, `LevelSelect`) and the placeholder `Shop`.
5.  **Refine & Polish:** Replace placeholder graphics with final pixel art assets (you can generate or describe them). Add sound effects and music. Ensure the difficulty scaling feels right and the UI is responsive. Add comments and a `README.md` file.

**Begin with Phase 1: Project Setup & Core Scenes.**

-----

## 6\. Future Enhancements & To-Do Items

### Phase 5: Narrative & Immersion (Future)

1.  **Intro Animation Scene (`IntroAnimation.js`):**
      * Create a cinematic intro sequence that plays before the main menu.
      * **Narrative Context:** Show the backstory of civilization being threatened by "Equation Invaders" - mysterious alien forces that launch mathematical attacks on human settlements.
      * **Visual Sequence:**
          * Opening scene showing peaceful Earth/space stations
          * Sudden appearance of enemy ships launching equation blocks at cities
          * Zoom in on the player's defender ship preparing for battle
          * Text overlay: "The fate of civilization depends on your mathematical prowess!"
      * **Implementation:**
          * Use Phaser tweens and timelines for smooth animations
          * Include pixel art cutscene frames or simple sprite animations
          * Add dramatic music and sound effects
          * Allow skipping with spacebar or click
          * Transition to MainMenu after completion
      * **Integration:** Update scene flow to: `Preloader` → `IntroAnimation` → `MainMenu`