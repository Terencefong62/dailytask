/**
 * AI client — ChatGPT (OpenAI) or Cursor Cloud Agents for recipe variants
 */

const OPENAI_KEY_STORAGE = "voice_poc_openai_api_key";
const CURSOR_KEY_STORAGE = "voice_poc_cursor_api_key";
const PROVIDER_STORAGE = "voice_poc_ai_provider";

function getProvider() {
  return localStorage.getItem(PROVIDER_STORAGE) || "openai";
}

function setProvider(provider) {
  localStorage.setItem(PROVIDER_STORAGE, provider);
}

function getStoredApiKey(provider = getProvider()) {
  const key =
    provider === "cursor"
      ? localStorage.getItem(CURSOR_KEY_STORAGE)
      : localStorage.getItem(OPENAI_KEY_STORAGE);
  return key || "";
}

function setStoredApiKey(provider, key) {
  const storage =
    provider === "cursor" ? CURSOR_KEY_STORAGE : OPENAI_KEY_STORAGE;
  if (key) localStorage.setItem(storage, key);
  else localStorage.removeItem(storage);
}

function getLocale() {
  const lang = document.documentElement.lang || "zh-HK";
  return lang.startsWith("en") ? "en" : "zh-HK";
}

async function checkHealth(provider = getProvider(), apiKey = getStoredApiKey(provider)) {
  const headers = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const res = await fetch(`/api/health?provider=${encodeURIComponent(provider)}`, {
    headers,
  });
  return res.json();
}

function streamRecipeVariant(variant, onEvent, provider = getProvider()) {
  const apiKey = getStoredApiKey(provider);
  if (!apiKey) {
    const label = provider === "cursor" ? "Cursor" : "OpenAI";
    return Promise.reject(new Error(`${label} API key not set`));
  }

  const locale = getLocale();
  const url = `/api/recipe/variant/stream?variant=${encodeURIComponent(variant)}&locale=${encodeURIComponent(locale)}&provider=${encodeURIComponent(provider)}`;

  return new Promise((resolve, reject) => {
    fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || `Request failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = JSON.parse(line.slice(5).trim());
            if (onEvent) onEvent(payload);

            if (payload.type === "complete") {
              resolve(payload.data);
              return;
            }
            if (payload.type === "error") {
              throw new Error(payload.message || "AI generation error");
            }
          }
        }

        reject(new Error("Stream ended without a complete response"));
      })
      .catch(reject);
  });
}

window.AiClient = {
  getProvider,
  setProvider,
  getStoredApiKey,
  setStoredApiKey,
  checkHealth,
  streamRecipeVariant,
};

// Backward compatibility
window.CursorAiClient = {
  getStoredApiKey: () => getStoredApiKey("cursor"),
  setStoredApiKey: (key) => setStoredApiKey("cursor", key),
  checkCursorHealth: (key) => checkHealth("cursor", key),
  streamRecipeVariant: (variant, onEvent) => streamRecipeVariant(variant, onEvent, "cursor"),
};
