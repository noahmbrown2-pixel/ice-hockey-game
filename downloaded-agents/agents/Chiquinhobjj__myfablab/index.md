# Agent Registry - MyFabLab Chat AI
# This file maps all available agents for Claude Code

## Available Agents

### Leadership
- **@ceo-myfablab** - CEO Orchestrator
  - Location: `.claude/agents/fazedoria/ceo-orchestrator.md`
  - Role: Strategic decisions, conflict resolution, prioritization
  - Authority: Final decision maker

### Technical Team
- **@woz-myfablab** - Technical Lead
  - Location: `.claude/agents/fazedoria/woz-tech.md`
  - Role: Debug, architecture, technical solutions
  - Expertise: JavaScript, APIs, performance, system design

- **@emergency-fixer** - Crisis Response
  - Location: `.claude/agents/debug/emergency-fixer.md`
  - Role: Emergency fixes, production issues
  - SLA: 2-minute response time

- **@equipe-myfablab** - DevOps Team
  - Location: `.claude/agents/fazedoria/equipe-devops.md`
  - Role: Infrastructure, deployment, monitoring
  - Tools: Docker, EasyPanel, CI/CD

### Product Team
- **@jobson-myfablab** - UX Designer
  - Location: `.claude/agents/fazedoria/jobson-ux.md`
  - Role: Interface design, user experience, simplification
  - Philosophy: Radical simplicity

- **@tobias-myfablab** - Creative Director
  - Location: `.claude/agents/fazedoria/tobias-creative.md`
  - Role: Visual narrative, branding, emotional design
  - Philosophy: Design is storytelling
  - Partnership: Works with Jobson for complete experiences

### Business Team
- **@gates-myfablab** - Business Strategist
  - Location: `.claude/agents/fazedoria/gates-business.md`
  - Role: Monetization, business model, market strategy
  - Focus: Revenue and scale

- **@seth-myfablab** - Growth Hacker
  - Location: `.claude/agents/fazedoria/seth-growth.md`
  - Role: Marketing, growth loops, user acquisition
  - Metrics: DAU, retention, viral coefficient

## Quick Commands

### For Problems
```
@emergency-fixer "Site is down!"
@woz-myfablab "Debug this error"
@equipe-myfablab "Deploy to production"
```

### For Development
```
@jobson-myfablab "Design new feature"
@woz-myfablab "Implement solution"
@equipe-myfablab "Setup CI/CD"
```

### For Strategy
```
@ceo-myfablab "Should we do X or Y?"
@gates-myfablab "How to monetize?"
@seth-myfablab "How to get users?"
```

## Team Combinations

### Full Stack Development
```
@woz-myfablab @jobson-myfablab @equipe-myfablab
```

### Business Planning
```
@ceo-myfablab @gates-myfablab @seth-myfablab
```

### Crisis Response
```
@emergency-fixer @woz-myfablab @ceo-myfablab
```

## Auto-Detection Rules

When you mention these keywords, the appropriate agent will be automatically suggested:

- **Technical**: bug, error, debug, API, performance → @woz-myfablab
- **Emergency**: urgent, down, broken, critical → @emergency-fixer
- **Design**: UX, interface, design, visual → @jobson-myfablab
- **Business**: monetize, revenue, pricing → @gates-myfablab
- **Growth**: marketing, users, SEO, viral → @seth-myfablab
- **Decision**: strategy, decide, conflict → @ceo-myfablab
- **DevOps**: deploy, server, docker → @equipe-myfablab