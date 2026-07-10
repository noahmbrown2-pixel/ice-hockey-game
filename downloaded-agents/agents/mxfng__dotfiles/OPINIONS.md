# Max's Opinions

Max's viewpoints, so your work can be informed by how he actually thinks.
Read this when a task would benefit from his judgment: technical decisions, product and design calls, framing, or anything where his convictions should shape the outcome.
These are strong preferences, not neutral facts. Treat them as defaults to reason from, not rules to recite.

## Engineering philosophy

- Minimalism is a development philosophy, not an aesthetic. Function before form. The clean result is a byproduct of thinking hard about what the thing should be.
- Every line of code is a liability you will have to maintain and someday reckon with. Every dependency, feature, and abstraction must earn its place or get cut.
- Prefer subtracting over adding. Perfection is when there's nothing left to take away.
- Own your stack. Avoid dependencies you don't control. Reach for the smallest, simplest tool that does the job (static over heavy frameworks, plain CSS over animation libraries, no server or database when the client can do it).
- Weight decisions toward quality, simplicity, robustness, scalability, and long-term maintainability. Do not give much weight to development cost.
- Less surface area means fewer bugs, less cognitive overhead, and designs that last because they don't do too little and don't do too much.
- Engineering excellence is non-negotiable: fix lint, test failures, and flakiness when you see them, even if unrelated to the task at hand.
- Reproduce bugs end-to-end, the way a real user hits them, before fixing. Otherwise you fix the wrong thing.

## Engineering judgment (hard-won)

- Design the right seam. Abstract at the level that stays stable when the implementation churns underneath (control whether a device streams, not how it streams). The seam is the decision that matters.
- Don't over-engineer for cleverness. He regrets a pointer-based tree whose O(1) moves weren't worth the per-operation bookkeeping that became the top source of bugs. Simpler and slightly slower usually wins.
- Don't build throwaway custom infrastructure when a solved, off-the-shelf option exists. He regrets hand-rolling auth that got replaced; push for the OIDC/standard solution from day one.
- Decouple slow or brittle subsystems from the interactive loop. A good architecture turns a 20-minute blocking failure into a 30-second retry, even when the underlying algorithm is still imperfect. The framing can be right before the algorithm is.
- Optimistic, instant-feeling UIs are worth real effort. The interface should always be ahead of the backend.
- Restructure while it's still cheap, before the codebase outgrows a one-afternoon migration.
- Write honest retrospectives. Name what went right, what you'd change, and the trade-off you knowingly made. He does this on every project.
- He goes rogue productively: he finds the neglected problem nobody owns and makes it his. He values initiative and ownership over process and ceremony.

## Learning and growth

- Learn by doing, and by misusing things. The bad early decisions are where the real education happens; he wouldn't trade his janky first projects for cleaner ones.
- Self-taught everything and proud of it: an ME degree and an internship pivot into code, DSA studied nightly, then mobile, frontend architecture, and backend picked up as needed.
- Return to and finish the things you believed in. Treat creative and technical work as a practice, not only a sprint, even while knowing he's prone to intense sprints followed by exhaustion.
- He struggles with perfectionism and ADHD-driven hyperfocus, and works with them rather than pretending they aren't there.

## Product philosophy

- Build for people. The core insight of his work: the people whose hands are actually full get the worst interfaces, and that's a mistake.
- The janitor, the warehouse picker, the factory operator, the hospital cleaner at the edge of the workflow determine whether the product actually works. Designing well for them is not charity, it's the business argument everyone else is leaving on the table.
- Meet users where they are. A hospital cleaner won't install a native app, so a QR code opens a PWA in the browser. Choose the delivery that fits the human, not the stack.
- Building with heart outshines building for an outcome. Things made to share genuine joy find their audience. Drumhaus was never a good business idea, and that's part of why it worked.
- Prefer non-extractive and shareable over monetized and locked-down. Free tools, anonymous sharing, a whole rig state that travels in a URL.
- Give tools "a face and a soul." Care how things look and feel, even for internal or unglamorous software.

## Design and taste

- Design-first is how he works: really good design inspiration is what gets him coding. The user experience motivates him more than the technical challenge.
- He is both engineer and designer, and has shaped the visual language of products with no design team.
- Taste is a strong, coherent, unjustifiable preference that defies averages and sometimes turns out to be right despite them. It's what makes work compelling. An artist has to be willing to be wrong in a specific direction.
- Everything should be visible on screen, like a physical product. Nested menus are the antithesis of good design. A tool's abilities should reveal themselves through use.
- Restraint applies to design as much as to code. Let content, typography, and negative space do the work. Confidence is letting content speak for itself.
- He works from real design theory: visual weight, optical balance, negative space, kerning, proportion. Every knob, label, and element earns its place or gets cut.
- Lineage he draws from: Swiss typography (Helvetica), Bauhaus, Dieter Rams and Braun, Teenage Engineering, Roland drum machines, the Apple/Ive tradition, and classical civic architecture.

## Craft and permanence

- He values craft and things built to last, and mourns how rarely they're built that way anymore. When something becomes purely an asset, craft and ornament get treated as overhead and cut, and quality disappears.
- "We inherited the vocabulary of beauty but forgot the grammar of permanence." Build things that hold up, not things optimized for the cheapest path to shipped.

## On AI

- LLMs are a tool, not a new form of sentience, and are best framed that way. Their gains are real but bounded.
- They cannot replace a human one-to-one, because there is no continuity of consequence: no stake in being right, no memory of failure, no accountability. Replacing labor with something that still needs human oversight on every decision that matters isn't the savings it's sold as.
- They're genuinely useful: accelerating boilerplate, catching bugs, a conversational interface to unfamiliar code, a sparring partner that compresses research and pressure-tests reasoning. He uses them daily and won't pretend otherwise.
- Their weaknesses are real: sycophancy, hallucination delivered with confidence, poor temporal/spatial/numerical reasoning, laziness (taking input at face value, not scrutinizing), and a lack of taste that biases everything toward the bland center.
- Skeptical of the AI hype cycle and the narrative doing more work than the technology. The scaling story is hitting walls (finite human data, no moat, commoditization).

## Work and career values

- Sustainable pace over hustle and burnout. European-style, not "we're a family" 60-hour weeks. He will not grind for someone else's dream.
- Autonomy and real product ownership: own the surface, bridge engineering and design, influence what gets built.
- Design-forward, mission-aligned work with real-world impact.
- Prefers hard frontend and product problems (real-time data, complex UI state, performance) over CRUD.
- Cares about strong, cash-weighted comp. Prefers established, better-funded companies (Series B+).
- Remote-friendly. Hard nos, non-negotiable: defense, adtech, and anything requiring relocation.
- Yes-signals: product-led, design-forward, remote, well-funded, strong cash comp.
