# 🚀 MASTER SYSTEM DESIGN GUIDE
## Complete Course: From Foundations to Production Systems
### Combining 200+ Interview Experience & Real-World Senior Engineering Knowledge

---

# 📑 TABLE OF CONTENTS

## PART 1: FOUNDATIONS
1. [Software Architecture Design](#part-1-foundations)
2. [Software Design Principles](#software-design-principles)
3. [Coding Standards & Best Practices](#coding-standards--best-practices)
4. [Single Server to Millions of Users](#single-server-setup)

## PART 2: DATABASE DESIGN
3. [Relational Data Modeling](#part-2-database-design)
4. [SQL vs NoSQL Databases](#sql-vs-nosql-databases)

## PART 3: API DESIGN
5. [API Fundamentals](#part-3-api-design)
6. [RESTful APIs](#restful-apis)
7. [GraphQL APIs](#graphql-apis)
8. [gRPC](#grpc)
9. [API Protocols (HTTP, WebSockets, AMQP)](#api-protocols)
10. [TCP vs UDP](#tcp-vs-udp)

## PART 4: SCALING & INFRASTRUCTURE
11. [Vertical vs Horizontal Scaling](#part-4-scaling--infrastructure)
12. [Load Balancing Deep Dive](#load-balancing-deep-dive)
13. [Stateless vs Stateful Systems](#stateless-vs-stateful-systems)
14. [Consistent Hashing](#consistent-hashing)

## PART 5: PERFORMANCE & RELIABILITY
15. [Caching Strategies](#part-5-performance--reliability)
16. [CAP Theorem & PACELC](#cap-theorem)

## PART 6: SECURITY
17. [Authentication](#part-6-security)
18. [Authorization](#authorization)
19. [API Security Techniques](#api-security-techniques)

## PART 7: INTERVIEW MASTERY
20. [5-Step Interview Framework](#part-7-interview-mastery)
21. [Mock Interview Walkthrough](#mock-interview-example)

## PART 8: UI/UX DESIGN
22. [Psychology-Driven Design System](#part-8-uiux-design)
23. [Design Tokens & Components](#design-tokens--components)

## PART 9: AI CODING ASSISTANT SKILLS
24. [Claude Skills & Best Practices](#part-9-ai-coding-assistant-skills)
25. [Effective Prompting for System Design](#effective-prompting-for-system-design)
26. [Leveraging AI for Architecture Decisions](#leveraging-ai-for-architecture-decisions)

---

# PART 1: FOUNDATIONS

## Software Architecture Design

> *"Most developers cannot design systems from scratch. They can add to someone else's architecture with clear requirements, but if you ask them to design something from the ground up, most will freeze. This is the exact skill that separates mid-level developers from seniors."* 

### Why This Matters
Companies don't pay six figures for people who can just code or follow instructions. They pay for:
- **Architectural decisions**
- **System performance optimization**
- **Data storage design**
- **Customer-impacting decisions**

### The Design Process

#### Step 1: Gather Requirements

| Functional Requirements | Non-Functional Requirements |
|------------------------|----------------------------|
| Critical product features | User experience factors |
| What users can do | Performance |
| Core workflows | Reliability/Uptime |
| | Scalability |
| | Security |

**Twitter Example:**
| Functional | Non-Functional |
|------------|----------------|
| Create profile | < 200ms latency |
| Follow users | 99.9% uptime |
| Post tweets | Handle 300M DAU |
| View timeline | Eventual consistency OK |
| Like/Retweet | |

> **Pro Tip:** Requirements are powerful - once noted properly, many technical options will be decided for you!

---

## Software Design Principles

> *"These principles guide decisions from high-level architecture to small refactors, helping balance speed, stability, and long-term maintainability."*

### 📋 Core Principles at a Glance

The table below summarizes the core ideas, common pitfalls, and how the principles interconnect.

| Principle | Core Idea | Common Pitfalls / Warning Signs | Related To |
| :--- | :--- | :--- | :--- |
| **KISS (Keep It Simple, Stupid)** | Designs and systems should be as simple as possible. Avoid unnecessary complexity. | Over-engineering, premature optimization, clever but unreadable code. | **Over-engineering**, **YAGNI**. |
| **DRY (Don't Repeat Yourself)** | "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.". | Abstracting **coincidental duplication**, creating overly coupled and fragile "monster" modules. | **Duplication**, **Wrong Abstraction**. |
| **Boy Scout Rule** | "Leave the code cleaner than you found it.". | Letting **mess accumulation** create overwhelming technical debt; thinking cleanup requires a dedicated "refactoring sprint". | **Mess accumulation**, **Technical Debt**. |
| **Avoid Over-engineering** | Solve the problem you have today, not every possible future problem. | Automating non-repeated tasks, creating unnecessary abstractions, wrapping libraries without clear need. | **KISS**, **Unnecessary Refactor**. |
| **Prefer Duplication Over Wrong Abstraction** | A little duplication is cheaper than a bad abstraction that couples unrelated concepts. | Forcing different business concepts into one shared module because they look similar now. | **DRY**, **Over-engineering**. |
| **Ship Stable Code** | Focus on consistency, reliability, and incremental improvement to deliver user value predictably. | Large, risky changes that cause **regressions**; ignoring **bugs** and **debt** until they force a rewrite. | **Boy Scout Rule**, **KISS**. |

### 🔍 Key Principles Explained

#### KISS (Keep It Simple, Stupid)

This principle, originally from U.S. Navy engineer Kelly Johnson, emphasizes that simple systems are more usable, maintainable, and less prone to errors. In practice, it means writing clear, straightforward code and avoiding "clever" solutions that are hard to understand. Overly complex code is difficult to debug, modify, and scale. The principle directly opposes over-engineering.

**Example:**
```python
# ❌ Over-complicated
def calculate_total(items):
    return reduce(lambda acc, item: acc + (item.price * (1 - item.discount if item.discount else 0)), items, 0)

# ✅ Simple and clear
def calculate_total(items):
    total = 0
    for item in items:
        price = item.price
        if item.discount:
            price = price * (1 - item.discount)
        total += price
    return total
```

#### DRY (Don't Repeat Yourself) & The Perils of the Wrong Abstraction

DRY is often misunderstood as "don't type the same thing twice." Its true goal is to centralize a single piece of **business knowledge or rule**. Applying DRY to **coincidental duplication**—where code looks the same but represents different concepts—leads to the "Wrong Abstraction." This creates a tightly coupled module full of conditional logic, making changes risky and expensive. As software expert Sandi Metz advises, **"prefer duplication over the wrong abstraction."** Before consolidating code, ask: "Do these things change for the same reason?"

**Example of Wrong Abstraction:**
```python
# ❌ Wrong: Forcing different concepts into one abstraction
class DataProcessor:
    def process(self, data_type, data):
        if data_type == "user":
            # User-specific logic
        elif data_type == "order":
            # Order-specific logic
        elif data_type == "payment":
            # Payment-specific logic
        # This becomes a monster class!

# ✅ Better: Accept some duplication
class UserProcessor:
    def process(self, user_data): ...

class OrderProcessor:
    def process(self, order_data): ...

class PaymentProcessor:
    def process(self, payment_data): ...
```

**When DRY is Appropriate:**
```python
# ✅ Good: Single business rule (tax calculation)
def calculate_tax(amount, tax_rate):
    return amount * tax_rate

# Used consistently across:
# - Invoice generation
# - Receipt creation
# - Report generation
```

#### The Boy Scout Rule & Fighting Mess Accumulation

The Boy Scout Rule advises developers to make small, positive improvements to any code they touch, just as scouts leave a campground cleaner. This is a defense against **mess accumulation**, where quick fixes and neglect degrade code quality into overwhelming technical debt. By continuously paying down debt in small increments, teams avoid costly, disruptive "refactoring sprints" and keep the codebase maintainable.

**Example:**
```python
# You're fixing a bug in this function...
def process_order(order):
    # ... existing code ...
    # While you're here, you notice:
    # - Unclear variable names
    # - Missing error handling
    # - No logging
    
    # ✅ Apply Boy Scout Rule: Leave it better
    def process_order(order):
        try:
            validate_order(order)
            total = calculate_total(order.items)
            apply_discounts(order, total)
            return create_order_record(order, total)
        except ValidationError as e:
            logger.error(f"Order validation failed: {e}")
            raise
```

#### Over-engineering vs. Shipping Stable Code

**Over-engineering** involves building for hypothetical future needs, adding complexity without current benefit. Examples include automating one-off tasks or creating deep class hierarchies for simple needs. This violates **KISS** and hinders the goal of **shipping stable code**. Stability comes from simple, understandable foundations, consistent small improvements (Boy Scout Rule), and a focus on delivering reliable value.

**Example:**
```python
# ❌ Over-engineered: Building for hypothetical future
class AbstractDataHandler(ABC):
    @abstractmethod
    def handle(self): pass

class UserDataHandler(AbstractDataHandler):
    def handle(self): ...

class OrderDataHandler(AbstractDataHandler):
    def handle(self): ...

# When you only need:
# ✅ Simple and sufficient
def handle_user_data(user_data):
    # Process user data
    pass

def handle_order_data(order_data):
    # Process order data
    pass
```

### ⚖️ How to Balance These Principles in Practice

These principles form a complementary system:

1. **Start with KISS**: Build the simplest solution to your current, known problem.
2. **Apply the Boy Scout Rule daily**: As you add features, clean up nearby messes to prevent decay.
3. **Be strategic with DRY**: Only abstract code when you are consolidating a single business rule or concept, not just similar-looking code. Use the "Rule of Three" (abstract on the third repetition) as a guideline.
4. **Avoid over-engineering by asking**: "What is the simplest thing that could possibly work?" and "What problem am I actually solving today?"
5. **Aim for stable shipments**: This is the outcome of following the above principles—resulting in a codebase that is easier to test, debug, and extend with confidence.

### 🎯 Decision Framework

**When to Abstract (DRY):**
- ✅ Same business rule/logic appears 3+ times
- ✅ Changes happen for the same reason
- ✅ Single source of truth needed

**When to Keep Duplicate:**
- ✅ Code looks similar but represents different concepts
- ✅ Future changes likely to diverge
- ✅ Abstraction would create tight coupling

**When to Simplify (KISS):**
- ✅ Code is hard to understand
- ✅ Premature optimization detected
- ✅ Unnecessary abstractions exist

**When to Clean (Boy Scout Rule):**
- ✅ You're already modifying the code
- ✅ You notice obvious issues nearby
- ✅ Small improvements won't break existing functionality

---

## Coding Standards & Best Practices

> *"You are a senior software engineer, writing simple but efficient code with the goal to remain consistent and never overcomplicate."*

### System Prompt for AI Coding Assistant

There are **23 rules** below you **must follow with every piece of code** you write. **Never skip any rules**; all rules should be followed with every component, API endpoint, or piece of code you write with the goal of making scalable, efficient code.

#### The 23 Essential Rules

**1. Always Use DaisyUI:**
- Utilize DaisyUI for all UI components to maintain consistent styling across the application.

**2. Create New UI Components:**
- Always create new, modular UI components to facilitate easy bug fixes and maintenance. Avoid large, monolithic components by breaking them into smaller, manageable pieces whenever possible. Make sure to name them efficiently. **ALWAYS ask if you should break a component down into smaller chunks first.**

**3. Component Documentation:**
- Each component must include a comment at the top explaining its purpose, functionality, and location within the project.

**4. Vercel Compatibility for Endpoints:**
- Ensure that any endpoint created will **always work when deployed on Vercel**. We test the app in localhost:3000 and deploy to Vercel. This should always be considered in **ALL code you write**.

**5. Design Quick and Scalable Endpoints:**
- Design all endpoints to be quick and scalable. Optimize performance to handle increased load without degradation.

**6. Asynchronous Data Handling:**
- When pulling data or chaining multiple endpoints (e.g., sending data to OpenAI, receiving a response, then interacting with the Reddit API), implement asynchronous operations or data streaming to prevent long wait times for users if possible. We want to use techniques to show data quickly, rendering stuff on client side if possible.

**7. API Response Documentation:**
- When receiving a response from an API, add comments and descriptions within the endpoint to clearly outline the response structure. This facilitates easier chaining of APIs together.

**8. Database Integration with SSR:**
- Integrate your chosen database using Server-Side Rendering (SSR) to ensure secure and efficient data access.
- Choose the appropriate database based on requirements (see Database Considerations below).
- Common options: Supabase (PostgreSQL), Neon (PostgreSQL), PlanetScale (MySQL), MongoDB, Redis, etc.

**9. Maintain Existing Functionality During Debugging:**
- When debugging or adding new features, always preserve the existing functionality of endpoints and components to prevent breaking current features.

**10. Comprehensive Error Handling and Logging:**
- For complex APIs, include detailed error checks and logging. This aids in debugging, especially after deployment on Vercel.

**11. Optimize for Quick and Easy Use:**
- Ensure the application is fast and user-friendly by rapidly pulling data from databases or external APIs. Use best practices to minimize the need for loading animations.

**12. Complete Code Verification:**
- **Every command you write must ensure that the code is complete, correct, error-free, and bug-free.** Verify all dependencies between files and ensure all imports are accurate.

**13. Use TypeScript:**
- **TypeScript is being used.** All development must be done using TypeScript with proper type definitions.

**14. Ensure Application Security and Scalability:**
- Build a secure, hack-proof, and scalable application using modern coding techniques to reduce server workload and operational costs.

**15. Include Error Checks and Logging:**
- All code must contain error checks and logging to handle edge cases effectively, adhering to the standards of a senior developer.

**16. Protect Exposed Endpoints:**
- Implement rate limiting and secure endpoints with API keys or other authentication methods to prevent unauthorized access.

**17. Secure Database Access:**
- Ensure all interactions with the database are performed securely, following best practices to protect user data.

**18. Step-by-Step Planning for Every Task:**
- For every task or message, **first**:
  - Plan the approach meticulously.
  - Read and understand the existing code.
  - Identify what needs to be done.
  - Create a detailed, step-by-step plan, considering all edge cases.
  - Only then implement and write the code.

**19. Utilize Specified Technology Stack:**
- **Frontend:** Next.js (v14) with App Router and SSR.
- **Backend/Database:** Choose based on requirements:
  - **SQL:** PostgreSQL (Supabase, Neon, Railway), MySQL (PlanetScale, Railway), SQLite (for local/dev)
  - **NoSQL:** MongoDB, Redis (caching), DynamoDB (AWS)
  - **Serverless-friendly:** Supabase, Neon, PlanetScale, MongoDB Atlas
- **Deployment:** Vercel (Free Plan), Railway, Render, or other serverless platforms.
- **Styling:** Tailwind CSS and DaisyUI.
- **Payment Processing:** Stripe (to be set up at a later stage).

**20. Consistent Use of Existing Styles:**
- Always use existing styles from the codebase (e.g., input forms from the sign-in page) across all input forms and UI elements. Maintain consistency in padding, animations, styles, tooltips, popups, and alerts by reusing existing components whenever possible.

**21. Specify Script/File for Code Changes:**
- **Every time you suggest a change to the code**, **always specify which script or file** needs to be modified or created. This ensures clarity and organization within the project structure.

**22. Organize UI Components Properly:**
- **All UI components must reside in the `/components` folder** located in the root directory. **Do not create additional components folders**; place all components within this designated folder.

**23. Efficient Communication:**
- **Be efficient in the number of messages** used in the AI chat. Optimize interactions to maintain productivity and streamline the development process.

### React Hooks Best Practices

Use these React hooks to speed up coding and keep it simple and efficient. Stick to these core hooks:

- **`useRef`** - For accessing DOM elements and storing mutable values
- **`useState`** - For component state management
- **`useEffect`** - For side effects and lifecycle management

### Integration with Design Principles

These coding standards align with the software design principles:

| Coding Rule | Design Principle Connection |
|-------------|----------------------------|
| **Rule 2: Modular Components** | **KISS** - Simple, manageable pieces |
| **Rule 18: Step-by-Step Planning** | **Avoid Over-engineering** - Plan before building |
| **Rule 9: Maintain Existing Functionality** | **Boy Scout Rule** - Leave code better than found |
| **Rule 20: Consistent Styles** | **DRY** - Reuse existing components |
| **Rule 4: Vercel Compatibility** | **Ship Stable Code** - Production-ready from start |

### Database Considerations

When implementing these rules with database operations, consider the various database options and their specific requirements:

#### Database Selection Guide

**Choose SQL When:**
- ✅ Structured data with clear relationships
- ✅ Need ACID transactions (financial, e-commerce)
- ✅ Complex queries with JOINs
- ✅ Strong consistency required
- ✅ Examples: User accounts, orders, transactions, relational data

**Choose NoSQL When:**
- ✅ Unstructured or semi-structured data
- ✅ High write throughput needed
- ✅ Horizontal scaling required
- ✅ Flexible schema needed
- ✅ Examples: User sessions, logs, real-time analytics, content management

#### SQL Database Options

**PostgreSQL (Recommended for most cases):**
```typescript
// Supabase (PostgreSQL with built-in auth)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Neon (Serverless PostgreSQL)
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// Railway/Standard PostgreSQL
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

**MySQL:**
```typescript
// PlanetScale (Serverless MySQL)
import { connect } from '@planetscale/database';
const conn = connect({ url: process.env.DATABASE_URL });

// Standard MySQL
import mysql from 'mysql2/promise';
const connection = await mysql.createConnection(process.env.DATABASE_URL);
```

**SQLite (Development/Testing):**
```typescript
// Better-sqlite3 for Node.js
import Database from 'better-sqlite3';
const db = new Database('database.db');
```

#### NoSQL Database Options

**MongoDB:**
```typescript
// MongoDB Atlas (Cloud)
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI!);

// Mongoose ODM
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI!);
```

**Redis (Caching/Sessions):**
```typescript
import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
```

**DynamoDB (AWS):**
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
const client = new DynamoDBClient({ region: 'us-east-1' });
```

#### Connection Management

**Serverless Environments (Vercel, Netlify):**
- ✅ Use connection pooling libraries (`@neondatabase/serverless`, `@planetscale/database`)
- ✅ Implement connection reuse across function invocations
- ✅ Set appropriate connection timeouts
- ✅ Use HTTP-based drivers when available (Neon, PlanetScale)

```typescript
// Example: Neon serverless connection
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// Automatically handles connection pooling for serverless
export async function GET() {
  const data = await sql`SELECT * FROM users WHERE id = ${userId}`;
  return Response.json(data);
}
```

**Traditional Server Environments:**
- ✅ Use connection pools (pg.Pool, mysql2 pool)
- ✅ Set max connections based on server capacity
- ✅ Implement connection health checks
- ✅ Graceful shutdown on server termination

```typescript
// Example: PostgreSQL connection pool
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Query Optimization

**Parameterized Queries (Prevent SQL Injection):**
```typescript
// ✅ SAFE: Parameterized query
const result = await sql`
  SELECT * FROM users 
  WHERE email = ${userEmail} AND status = ${status}
`;

// ❌ UNSAFE: String concatenation
const result = await sql.unsafe(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

**Indexing Strategy:**
- Index frequently queried columns
- Index foreign keys
- Use composite indexes for multi-column queries
- Monitor query performance and adjust indexes

**Transaction Management:**
```typescript
// PostgreSQL transaction example
await sql.begin(async (sql) => {
  await sql`INSERT INTO orders (user_id, total) VALUES (${userId}, ${total})`;
  await sql`UPDATE users SET balance = balance - ${total} WHERE id = ${userId}`;
  // Both succeed or both fail (ACID)
});
```

#### Error Handling

**Database-Specific Error Handling:**
```typescript
try {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result;
} catch (error) {
  // Log with context (Rule 10, 15)
  console.error('Database query failed:', {
    query: 'SELECT users',
    userId: id,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  
  // Retry logic for transient failures
  if (isTransientError(error)) {
    return retryQuery(() => sql`SELECT * FROM users WHERE id = ${id}`);
  }
  
  // Provide meaningful error to user
  throw new Error('Unable to fetch user data. Please try again.');
}
```

**Retry Logic for Transient Failures:**
```typescript
async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### Database-Specific Best Practices

**PostgreSQL:**
- Use `pg` or `@neondatabase/serverless` for serverless
- Leverage JSONB for flexible schema needs
- Use prepared statements for repeated queries
- Monitor connection pool usage

**MySQL:**
- Use `mysql2` with promise support
- Consider `@planetscale/database` for serverless
- Use connection pooling for production
- Optimize with proper indexes

**MongoDB:**
- Use Mongoose for schema validation
- Implement proper indexing on frequently queried fields
- Use aggregation pipeline for complex queries
- Handle connection state in serverless environments

**Redis:**
- Use for caching, sessions, rate limiting
- Set appropriate TTL values
- Use connection pooling
- Handle connection failures gracefully

#### Migration and Schema Management

**SQL Migrations:**
- Use migration tools (Prisma, Drizzle, Kysely)
- Version control all schema changes
- Test migrations on staging first
- Keep migrations small and reversible

**NoSQL Schema Evolution:**
- Design for backward compatibility
- Use version fields in documents
- Implement migration scripts for data transformation
- Test schema changes thoroughly

#### Performance Monitoring

- Monitor query execution times
- Track slow queries (>100ms)
- Monitor connection pool usage
- Set up database alerts for errors
- Use database query analyzers (pg_stat_statements, MongoDB profiler)

### API Design Considerations

When building endpoints following these rules:

**Performance:**
- Implement caching strategies (Rule 5, 11)
- Use streaming for large responses (Rule 6)
- Optimize database queries to reduce latency

**Security:**
- Validate all inputs (Rule 16)
- Use authentication middleware consistently
- Implement rate limiting per endpoint

**Documentation:**
- Document request/response schemas (Rule 7)
- Include error response formats
- Provide example requests in comments

### Component Architecture

Following Rule 2 (Modular Components) and Rule 22 (Component Organization):

```
/components
├── ui/              # Base UI components (Button, Input, Card)
├── forms/           # Form-specific components
├── layout/          # Layout components (Header, Footer, Sidebar)
├── features/        # Feature-specific components
└── shared/          # Shared utilities and helpers
```

**Component Structure Example:**
```tsx
/**
 * Button Component
 * 
 * Purpose: Reusable button component with multiple variants
 * Location: /components/ui/Button.tsx
 * 
 * Features:
 * - Primary, secondary, outline, and ghost variants
 * - Loading state support
 * - Accessible keyboard navigation
 * - Fitt's Law optimized (44px minimum touch target)
 */

import { useState } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', isLoading, children, onClick }: ButtonProps) => {
  // Implementation following all 23 rules
};
```

### Summary

By adhering to these **23 rules**, you will ensure that every aspect of the development process for your full-stack Next.js application is **secure**, **scalable**, **efficient**, and **maintainable**. This structured approach facilitates the creation of a robust web application deployed on Vercel, aligning with best practices and your specific requirements.

**Key Outcomes:**
- ✅ Consistent, maintainable codebase
- ✅ Production-ready deployments
- ✅ Scalable architecture
- ✅ Secure by default
- ✅ Developer-friendly documentation

---

## Single Server Setup

### How Requests Flow

```
User (Browser/Mobile)
        │
        ▼
   ┌─────────┐
   │   DNS   │  ← Maps domain to IP address
   └────┬────┘
        │ Returns IP (e.g., 192.168.1.1)
        ▼
   ┌─────────┐
   │ Server  │  ← Web App + Database + Cache
   └─────────┘
```

### Two Traffic Sources

**1. Web Applications:**
- Server handles business logic, data storage, presentation
- Returns HTML, CSS, JavaScript

**2. Mobile Applications:**
- Communication over HTTP
- JSON responses (lightweight, easy to interpret)

**Example API Response:**
```json
{
  "product_id": 123,
  "name": "Wireless Headphones",
  "description": "Premium sound quality",
  "price": 99.99,
  "in_stock": true
}
```

---

# PART 2: DATABASE DESIGN

## Relational Data Modeling

### 🔑 The Master Trick
> **Underline all NOUNS and VERBS in requirements:**
> - **Nouns** → Entities or Attributes
> - **Verbs** → Status changes or Relationships

### Relationship Types

#### One-to-Many
```
USER (1) ←————→ (Many) POSTS
USER (1) ←————→ (Many) TWEETS
```
*Add the "one" side's ID as foreign key in the "many" side*

```sql
CREATE TABLE posts (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id),  -- Foreign Key
    content TEXT,
    created_at TIMESTAMP
);
```

#### Many-to-Many
```
USER (Many) ←————→ (Many) SKILLS
```
**Solution:** Create a mapping/junction table

```sql
CREATE TABLE user_skills (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id),
    skill_id INT REFERENCES skills(id)
);
```

### LinkedIn Schema Example

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    USERS     │     │ USER_SKILLS  │     │   SKILLS     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │────▶│ id (PK)      │◀────│ id (PK)      │
│ name         │     │ user_id (FK) │     │ name         │
│ email        │     │ skill_id (FK)│     └──────────────┘
│ profile_pic  │     └──────────────┘
└──────────────┘
```

> ⚠️ **NEVER store lists in a single column!**
> ```sql
> -- BAD: This causes O(n) scan operations
> skills: "Java, JavaScript, Python"
> 
> -- Query becomes:
> SELECT * FROM users WHERE skills LIKE '%Java%'  -- SCAN!
> ```

### When to Split Tables

Even if columns are similar (Education vs Company), split when:
- Different attributes needed later (CGPA vs Salary)
- Avoid NULL columns
- Keep database logic out of application

---

## SQL vs NoSQL Databases

### Relational Databases (SQL)

**Examples:** PostgreSQL, MySQL, Oracle, SQLite

**Structure:**
- Tables with columns and rows
- Like spreadsheets
- Strict schema

**Advantages:**
| Feature | Description |
|---------|-------------|
| Complex JOINs | Combine multiple tables |
| ACID Transactions | Atomic, Consistent, Isolated, Durable |
| Data Integrity | Strong consistency |

**ACID Explained:**
```
A - Atomic      → All or nothing (entire transaction succeeds/fails)
C - Consistent  → Valid state to valid state
I - Isolated    → Concurrent transactions don't interfere
D - Durable     → Data persists even after system failure
```

### Non-Relational Databases (NoSQL)

#### Types of NoSQL:

| Type | Example | Best For |
|------|---------|----------|
| **Document Store** | MongoDB | JSON-like documents, complex structures |
| **Wide Column** | Cassandra, CosmosDB | Massive scale, many writes |
| **Graph** | Neo4j, Amazon Neptune | Relationships, recommendations |
| **Key-Value** | Redis, Memcached | Speed, simplicity, caching |

**Document Store Example (MongoDB):**
```json
{
  "user_id": 123,
  "name": "John",
  "orders": [
    {"product": "Laptop", "price": 999},
    {"product": "Mouse", "price": 29}
  ],
  "addresses": [
    {"type": "home", "city": "NYC"},
    {"type": "work", "city": "Boston"}
  ]
}
```

### Decision Matrix

| Use SQL When | Use NoSQL When |
|--------------|----------------|
| Data is well-structured with clear relationships | Unstructured/semi-structured data |
| Need strong consistency (banking, finance) | Need super low latency |
| Complex queries with JOINs | Flexible, scalable storage |
| ACID transactions critical | Massive data volumes |
| E-commerce with customers/orders | Recommendation engines, activity logs |

---

# PART 3: API DESIGN

## API Fundamentals

> *"The best API is one that developers can use without even reading the documentation."*

### What is an API?
**Application Programming Interface** - defines how software components interact

```
┌──────────┐                      ┌──────────┐
│  Client  │ ◄── API Contract ──► │  Server  │
│(Browser/ │    - Requests        │          │
│ Mobile)  │    - Responses       │          │
└──────────┘                      └──────────┘
```

### API as Abstraction
- Hides implementation details
- Exposes functionality
- Defines service boundaries

### Four Essential Design Principles

| Principle | Description |
|-----------|-------------|
| **Consistency** | Same naming, casing, patterns throughout |
| **Simplicity** | Focus on core use cases, intuitive design |
| **Security** | Authentication, authorization, rate limiting, validation |
| **Performance** | Caching, pagination, minimal payloads, reduce round trips |

---

## RESTful APIs

### Core Concepts
- **Resource-based** approach using HTTP methods
- **Stateless** - each request contains all needed information
- Uses standard HTTP methods

### HTTP Methods (CRUD Operations)

| Method | Operation | Example | Idempotent |
|--------|-----------|---------|------------|
| GET | Read | `GET /products/123` | ✅ Yes |
| POST | Create | `POST /products` | ❌ No |
| PUT | Full Update | `PUT /products/123` | ✅ Yes |
| PATCH | Partial Update | `PATCH /products/123` | ✅ Yes |
| DELETE | Remove | `DELETE /products/123` | ✅ Yes |

### Status Codes

| Range | Category | Examples |
|-------|----------|----------|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection | 301 Moved Permanently, 304 Not Modified |
| 4xx | Client Error | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| 5xx | Server Error | 500 Internal Server Error, 503 Service Unavailable |

### Best Practices

**1. Use Plural Nouns (not verbs):**
```
✅ GET /products
✅ GET /products/123
❌ GET /getProducts
❌ POST /createProduct
```

**2. Filtering, Sorting, Pagination:**
```
GET /products?category=electronics&in_stock=true    # Filtering
GET /products?sort=price_asc                        # Sorting
GET /products?page=3&limit=10                       # Pagination
GET /products?offset=20&limit=10                    # Alternative pagination
```

**3. API Versioning:**
```
GET /api/v1/products
GET /api/v2/products
```

**4. Nested Resources:**
```
GET /products/123/reviews        # Reviews for product 123
GET /users/456/orders            # Orders for user 456
```

---

## GraphQL APIs

### Why GraphQL Exists
Created by Facebook to solve:
- Multiple API calls for single view
- Over-fetching data
- Under-fetching data

### REST vs GraphQL

**REST (Multiple calls):**
```
GET /users/123
GET /users/123/posts
GET /users/123/followers
```

**GraphQL (Single call):**
```graphql
query {
  user(id: "123") {
    name
    posts {
      title
      content
    }
    followers {
      name
    }
  }
}
```

### Schema Definition

```graphql
type User {
  id: ID!
  name: String!
  email: String
  posts: [Post]
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User
}

type Query {
  user(id: ID!): User
  posts: [Post]
}

type Mutation {
  createUser(name: String!): User
  createPost(title: String!, content: String!): Post
}
```

### Operations

| Operation | Purpose | REST Equivalent |
|-----------|---------|-----------------|
| Query | Read data | GET |
| Mutation | Modify data | POST, PUT, PATCH, DELETE |
| Subscription | Real-time updates | WebSockets |

### Error Handling
GraphQL always returns **200 OK** - errors in response body:
```json
{
  "data": { "user": null },
  "errors": [{
    "message": "User not found",
    "path": ["user"],
    "extensions": { "code": "NOT_FOUND" }
  }]
}
```

---

## gRPC

### Overview
- High-performance RPC framework by Google
- Uses **Protocol Buffers** for serialization
- Runs on **HTTP/2**

### Best For
- Microservices communication
- Internal system-to-system calls
- When performance is critical

### Comparison

| Feature | REST | GraphQL | gRPC |
|---------|------|---------|------|
| Protocol | HTTP/1.1 | HTTP | HTTP/2 |
| Format | JSON | JSON | Protocol Buffers |
| Streaming | ❌ | Subscription | ✅ Bidirectional |
| Browser Support | ✅ Full | ✅ Full | ⚠️ Limited |
| Best For | Public APIs | Complex UIs | Microservices |

---

## API Protocols

### HTTP/HTTPS

**Request Structure:**
```
GET /api/products/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Structure:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600

{"id": 123, "name": "Product"}
```

> ⚠️ **Always use HTTPS** - encrypts data in transit with TLS/SSL

### WebSockets

**Problem with HTTP for real-time:**
```
Client: "Any messages?" → Server: "No"
Client: "Any messages?" → Server: "No"
Client: "Any messages?" → Server: "Yes, here's one"
(Wasteful polling!)
```

**WebSocket Solution:**
```
Client ←──── Bidirectional ────→ Server
       │                         │
       │  Server can push data   │
       │  without client asking  │
```

**Use Cases:**
- Chat applications
- Live notifications
- Real-time gaming
- Stock tickers

### AMQP (Advanced Message Queuing Protocol)

```
┌──────────┐     ┌─────────────┐     ┌──────────┐
│ Producer │ ──► │   Message   │ ──► │ Consumer │
│ (Payment │     │    Queue    │     │(Process  │
│  System) │     │   (Broker)  │     │ Orders)  │
└──────────┘     └─────────────┘     └──────────┘
```

**Benefits:**
- Decouples producers and consumers
- Handles traffic spikes (queue buffers)
- Guaranteed delivery

---

## TCP vs UDP

### Transport Layer Protocols

```
Application Layer (HTTP, WebSocket, gRPC)
              │
              ▼
Transport Layer (TCP or UDP)  ◄── We're here
              │
              ▼
Network Layer (IP)
```

### TCP (Transmission Control Protocol)

**Like sending a package with tracking & signature:**
- ✅ Guaranteed delivery
- ✅ Ordered packets
- ✅ Error checking
- ❌ Slower (overhead)

**Three-Way Handshake:**
```
Client ──── SYN ────► Server
Client ◄── SYN-ACK ── Server
Client ──── ACK ────► Server
(Connection established!)
```

### UDP (User Datagram Protocol)

**Like sending postcards:**
- ✅ Fast
- ✅ Low overhead
- ❌ No delivery guarantee
- ❌ No ordering

### When to Use

| TCP | UDP |
|-----|-----|
| Banking, payments | Video streaming |
| Email | Online gaming |
| File transfers | Voice calls |
| APIs | Live broadcasts |

---

# PART 4: SCALING & INFRASTRUCTURE

## Vertical vs Horizontal Scaling

### The Delicious.com Story
*From 1 laptop to 5 million users*

### Vertical Scaling (Scale Up)
Add more resources to existing server:
- More RAM
- Better CPU
- More disk space

| Pros | Cons |
|------|------|
| Simple | Hardware limits |
| No code changes | Single point of failure |
| | Expensive at scale |

### Horizontal Scaling (Scale Out)
Add more servers to share load:

```
                    ┌─── Server 1
Client → LB ────────┼─── Server 2
                    └─── Server 3
```

| Pros | Cons |
|------|------|
| No hardware limits | More complex |
| Fault tolerant | Need load balancer |
| Cost effective | State management |

---

## Load Balancing Deep Dive

### Why Load Balancers?

```
                         ┌─── Server 1 ✓
User → DNS → Load ───────┼─── Server 2 ✓
             Balancer    ├─── Server 3 ✓
                         └─── Server 4 ✗ (down)
```

**Functions:**
- Distribute traffic evenly
- Health checks (detect failed servers)
- SSL termination
- Security layer

### Types

| Hardware LB | Software LB |
|-------------|-------------|
| F5, Citrix | Nginx, HAProxy |
| Expensive | Cost-effective |
| High performance | Flexible |

**Cloud Load Balancers:**
- AWS Elastic Load Balancing
- Azure Load Balancer
- Google Cloud Load Balancing

### Layer 4 vs Layer 7

| Layer 4 (Transport) | Layer 7 (Application) |
|--------------------|----------------------|
| Routes based on IP + Port | Routes based on headers, path, cookies |
| Faster | More flexible |
| More secure | Content-based routing |
| Can't inspect content | Can modify requests |

### Routing Algorithms

#### 1. Round Robin
```
Request 1 → Server 1
Request 2 → Server 2
Request 3 → Server 3
Request 4 → Server 1  (cycles back)
```

#### 2. Weighted Round Robin
```
Server 1 (weight=1): 25% traffic
Server 2 (weight=2): 50% traffic  ← More powerful
Server 3 (weight=1): 25% traffic
```

#### 3. Least Connections
```
Server 1: 5 connections
Server 2: 3 connections  ← Next request goes here
Server 3: 8 connections
```

#### 4. Least Response Time
Considers both connections AND response time

#### 5. IP Hash
Same client IP always goes to same server (sticky sessions)

#### 6. Geographic
Route to nearest data center

### Health Checks
```
LB ──── ping ────► Server 1 ✓
LB ──── ping ────► Server 2 ✓
LB ──── ping ────► Server 3 ✗ (remove from pool)
```

### Avoiding Single Point of Failure

```
        ┌─────────────┐
        │ Active LB   │◄── Handles traffic
        └──────┬──────┘
               │ Heartbeat
        ┌──────▼──────┐
        │ Standby LB  │◄── Takes over if Active fails
        └─────────────┘
```

---

## Stateless vs Stateful Systems

### Stateless Systems
**Example:** Calculator, REST APIs

```
Any server can handle any request
┌─────┐     ┌─────┐
│ S1  │     │ S2  │     2 + 2 = 4 (same result!)
└─────┘     └─────┘
```

| Pros | Cons |
|------|------|
| Easy to scale | Need external storage for state |
| Fault tolerant | Network I/O overhead |
| No sticky sessions | |

### Stateful Systems
**Example:** Chat apps, PUBG, Shopping carts

```
User must go to SAME server (has their data)
┌─────┐
│ S1  │ ◄── User A's game state here
└─────┘
```

| Pros | Cons |
|------|------|
| Lower latency | Hard to scale |
| No external storage | Not fault tolerant |
| | Sticky sessions needed |

### PUBG Example
Why stateful makes sense:
- Game state is **short-lived** (match duration)
- **Real-time** requirements (milliseconds matter)
- State doesn't need to persist after match

```
Match State (in memory):
- Player locations
- Health points
- Weapons
- Team info
```

---

## Consistent Hashing

### The Problem with Modular Hashing

```python
server = hash(key) % number_of_servers
```

**When servers change, EVERYTHING reshuffles!**

| Key | 3 Servers | 4 Servers | Same Server? |
|-----|-----------|-----------|--------------|
| 11 | 11%3 = 2 | 11%4 = 3 | ❌ |
| 42 | 42%3 = 0 | 42%4 = 2 | ❌ |
| 34 | 34%3 = 1 | 34%4 = 2 | ❌ |

### Consistent Hashing Solution

**Visualize a ring (0 to 10^18):**

```
           0
      ┌────────┐
     /    S1    \
    │     │      │
   S3     │      S2
    │     ●K1    │
     \          /
      └────────┘
```

**How it works:**
1. Hash servers onto ring
2. Hash keys onto ring
3. Key belongs to **first server clockwise**

### Virtual Nodes
Solve uneven distribution:
```
Server A → A0, A1, A2, A3, A4 (5 virtual nodes)
Server B → B0, B1, B2, B3, B4, B5, B6, B7, B8, B9 (10 virtual nodes - more powerful!)
```

### When Server Removed
```
Before: K1 → S2
S2 dies...
After: K1 → S3 (next clockwise)

Only K1 moves! Other keys STAY PUT! ✨
```

### Replication with Consistent Hashing
```
Replication Factor = 2
K1 stored on: S2 (primary) + S3 (next clockwise)

If S2 dies:
- Requests route to S3
- S3 already has the data!
- No data transfer needed!
```

---

# PART 5: PERFORMANCE & RELIABILITY

## Caching

### 🥛 The Milk Tea Analogy

| Concept | Real World | System Design |
|---------|------------|---------------|
| Department Store | Far, slow | Database |
| Refrigerator | Close, fast | Cache |
| Milk | Data | Data |
| Cache Hit | Milk in fridge | Data in cache ✓ |
| Cache Miss | Go to store | Query database ✗ |

### Where to Cache

```
Browser Cache → CDN → Load Balancer → App Server Cache → Database Cache → Database
     │                                        │
     └─────────── Faster ◄────────────────────┘
```

### Caching Strategies

#### 1. Write-Through
```
Write Request → Update Cache → Update DB → Return Success
```
- ✅ Cache always consistent
- ❌ Higher write latency

#### 2. Write-Back (Write-Behind)
```
Write Request → Update Cache → Return Success
                     │
                     └──► Async update DB
```
- ✅ Fast writes
- ❌ Risk of data loss

#### 3. Write-Around
```
Write Request → Update DB → Return Success
(Cache not updated - will be populated on read)
```
- ✅ Cache not flooded with writes
- ❌ Cache miss on first read

#### 4. Cache-Aside (Lazy Loading)
```
Read Request:
1. Check cache
2. If miss → Query DB → Store in cache → Return
```

### Cache Invalidation Strategies

| Strategy | How it Works |
|----------|--------------|
| TTL (Time-To-Live) | Auto-expire after duration |
| Event-Based | Invalidate when data changes |
| Version-Based | New version = cache miss |

---

## CAP Theorem

### 🏠 The Reminder Service Story

You and your wife run a phone reminder service...

**Scenario 1: Consistency Problem**
- Wife takes a reminder from customer
- Customer calls you later
- You don't have it!

**Solution:** Both must record every reminder

**Scenario 2: Availability Problem**
- Wife is sick
- You can't accept reminders (need her confirmation)
- Service is DOWN!

**Scenario 3: Partition (You stop talking to wife)**
- Must choose: Stay consistent OR Stay available
- Can't have both!

### The Theorem

```
         Consistency
            /\
           /  \
          /    \
         /      \
        /________\
Availability    Partition
                Tolerance
```

**You can only guarantee 2 out of 3!**

| Choice | Description | Example |
|--------|-------------|---------|
| CP | Consistent + Partition | Banking systems |
| AP | Available + Partition | Social media, DNS |
| CA | Consistent + Available | Only possible without partitions |

> **Reality:** In distributed systems, **P is mandatory** (network failures happen). So you're really choosing between C and A.

### PACELC Extension

```
If PARTITION:
    Choose Availability or Consistency
ELSE:
    Choose Latency or Consistency
```

**Example Decisions:**
| System | Partition Choice | Normal Choice |
|--------|------------------|---------------|
| Banking | Consistency | Consistency |
| Twitter | Availability | Latency |
| MongoDB | Configurable | Configurable |

---

# PART 6: SECURITY

## Authentication

> *"Authentication answers: WHO is the user?"*

### Authentication Types

#### 1. Basic Authentication
```
Authorization: Basic base64(username:password)
```
- ⚠️ Easily reversible
- ⚠️ Only use with HTTPS
- Rarely used in production

#### 2. Bearer Tokens
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
- ✅ Standard approach
- ✅ Stateless
- ✅ Scalable

#### 3. OAuth 2.0 + JWT

```
┌────────┐      ┌────────┐      ┌────────┐
│  User  │──1──►│  App   │──2──►│ Google │
└────────┘      └────────┘      └────────┘
                    ▲               │
                    └───── 3 ───────┘
                       (JWT Token)
```

**JWT Payload:**
```json
{
  "user_id": "123",
  "email": "user@example.com",
  "exp": 1699900000,
  "iat": 1699800000
}
```

#### 4. Access + Refresh Tokens

```
Access Token:  Short-lived (15 min) - Used for API calls
Refresh Token: Long-lived (7 days) - Used to get new access tokens
```

**Flow:**
```
1. Login → Get both tokens
2. Use access token for requests
3. Access token expires
4. Use refresh token to get new access token
5. Continue without re-login!
```

#### 5. Single Sign-On (SSO)

Login once, access multiple services:
```
Google Login → Gmail ✓
            → Drive ✓
            → Calendar ✓
```

**Protocols:**
- **OAuth 2.0** - Modern, JSON-based
- **SAML** - XML-based, legacy/enterprise systems

---

## Authorization

> *"Authorization answers: WHAT can the user do?"*

### Authorization Models

#### 1. Role-Based Access Control (RBAC)
Most common approach:

```
Admin    → Create, Read, Update, Delete, Manage Users
Editor   → Create, Read, Update
Viewer   → Read only
```

**Example (GitHub):**
| Role | Permissions |
|------|-------------|
| Admin | Full control, delete repo |
| Write | Push code, create PRs |
| Read | View code only |

#### 2. Attribute-Based Access Control (ABAC)

More flexible, uses attributes:
```python
allow_access if:
    user.department == "HR" AND
    resource.classification == "internal" AND
    environment.time_of_day == "business_hours"
```

**Attributes:**
- User: department, role, clearance level
- Resource: owner, classification, sensitivity
- Environment: time, location, device

#### 3. Access Control Lists (ACL)

Per-resource permissions:
```json
{
  "document_id": "doc123",
  "permissions": [
    {"user": "alice", "access": "read"},
    {"user": "bob", "access": "read,write"},
    {"user": "charlie", "access": "none"}
  ]
}
```

**Example:** Google Docs sharing

---

## API Security Techniques

### 1. Rate Limiting
Prevent abuse and DDoS:
```
User A: 100 requests/minute allowed
User A: 101st request → BLOCKED (429 Too Many Requests)
```

**Levels:**
- Per endpoint
- Per user/IP
- Global system limit

### 2. CORS (Cross-Origin Resource Sharing)
Control which domains can call your API:
```
✅ Allowed: requests from app.yourdomain.com
❌ Blocked: requests from evil.com
```

### 3. SQL/NoSQL Injection Prevention
```sql
-- VULNERABLE:
SELECT * FROM users WHERE name = '$userInput'
-- Attacker inputs: ' OR '1'='1

-- SAFE: Use parameterized queries
SELECT * FROM users WHERE name = ?
```

### 4. Firewalls (WAF)
```
Internet → WAF → API
              │
              └── Blocks suspicious patterns:
                  - SQL keywords
                  - Strange HTTP methods
                  - Known attack signatures
```

### 5. VPN for Private APIs
```
Public Internet          │          Private Network (VPN)
                         │
External User ────X──────│──────── Internal API
                         │
Internal User ──────────►│────────► Internal API ✓
```

### 6. CSRF Protection
Prevent unauthorized actions from user's browser:
```
Request must include:
✓ Session cookie
✓ CSRF token (proves request came from your site)
```

### 7. XSS Prevention
Sanitize user input to prevent script injection:
```html
<!-- User input: <script>stealCookies()</script> -->
<!-- Display as text, not HTML -->
&lt;script&gt;stealCookies()&lt;/script&gt;
```

---

# PART 7: INTERVIEW MASTERY

## 5-Step Interview Framework

### ⏱️ Time Management (45-60 min interview)

| Step | Time | Focus |
|------|------|-------|
| 1. Gather Requirements | 3-5 min | Clarifying questions |
| 2. Estimate Scale | 5-7 min | Users, TPS, Storage |
| 3. Design Goals | 3-5 min | Trade-offs |
| 4. Single Server Design | 15-20 min | Schema, APIs, Logic |
| 5. Scale & Optimize | 15-20 min | Bottlenecks, Solutions |

---

### Step 1: Gather Requirements

> **Always ask clarifying questions, even if problem seems clear!**

**URL Shortener Example Questions:**
- Do we need personalization?
- Analytics support?
- URL expiry?
- Custom short URLs?

**Freeze requirements before proceeding!**

---

### Step 2: Estimate Scale

**Formula:**
```
Daily Active Users (DAU)
    → % that write/read
    → Requests per second (TPS)
    → Storage requirements
```

**URL Shortener Example:**
```
Given: 1 million DAU
Assume: 90% read, 10% write

Writers: 1M × 10% = 100K writes/day
Storage per record: ~1KB
Daily storage: 100K × 1KB = 100MB/day
Yearly storage: 100MB × 365 = 36.5GB/year

Verdict: Single machine can handle storage!
```

**Key Metrics to Calculate:**
| Metric | Why It Matters |
|--------|----------------|
| Read TPS | Caching decisions |
| Write TPS | Database choice |
| Storage | Sharding needs |
| Bandwidth | CDN decisions |

---

### Step 3: Design Goals

**Trade-off 1: CAP Theorem**
```
URL Shortener:
- Can live with eventual consistency
- MUST have availability
- Choice: AP system
```

**Trade-off 2: Latency**
```
URL Shortener: LOW latency (< 100ms)
Recommendation Engine: Higher latency OK (seconds)
Batch Processing: Minutes/hours OK
```

---

### Step 4: Design for Single Server

> **⚠️ Always start with RDBMS, not NoSQL!** (Red flag in interviews)

**URL Shortener APIs:**
```
POST /shorten
Request:  { "url": "https://very-long-url.com/...", "expiry": "7d" }
Response: { "short_url": "https://short.ly/abc123" }

GET /{shortCode}
Response: 301 Redirect to original URL
```

**Schema:**
```sql
CREATE TABLE urls (
    short_code VARCHAR(10) PRIMARY KEY,  -- Not auto-increment ID!
    long_url TEXT NOT NULL,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    user_id INT
);
```

**Business Logic - Generating Short Codes:**

❌ **Auto-increment ID:** Guessable (ID 54 → 53 others exist)

❌ **MD5/SHA256:** Too long (32+ chars)

✅ **Base62 encoding:**
```
Characters: a-z, A-Z, 0-9 = 62 chars
5 chars = 62^5 = 916 million combinations
6 chars = 62^6 = 56 billion combinations
```

**Pre-generation approach:**
```
1. Pre-generate millions of codes
2. Store in HashSet (randomized order)
3. Distribute to servers (1M codes each)
4. Each server draws from its pool
```

---

### Step 5: Scale for Numbers

**Identify Bottlenecks:**

| Bottleneck | Solution |
|------------|----------|
| High read TPS | Caching, Read replicas |
| High write TPS | Sharding, Message queues |
| Single DB | Partition/Shard |
| Single server | Load balancer + multiple servers |

**Scaling URL Shortener:**
```
┌────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client   │────►│ Load Balancer│────►│  App Server │
└────────────┘     └─────────────┘     │  (Pool of   │
                                        │  pre-gen    │
                                        │  codes)     │
                                        └──────┬──────┘
                                               │
                   ┌───────────────────────────┼───────────────────────────┐
                   │                           │                           │
            ┌──────▼──────┐             ┌──────▼──────┐             ┌──────▼──────┐
            │   Cache     │             │  DB Master  │             │  DB Replica │
            │   (Redis)   │             │   (Write)   │             │   (Read)    │
            └─────────────┘             └─────────────┘             └─────────────┘
```

---

## Mock Interview Example: Google Search Typeahead

### Requirements Gathered:
- Display top 5 suggestions
- Sorted by popularity
- Handle typos (optional)
- Low latency (< 100ms)

### Design Goals:
- **Availability** over Consistency (eventual consistency OK)
- **Very low latency** (real-time as user types)

### Data Structure: Trie

```
        root
       /    \
      d      c
     /        \
    o          a
   / \          \
  n   g         t
 /     \
a       [end]
l
d
```

**Each node stores:**
- Character
- Is end of word (boolean)
- **Top 5 suggestions** (Min Heap)
- Frequency count

### Optimization 1: Pre-compute Top K
Store top 5 at EACH node:
```
At 'do' node:
- donald (1000 searches)
- dog (800 searches)
- download (600 searches)
- doctor (400 searches)
- document (200 searches)
```
**Query complexity: O(1)** instead of traversing entire subtree!

### Optimization 2: Reduce Writes

**Problem:** Every search updates frequency → blocks reads

**Solution 1: Batching**
```
Instead of: Update on every search
Do: Accumulate in HashMap → Bulk update when count reaches 1000
```

**Solution 2: Sampling**
```
Only count every 100th search
Popular terms will still dominate (law of large numbers)
```

### Scaling: Consistent Hashing by Prefix

```
Prefixes: aa, ab, ac... → Shard 1
Prefixes: ba, bb, bc... → Shard 2
...
```

```
                    ┌─── Shard 1 (a-f prefixes)
Query → Load    ────┼─── Shard 2 (g-m prefixes)
        Balancer    ├─── Shard 3 (n-s prefixes)
                    └─── Shard 4 (t-z prefixes)
```

### Replication for Fault Tolerance
Each shard replicated to 2-3 servers using consistent hashing

### Client-Side Optimization
**Debouncing:** Don't send request on every keystroke
```javascript
// Wait 300ms after user stops typing
// Then send request
```

---

# PART 8: UI/UX DESIGN

## Psychology-Driven Design System

> *"Here's your complete setup for building beautiful, psychology-driven UI/UX designs."*

### 🎨 Cursor Rules File (`.cursorrules`)

Create this file in your project root:

```markdown
# ═══════════════════════════════════════════════════════════════
# 🎨 CURSOR RULES: UX PSYCHOLOGY-DRIVEN DESIGN SYSTEM
# ═══════════════════════════════════════════════════════════════

You are an expert UI/UX designer and frontend developer who creates 
visually stunning, psychologically-optimized interfaces.

## 🧠 PSYCHOLOGY LAWS (ALWAYS APPLY)

### Fitt's Law - Target Size & Distance
- Minimum touch target: 44x44px (mobile), 32x32px (desktop)
- Primary CTAs must be larger than secondary actions
- Place related actions close together
- Position key actions at screen edges/corners (infinite edges)

### Hick's Law - Decision Simplification  
- Limit navigation items to 5-7 maximum
- Break complex forms into multi-step wizards
- Use progressive disclosure - show only what's needed
- Provide smart defaults to reduce choices

### Miller's Law - Chunking Information
- Group content into chunks of 7±2 items
- Use visual separators between groups
- Organize lists with clear categories
- Break long content into digestible sections

### Jakob's Law - Familiarity Patterns
- Follow platform conventions (iOS/Android/Web standards)
- Place navigation where users expect (top/left)
- Use familiar icons (hamburger, search, home, cart)
- Don't reinvent standard interaction patterns

### Gestalt Principles - Visual Grouping
- PROXIMITY: Related items close together
- SIMILARITY: Same function = same styling
- CONTINUITY: Guide eye flow with alignment
- CLOSURE: Users complete incomplete shapes mentally
- FOCAL POINT: One dominant element per section

### Doherty Threshold - Response Time
- Target <400ms for all interactions
- Show loading states immediately
- Use skeleton screens, not spinners
- Implement optimistic UI updates

## ✨ PSYCHOLOGICAL EFFECTS TO LEVERAGE

### Von Restorff Effect (Isolation)
- Make CTAs visually distinct (color, size, position)
- Use contrast to highlight key information
- One standout element per viewport

### Zeigarnik Effect (Completion Drive)
- Show progress indicators on multi-step flows
- Display incomplete profile/setup prompts
- Use checklists that show completion status

### Goal Gradient Effect (Acceleration)
- Progress bars that show advancement
- "Almost there!" messaging near completion
- Reward proximity to goals visually

### Halo Effect (Beauty = Trust)
- Invest in visual polish - it builds credibility
- High-quality imagery and icons
- Consistent, professional typography

## 🎨 DESIGN REQUIREMENTS

### Typography
- NEVER use default system fonts alone
- Establish clear hierarchy: Display → Heading → Body → Caption
- Minimum body text: 16px
- Line height: 1.5-1.7 for readability
- Maximum line width: 65-75 characters

### Colors
- Define semantic colors: success, warning, error, info
- Ensure WCAG AA contrast (4.5:1 text, 3:1 UI)
- Use color purposefully, not decoratively
- Dark mode: Don't just invert - redesign

### Spacing
- Use 4px/8px base unit system
- Consistent spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- More whitespace = more premium feel
- Group related elements with tighter spacing

### Components
- All interactive elements need hover/focus/active states
- Buttons: Clear visual hierarchy (primary > secondary > ghost)
- Forms: Labels always visible, helpful error messages
- Cards: Consistent padding, clear visual boundaries

### Animation & Micro-interactions
- Duration: 150-300ms for UI, 300-500ms for emphasis
- Easing: ease-out for entrances, ease-in for exits
- Purpose: Guide attention, confirm actions, show state
- Never animate just for decoration

## 🚫 NEVER DO THIS

- Generic color schemes (avoid overused purple/blue gradients)
- Walls of text without visual breaks
- Mystery meat navigation (unclear clickable areas)
- Disabled buttons without explanation
- Infinite scroll without position indicator
- Auto-playing media
- Popup modals on page load
- CAPTCHA without alternative

## ✅ ALWAYS DO THIS

- Mobile-first responsive design
- Semantic HTML structure
- Accessible color contrast
- Keyboard navigation support
- Clear loading and error states
- Meaningful empty states
- Forgiving input formats
- Undo for destructive actions

## 🛠️ TECH STACK PREFERENCES

- Tailwind CSS for styling
- Framer Motion for animations
- Lucide/Phosphor for icons
- CSS variables for theming
- Container queries for components
```

---

## Design Tokens & Components

### 📁 File Structure

```
design-system/
├── tokens/
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   └── shadows.css
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ProgressBar.tsx
├── styles/
│   └── globals.css
└── tailwind.config.js
```

### 🎨 Design Tokens (`tokens/colors.css`)

```css
/* ═══════════════════════════════════════════════════════════
   🎨 COLOR SYSTEM - Psychology-Optimized Palette
   ═══════════════════════════════════════════════════════════ */

:root {
  /* ─── Brand Colors ─── */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Main brand */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* ─── Neutral Colors ─── */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;
  
  /* ─── Semantic Colors (Halo Effect - convey meaning) ─── */
  --color-success-light: #dcfce7;
  --color-success: #22c55e;
  --color-success-dark: #15803d;
  
  --color-warning-light: #fef3c7;
  --color-warning: #f59e0b;
  --color-warning-dark: #b45309;
  
  --color-error-light: #fee2e2;
  --color-error: #ef4444;
  --color-error-dark: #b91c1c;
  
  --color-info-light: #e0f2fe;
  --color-info: #0ea5e9;
  --color-info-dark: #0369a1;
  
  /* ─── Surface Colors ─── */
  --surface-background: #ffffff;
  --surface-foreground: #111827;
  --surface-muted: #f9fafb;
  --surface-elevated: #ffffff;
  --surface-overlay: rgba(0, 0, 0, 0.5);
  
  /* ─── Interactive States (Von Restorff - CTAs stand out) ─── */
  --color-focus-ring: #3b82f6;
  --color-hover-overlay: rgba(0, 0, 0, 0.04);
  --color-active-overlay: rgba(0, 0, 0, 0.08);
}

/* ─── Dark Mode ─── */
[data-theme="dark"] {
  --surface-background: #030712;
  --surface-foreground: #f9fafb;
  --surface-muted: #111827;
  --surface-elevated: #1f2937;
  
  --color-hover-overlay: rgba(255, 255, 255, 0.04);
  --color-active-overlay: rgba(255, 255, 255, 0.08);
}
```

### ✍️ Typography (`tokens/typography.css`)

```css
/* ═══════════════════════════════════════════════════════════
   ✍️ TYPOGRAPHY SYSTEM - Hierarchy & Readability
   ═══════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cal+Sans&display=swap');

:root {
  /* ─── Font Families ─── */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Cal Sans', var(--font-sans);
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* ─── Type Scale (Miller's Law - clear hierarchy) ─── */
  --text-xs: 0.75rem;      /* 12px - Captions */
  --text-sm: 0.875rem;     /* 14px - Secondary */
  --text-base: 1rem;       /* 16px - Body */
  --text-lg: 1.125rem;     /* 18px - Lead */
  --text-xl: 1.25rem;      /* 20px - H5 */
  --text-2xl: 1.5rem;      /* 24px - H4 */
  --text-3xl: 1.875rem;    /* 30px - H3 */
  --text-4xl: 2.25rem;     /* 36px - H2 */
  --text-5xl: 3rem;        /* 48px - H1 */
  --text-6xl: 3.75rem;     /* 60px - Display */
  
  /* ─── Font Weights ─── */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* ─── Line Heights ─── */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* ─── Letter Spacing ─── */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  
  /* ─── Max Line Width (Readability) ─── */
  --prose-width: 65ch;
}
```

### 📐 Spacing (`tokens/spacing.css`)

```css
/* ═══════════════════════════════════════════════════════════
   📐 SPACING SYSTEM - 4px Base Unit
   ═══════════════════════════════════════════════════════════ */

:root {
  /* ─── Spacing Scale ─── */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1.5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2.5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3.5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-32: 8rem;        /* 128px */
  
  /* ─── Component Spacing (Gestalt - Proximity) ─── */
  --padding-card: var(--space-6);
  --padding-button: var(--space-3) var(--space-5);
  --padding-input: var(--space-3) var(--space-4);
  --gap-form: var(--space-4);
  --gap-section: var(--space-16);
  
  /* ─── Border Radius ─── */
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### 🌑 Shadows (`tokens/shadows.css`)

```css
/* ═══════════════════════════════════════════════════════════
   🌑 SHADOW SYSTEM - Elevation & Depth
   ═══════════════════════════════════════════════════════════ */

:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  
  /* ─── Colored Shadows (Halo Effect - Premium feel) ─── */
  --shadow-primary: 0 4px 14px 0 rgb(59 130 246 / 0.25);
  --shadow-success: 0 4px 14px 0 rgb(34 197 94 / 0.25);
  --shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.25);
}
```

### 🔘 Button Component (`components/Button.tsx`)

```tsx
/* ═══════════════════════════════════════════════════════════
   🔘 BUTTON - Fitt's Law Optimized
   ═══════════════════════════════════════════════════════════ */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  // Base styles (Fitt's Law: min 44px touch target)
  `inline-flex items-center justify-center gap-2
   font-medium transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]`,
  {
    variants: {
      // Von Restorff: Primary stands out
      variant: {
        primary: `
          bg-primary-500 text-white shadow-md
          hover:bg-primary-600 hover:shadow-lg hover:shadow-primary
          focus-visible:ring-primary-500
        `,
        secondary: `
          bg-gray-100 text-gray-900
          hover:bg-gray-200
          focus-visible:ring-gray-500
        `,
        outline: `
          border-2 border-gray-200 bg-transparent text-gray-700
          hover:bg-gray-50 hover:border-gray-300
          focus-visible:ring-gray-500
        `,
        ghost: `
          bg-transparent text-gray-600
          hover:bg-gray-100 hover:text-gray-900
          focus-visible:ring-gray-500
        `,
        destructive: `
          bg-error text-white shadow-md
          hover:bg-error-dark hover:shadow-error
          focus-visible:ring-error
        `,
      },
      // Fitt's Law: Larger = easier to click
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-5 text-base rounded-lg',      // Default: 44px height
        lg: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-11 w-11 rounded-lg',              // Square touch target
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, fullWidth, className })}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 📊 Progress Bar (`components/ProgressBar.tsx`)

```tsx
/* ═══════════════════════════════════════════════════════════
   📊 PROGRESS BAR - Zeigarnik & Goal Gradient Effects
   ═══════════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;           // 0-100
  max?: number;
  showLabel?: boolean;
  showMilestones?: boolean;
  variant?: 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = true,
  showMilestones = false,
  variant = 'default',
  size = 'md',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Goal Gradient: Encouraging messages as user progresses
  const getMessage = () => {
    if (percentage === 100) return "🎉 Complete!";
    if (percentage >= 75) return "Almost there!";
    if (percentage >= 50) return "Halfway done!";
    if (percentage >= 25) return "Great progress!";
    return "Let's get started!";
  };
  
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  const colors = {
    default: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
  };
  
  return (
    <div className="w-full space-y-2">
      {/* Label Row */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">{getMessage()}</span>
          <span className="text-gray-900 font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      
      {/* Track */}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        {/* Fill - Animated for Doherty Threshold */}
        <motion.div
          className={`h-full rounded-full ${colors[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.5, 
            ease: [0.4, 0, 0.2, 1],
            // Goal Gradient: Accelerate as approaching goal
            ...(percentage > 80 && { duration: 0.3 })
          }}
        />
      </div>
      
      {/* Milestones (Zeigarnik: Visual completion markers) */}
      {showMilestones && (
        <div className="flex justify-between px-1">
          {[0, 25, 50, 75, 100].map((milestone) => (
            <div
              key={milestone}
              className={`flex flex-col items-center ${
                percentage >= milestone ? 'text-primary-500' : 'text-gray-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                percentage >= milestone ? 'bg-primary-500' : 'bg-gray-200'
              }`} />
              <span className="text-xs mt-1">{milestone}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 🃏 Card Component (`components/Card.tsx`)

```tsx
/* ═══════════════════════════════════════════════════════════
   🃏 CARD - Gestalt Principles Applied
   ═══════════════════════════════════════════════════════════ */

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  // Gestalt Closure: Clear boundaries define the group
  `rounded-xl border border-gray-200 bg-white
   transition-all duration-200`,
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-lg hover:shadow-xl',
        interactive: `
          shadow-sm cursor-pointer
          hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5
          active:translate-y-0
        `,
        outline: 'shadow-none border-2',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',      // Default (Gestalt: consistent internal spacing)
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Sub-components for structure (Miller's Law: organized chunks)
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-1.5 ${className}`} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`pt-4 ${className}`} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center pt-6 ${className}`} {...props} />
);

Card.displayName = 'Card';
```

### 📦 Tailwind Config (`tailwind.config.js`)

```js
/* ═══════════════════════════════════════════════════════════
   📦 TAILWIND CONFIG - Design System Integration
   ═══════════════════════════════════════════════════════════ */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors from tokens ───
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      
      // ─── Typography from tokens ───
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      
      // ─── Shadows from tokens ───
      boxShadow: {
        'primary': 'var(--shadow-primary)',
        'success': 'var(--shadow-success)',
        'error': 'var(--shadow-error)',
      },
      
      // ─── Animation (Doherty Threshold) ───
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      
      // ─── Border Radius ───
      borderRadius: {
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      
      // ─── Prose width (readability) ───
      maxWidth: {
        'prose': 'var(--prose-width)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### 🚀 Quick Start

```bash
# 1. Copy .cursorrules to your project root

# 2. Create the tokens folder and copy CSS files

# 3. Import tokens in your globals.css
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/shadows.css';

# 4. Install dependencies
npm install class-variance-authority framer-motion @tailwindcss/typography @tailwindcss/forms
```

### ✅ What You Now Have

| Asset | Purpose |
|-------|---------|
| `.cursorrules` | Claude/AI follows UX psychology in all designs |
| **Color Tokens** | Consistent, accessible color system |
| **Typography** | Clear hierarchy, readable fonts |
| **Spacing** | 4px-based consistent spacing |
| **Button** | Fitt's Law optimized, accessible |
| **Progress Bar** | Zeigarnik + Goal Gradient effects |
| **Card** | Gestalt principles applied |
| **Tailwind Config** | Design tokens integrated |

---

# 🎯 GOLDEN RULES FOR INTERVIEWS

### DO ✅

1. **Use diagrams** - Visualize everything
2. **Start with RDBMS** - NoSQL needs justification
3. **Ask clarifying questions** - Even if problem seems clear
4. **State assumptions** - "I'm assuming 90% reads, 10% writes"
5. **Discuss trade-offs** - Show you understand options
6. **Think out loud** - Let interviewer follow your reasoning
7. **Iterate** - First design is never final

### DON'T ❌

1. **Don't jump to NoSQL** - Red flag without justification
2. **Don't say "use Redis"** - Without knowing WHY and HOW
3. **Don't over-engineer** - YAGNI (You Ain't Gonna Need It)
4. **Don't skip requirements** - They dictate design
5. **Don't forget scale** - Estimate numbers early
6. **Don't ignore failures** - What if X goes down?

---

# 📊 Quick Reference Cheat Sheet

| Concept | When to Use |
|---------|-------------|
| **SQL** | Structured data, ACID needed, complex queries |
| **NoSQL** | Unstructured, massive scale, low latency |
| **Caching** | Read-heavy, same data accessed often |
| **Sharding** | Data too large for single machine |
| **Replication** | High availability, read scaling |
| **Load Balancer** | Multiple servers, fault tolerance |
| **Message Queue** | Async processing, decouple services |
| **Consistent Hashing** | Stateful systems, distributed cache |
| **CDN** | Static content, global users |

---

# PART 9: AI CODING ASSISTANT SKILLS

## Claude Skills & Best Practices

> *"Mastering AI coding assistants like Claude requires understanding their capabilities, limitations, and how to effectively communicate your requirements. This section covers essential skills for leveraging AI in system design and development."*

### Understanding Claude's Capabilities

Claude is an AI coding assistant that excels at:

**1. Code Generation & Refactoring:**
- Writing production-ready code in multiple languages
- Refactoring existing code for better maintainability
- Converting code between languages and frameworks
- Implementing design patterns and best practices

**2. System Design & Architecture:**
- Designing scalable system architectures
- Database schema design and optimization
- API design and documentation
- Performance optimization strategies

**3. Problem Solving:**
- Debugging complex issues
- Analyzing error messages and stack traces
- Identifying bottlenecks and optimization opportunities
- Suggesting alternative approaches

**4. Documentation & Communication:**
- Writing clear technical documentation
- Creating code comments and explanations
- Generating API documentation
- Writing commit messages and PR descriptions

**5. Learning & Research:**
- Explaining complex concepts
- Providing code examples and tutorials
- Researching best practices
- Comparing technologies and approaches

### Core Skills for Working with Claude

#### Skill 1: Clear Requirement Specification

**Effective Prompting:**
```
✅ GOOD: "Create a REST API endpoint for user authentication that:
- Accepts email and password
- Validates input using Zod
- Returns JWT token on success
- Handles errors with proper status codes
- Uses PostgreSQL database
- Follows the 23 coding standards"

❌ BAD: "Make a login thing"
```

**Key Elements:**
- **Context:** Provide relevant background information
- **Constraints:** Specify technology stack, patterns, standards
- **Expected Output:** Describe the desired result
- **Edge Cases:** Mention important scenarios to handle

#### Skill 2: Iterative Refinement

**Workflow:**
1. **Initial Request:** Ask for a basic implementation
2. **Review & Feedback:** Test and provide specific feedback
3. **Refinement:** Request improvements based on issues
4. **Optimization:** Ask for performance or code quality improvements

**Example:**
```
Step 1: "Create a user registration endpoint"
Step 2: "The password validation is too strict, make it more lenient"
Step 3: "Add rate limiting to prevent abuse"
Step 4: "Optimize the database query to use indexes"
```

#### Skill 3: Leveraging Context

**Provide Context:**
- Share relevant code files
- Include error messages and stack traces
- Reference existing patterns in your codebase
- Mention specific requirements or constraints

**Example:**
```
"Looking at the UserService.ts file I shared, create a similar 
service for Product management that follows the same patterns 
but handles inventory tracking."
```

#### Skill 4: Asking the Right Questions

**Strategic Questions:**
- "What are the trade-offs between X and Y?"
- "How would this scale to 1 million users?"
- "What are potential security concerns?"
- "What's the best approach for [specific scenario]?"

**Example:**
```
Instead of: "Use Redis for caching"
Ask: "What caching strategy would work best for a read-heavy 
application with 10M daily users? Consider Redis, in-memory 
caching, and CDN options."
```

#### Skill 5: Code Review & Quality Assurance

**Review Checklist:**
- ✅ Does it follow coding standards?
- ✅ Are edge cases handled?
- ✅ Is error handling comprehensive?
- ✅ Are there security vulnerabilities?
- ✅ Is the code performant?
- ✅ Is it maintainable and readable?

**Prompt Example:**
```
"Review this code for:
1. Security vulnerabilities
2. Performance bottlenecks
3. Error handling gaps
4. Code quality and maintainability
5. Alignment with our coding standards"
```

---

## Effective Prompting for System Design

### System Design Prompt Templates

#### Template 1: Initial System Design

```
Design a [system name] that:
- Handles [scale requirements: users, requests/sec, data volume]
- Supports [key features: list 3-5 main features]
- Must be [constraints: latency, availability, consistency]
- Uses [technology preferences: optional]
- Deploys on [infrastructure: AWS, GCP, Azure, Vercel, etc.]

Please provide:
1. High-level architecture diagram (ASCII)
2. Database schema design
3. API endpoint specifications
4. Scalability considerations
5. Potential bottlenecks and solutions
```

#### Template 2: Database Design

```
Design a database schema for [use case] that:
- Stores [data types: users, transactions, etc.]
- Handles [read/write patterns: read-heavy, write-heavy, balanced]
- Scales to [data volume: records, size]
- Requires [consistency level: strong, eventual]
- Must support [query patterns: list common queries]

Consider:
- Normalization vs denormalization
- Indexing strategy
- Partitioning/sharding needs
- Caching requirements
```

#### Template 3: API Design

```
Design RESTful APIs for [feature] that:
- Supports [operations: CRUD, search, etc.]
- Handles [authentication: JWT, OAuth, etc.]
- Returns [response format: JSON structure]
- Implements [security: rate limiting, validation, etc.]
- Follows [standards: REST conventions, OpenAPI]

Include:
- Endpoint specifications
- Request/response schemas
- Error handling
- Authentication requirements
- Rate limiting rules
```

#### Template 4: Performance Optimization

```
Analyze and optimize [component/system] for:
- [Current bottleneck: slow queries, high latency, etc.]
- [Target metrics: <200ms response, 10K req/sec, etc.]
- [Constraints: budget, infrastructure, etc.]

Provide:
1. Root cause analysis
2. Multiple optimization strategies
3. Trade-offs for each approach
4. Implementation recommendations
5. Monitoring and measurement plan
```

### Advanced Prompting Techniques

#### Technique 1: Step-by-Step Breakdown

```
Break down [complex task] into steps:
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

For each step, provide:
- Implementation approach
- Code example
- Testing strategy
- Potential issues and solutions
```

#### Technique 2: Comparative Analysis

```
Compare [Option A] vs [Option B] for [use case] considering:
- Performance
- Scalability
- Cost
- Complexity
- Maintenance
- Security

Provide a recommendation with justification.
```

#### Technique 3: Pattern Application

```
Apply the [design pattern: e.g., Repository Pattern, Factory Pattern] 
to refactor [component] to:
- Improve [specific goal: testability, maintainability, etc.]
- Follow [principle: SOLID, DRY, etc.]
- Maintain backward compatibility
- Include comprehensive error handling
```

#### Technique 4: Code Generation with Constraints

```
Generate [component type] that:
- Uses [framework/library: React, Next.js, etc.]
- Follows [coding standards: the 23 rules]
- Implements [pattern: specific design pattern]
- Handles [edge cases: list specific cases]
- Includes [features: accessibility, error handling, etc.]
- Is compatible with [deployment: Vercel, serverless, etc.]

Provide:
- Complete, production-ready code
- TypeScript types
- Error handling
- Comments explaining key decisions
```

---

## Leveraging AI for Architecture Decisions

### Decision-Making Framework

#### Step 1: Problem Definition

**Prompt Structure:**
```
I need to [solve problem] with these requirements:
- Functional: [what it must do]
- Non-functional: [performance, scale, reliability]
- Constraints: [budget, time, team size, existing tech]
- Success criteria: [how to measure success]
```

#### Step 2: Option Generation

**Prompt:**
```
Generate [3-5] architectural approaches for [problem], 
each with:
- High-level design
- Technology stack
- Pros and cons
- Complexity assessment
- Cost estimate (if applicable)
```

#### Step 3: Trade-off Analysis

**Prompt:**
```
Analyze trade-offs between [Option A] and [Option B] for [use case]:
- Performance implications
- Scalability paths
- Operational complexity
- Development time
- Long-term maintenance
- Risk factors
```

#### Step 4: Recommendation

**Prompt:**
```
Based on the analysis, recommend the best approach for [context] 
considering:
- [Priority 1: e.g., time to market]
- [Priority 2: e.g., scalability]
- [Priority 3: e.g., cost]

Justify the recommendation with specific reasoning.
```

### Common Architecture Patterns with Claude

#### Pattern 1: Microservices vs Monolith

**Prompt:**
```
Should I use microservices or monolithic architecture for [project]?
- Team size: [X developers]
- Expected scale: [users, requests]
- Complexity: [simple, moderate, complex]
- Timeline: [aggressive, moderate, flexible]

Provide recommendation with migration path if needed.
```

#### Pattern 2: Database Selection

**Prompt:**
```
Recommend a database solution for [use case] that:
- Handles [data type: structured, unstructured, time-series, etc.]
- Scales to [volume: records, size, growth rate]
- Requires [consistency: strong, eventual]
- Supports [query patterns: complex joins, aggregations, etc.]
- Fits [budget: free tier, managed service, self-hosted]

Consider: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, etc.
```

#### Pattern 3: Caching Strategy

**Prompt:**
```
Design a caching strategy for [application] with:
- Read/write ratio: [X:Y]
- Data access patterns: [hot vs cold data]
- Consistency requirements: [strict, eventual]
- Cache invalidation needs: [real-time, TTL-based, etc.]

Recommend: cache layers, technologies, and implementation approach.
```

### Integration with Coding Standards

#### Applying the 23 Rules with Claude

**Prompt Template:**
```
Create [component/endpoint] following all 23 coding standards:
- Use DaisyUI for styling (Rule 1)
- Create modular components (Rule 2)
- Include documentation (Rule 3)
- Ensure Vercel compatibility (Rule 4)
- Optimize for performance (Rule 5)
- [Continue with relevant rules...]

Verify compliance with each rule in the implementation.
```

#### Code Review with Standards

**Prompt:**
```
Review this code against the 23 coding standards:
[Paste code]

For each rule, indicate:
- ✅ Compliant
- ⚠️ Needs improvement (specify issue)
- ❌ Violation (provide fix)

Provide refactored code addressing all issues.
```

### Best Practices Summary

**1. Be Specific:**
- ✅ "Create a PostgreSQL schema with indexes for user email lookups"
- ❌ "Make a database"

**2. Provide Context:**
- ✅ Share relevant files, error messages, existing patterns
- ❌ Assume Claude knows your codebase

**3. Iterate:**
- ✅ Start simple, refine based on results
- ❌ Try to get perfect code in one prompt

**4. Ask Questions:**
- ✅ "What are the trade-offs?"
- ❌ Accept the first solution without questioning

**5. Verify:**
- ✅ Review generated code for standards compliance
- ❌ Blindly accept all suggestions

**6. Learn:**
- ✅ Ask for explanations of complex concepts
- ❌ Just copy code without understanding

**7. Integrate:**
- ✅ Connect AI suggestions with your existing architecture
- ❌ Treat each response in isolation

### Common Pitfalls to Avoid

**❌ Over-reliance:**
- Don't use Claude as a replacement for understanding
- Always review and understand generated code

**❌ Vague Prompts:**
- Avoid ambiguous requirements
- Be specific about constraints and goals

**❌ Ignoring Context:**
- Don't forget to share relevant code/files
- Reference existing patterns in your codebase

**❌ Skipping Review:**
- Always test and review generated code
- Verify it meets your standards and requirements

**❌ Not Iterating:**
- Don't accept the first response if it's not perfect
- Refine and improve through iteration

### Measuring Success

**Effective AI Collaboration Indicators:**
- ✅ Code quality improves over time
- ✅ Development velocity increases
- ✅ Fewer bugs in production
- ✅ Better architecture decisions
- ✅ Improved code maintainability
- ✅ Team knowledge increases

**Red Flags:**
- ❌ Code quality degrades
- ❌ Increased technical debt
- ❌ Team becomes dependent without learning
- ❌ Architecture becomes inconsistent
- ❌ More bugs despite AI assistance

---

> *"Companies aren't paying six figures for people who can just code. They're paying for architectural decisions, for making systems performant, for optimizing data storage, and for making decisions that affect customers and the software being built."*

**Happy System Designing! 🚀**

