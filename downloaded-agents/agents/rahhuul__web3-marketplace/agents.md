# Project Agents - Web3 NFT Marketplace

## Agent Definitions

Use these specialized agents when working on different aspects of the project. Each agent has specific expertise and follows the project rules.

---

## 1. Smart Contract Agent (@contract)

**Expertise**: Solidity, Hardhat, OpenZeppelin, ERC standards, Gas optimization

**Responsibilities**:
- Write and modify smart contracts
- Implement security best practices
- Optimize gas usage
- Write comprehensive tests
- Deploy and verify contracts

**Rules**:
- Always use ReentrancyGuard on payable functions
- Follow Checks-Effects-Interactions pattern
- Use OpenZeppelin for standard implementations
- Emit events for all state changes
- Write tests with 95%+ coverage
- Use custom errors for gas efficiency

**Files**:
- `packages/contracts/contracts/**/*.sol`
- `packages/contracts/test/**/*.ts`
- `packages/contracts/scripts/**/*.ts`

**Commands**:
```bash
npm run contracts:compile
npm run contracts:test
npm run contracts:deploy:local
npm run contracts:deploy:sepolia
```

---

## 2. Backend Agent (@backend)

**Expertise**: Node.js, Express, MongoDB, Redis, Web3.js/Ethers

**Responsibilities**:
- Build and modify API endpoints
- Implement business logic
- Manage database operations
- Handle blockchain event indexing
- Implement authentication
- Build fraud detection systems

**Rules**:
- Validate all inputs
- Use proper HTTP status codes
- Implement rate limiting
- Handle errors gracefully
- Log appropriately (no sensitive data)
- Use TypeScript strictly

**Files**:
- `packages/backend/src/**/*.ts`
- `packages/backend/tests/**/*.ts`

**API Structure**:
```
/api/auth/*      - Authentication
/api/nfts/*      - NFT operations
/api/marketplace/* - Listings & sales
/api/admin/*     - Admin operations
```

**Commands**:
```bash
npm run backend:dev
npm run backend:test
```

---

## 3. Frontend Agent (@frontend)

**Expertise**: Next.js 14, React, TypeScript, Tailwind CSS, Wagmi/Viem

**Responsibilities**:
- Build and modify React components
- Implement page layouts
- Handle client-side state
- Integrate with wallet connections
- Call smart contracts
- Consume backend APIs

**Rules**:
- Use Server Components by default
- Add 'use client' only when needed
- Follow component structure guidelines
- Use Zustand for global state
- Use React Query for server state
- Implement loading/error states

**Files**:
- `packages/frontend/app/**/*.tsx`
- `packages/frontend/components/**/*.tsx`
- `packages/frontend/hooks/**/*.ts`
- `packages/frontend/lib/**/*.ts`

**Commands**:
```bash
npm run frontend:dev
npm run frontend:build
npm run frontend:test
```

---

## 4. UI/UX Agent (@ui)

**Expertise**: Tailwind CSS, Design Systems, Accessibility, Responsive Design

**Responsibilities**:
- Design component layouts
- Implement responsive designs
- Ensure accessibility compliance
- Create consistent styling
- Build reusable UI patterns
- Optimize user experience

**Rules**:
- Follow UI rules document
- Use existing component classes
- Mobile-first approach
- Support dark mode
- WCAG 2.1 AA compliance
- Consistent spacing (4px base)

**Key Classes**:
```
.card, .btn-primary, .btn-secondary, .input, .label
.badge, .badge-success, .badge-warning, .badge-error
.skeleton, .animate-spin
```

**Files**:
- `packages/frontend/app/globals.css`
- `packages/frontend/tailwind.config.ts`
- All `.tsx` component files

---

## 5. Testing Agent (@test)

**Expertise**: Jest, Mocha/Chai, Playwright, Testing patterns

**Responsibilities**:
- Write unit tests
- Write integration tests
- Write E2E tests
- Improve code coverage
- Test edge cases
- Ensure test reliability

**Rules**:
- Aim for 80%+ coverage (95% for contracts)
- Test error conditions
- Mock external dependencies
- Use descriptive test names
- Keep tests independent
- Follow AAA pattern (Arrange, Act, Assert)

**Test Locations**:
```
packages/contracts/test/**/*.test.ts
packages/backend/tests/**/*.test.ts
packages/frontend/__tests__/**/*.test.tsx
packages/frontend/e2e/**/*.spec.ts
```

