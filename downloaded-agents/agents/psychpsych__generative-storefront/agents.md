# AGENTS.md  
**Project:** Emotion & Intuition Shopping Agent – PoC/MVP  
**Repository root:** `/`  
**Date:** 2025‑11‑05  
**Author:** Barış / AI Director  
**Version:** 0.1

---

## 1. Project Overview  
This project aims to build a **minimal viable product (MVP)** for an AI-driven shopping assistant that interprets user intent (emotion, mood, or context) and returns personalized product suggestions. The system uses the **ChatGPT API** to process natural language input and generate intuitive recommendations.

The MVP demonstrates the feasibility of using AI to transform a static shopping experience into a more emotional and intuitive journey.

---

## 2. Goals & Success Criteria  
### Goals  
- Prompt the user with a friendly intent question (e.g., *"What are you shopping for today?"*)  
- Analyze the user's emotional intent using ChatGPT  
- Generate 3–5 dynamic product suggestions with images, titles, and short copy  
- Store minimal user preferences (intent, previous interactions) in a Supabase DB  
- Deliver an aesthetically clean, mobile-first UI  

### Success Metrics  
- Prompt response rate > 60%  
- Suggestion click-through rate (CTR) > 20%  
- Repeat visit rate > 25%  
- Response latency < 2s for LLM requests  

---

## 3. MVP Scope  
### In-Scope  
- One input interface for user intent  
- ChatGPT API integration for interpreting text  
- Recommendation cards generated from intent  
- Basic memory using Supabase (user ID + last intent)  
- Lightweight analytics (intent count, CTR)  
- Basic responsive layout in **Next.js**

### Out of Scope  
- Advanced emotion detection (camera/audio)  
- AR/VR try-on features  
- Social media integrations  
- Multi-language support (for later phases)

---

## 4. Technology Stack  
| Layer | Technology |
|--------|-------------|
| **Frontend** | Next.js (React, TypeScript) |
| **Backend** | Node.js (API Routes) |
| **Database** | Supabase (PostgreSQL) |
| **AI API** | OpenAI ChatGPT API |
| **Deployment** | Vercel |
| **Analytics** | Supabase logging + optional Segment |

---

## 5. ChatGPT Integration Example  
```ts
// /pages/api/intent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { intent } = req.body;

    const prompt = `You are a personal shopping assistant. The user says: "${intent}".\nGenerate a JSON with 3 product ideas including title, description, and category.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const result = completion.choices[0].message?.content;
    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
```

---

## 6. User Flow  
1. **User visits** the landing page.  
2. Agent asks: *"What are you shopping for today?"*  
3. User types something like *"a cozy outfit for a rainy evening"*.  
4. Backend sends this text to **ChatGPT API**, receives structured JSON suggestions.  
5. Suggestions are displayed as product cards with titles, short copy, and images.  
6. User clicks one; event logged in Supabase.  
7. On the next visit, the system recalls last intent and suggests similar ideas.

---

## 7. Architecture  
```text
Next.js (Frontend)
   ├─ pages/index.tsx → input UI
   ├─ pages/results.tsx → suggestion cards
   └─ /api/intent.ts → connects to ChatGPT API

Supabase (Backend DB)
   ├─ users
   ├─ intents
   ├─ clicks

ChatGPT API (LLM)
   └─ Receives user intent → returns product ideas in JSON
```

---

## 8. Data Model  
| Table | Columns |
|--------|----------|
| **users** | id, created_at |
| **intents** | id, user_id, text, timestamp |
| **suggestions** | id, intent_id, json_data |
| **clicks** | id, suggestion_id, timestamp |

---

## 9. Security & Privacy  
- API keys stored securely via `.env.local`  
- Only minimal personal data (anonymous ID) stored  
- Data retention policy: clear intents every 30 days  
- Compliant with **KVKK** / **GDPR** guidelines  

---

## 10. Metrics Tracked  
- Number of intents submitted  
- Average response time  
- CTR per suggestion  
- Repeat session frequency  

---

## 11. Roadmap  
| Week | Milestone |
|------|------------|
| 1 | Setup repo, initialize Next.js + Supabase |
| 2 | Integrate ChatGPT API + test response quality |
| 3 | Build suggestion UI, add event logging |
| 4 | Implement analytics dashboard |
| 5 | Internal demo and feedback round |

---

## 12. Future Enhancements  
- Voice-based intent capture  
- AI-driven visuals (product in environment)  
- Sentiment-based personalization  
- Cross-channel user profiles (mobile/web)  

---

## 13. Risks & Mitigations  
| Risk | Mitigation |
|------|-------------|
| Ambiguous intent text | Provide fallback options (mood-based) |
| LLM irrelevant results | Add brand/voice constraints to prompt |
| API latency | Cache popular intents locally |
| Data privacy | Anonymize all stored user data |

---

## 14. Next Steps  
- [ ] Finalize schema in Supabase  
- [ ] Set up ChatGPT API key and `.env`  
- [ ] Test prompt quality and refine output structure  
- [ ] Deploy MVP on Vercel  
- [ ] Collect metrics and evaluate UX feedback  

---

**End of AGENTS.md**

