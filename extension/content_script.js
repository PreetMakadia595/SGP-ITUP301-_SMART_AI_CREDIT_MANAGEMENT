/**
 * Content Script — Smart AI Credit Advisor Extension
 * Tracks session duration, model names, prompt counts, and URL metadata.
 * PRIVACY GUARANTEE: Does NOT collect prompt text contents.
 */

(function () {
  console.log("[AI Credit Advisor] Content script initialized on", window.location.hostname);

  let sessionStart = Date.now();
  let promptCount = 0;
  let currentModel = "Default Model";

  // Identify Platform
  const hostname = window.location.hostname;
  let platform = "unknown";

  if (hostname.includes("chatgpt.com")) platform = "chatgpt";
  else if (hostname.includes("claude.ai")) platform = "claude";
  else if (hostname.includes("gemini.google.com")) platform = "gemini";
  else if (hostname.includes("perplexity.ai")) platform = "perplexity";
  else if (hostname.includes("cursor.com")) platform = "cursor";
  else if (hostname.includes("bolt.new")) platform = "bolt";
  else if (hostname.includes("lovable.dev")) platform = "lovable";

  if (platform === "unknown") return;

  // Detect Model from DOM
  function detectModel() {
    try {
      if (platform === "chatgpt") {
        const modelBtn = document.querySelector('[data-testid="model-selector-button"]') || document.querySelector('.text-token-text-secondary');
        if (modelBtn) currentModel = modelBtn.innerText.trim();
        else currentModel = "GPT-4o";
      } else if (platform === "claude") {
        const claudeModel = document.querySelector('[data-testid="model-selector"]') || document.querySelector('button[aria-haspopup="menu"]');
        if (claudeModel) currentModel = claudeModel.innerText.trim();
        else currentModel = "Claude 3.5 Sonnet";
      } else if (platform === "gemini") {
        const geminiBadge = document.querySelector('.model-select-button') || document.querySelector('.mat-mdc-select-value-text');
        if (geminiBadge) currentModel = geminiBadge.innerText.trim();
        else currentModel = "Gemini 1.5 Pro";
      } else if (platform === "perplexity") {
        const perplexityModel = document.querySelector('.font-sans.font-medium') || document.querySelector('[aria-label="Model"]');
        if (perplexityModel) currentModel = perplexityModel.innerText.trim();
        else currentModel = "Sonar Pro";
      } else if (platform === "cursor") {
        currentModel = "Cursor AI Composer";
      } else if (platform === "bolt") {
        currentModel = "Bolt StackBlitz Agent";
      } else if (platform === "lovable") {
        currentModel = "Lovable AI Architect";
      }
    } catch (e) {
      currentModel = `${platform.toUpperCase()} Model`;
    }
  }

  detectModel();
  setInterval(detectModel, 5000);

  // Prompt Counting Listener
  function attachPromptListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const target = e.target;
        if (target && (target.tagName === "TEXTAREA" || target.getAttribute("contenteditable") === "true")) {
          // Increment prompt counter without capturing text
          promptCount++;
          sendUsageTelemetry();
        }
      }
    }, true);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) {
        const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
        const testId = (btn.getAttribute("data-testid") || "").toLowerCase();
        if (aria.includes("send") || testId.includes("send") || aria.includes("submit")) {
          promptCount++;
          sendUsageTelemetry();
        }
      }
    }, true);
  }

  attachPromptListeners();

  // Send Usage Event to Service Worker
  function sendUsageTelemetry() {
    const durationSeconds = Math.max(5, Math.floor((Date.now() - sessionStart) / 1000));
    const payload = {
      platform: platform,
      model: currentModel || `${platform} Model`,
      duration_seconds: durationSeconds,
      prompt_count: Math.max(1, promptCount),
      website_url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    chrome.runtime.sendMessage({
      action: "INGEST_EVENT",
      payload: payload,
    });
  }

  // Periodic heartbeat every 60 seconds
  setInterval(() => {
    if (promptCount > 0) {
      sendUsageTelemetry();
    }
  }, 60000);
})();
