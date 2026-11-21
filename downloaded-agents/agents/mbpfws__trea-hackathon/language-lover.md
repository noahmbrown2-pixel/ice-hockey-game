---
trigger: manual
---

# AI-Powered Language Learning Platform - Project Rules & Guidelines

## 1. Project Overview & Constraints

### Hackathon Context
- **Duration**: 30 hours total development time
- **Team Structure**: Frontend AI Developer, Backend AI Developer, Debugger AI Developer
- **Primary Technologies**: Google Gemini 2.5, Zilliz Cloud, Next.js 15, Trae AI IDE
- **Deployment Target**: Vercel serverless platform

### Success Criteria
1. **Application of Technology**: Innovative use of Gemini 2.5 and Zilliz Cloud
2. **Business Value**: Practical learning outcomes demonstration
3. **Originality**: Unique approach to AI-powered language learning
4. **Presentation**: Compelling demo with stable functionality

## 2. Technical Architecture Standards

### Technology Stack Requirements

#### Frontend Stack
- **Framework**: Next.js 15.1.8 with App Router
- **UI Library**: DaisyUI + Tailwind CSS V4
- **State Management**: Zustand for global state
- **Voice Integration**: Web Speech API + Gemini Live API
- **Type Safety**: TypeScript strict mode

#### Backend Stack
- **API Framework**: Next.js 15.1.8 API Routes
- **AI Integration**: Google Gemini 2.5 Pro/Flash + Vertex AI SDK
- **Vector Database**: Zilliz Cloud (Managed Milvus)
- **Relational Database**: Neon PostgreSQL
- **Authentication**: NextAuth.js
- **Streaming**: Vercel AI SDK

#### Quality Assurance Stack
- **Testing**: Jest + React Testing Library + Playwright
- **Performance**: Artillery for load testing
- **Code Quality**: ESLint + Prettier + TypeScript
- **Monitoring**: Vercel Analytics + Sentry

### Database Schema Standards

```sql
-- Core user management
users: id, email, name, native_language, target_language, proficiency_level, created_at, updated_at

-- Learning session tracking
learning_sessions: id, user_id, session_type, duration, performance_score, created_at

-- Progress tracking
user_progress: id, user_id, skill_type, current_level, experience_points, updated_at

-- Vocabulary management
vocabulary_progress: id, user_id, word, familiarity_score, review_count, last_reviewed

-- Assessment results
assessment_results: id, user_id, assessment_type, score, detailed_results, created_at

-- Conversation history
conversation_history: id, user_id, session_id, message_type, content, timestamp
```

### API Design Standards

#### Endpoint Structure
```
/api/auth/*           - Authentication (NextAuth.js)
/api/assessment/*     - Proficiency evaluation
/api/conversation/*   - AI conversation management
/api/content/*        - Dynamic content generation
/api/progress/*       - User progress tracking
/api/vector/*         - Zilliz Cloud operations
```

#### Response Format Standards
```typescript
// Success Response
{
  success: true,
  data: T,
  timestamp: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}
```

## 3. Performance Requirements

### Response Time Targets
- **AI Interactions**: < 2 seconds
- **Database Queries**: < 500ms
- **Vector Search**: < 1 second
- **Page Load**: < 3 seconds (First Contentful Paint)
- **Voice Response**: < 1.5 seconds

### Optimization Strategies
- **Caching**: Implement Redis for frequently accessed data
- **Streaming**: Use Vercel AI SDK for streaming AI responses
- **Lazy Loading**: Implement for non-critical components
- **Bundle Optimization**: Code splitting and tree shaking
- **Image Optimization**: Next.js Image component with WebP

## 4. Security & Privacy Standards

### Data Protection
- **Environment Variables**: All API keys and secrets in .env files
- **Input Validation**: Zod schemas for all user inputs
- **Rate Limiting**: Implement for all AI API endpoints
- **CORS Configuration**: Restrict to allowed origins
- **SQL Injection Prevention**: Use parameterized queries

### Authentication & Authorization
- **Session Management**: NextAuth.js with JWT tokens
- **Route Protection**: Middleware for protected routes
- **API Security**: Bearer token validation
- **User Data**: Encrypt sensitive information

## 5. AI Integration Guidelines

### Gemini 2.5 Usage Patterns

#### Model Selection
- **Gemini 2.5 Pro**: Complex reasoning, content generation, assessment evaluation
- **Gemini 2.5 Flash**: Real-time interactions, quick responses, conversation
- **Gemini Live API**: Bidirectional audio streaming, voice conversations

