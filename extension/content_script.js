/**
 * Content Script — Smart AI Credit Advisor Extension
 * Tracks session duration, model names, prompt counts, and URL metadata.
 * PRIVACY GUARANTEE: Does NOT collect prompt text contents.
 *
 * Extension Context Invalidation: When the extension is reloaded while a tab
 * is open, any subsequent chrome API call throws "Extension context invalidated".
 * We use a module-level flag `isContextValid` to stop all activity the moment
 * that error is detected, without rethrowing or logging.
 */

(function () {
  // Fast-exit if chrome APIs are not available at all
  if (typeof chrome === "undefined" || !chrome.runtime) return;

  let isContextValid = true; // becomes false the moment context is invalidated

  /**
   * Safe wrapper for chrome.runtime.sendMessage.
   * Returns false if the context is already invalid.
   */
  function safeSendMessage(message, callback) {
    if (!isContextValid) return;
    try {
      chrome.runtime.sendMessage(message, function (response) {
        // Accessing chrome.runtime.lastError acknowledges the error
        // and prevents Chrome from logging an unhandled error.
        const err = chrome.runtime && chrome.runtime.lastError;
        if (err) {
          // Detect context invalidation from inside the callback
          if (err.message && err.message.includes("context invalidated")) {
            isContextValid = false;
          }
          // Other errors (e.g. "Receiving end does not exist") are silent — no background listener active yet
          return;
        }
        if (callback) callback(response);
      });
    } catch (e) {
      // chrome.runtime.sendMessage throws synchronously when context is invalidated
      if (e && e.message && e.message.includes("context invalidated")) {
        isContextValid = false;
      }
      // All other errors silently ignored
    }
  }

  // ─── Platform Detection ───────────────────────────────────────────────────

  const hostname = window.location.hostname;
  let platform = "unknown";

  if (hostname.includes("chatgpt.com"))       platform = "chatgpt";
  else if (hostname.includes("claude.ai"))    platform = "claude";
  else if (hostname.includes("gemini.google.com")) platform = "gemini";
  else if (hostname.includes("perplexity.ai")) platform = "perplexity";
  else if (hostname.includes("cursor.com"))   platform = "cursor";
  else if (hostname.includes("bolt.new"))     platform = "bolt";
  else if (hostname.includes("lovable.dev"))  platform = "lovable";

  if (platform === "unknown") return;

  console.log("[AI Credit Advisor] Tracking active on", hostname);

  let sessionStart   = Date.now();
  let promptCount    = 0;
  let currentModel   = "Default Model";

  // ─── Model Detection from DOM ─────────────────────────────────────────────

  function detectModel() {
    try {
      if (platform === "chatgpt") {
        const el = document.querySelector('[data-testid="model-selector-button"]')
                || document.querySelector('.text-token-text-secondary');
        currentModel = (el && el.innerText) ? el.innerText.trim() : "GPT-4o";

      } else if (platform === "claude") {
        const el = document.querySelector('[data-testid="model-selector"]')
                || document.querySelector('button[aria-haspopup="menu"]');
        currentModel = (el && el.innerText) ? el.innerText.trim() : "Claude 3.5 Sonnet";

      } else if (platform === "gemini") {
        const el = document.querySelector('.model-select-button')
                || document.querySelector('.mat-mdc-select-value-text');
        currentModel = (el && el.innerText) ? el.innerText.trim() : "Gemini 1.5 Pro";

      } else if (platform === "perplexity") {
        const el = document.querySelector('.font-sans.font-medium')
                || document.querySelector('[aria-label="Model"]');
        currentModel = (el && el.innerText) ? el.innerText.trim() : "Sonar Pro";

      } else if (platform === "cursor")  { currentModel = "Cursor AI Composer";
      } else if (platform === "bolt")    { currentModel = "Bolt StackBlitz Agent";
      } else if (platform === "lovable") { currentModel = "Lovable AI Architect";
      }
    } catch (_) {
      currentModel = platform.toUpperCase() + " Model";
    }
  }

  detectModel();
  setInterval(detectModel, 5000);

  // ─── Send Telemetry ───────────────────────────────────────────────────────

  function sendUsageTelemetry() {
    if (!isContextValid) return;

    const payload = {
      platform:         platform,
      model:            currentModel || (platform + " Model"),
      duration_seconds: Math.max(5, Math.floor((Date.now() - sessionStart) / 1000)),
      prompt_count:     Math.max(1, promptCount),
      website_url:      window.location.href,
      timestamp:        new Date().toISOString(),
    };

    safeSendMessage({ action: "INGEST_EVENT", payload });
  }

  // ─── Prompt Counting Listeners ────────────────────────────────────────────

  // Detect Enter key in chat textareas (ChatGPT, Claude, etc.)
  document.addEventListener("keydown", function (e) {
    if (!isContextValid) return;
    if (e.key === "Enter" && !e.shiftKey) {
      const t = e.target;
      if (t && (t.tagName === "TEXTAREA" || t.getAttribute("contenteditable") === "true")) {
        promptCount++;
        sendUsageTelemetry();
      }
    }
  }, true);

  // Detect Send/Submit button clicks
  document.addEventListener("click", function (e) {
    if (!isContextValid) return;
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;
    const aria   = (btn.getAttribute("aria-label")   || "").toLowerCase();
    const testId = (btn.getAttribute("data-testid")  || "").toLowerCase();
    if (aria.includes("send") || testId.includes("send") || aria.includes("submit")) {
      promptCount++;
      sendUsageTelemetry();
    }
  }, true);

  // ─── Periodic Heartbeat (every 60 s) ─────────────────────────────────────

  setInterval(function () {
    if (isContextValid && promptCount > 0) {
      sendUsageTelemetry();
    }
  }, 60000);

})();
