# AGENTS.md

You are an expert in TypeScript, Rsbuild, and web application development. You write maintainable, performant, and accessible code.

## Project Overview

This is a React 19 + TypeScript personal profile web application built with Rsbuild. The project uses:

- **Build Tool**: Rsbuild (powered by Rspack)
- **Framework**: React 19.2.0 with React Router DOM 7.9.6
- **UI Library**: Fluent UI React Components (Microsoft's design system)
- **Internationalization**: i18next with react-i18next
- **Styling**: CSS with Google Sans Flex font family
- **Type Safety**: TypeScript 5.9+ with strict mode enabled

## Architecture

### Project Structure

- `src/components/` - React components (Header, LocaleRouter, etc.)
- `src/i18n/` - Internationalization configuration and locale files (en-US, zh-CN, zh-TW)
- `src/utils/` - Utility functions (locale management, theme, document title)
- `public/` - Static assets
- `rsbuild.config.ts` - Rsbuild configuration

### Key Features

- Multi-language support (English, Simplified Chinese, Traditional Chinese)
- Theme management with Fluent UI
- Dynamic document title based on locale
- Client-side routing with React Router
- Custom favicon and external font loading via HTML tags injection

## Commands

- `npm run dev` - Start the dev server (auto-opens browser)
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

## Configuration

### TypeScript

- Target: ES2020
- Strict mode enabled with additional checks (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)
- Module resolution: bundler
- JSX: react-jsx (automatic runtime)

### Rsbuild

- React plugin enabled
- Custom HTML configuration with dynamic title and favicon
- Google Fonts preconnect and stylesheet injection
- Favicon served from external CDN

### i18n

- Default language: en-US
- Fallback language: en-US
- Supported locales: en-US, zh-CN, zh-TW
- Translation files located in `src/i18n/locales/`

## Development Guidelines

### Code Style

- Use functional components with React hooks
- Prefer TypeScript strict typing (avoid `any`)
- Use Fluent UI components for consistent UI/UX
- Follow ESLint and Prettier configurations
- Use CSS modules or scoped CSS for component styling

### Internationalization

- All user-facing text should use i18next translation keys
- Add translations to all three locale files
- Use `useTranslation` hook in components
- Test all locales before committing

### Best Practices

- Keep components small and focused
- Extract reusable logic into utility functions
- Use TypeScript interfaces for props and data structures
- Handle loading and error states appropriately
- Ensure accessibility with semantic HTML and ARIA attributes

### File Operations

- **NEVER use `rm` command** - It permanently deletes files without recovery
- Use `trash` command on macOS to move files to Trash (install via `brew install trash`)
- Alternative: Use `mv` to move files to a safe location before deletion
- For safe file removal: `trash <file>` instead of `rm <file>`

## Docs

- Rsbuild: <https://rsbuild.rs/llms.txt>
- Rspack: <https://rspack.rs/llms.txt>
- Fluent UI React: <https://react.fluentui.dev/>
- React Router: <https://reactrouter.com/>
- i18next: <https://www.i18next.com/>
