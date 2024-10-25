"use client";

import { useState } from "react";
import { api } from "~/trpc/react"

export function AIComponent() {
  const [promptDraft, setPromptDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  const { data, isLoading } = api.openai.getStructuredData.useQuery(
    { prompt: submittedPrompt, native_language: "id", foreign_language: "en" },
    { enabled: !!submittedPrompt }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPrompt(promptDraft);
  }

  return (
    <div>
      <div>lol</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={promptDraft}
          onChange={(e) => setPromptDraft(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={isLoading}>
          Get Data
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {data && (
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
