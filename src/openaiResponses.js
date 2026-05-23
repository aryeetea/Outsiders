const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export const DEFAULT_OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-5-mini";

function getErrorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  return data.error?.message || fallback;
}

export async function createOpenAIResponse({
  apiKey,
  model = DEFAULT_OPENAI_MODEL,
  instructions,
  input,
  previousResponseId,
}) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      previous_response_id: previousResponseId || undefined,
      reasoning: { effort: "low" },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "The AI request did not complete."));
  }

  return {
    id: data.id,
    text: data.output_text || "I couldn't generate a text reply for that request.",
  };
}
