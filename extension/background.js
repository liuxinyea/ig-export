const CURRENT_TASK_KEY = "leadflow.currentTask";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "leadflow:open-workspace") {
    chrome.tabs.create({ url: "workspace.html" });
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:collector-batch") {
    persistBatch(message.payload).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === "leadflow:collector-status") {
    updateTaskStatus(message.payload).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === "leadflow:avatar-fetch") {
    fetchAvatarDataUrl(message.url).then(sendResponse);
    return true;
  }
});

async function fetchAvatarDataUrl(url) {
  if (!isInstagramAvatarUrl(url)) return { ok: false, error: "Unsupported avatar host" };
  try {
    const response = await fetch(url, { credentials: "omit" });
    const type = response.headers.get("content-type") || "";
    if (!response.ok || !type.startsWith("image/")) return { ok: false, error: `Avatar request failed (${response.status})` };
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return { ok: true, dataUrl: `data:${type};base64,${btoa(binary)}` };
  } catch (error) {
    return { ok: false, error: error.message || "Avatar request failed" };
  }
}

function isInstagramAvatarUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname.endsWith(".cdninstagram.com") || url.hostname.endsWith(".fbcdn.net"));
  } catch {
    return false;
  }
}

async function persistBatch({ taskId, records, sourceProfile }) {
  const stored = await chrome.storage.local.get(CURRENT_TASK_KEY);
  const task = stored[CURRENT_TASK_KEY];
  if (!task || task.id !== taskId) return;

  const seen = new Set(task.records.map((record) => record.username));
  const additions = records.filter((record) => record.username && !seen.has(record.username));
  if (!additions.length) return;

  task.records.push(...additions.map((record) => ({
    ...record,
    platform: "instagram",
    sourceProfile,
    collectedAt: new Date().toISOString()
  })));
  task.updatedAt = new Date().toISOString();
  await chrome.storage.local.set({ [CURRENT_TASK_KEY]: task });
}

async function updateTaskStatus({ taskId, status, reason, reasonKey, reasonParams }) {
  const stored = await chrome.storage.local.get(CURRENT_TASK_KEY);
  const task = stored[CURRENT_TASK_KEY];
  if (!task || task.id !== taskId) return;
  task.status = status;
  task.reason = reason || null;
  task.reasonKey = reasonKey || null;
  task.reasonParams = reasonParams || {};
  task.updatedAt = new Date().toISOString();
  await chrome.storage.local.set({ [CURRENT_TASK_KEY]: task });
}
