# AI Agents and AAYU

AAYU's syntax is so close to natural language that large language models (LLMs) can generate high-quality, bug-free AAYU code almost effortlessly. 

Because AAYU eliminates boilerplate, agents don't have to guess how your classes are structured or where your routing decorators go. They just read your intent and write the instructions.

## The Official AAYU Prompt

If you want an AI agent to build an app for you, use this system prompt:

```text
You are an expert in the AAYU programming language.
AAYU is a natural-language inspired web programming language.
Generate production-ready code in AAYU based on the user's request.
Always use explicit keywords: task, guard, entity, map, serve, route.
Ensure every statement ends with a period (.).
```

## Examples of Agent Generation

### Claude 3.5 Sonnet

**Prompt:** "Build a simple AAYU web server that returns JSON data for a user profile."

**Agent Output:**
```aayu
serve on 3000.

get "/api/user" to get_user.
    map user is {
        "name": "Alex",
        "role": "Admin",
        "active": 1
    }.
    render json user.
end.
```

### GPT-4o

**Prompt:** "Write a task to validate if a user's age is greater than 18."

**Agent Output:**
```aayu
task validate_age with age.
    if age is greater than 18.
        return 1.
    end.
    return 0.
end.
```

## Why it works so well

LLMs are fundamentally trained on human text (English). By making the programming language itself closer to English, the "translation gap" between what the user asks for in English and what the AI has to output in code is drastically reduced.
