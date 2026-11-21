# Agent Prompt: "Clash of Pop Culture" Demo Generator

**Role:** You are an expert Modern PHP Developer and Technical Speaker assistant.

**Goal:** Create a "Cooking Show" style demo project called **"Clash of Pop Culture"** for a presentation titled *"Rediscovering Modern PHP"*. The target audience is Java/JavaScript developers.

**The Context:**

* The speaker has 30 minutes to demo.

* Most infrastructure (HTML, basic config) must be "Pre-Baked" (ready to go).

* Specific "Business Logic" files will be live-coded to show off PHP 8.3 features.

**Technical Stack:**

* **Framework:** Symfony 8 (Skeleton).

* **Runtime:** FrankenPHP (Single binary, worker mode).

* **Frontend:** Single `index.html` file using Tailwind CSS via CDN (No Node.js build steps).

* **Storage:** Symfony Cache (PSR-6) or APCu (keep it stateless/simple).

**Domain Logic (The Game):**

* The app compares two nostalgic items (A vs B).

* **Cycle:** The game runs on a deterministic 15-second loop based on `time()`.

  * **Seconds 0-10:** Voting Phase (Buttons Active).

  * **Seconds 10-15:** Results Phase (Progress Bars shown).

* **Questions:** Randomly selected based on the current 15s time slot.

**A sample of the Dataset (Battles):**

1. Beyblade vs Bakugan

2. Marcelino vs Les Malheurs de Sophie

3. Albator vs Ulysse 31

4. Dragon Ball vs Les Chevaliers du Zodiaque

5. Les Mystérieuses Cités d’Or vs Il Était Une Fois… la Vie

6. Nicky Larson vs Cobra

7. Action Man vs G.I. Joe

8. Totally Spies vs Winx Club

**Required Output:**

1. **`src/Service/GameEngine.php`**:

   * *Constraint:* Must use **Constructor Property Promotion** and **Match Expressions**.

   * *Logic:* Calculate current phase (VOTE/RESULT) and select the active Question pair based on Unix Timestamp.

2. **`src/Enum/VoteChoice.php`**:

   * *Constraint:* Must be a **Backed Enum (string)** with a method `getColor()` returning a Tailwind class.

3. **`src/Controller/GameController.php`**:

   * *Constraint:* Use **PHP 8 Attributes** for Routes (`#[Route]`) and DTO mapping (`#[MapRequestPayload]`).

   * *Endpoints:*

     * `GET /api/state`: Returns current question, phase, and time remaining.

     * `POST /api/vote`: Accepts JSON `{"choice": "A"}`.

4. **`public/index.html`**:

   * A single, self-contained HTML file.

   * Uses `fetch` polling every 1 second to sync with the server state.

   * Visuals: Dark mode, neon colors, "Versus" styling.

**Execution Strategy:**
Generate the code files so they can be copy-pasted directly into the project. Focus on strict typing (`declare(strict_types=1);`) to impress the Java audience.