/**
 * Service Worker — Smart AI Credit Advisor Extension
 * Handles JWT authentication, batch queueing, and POSTing usage events to backend.
 */

const DEFAULT_BACKEND_URL = "http://localhost:8000/api/v1";

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INGEST_EVENT") {
    handleIngestEvent(request.payload)
      .then((res) => sendResponse({ success: true, data: res }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === "GET_STATUS") {
    chrome.storage.local.get(["token", "backendUrl", "lastEvent"], (data) => {
      sendResponse({
        tokenAvailable: Boolean(data.token),
        backendUrl: data.backendUrl || DEFAULT_BACKEND_URL,
        lastEvent: data.lastEvent || null,
      });
    });
    return true;
  }
});

async function handleIngestEvent(payload) {
  const { token, backendUrl } = await getStorageData(["token", "backendUrl"]);
  if (!token) {
    console.warn("[AI Advisor Extension] Event skipped: No JWT token configured in popup.");
    return { status: "unauthenticated", message: "Token missing" };
  }

  const baseUrl = backendUrl || DEFAULT_BACKEND_URL;
  const endpoint = `${baseUrl}/ingestion/extension-event`;

  console.log(`[AI Advisor Extension] Ingesting telemetry to ${endpoint}:`, payload);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const result = await response.json();
  chrome.storage.local.set({ lastEvent: { ...payload, timestamp: new Date().toISOString() } });
  return result;
}

function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res) => resolve(res));
  });
}
