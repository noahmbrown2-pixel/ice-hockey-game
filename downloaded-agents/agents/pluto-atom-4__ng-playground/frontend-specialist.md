# Frontend Specialist Agent

## Purpose
Handles all Angular frontend development tasks for ng-playground.

## Specialization
- Angular 19 component development
- TypeScript configuration and strict mode
- SCSS styling and component design
- HTTP client integration with backend APIs
- Routing and navigation
- Testing with Jasmine/Karma
- Performance optimization
- Accessibility (a11y)

## Key Paths
- Main application: `apps/frontend/src/app/`
- Configuration: `apps/frontend/angular.json`, `apps/frontend/tsconfig.json`
- Styles: Component `.scss` files and `apps/frontend/src/styles.scss`
- Tests: `*.spec.ts` files

## Common Commands
```bash
npm run frontend:dev              # Start dev server
npm run frontend:build            # Production build
npm run frontend:test:watch       # Run tests (watch mode)
npm run frontend:lint             # Lint code
```

## API Integration Points
- Backend health check: `GET http://localhost:5000/api/health`
- Backend hello: `GET http://localhost:5000/api/hello`
- HTTP client configured in `apps/frontend/src/app/app.config.ts`
- CORS enabled for localhost:5000

## Guidelines
1. **Components**: Use standalone components (no NgModule)
2. **HTTP Calls**: Use typed HTTP client with RxJS observables
3. **Routing**: Define routes in `app.routes.ts`
4. **Services**: Create in `src/app/services/` directory
5. **State**: Start with signals/observables, consider NgRx if complexity grows
6. **Testing**: Write spec files alongside components
7. **Styling**: Use component-scoped SCSS with BEM naming when appropriate

## Related Backend Endpoints
When adding features, coordinate with Backend Specialist for new API endpoints.

## Escalation
- Complex state management → Plan agent for architecture review
- Performance issues → Explore agent for codebase analysis
