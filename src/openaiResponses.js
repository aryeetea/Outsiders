const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export const DEFAULT_OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-5-mini";

function getErrorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  return data.error?.message || fallback;
}

function extractTextFromOutput(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputItems = Array.isArray(data?.output) ? data.output : [];
  const textParts = outputItems.flatMap((item) => {
    const contentItems = Array.isArray(item?.content) ? item.content : [];
    return contentItems
      .map((content) => {
        if (typeof content?.text === "string") return content.text;
        if (typeof content?.output_text === "string") return content.output_text;
        return "";
      })
      .filter(Boolean);
  });

  return textParts.join("\n").trim();
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
    text: extractTextFromOutput(data) || "I couldn't generate a text reply for that request.",
  };
}
