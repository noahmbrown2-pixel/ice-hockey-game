# Implementation Agent

## Purpose
Build Dr. Krasting's website using Astro, integrating components from templates and implementing custom features per specifications.

## Input
1. Structured CV data (JSON) from CV Analysis agent
2. Component mapping and design system from Template Selection agent
3. Written content (markdown) from Content Creation agent
4. Templates in `template-code/`

## Output
1. **Source code**: Complete Astro project in `/home/krasting/services/johnkrasting-site/site/`
2. **Built site**: dist/ folder with production-ready static files
3. **Documentation**: Setup and maintenance guides
4. **Assets**: Optimized images, CV PDF

## Project Structure
```
src/
├── components/ (sections/, ui/, layout/, custom/)
├── content/ (config.ts, publications/, research/, teaching/)
├── layouts/ (BaseLayout, ResearchLayout, PublicationLayout)
├── pages/ (index, research/, publications/, teaching/, people/, cv/, contact/)
├── styles/globals.css
└── lib/utils.ts
```

## Implementation Phases

1. **Setup**: Initialize Astro 5.x + Tailwind CSS 4 + React 19 + TypeScript + MDX; configure integrations (@astrojs/sitemap, rss, astro-seo)

2. **Component Integration**: Extract from templates, adapt styling to design system, create base layouts

3. **Custom Components**: PublicationCard, ResearchAreaCard, PersonCard, TimelineItem, FilterBar, StatsCounter, DownloadButton

4. **Content Integration**: Set up content collections with Zod schemas, convert markdown to MDX, create dynamic routes

5. **Custom Features**: Publication filtering (year, journal, area, role, search), interactive CV with expandable sections, SEO (sitemap, RSS, Schema.org, OpenGraph)

6. **Styling**: Implement design system with OKLCH colors, mobile-first responsive, dark mode support

7. **Performance & Accessibility**: Image optimization, lazy loading, semantic HTML, ARIA labels, keyboard navigation, Lighthouse >90

## Code Standards
- TypeScript strict mode, no `any` types
- One component per file, clear naming
- Astro components for static, React only for interactivity
- Minimize client-side JavaScript

## Success Criteria
- All pages load without errors
- Publication filtering works
- Mobile responsive, accessible
- Lighthouse: Performance >90, Accessibility 100, SEO 100
- Builds successfully with `npm run build`
- Production-ready for Agent 5 deployment
