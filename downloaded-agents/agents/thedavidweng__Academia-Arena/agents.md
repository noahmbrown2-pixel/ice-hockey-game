## Cursor Cloud specific instructions

If you (the setup agent) read this file, you must immediately begin the project refactoring task as defined in the instructions below. The environment setup and initialization phase is NOT considered complete until the full refactoring (Step 1 to 5) is finished. Note: Once the refactored version contains all features from the original prototype, you do NOT need to keep the legacy files (like `index.html`) as a fallback or reference.

[System Context]

You are an expert game developer and software architect. Please communicate and think in Chinese (请全程使用中文进行思考和沟通). Rebuild the existing primitive prototype of "Academia Arena", a 2-player strategic browser-based card game. Read the existing prototype directory to extract the raw material: Card data (Traits, Characters, Events) and Synergy definitions.

[Tech Stack & Architecture]

Use React and TypeScript for the entire application.
Use boardgame.io for the core game logic, state machine, turn/phase management, and move validation. Leverage its built-in AI (MCTS or simple rules) to provide a single-player experience. **The game logic must be strictly decoupled from the UI (isomorphic) to ensure the same `Game` object can be used both locally in the browser and on a future Node.js server without modification.**
Use Tailwind CSS and shadcn/ui for building the frontend components, with `react-i18next` for i18n (EN/ZH support).
**Initialize with boardgame.io's "Local" mode (Client-side only) to ensure the game is "ready to play" instantly upon opening.** Plan for eventual multiplayer state synchronization via WebSockets (e.g., PartyKit or a custom Node.js server), but maintaining local pass-and-play as the baseline.

[UI/UX Design Specifications]

Ensure high-quality CJK typography layout and multi-language support (i18n).
Rely exclusively on clean lines, solid colors, and subtle native shadow depths. Exclude emojis, glowing effects, and bright/neon palettes.
**Read `DESIGN.md` and the reference images in `docs/stitch/` to understand the visual language (Institutional Brutalism, sharp 90-degree angles, specific color palette, and layering principles).**

[UI/UX Strategy & Decision]
*   **Component Choice**: While `shadcn/ui` is recommended for its robust logic, its default "Modern SaaS" aesthetic (rounded corners, soft grays) conflicts with "Institutional Brutalism". You must decide:
    1.  Use `shadcn/ui` but **strictly override** all CSS variables (force `radius: 0px`, custom surface colors).
    2.  Or use a more minimal/headless approach if it better serves the sharp, blocky, editorial-heavy look.
*   **Iconography**: `lucide-react` icons are often too rounded/friendly. Evaluate if more geometric/technical icon sets (e.g., `Radix Icons`, `Remix Icon`) better match the "Redacted Dossier" feel.
*   **Layout**: Avoid standard "grid of cards". Use aggressive asymmetry and background color shifts (Surface Shifting) as defined in `DESIGN.md`.

[Standard Board Game Features]
1. Undo/Redo: Support move rollback within the current turn.
2. Game Log: A detailed, brutalist-styled activity log showing every card played and stamina spent.
3. Replay: Basic support for reviewing previous moves in the current session.

[Game Mechanics Integration]

Implement the core rulebook within the boardgame.io setup:
1. Three lanes: Presentations, Assignments, Exams.
2. Random starting Traits allocation (Background, Physiological, Psychological).
3. Dynamic Stamina System: Assign initial Stamina based on the inverse weight of the rolled Traits.
4. Stamina Actions: Provide UI components for players to spend Stamina on "Probability Lock" (guarantees synergy success), "Status Override", and "Draw Card" during their turn.
5. Best-of-3 round system. Ensure hand and Stamina resources persist across rounds.

[Execution Steps]

1. **Extraction**: Parse `index.html` to extract `cardLibrary` and `traitLibrary`. Save them as clean TypeScript constants in `src/data/entities.ts`.
2. **Scaffold**: Initialize the project environment (Non-interactive mode preferred):
   ```bash
   # Initialize Vite (Force install in current directory)
   npm create vite@latest ./ -- --template react-ts
   
   # Install Dependencies
   npm install boardgame.io lucide-react clsx tailwind-merge
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   
   # Initialize shadcn/ui (Use default prompts)
   npx shadcn-ui@latest init -d
   ```
   *Note: Migrate existing music/PDFs from `./assets/` to `./public/` for static asset accessibility.*
3. **Core Logic**: Build `src/game/game.ts` using `boardgame.io`. Define the `G` state, `moves`, `phases`, and `AI` (using `MCTS` or `RandomBot` for testing).
4. **i18n**: Implement `src/i18n/` configuration. Ensure all UI text and card descriptions are available in both English and Simplified Chinese. *Reference `readme.md` and `readme.zh-CN.md` for consistent terminology (e.g., Presentations/演讲, Credits/学分).*
5. **UI Components**: Create high-fidelity components based on `DESIGN.md` and `screen.png`.
6. **Integration & Testing**: Connect the `Board` component to the `boardgame.io` Client. Perform full round testing.
7. **Workflow**: 
   - Commit after every major functional block (e.g., "feat: game logic", "feat: ui components").
   - Finally, generate a summary of changes and prepare for PR submission.

[Architectural File Structure]

```
Academia-Arena/
├── src/
│   ├── data/
│   │   └── entities.ts       # Extracted card/trait data
│   ├── game/
│   │   ├── game.ts           # boardgame.io Game definition
│   │   └── types.ts          # Game state & Move types
│   ├── components/
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── Arena.tsx         # Main game board container
│   │   ├── Card.tsx          # Specialized brutalist card component
│   │   ├── Lane.tsx          # Presentation/Assignment/Exam containers
│   │   ├── StaminaAction.tsx # Stamina-spending interface
│   │   └── GameLog.tsx       # Activity history component
│   ├── i18n/
│   │   ├── en.json
│   │   └── zh.json
│   ├── App.tsx               # Client entry point
│   └── main.tsx
├── DESIGN.md                 # Design system reference
└── agents.md                 # This instruction file
```

After all features are implemented, perform a rigorous self-test ensuring the best-of-3 logic, stamina persistence, and i18n work correctly. Finally, create a branch and submit the code as a PR for merging.