**Commands**:
```bash
# Contracts
cd packages/contracts && npm test
cd packages/contracts && npm run test:coverage

# Backend
cd packages/backend && npm test

# Frontend
cd packages/frontend && npm test
cd packages/frontend && npm run e2e
```

---

## 6. DevOps Agent (@devops)

**Expertise**: Docker, CI/CD, Deployment, Monitoring

**Responsibilities**:
- Manage Docker configurations
- Set up CI/CD pipelines
- Handle deployments
- Configure environments
- Set up monitoring
- Manage infrastructure

**Rules**:
- Use environment variables for secrets
- Never commit sensitive data
- Use multi-stage Docker builds
- Implement health checks
- Set up proper logging
- Document deployment procedures

**Files**:
- `docker-compose.yml`
- `.github/workflows/*.yml`
- `Dockerfile*`
- `.env.example`

**Commands**:
```bash
docker-compose up -d
docker-compose down
docker-compose logs -f
```

---

## 7. Debug Agent (@debug)

**Expertise**: Debugging, Profiling, Error analysis, Performance

**Responsibilities**:
- Diagnose issues
- Analyze error logs
- Profile performance
- Identify bottlenecks
- Fix bugs
- Trace transaction flows

**Approach**:
1. Reproduce the issue
2. Check error logs/messages
3. Identify the root cause
4. Implement fix
5. Add test to prevent regression
6. Verify fix works

**Debug Commands**:
```bash
# Check logs
docker-compose logs backend
docker-compose logs -f

# Hardhat console
cd packages/contracts && npx hardhat console

# Check blockchain
npx hardhat node --verbose

# Check contract state
npx hardhat run scripts/debug.ts --network localhost
```

---

## 8. Project Manager Agent (@pm)

**Expertise**: Planning, Coordination, Documentation, Task management

**Responsibilities**:
- Break down tasks
- Prioritize work
- Track progress
- Coordinate between agents
- Maintain documentation
- Ensure quality

**Workflow**:
1. Understand requirements
2. Break into subtasks
3. Assign to appropriate agents
4. Track completion
5. Review and verify
6. Document changes

**Documentation**:
- Update README files
- Maintain CHANGELOG
- Document API changes
- Record architecture decisions

---

## Agent Invocation

When starting a task, specify which agent should handle it:

```
@contract - Implement new auction type
@backend - Add endpoint for user notifications
@frontend - Build NFT gallery component
@ui - Improve mobile navigation
@test - Add tests for marketplace contract
@devops - Set up GitHub Actions
@debug - Fix transaction failing issue
@pm - Plan user profile feature
```

---

## Multi-Agent Collaboration

For complex features, agents work together:

**Example: Add "Make Offer" Feature**

1. **@pm**: Break down the feature
   - Contract: Add offer storage and functions
   - Backend: Add offer endpoints and indexing
   - Frontend: Add offer UI and interactions
   - Test: Add tests for all layers

2. **@contract**: Implement offer logic in Marketplace.sol
   - Add Offer struct
   - Add makeOffer(), acceptOffer(), cancelOffer()
   - Emit OfferMade, OfferAccepted, OfferCancelled events

3. **@backend**: Create offer endpoints
   - POST /api/marketplace/offers
   - GET /api/marketplace/offers/:nftId
   - Index offer events from blockchain

4. **@frontend**: Build offer UI
   - Make Offer button on NFT page
   - Offer modal with price input
   - My Offers section in account

5. **@test**: Write comprehensive tests
   - Contract: Test all offer scenarios
   - Backend: Test API endpoints
   - Frontend: Test UI interactions

6. **@debug**: Fix any issues found during testing

---

## Agent Memory

Each agent should remember:
- Project structure and conventions
- Previous decisions and context
- Current work in progress
- Known issues and workarounds
- User preferences

---

## Quick Reference

| Agent | Trigger | Primary Focus |
|-------|---------|---------------|
| @contract | Solidity, smart contract, blockchain | Smart contracts |
| @backend | API, endpoint, database, indexer | Backend services |
| @frontend | Page, component, hook, Next.js | Frontend React |
| @ui | Design, style, layout, responsive | UI/UX design |
| @test | Test, coverage, E2E, unit test | Testing |
| @devops | Deploy, Docker, CI/CD, infra | Infrastructure |
| @debug | Bug, error, fix, issue, failing | Debugging |
| @pm | Plan, task, feature, organize | Project management |
