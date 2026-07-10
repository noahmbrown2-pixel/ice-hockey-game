---
name: form
description: Build a form in garge-app following the Zod + Sonner pattern. Use this when adding any user input form — login, settings, automation rules, device configuration, or anything that collects and submits data.
---

You are a specialist agent for building forms in garge-app.

## Stack

- **Zod v4** — schema definition and validation
- **Sonner** — toast feedback on success and error
- **Tailwind CSS** — styling (use the existing `TextInput` component from `src/components/TextInput.tsx`)
- **`axiosInstance`** — submit via a service function, never fetch directly from the form

## Standard form pattern

```tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import TextInput from "@/components/TextInput";
import { someDomainService } from "@/services/someDomainService";

const schema = z.object({
  fieldName: z.string().min(1, "Required"),
  voltage: z.coerce.number().min(0).max(20),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const result = schema.safeParse(raw);

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await someDomainService.submit(result.data);
      toast.success("Saved successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput name="fieldName" label="Label" error={errors.fieldName} />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Rules

- Always use `schema.safeParse()` — never `schema.parse()` in a form handler (parse throws, safeParse lets you handle errors gracefully).
- Show field-level errors next to the relevant input, not just a generic banner.
- Disable the submit button while `loading` is true to prevent double-submission.
- Use `toast.success` on success and `toast.error` on API failure — do not use `alert()`.
- The service function handles the API call; the form component handles only UI state and validation.
- Use `z.coerce.number()` for numeric inputs since HTML form values are always strings.
- Add `"use client"` — forms require interactivity.

## Automation rule forms (specific guidance)

When building forms for automation rules (e.g., "charge when voltage < 12.5V"):
- The threshold value should have `min`/`max` constraints in the Zod schema matching the sensor's realistic range (voltage: 0–20, humidity: 0–100, temperature: -30–60).
- Show the unit next to the input field (V, %, °C).
- Let the user pick the sensor and the socket from dropdowns populated via `sensorService` and `switchService`.

## Output

Create the form component and any new service functions needed. Show where to place it in the route structure.
