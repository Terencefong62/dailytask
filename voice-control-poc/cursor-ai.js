/**
 * Cursor AI client — real-time recipe variant generation via Cloud Agents API
 */

const CURSOR_KEY_STORAGE = "voice_poc_cursor_api_key";

function getStoredApiKey() {
  return localStorage.getItem(CURSOR_KEY_STORAGE) || "";
}

function setStoredApiKey(key) {
  if (key) localStorage.setItem(CURSOR_KEY_STORAGE, key);
  else localStorage.removeItem(CURSOR_KEY_STORAGE);
}

function getLocale() {
  const lang = document.documentElement.lang || "zh-HK";
  return lang.startsWith("en") ? "en" : "zh-HK";
}

async function checkCursorHealth(apiKey) {
  const headers = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const res = await fetch("/api/health", { headers });
  return res.json();
}

/**
 * Stream variant generation from Cursor AI (SSE).
 * @returns {Promise<object>} parsed recipe variant JSON
 */
function streamRecipeVariant(variant, onEvent) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Cursor API key not set"));
  }

  const locale = getLocale();
  const url = `/api/recipe/variant/stream?variant=${encodeURIComponent(variant)}&locale=${encodeURIComponent(locale)}`;

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
              throw new Error(payload.message || "Cursor AI error");
            }
          }
        }

        reject(new Error("Stream ended without a complete response"));
      })
      .catch(reject);
  });
}

window.CursorAiClient = {
  getStoredApiKey,
  setStoredApiKey,
  checkCursorHealth,
  streamRecipeVariant,
};
