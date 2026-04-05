function resolveProvider(provider) {
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }

  return null;
}

function getProviderSettings(provider) {
  const resolvedProvider = resolveProvider(provider);
  if (!resolvedProvider) {
    return null;
  }

  if (resolvedProvider === "openai") {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    };
  }

  return {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  };
}

async function callLanguageModel({ systemPrompt, userPrompt, maxOutputTokens = 240, provider }) {
  const settings = getProviderSettings(provider);
  if (!settings?.apiKey) {
    return null;
  }

  const response = await fetch(`${settings.baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
      ...(settings.provider === "openrouter"
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
  getProviderSettings,
  resolveProvider,
};
