"use client";

import { FormEvent, useState } from "react";

type AgentSource = {
  source?: string;
  dog?: string;
  area?: string;
};

type AgentResponse = {
  answer?: string;
  suggestions?: string[];
  sources?: AgentSource[];
  error?: string;
};

const suggestedQuestions = [
  "Which dogs are in Faculty Housing?",
  "Tell me about Motu",
  "What should I do if a dog is hurt?"
];

export function DogAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sources, setSources] = useState<AgentSource[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function askAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setIsLoading(true);
    setError("");
    setAnswer("");
    setSuggestions([]);
    setSources([]);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion })
      });
      const data = (await response.json()) as AgentResponse;
      if (!response.ok) throw new Error(data.error ?? "The assistant could not answer right now.");
      setAnswer(data.answer ?? "I could not find an answer in the campus records.");
      setSuggestions(data.suggestions ?? []);
      setSources(data.sources ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="assistant-panel" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div>
          <p className="eyebrow">Campus guide</p>
          <h2 id="assistant-title">Ask the pack.</h2>
        </div>
        <span className="assistant-status"><i /> grounded in dog profiles</span>
      </div>
      <p className="assistant-intro">Find a dog, learn how to say hello, or get the right contact when something feels wrong.</p>
      <div className="assistant-suggestions" aria-label="Suggested questions">
        {suggestedQuestions.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => setQuestion(suggestion)}>{suggestion}</button>
        ))}
      </div>
      <form className="assistant-form" onSubmit={askAgent}>
        <label className="sr-only" htmlFor="dog-question">Ask about the IIMU dogs</label>
        <input
          id="dog-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about a dog or campus area..."
          maxLength={500}
        />
        <button type="submit" disabled={isLoading || !question.trim()}>{isLoading ? "Thinking..." : "Ask"}<span>↗</span></button>
      </form>
      {(answer || error) && (
        <div className={error ? "assistant-result has-error" : "assistant-result"} aria-live="polite">
          <p>{error || answer}</p>
          {!error && sources.length > 0 && (
            <div className="assistant-sources">
              <span>Sources</span>
              {sources.map((source, index) => (
                <span key={`${source.source}-${source.dog}-${index}`}>{source.dog ?? source.source}</span>
              ))}
            </div>
          )}
          {!error && suggestions.length > 0 && (
            <div className="assistant-followups">
              <span>Try next</span>
              {suggestions.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => setQuestion(suggestion)}>{suggestion}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
