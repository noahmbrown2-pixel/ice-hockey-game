# Development Validation Agents

This directory contains standalone validation tools and agent definitions for various development tasks.

## Available Agents

### nextjs-vercel-specialist

A standalone validation tool for Next.js projects deploying to Vercel. Handles:
- Server/Client component boundary validation
- React Server Components best practices
- Vercel deployment optimization
- Rate limit error handling (429)
- TypeScript and ESLint validation
- Environment variable configuration

**Usage:**
```bash
# Validate any Next.js project (requires Node.js only)
node nextjs-vercel-specialist.js [project-path]

# Examples:
node nextjs-vercel-specialist.js .
node nextjs-vercel-specialist.js ./my-nextjs-app
node nextjs-vercel-specialist.js ../another-project

# Integrate into package.json
"scripts": {
  "validate-deployment": "node path/to/nextjs-vercel-specialist.js .",
  "pre-deploy": "npm run validate-deployment && npm run build"
}
```

**Common Issues Detected:**
- Missing 'use client' directives
- Server components importing client utilities
- Client components importing server utilities (next/headers)
- Functions passed as props to Client Components
- Console.log statements in production
- Missing NEXT_PUBLIC_ prefixes for client-side env vars
- TypeScript errors that will fail build

**Rate Limit Handling:**
When Vercel returns 429 "Rate limit exceeded":
1. Wait for the retry time (usually 50-60 seconds)
2. Use preview deployments first: `vercel`
3. Only deploy to production after testing: `vercel --prod`
4. Consider using GitHub integration for automatic deployments
5. Run the validator in CI/CD pipelines before deployment

## Adding New Validation Tools

To add a new validation tool:
1. Create `tool-name.md` with documentation and best practices
2. Create `tool-name.js` with validation logic (Node.js only, no external deps)
3. Update this README with usage instructions
4. Test with multiple projects to ensure generic compatibility

## Tool Standards

All validation tools should:
- Be completely standalone (Node.js built-ins only)
- Work with any project of their type (framework/language agnostic)
- Provide clear, actionable error messages and fixes
- Skip test/development files when validating production code
- Handle edge cases gracefully with helpful error messages
- Include deployment and troubleshooting guidance
- Exit with proper status codes (0 = success, 1 = errors found)