#### Prompt Engineering Standards
```typescript
// Assessment Prompt Template
const assessmentPrompt = `
You are a language proficiency assessor. Evaluate the user's response:
User Level: ${userLevel}
Question: ${question}
User Response: ${userResponse}
Provide: score (1-10), feedback, next_difficulty
`;

// Conversation Prompt Template
const conversationPrompt = `
You are a friendly language tutor. Maintain conversation in ${targetLanguage}.
User Level: ${proficiencyLevel}
Context: ${conversationContext}
Provide natural, encouraging responses with gentle corrections.
`;
```

### Vector Database Integration

#### Zilliz Cloud Configuration
```typescript
// Collection Schema
const collectionSchema = {
  name: "language_content",
  fields: [
    { name: "id", type: "Int64", is_primary: true },
    { name: "content_type", type: "VarChar", max_length: 50 },
    { name: "difficulty_level", type: "Int64" },
    { name: "language", type: "VarChar", max_length: 10 },
    { name: "embedding", type: "FloatVector", dim: 768 },
    { name: "metadata", type: "JSON" }
  ]
};
```

## 6. State Management Architecture

### Zustand Store Structure
```typescript
// User Store
interface UserStore {
  user: User | null;
  proficiencyLevel: string;
  targetLanguage: string;
  setUser: (user: User) => void;
  updateProficiency: (level: string) => void;
}

// Conversation Store
interface ConversationStore {
  messages: Message[];
  isRecording: boolean;
  isProcessing: boolean;
  addMessage: (message: Message) => void;
  setRecording: (recording: boolean) => void;
}

// Assessment Store
interface AssessmentStore {
  currentQuestion: Question | null;
  responses: Response[];
  score: number;
  progress: number;
  setCurrentQuestion: (question: Question) => void;
  addResponse: (response: Response) => void;
}
```

## 7. Error Handling Standards

### Frontend Error Boundaries
```typescript
// Global Error Boundary
class GlobalErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry
    console.error('Global error:', error, errorInfo);
  }
}

// API Error Handling
const handleApiError = (error: any) => {
  if (error.response?.status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again.';
  }
  return error.message || 'An unexpected error occurred.';
};
```

### Backend Error Handling
```typescript
// API Route Error Handler
export const withErrorHandler = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      });
    }
  };
};
```

## 8. Testing Standards

### Test Coverage Requirements
- **Unit Tests**: 80% coverage for utility functions
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load testing for AI endpoints

### Testing Patterns
```typescript
// Component Testing
describe('AssessmentComponent', () => {
  test('renders question correctly');
  test('handles voice input');
  test('submits response');
  test('displays feedback');
});

// API Testing
describe('Assessment API', () => {
  test('generates appropriate questions');
  test('evaluates responses accurately');
  test('handles invalid input');
  test('maintains session state');
});
```

## 9. Deployment & DevOps

### Environment Configuration
```bash
# Required Environment Variables
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_AI_API_KEY=
ZILLIZ_ENDPOINT=
ZILLIZ_TOKEN=
DATABASE_URL=
SENTRY_DSN=
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Vector collections created
- [ ] API endpoints tested
- [ ] Performance benchmarks met
- [ ] Error monitoring active
- [ ] Demo scenarios validated

## 10. Communication Protocols

### Daily Coordination
- **Stand-up**: 15-minute sync every 6 hours
- **Blocker Resolution**: Immediate Slack/Discord notification
- **Code Reviews**: Required for all major features
- **Integration Points**: Coordinated testing sessions

### Documentation Requirements
- **API Documentation**: OpenAPI/Swagger specs
- **Component Documentation**: Storybook for UI components
- **Database Documentation**: Schema diagrams and relationships
- **Deployment Documentation**: Step-by-step deployment guide

### Demo Preparation
- **Demo Script**: Prepared scenarios showcasing all features
- **Fallback Plans**: Offline demos for network issues
- **Performance Monitoring**: Real-time metrics during demo
- **User Stories**: Clear narrative for each feature demonstration

## 11. Risk Mitigation

### Technical Risks
- **AI API Limits**: Implement caching and fallback responses
- **Database Performance**: Connection pooling and query optimization
- **Real-time Features**: WebSocket fallbacks and reconnection logic
- **Mobile Compatibility**: Progressive Web App features

### Timeline Risks
- **Feature Scope**: Prioritize MVP features, defer nice-to-haves
- **Integration Issues**: Daily integration testing
- **Performance Problems**: Continuous monitoring and optimization
- **Demo Failures**: Comprehensive testing and backup plans