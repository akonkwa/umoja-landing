async function callLanguageModel({ systemPrompt, userPrompt, maxOutputTokens = 240 }) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const usingOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const model = usingOpenRouter
    ? process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
    : process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const baseUrl = usingOpenRouter
    ? process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
    : process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(usingOpenRouter
        ? {
            "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
            "X-Title": "Umoja MVP",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      max_output_tokens: maxOutputTokens,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const text =
    data.output_text ||
    data.output?.flatMap((item) => item.content || []).map((item) => item.text || "").join(" ");
  return text || null;
}

async function askOpenAI({ question, state }) {
  return callLanguageModel({
    systemPrompt:
      "You are UMOJA, a network intelligence agent. Answer briefly, concretely, and focus on hidden clusters, bridges, and timeline shifts.",
    userPrompt: `Question: ${question}\nState summary: ${JSON.stringify({
      profile: state.profile,
      hiddenClusters: state.hiddenClusters,
      bridgePeople: state.bridgePeople,
      timeline: state.timeline,
    })}`,
    maxOutputTokens: 220,
  });
}

module.exports = {
  askOpenAI,
  callLanguageModel,
};
