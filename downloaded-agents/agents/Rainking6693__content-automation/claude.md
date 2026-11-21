DirectoryBolt Development Guide
Code Understanding
Whenever you need to retrieve or understand code context, start with the Nuanced MCP Server. Use the returned metadata to map the call graph before diving into the source.

Treat each node as a function. callers are upstream locations (who invokes it) and callees are downstream dependencies (who it invokes). Use this to sketch the subgraph around your target.
Follow call chains while they add insight or the next hop no longer informs your task. Skip <native> callees; they're leaf nodes.
After reviewing the metadata, read the function source using the provided start/end ranges to confirm behavior, understand data flow, and capture nuances the graph can't show.
Combine structural findings from the graph with behavioral details from the source in your response so the user gets both relationship context and concrete implementation notes.

Project Context
DirectoryBolt: AI-powered business intelligence platform that automates directory submissions

Repository: C:\Users\Ben\OneDrive\Documents\GitHub\DirectoryBolt
Pricing Strategy: $149-799 premium positioning (not $49-299 directory tool)
Value Proposition: $4,300 worth of business intelligence for $299 (93% savings)
Target Market: Business owners seeking competitive advantage through AI analysis

Technology Stack
Frontend

Next.js 14 with App Router
React 18 with TypeScript 5.2
Tailwind CSS with volt yellow brand theme
Framer Motion for animations

Backend

Next.js API routes (serverless)
Supabase (PostgreSQL + real-time)
Stripe (one-time payments, no subscriptions)
OpenAI + Anthropic (AI analysis)
Puppeteer + Cheerio (web scraping)

Infrastructure

Netlify hosting and deployment
Chrome Extension (AutoBolt) for directory automation
WebSocket for real-time updates (Enterprise tier)

Core Architecture Patterns
1. Streamlined Payment-First Flow
Email Collection → Stripe Payment → Business Info Collection → Customer Registration → AutoBolt Queue
Key Implementation:

Minimal friction: email-only before payment
Post-payment business information collection
Stripe session validation for email retrieval
Customer record creation after payment commitment

2. Tier-Based Feature Access
typescriptconst TIER_FEATURES = {
  starter: { directories: 50, ai_analysis: 'basic' },
  growth: { directories: 150, ai_analysis: 'full', popular: true },
  professional: { directories: 300, content_gap_analyzer: true },
  enterprise: { directories: 500, content_gap_analyzer: true, realtime_websocket: true }
}
3. AI Content Gap Analyzer (Professional/Enterprise Only)

Competitor website scraping using Cheerio
AI-powered content gap identification
Blog post ideas and FAQ suggestions with SEO data
Real-time WebSocket updates for Enterprise tier
Keyword clustering and competitive analysis

4. Staff-Controlled AutoBolt Processing

Manual "Push to AutoBolt" functionality via staff dashboard
Real-time queue monitoring and progress tracking
Human oversight for quality assurance
Chrome extension integration for automated form filling

5. Real-Time Data Flow

Supabase real-time subscriptions for live updates
WebSocket connections for Enterprise tier features
Staff dashboard with live queue monitoring
Customer notifications and progress tracking

Database Schema Patterns
Core Tables
sqlcustomers (id, customer_id, email, business_name, package_type, status, directories_allocated)
queue_history (id, customer_id, status, priority_level, created_at, updated_at)
autobolt_processing_queue (id, customer_id, status, directories_processed)
customer_notifications (id, customer_id, notification_type, message, read)
analytics_events (id, customer_id, event_type, event_data, created_at)
Critical DirectoryBolt Anti-Patterns
Payment Flow Issues
typescript// ❌ BAD: Collecting extensive info before payment
const BadCheckout = () => {
  return (
    <form onSubmit={handlePayment}>
      <BusinessInfoForm /> {/* 15+ fields before payment */}
      <PaymentForm />
    </form>
  );
};

