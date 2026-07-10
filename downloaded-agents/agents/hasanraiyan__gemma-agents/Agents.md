# A Practical Guide to Building Tool-Using AI Agents

This guide provides a complete blueprint for building a sophisticated AI agent from scratch. We go beyond simple chatbots by creating an agent that can **reason, use tools, and perform multi-step tasks** within your application.

The core principle is to use a Large Language Model (LLM) as a "reasoning engine" that translates natural language into structured commands your app can execute. This method is incredibly powerful and works even with models that **do not have native "Function Calling" features**, like Gemma.

We will use a real-world **AI Expense Tracker** as our reference implementation.

## The Core Concept: The "Brain" and "Hands" Architecture

An agent is more than a model that talks; it's a system that acts. Our architecture separates the agent into two distinct parts:

*   **🧠 The Brain (The Reasoning Engine):** An LLM (like `gemma-3-27b-it`) whose only job is to analyze a user's request and the conversation history, then decide which tool to use. It outputs its decision as a structured JSON command.

*   **✋ The Hands (The Tool Executor):** The actual code in your application (e.g., JavaScript functions) that performs tasks like reading from a database, writing a file, or calling another API.

### The Agentic Loop

The interaction follows a continuous "Reason-Act-Observe" cycle:

> **User:** "That lunch I added yesterday was actually 120."
>
> 1.  **REASON (Brain):** The LLM receives the request. It thinks, "The user is being ambiguous. I need to find the 'lunch' expense from yesterday first." It outputs the command: `{"tool_name": "listExpenses", "parameters": {"query": "lunch yesterday"}}`
>
> 2.  **ACT (Hands):** Your application's "Executor" receives this command, calls the `listExpenses` function, and gets a result: `[{"id":"456", "amount": 150, "note":"lunch"}]`.
>
> 3.  **OBSERVE (Brain):** The loop continues. The `tool_result` is fed back to the LLM. It now thinks, "Okay, I have the expense. Now I must update it." It outputs the next command: `{"tool_name": "updateExpense", "parameters": {"id": "456", "updates": {"amount": 120}}}`
>
> 4.  **ACT (Hands):** The `updateExpense` function is called, changing the data in your database.
>
> 5.  **REASON & FINISH (Brain):** The success message is fed back. The LLM thinks, "The task is complete. I should inform the user." It outputs the final command: `{"tool_name": "answerUser", "parameters": {"answer": "Done! I've updated the lunch expense to ₹120."}}`. The loop ends.

---

## Step-by-Step Guide to Building Your Agent

### Prerequisites

*   **An API Key:** You need an API key for a capable LLM. This guide is tailored for models accessible via the Google AI API, specifically `gemma-3-27b-it`.
*   **A JavaScript Environment:** A Node.js or React Native (Expo) project.

### Step 1: Define Your Tools (The "Hands")

Before you write any AI code, you must define what your application can do. These are your tools. For our expense tracker, they live in `services/AppFunctions.js`.

**Example Tools:**
*   `addExpense({ amount, category, note })`: Adds a new expense to the database.
*   `listExpenses({ query })`: Searches for expenses matching a text query.
*   `updateExpense({ id, updates })`: Updates a specific expense.
*   `deleteExpenseById({ id })`: Deletes a specific expense.
*   `answerUser({ answer })`: A special tool to give the final response to the user.

```javascript
// File: services/AppFunctions.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// (Your functions for reading and writing to storage would be here)

export const addExpense = async ({ amount, category, note }) => { /* ... */ };
export const listExpenses = async ({ query }) => { /* ... */ };
export const updateExpense = async ({ id, updates }) => { /* ... */ };
export const deleteExpenseById = async ({ id }) => { /* ... */ };
export const answerUser = async ({ answer }) => { return answer; };
```

### Step 2: Build the "Brain" with a Master Prompt

The "Brain" is a single function that calls the LLM with a carefully constructed **master prompt**. This prompt is the agent's constitution. It tells the AI its persona, its tools, its rules, and how to behave.

This is the most critical piece of the entire system.

```javascript
// File: services/aiService.js

import Constants from "expo-constants";
const GEMINI_API_KEY = Constants.expoConfig.extra.GEMINI_API_KEY;

// NOTE: Using the specific model you have access to.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`;

