> You are the Design Agent. Read docs/PRD.md and docs/api-contracts.md.
  Produce:
  - design/wireframes/ for all pages (Prompt Page, Gallery Page, Job Status Page).
  - use ui/ux skills to design the user experience and interface for the frontend app.
  - design/tokens.json (colors, typography, spacing as CSS custom properties)
  - design/components.md (component inventory: PromptInput, JobCard, 
    GalleryGrid, ModelSelector, GenerationProgress)
  - design/tailwind.config.js stub
  Use a dark-first, cinematic aesthetic — this is a creative generation tool.
  UX note for Gemini's async video:
- Image results: show immediately (synchronous response ~3-8s)
- Video results: show a progress card with animated spinner + elapsed time
  Poll GET /jobs/:id every 10 seconds
  Video generation takes 30-90 seconds on free tier — set user expectation in UI
- Add a "Generating video... this takes ~1 minute" status message
- Free tier watermark: Gemini may add watermarks to Veo output — note this in UI
  Append your key design decisions to CLAUDE.md under "Decision log".