// ✅ GOOD: Email-only before payment
const GoodCheckout = () => {
  return (
    <form onSubmit={handleStripeCheckout}>
      <input type="email" placeholder="Your email" />
      <button>Pay ${price}</button>
    </form>
  );
};
Feature Access Control
typescript// ❌ BAD: Frontend-only tier checking
const BadTierGate = ({ userTier, children }) => {
  if (userTier === 'free') return <UpgradePrompt />;
  return children;
};

// ✅ GOOD: Backend validation + frontend UX
const GoodTierGate = ({ userTier, children }) => {
  return (
    <TierValidator tier={userTier} requiredTier="professional">
      {children}
    </TierValidator>
  );
};
AI Integration Errors
typescript// ❌ BAD: Exposing AI costs without tier validation
const BadAICall = async (prompt) => {
  return await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
};

// ✅ GOOD: Tier-validated AI calls with cost control
const GoodAICall = async (prompt, userTier) => {
  validateTierAccess(userTier, 'ai_analysis');
  
  const config = AI_TIER_CONFIGS[userTier];
  return await openai.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: config.maxTokens
  });
};
Stripe Integration Pitfalls
typescript// ❌ BAD: Processing webhooks without validation
app.post('/api/webhooks/stripe', async (req, res) => {
  const customer = await createCustomer(req.body);
  res.json(customer);
});

// ✅ GOOD: Proper webhook signature validation
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  await processWebhookEvent(event);
  res.json({ received: true });
});
AutoBolt Queue Management Mistakes
typescript// ❌ BAD: Processing queue without priority consideration
const getNextCustomer = () => {
  return supabase.from('autobolt_processing_queue')
    .select('*')
    .eq('status', 'queued')
    .limit(1);
};

// ✅ GOOD: Priority-based queue processing
const getNextCustomer = () => {
  return supabase.from('autobolt_processing_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority_level', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1);
};
Data Security Violations
typescript// ❌ BAD: Exposing sensitive customer data
app.get('/api/customers', async (req, res) => {
  const customers = await getAllCustomers();
  res.json(customers); // Includes all data
});

// ✅ GOOD: Filtered data with authentication
app.get('/api/customers', async (req, res) => {
  const staffUser = await validateStaffAccess(req);
  if (!staffUser) return res.status(401).json({ error: 'Unauthorized' });
  
  const customers = await getCustomersForStaff(staffUser.permissions);
  res.json(customers);
});
Common Implementation Failures
1. Revenue-Critical Failures
Symptoms: Payment processing stops, customer registration fails, AI analysis breaks
Root Causes:

Missing Stripe webhook signature validation
Incorrect environment variables in production
Database connection pool exhaustion
AI service rate limit exceeded without fallback

Prevention:
typescript// Always validate Stripe webhooks
const validateStripeWebhook = (req) => {
  const sig = req.headers['stripe-signature'];
  try {
    return stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error('Invalid webhook signature');
  }
};
2. Tier Feature Leakage
Symptoms: Free users accessing premium features, Enterprise features available to all
Root Causes:

Frontend-only tier validation
Missing backend tier checks
Inconsistent tier definitions across frontend/backend

Prevention:
typescript// Always validate on backend
const validateTierAccess = (userTier, requiredFeature) => {
  const tierConfig = TIER_CONFIGS[userTier];
  if (!tierConfig || !tierConfig.features.includes(requiredFeature)) {
    throw new Error(`Feature ${requiredFeature} requires ${getRequiredTier(requiredFeature)} tier`);
  }
};
3. Real-Time Feature Failures
Symptoms: Enterprise customers not receiving live updates, WebSocket connections failing
Root Causes:

WebSocket server not properly configured
Supabase real-time subscriptions not established
Network connectivity issues

Prevention:
typescript// Always handle WebSocket failures gracefully
const initializeRealTimeUpdates = (customerId) => {
  const subscription = supabase
    .channel(`customer_${customerId}`)
    .on('postgres_changes', { /* config */ }, handleUpdate)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time connected');
      } else if (status === 'CHANNEL_ERROR') {
        // Implement fallback polling
        initializeFallbackPolling(customerId);
      }
    });
};
4. AutoBolt Processing Failures
Symptoms: Customers stuck in queue, directory submissions failing, extension disconnected
Root Causes:

Chrome extension not responding to heartbeat
Queue items not being processed in priority order
Missing error handling for failed submissions

Prevention:
typescript// Always monitor extension health
const checkExtensionHealth = async () => {
  const extensions = await supabase
    .from('autobolt_extension_status')
    .select('*')
    .gt('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000));
    
  if (extensions.length === 0) {
    await alertStaff('No active AutoBolt extensions detected');
  }
};
Error Handling Standards
API Error Response Format
typescriptinterface APIError {
  error: string;
  code?: string;
  details?: string; // Only in development
  timestamp: string;
}
Frontend Error Boundaries

Graceful degradation for AI service failures
User-friendly error messages
Automatic retry mechanisms
Staff notification for critical errors

Security Requirements

Staff Authentication: Required for all admin/staff endpoints
Tier Validation: Backend validation for all premium features
Rate Limiting: Prevent AI service abuse
Input Sanitization: All user inputs must be validated
Stripe Security: Webhook signature verification

Performance Standards

Page Load: <2 seconds for all pages
API Response: <500ms for standard endpoints
AI Analysis: <30 seconds for comprehensive analysis
Real-time Updates: <100ms latency for staff dashboard

Code Quality Evaluation Framework
Smoke Tests (Must Pass)

 Code compiles without TypeScript errors
 All API endpoints return expected status codes
 Database connections establish successfully
 Payment processing flow works end-to-end

DirectoryBolt Requirements (Revenue Critical)

 Tier validation implemented on backend
 Stripe webhook signature validation present
 AutoBolt queue respects priority ordering
 AI services have rate limiting and error handling
 Staff authentication required for admin endpoints

Code Quality Metrics

 Follows DirectoryBolt naming conventions
 Includes comprehensive error handling
 Implements premium customer experience standards
 Uses consistent data models across frontend/backend
 Has proper logging for debugging premium customer issues

Deployment Configuration
Netlify Environment Variables
bash# Core Application
BASE_URL=https://directorybolt.com
NEXT_PUBLIC_APP_URL=https://directorybolt.com

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Payments
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-key

# AutoBolt
AUTOBOLT_EXTENSION_ID=your_extension_id
MCP Integration Standards
Always use Nuanced MCP server for code analysis:
bash"Use Nuanced on [function_name] to understand dependencies before implementing changes"
"Use Nuanced on StreamlinedCheckout to map the conversion funnel"
"Use Nuanced on ContentGapAnalyzer to understand AI integration patterns"
"Use Nuanced on register-complete to trace the customer onboarding pipeline"
Quality Gates
Before any deployment:

 All payment flows tested across 4 tiers
 AI analysis accuracy validated
 Staff dashboard functionality verified
 AutoBolt integration tested
 Real-time updates working for Enterprise tier
 Security audit passed
 Performance benchmarks met
 Error handling tested for all critical paths

Emergency Response Procedures
Revenue-Critical Issues (< 5 min response)

Payment processing failures
Customer registration blocking
AI service complete outage
Database connectivity loss

High-Priority Issues (< 30 min response)

AutoBolt queue backup
Enterprise tier feature failures
Staff dashboard outages
Security vulnerabilities

Response Checklist

 Identify failure type and customer impact
 Check environment variables and API keys
 Validate database connections
 Test AI service availability
 Verify AutoBolt extension health
 Implement immediate fix or workaround
 Notify affected Enterprise customers
 Document incident and prevention measures

Further Reading
For specific implementation details:

Stripe Integration: https://docs.stripe.com/webhooks
Supabase Real-time: https://supabase.com/docs/guides/realtime
OpenAI Best Practices: https://platform.openai.com/docs/guides/production-best-practices
Next.js Performance: https://nextjs.org/docs/going-to-production
Netlify Deployment: https://docs.netlify.com/configure-builds/environment-variables/

Remember: DirectoryBolt serves premium customers ($149-799) who expect enterprise-grade experiences. Every implementation should reflect this positioning while maintaining the conversion optimization that drives business growth.