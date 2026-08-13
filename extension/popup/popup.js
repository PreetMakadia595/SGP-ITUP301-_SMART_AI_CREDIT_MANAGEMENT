document.addEventListener("DOMContentLoaded", () => {
  const backendUrlInput = document.getElementById("backendUrl");
  const jwtTokenInput = document.getElementById("jwtToken");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");
  const lastEventContainer = document.getElementById("lastEventContainer");

  // Load saved credentials
  chrome.storage.local.get(["token", "backendUrl", "lastEvent"], (data) => {
    if (data.backendUrl) backendUrlInput.value = data.backendUrl;
    if (data.token) jwtTokenInput.value = data.token;
    if (data.lastEvent) {
      renderLastEvent(data.lastEvent);
    }
  });

  saveBtn.addEventListener("click", () => {
    const token = jwtTokenInput.value.trim();
    const backendUrl = backendUrlInput.value.trim();

    if (!token) {
      showStatus("Please paste a valid JWT access token.", "error");
      return;
    }

    chrome.storage.local.set({ token, backendUrl }, () => {
      showStatus("Credentials saved successfully!", "success");
    });
  });

  function showStatus(text, type) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${type}`;
    setTimeout(() => {
      statusMsg.textContent = "";
    }, 4000);
  }

  function renderLastEvent(ev) {
    lastEventContainer.innerHTML = `
      <div style="color: #38bdf8; font-weight: 600;">${ev.platform.toUpperCase()}</div>
      <div>Model: <span style="color: #e2e8f0;">${ev.model}</span></div>
      <div>Prompts: <span style="color: #a7f3d0;">${ev.prompt_count}</span> | Duration: ${ev.duration_seconds}s</div>
      <div style="font-size: 9px; color: #64748b; margin-top: 4px;">Synced at ${new Date(ev.timestamp).toLocaleTimeString()}</div>
    `;
  }
});
