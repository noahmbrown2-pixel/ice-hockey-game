# Project Documentation Rules (Non-Obvious Only)
- Full-stack e-commerce platform: FastAPI backend (Python) with React/TypeScript frontend, PostgreSQL database
- Backend uses SQLAlchemy ORM with platform-specific async/sync patterns (Windows uses synchronous operations)
- Frontend employs React Query for API state management with custom retry logic avoiding auth errors
- Authentication system uses JWT tokens with automatic refresh via API interceptors
- State management handled by Zustand stores (auth, cart, wishlist) with persistent localStorage
- Admin routes protected by role-based guards (ADMIN role required)
- UI components follow design system with custom Tailwind color palette and neumorphic shadows
- Database migrations managed via Alembic with PostgreSQL-specific features