const createMasterPrompt = (history) => {
  const formattedHistory = history.map(turn => { /* ... */ }).join('\n\n');

  return `
// 1. PERSONA: Define what the AI is.
You are an expert financial assistant AI. Your task is to help the user manage their finances by converting their requests into specific JSON commands.

// 2. TOOL DECLARATION: List all available tools and their parameters.
You have access to the following tools:
1.  addExpense: ...
2.  listExpenses: ...
3.  updateExpense: ...
// ... and so on

// 3. RULES & CONSTRAINTS: Define the rules of engagement.
IMPORTANT RULES:
- Your response MUST be a single, valid JSON object.
- For any destructive action like deleting, you MUST first confirm with the user.
- If a user's request is ambiguous, use 'listExpenses' first, then 'clarify'.

// 4. FEW-SHOT EXAMPLES: Show, don't just tell. This is vital for complex tasks.
MULTI-STEP EXAMPLE:
User: "that food expense from yesterday was wrong"
Your Response:
{"tool_name": "listExpenses", "parameters": {"query": "food yesterday"}}
TOOL_RESULT: "[...]"
Your Response:
{"tool_name": "clarify", "parameters": {"question": "I found two... which one?"}}
User: "the second one, it should be 120"
Your Response:
{"tool_name": "updateExpense", "parameters": {"id": "456", "updates": {"amount": 120}}}
TOOL_RESULT: "SUCCESS: ..."
Your Response:
{"tool_name": "answerUser", "parameters": {"answer": "Done! I've updated it."}}

// 5. CONTEXT & QUERY: Provide the history and the final instruction.
---
Here is the conversation history. Analyze it to decide your next step.

${formattedHistory}
---

Now, based on the last user message and the entire history, decide on the next JSON command to execute.

Your Response:
`;
};

export const processUserRequest = async (history) => {
  const prompt = createMasterPrompt(history);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    
    // ... (error handling) ...

    const data = await response.json();
    const aiResponseText = data.candidates[0].content.parts[0].text;
    
    // CRITICAL: This makes the agent resilient. Models like Gemma may wrap
    // their output in markdown. This removes it before parsing.
    const cleanedJsonString = aiResponseText.replace(/```json\n?/, '').replace(/```$/, '');
    
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    // ... (error handling) ...
  }
};
```

### Step 3: Create the Executor (The Agentic Loop)

The Executor is the conductor of the orchestra. It lives in your main UI component (`AgentScreen.js`) and runs the "Reason-Act-Observe" loop.

```javascript
// File: screens/AgentScreen.js (Simplified Logic)
import { processUserRequest } from '../services/aiService';
import * as AppFunctions from '../services/AppFunctions';

// A mapping from the AI's tool names to your actual functions.
const toolMapping = {
  addExpense: AppFunctions.addExpense,
  listExpenses: AppFunctions.listExpenses,
  // ... all other tools
};

const handleUserSubmit = async (userInput) => {
  // 1. Initialize history for this turn
  let currentHistory = [
      ...conversationHistory, // from component state
      { role: 'user', content: userInput }
  ];
  
  const MAX_STEPS = 5; // Safety break
  for (let i = 0; i < MAX_STEPS; i++) {
    
    // 1. REASON: Call the brain with the current history
    const command = await processUserRequest(currentHistory);
    
    // If the AI is done, break the loop
    if (command.tool_name === 'answerUser' || command.tool_name === 'clarify') {
        // Display the final answer/question to the user
        break; 
    }
    
    // 2. ACT: Find the correct tool and execute it
    const toolToCall = toolMapping[command.tool_name];
    const toolResult = await toolToCall(command.parameters);
    
    // 3. OBSERVE: Add the AI's action and the tool's result back to history
    // so the AI has new information for the next loop iteration.
    currentHistory.push({ role: 'ai', content: command });
    currentHistory.push({ role: 'tool', content: toolResult });
  }
  // Update final conversation state
};
```

---

## How to Adapt This For Your Own Project

1.  **Define Your Tools:** Create your own set of functions in a file like `AppFunctions.js`. What are the core actions your app can perform?
2.  **Update the Master Prompt:** In `aiService.js`, replace the persona, tool declarations, and examples with ones that match your application's domain (e.g., a smart home assistant, a calendar manager, etc.). The more relevant your examples, the better the agent will perform.
3.  **Update the Tool Mapping:** In your main component (`AgentScreen.js`), update the `toolMapping` object to connect the AI's tool names to your new functions.

The agentic loop logic itself is generic and should not need significant changes. This architecture allows you to build powerful, multi-step AI agents for virtually any purpose.
