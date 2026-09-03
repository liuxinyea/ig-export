const TASK_KEY = "leadflow.currentTask";
let currentTab = null;
const $ = (selector) => document.querySelector(selector);

async function initialize() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  currentTab = tab;
  const username = usernameFromUrl(tab?.url);
  if (!username) {
    updateStartAvailability();
    return;
  }
  const stored = await chrome.storage.local.get(TASK_KEY);
  renderTask(stored[TASK_KEY], username);
}

$("#start").addEventListener("click", async () => {
  const username = usernameFromUrl(currentTab?.url);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const listType = $("#listType").value;
  const limit = Math.max(1, Number($("#limit").value) || 300);
  const delayMs = Math.max(1000, Number($("#delay").value) || 5000);
  if (mode === "api") {
    const query = new URLSearchParams({ listType, limit: String(limit), delay: String(delayMs) });
    if (username) query.set("source", username);
    await chrome.tabs.create({ url: `workspace.html?${query}` });
    window.close();
    return;
  }
  if (!username || !currentTab?.id) {
    setHint("Browser-assisted mode requires an open public Instagram profile.");
    return;
  }
  try {
    await ensureContentScript(currentTab.id);
    const task = { id: crypto.randomUUID(), status: "starting", reason: null, sourceProfile: username, listType, limit, records: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await chrome.storage.local.set({ [TASK_KEY]: task });
    await chrome.tabs.sendMessage(currentTab.id, { type: "leadflow:browser-collection-start", payload: { taskId: task.id, sourceProfile: username, listType, limit, delayMs } });
    renderTask(task, username);
  } catch (error) { $("#hint").textContent = error.message || "Could not start collection."; }
});

$("#pricing").addEventListener("click", () => chrome.tabs.create({ url: "pricing.html" }));
$("#pause").addEventListener("click", () => controlCollection("pause"));
$("#stop").addEventListener("click", () => controlCollection("stop"));
$("#csv").addEventListener("click", () => exportTask("csv"));
$("#json").addEventListener("click", () => exportTask("json"));
$("#excel").addEventListener("click", () => exportTask("xls"));
$("#clearData").addEventListener("click", clearLocalData);
document.querySelectorAll('input[name="mode"]').forEach((input) => input.addEventListener("change", updateStartAvailability));

async function ensureContentScript(tabId) {
  try { await chrome.tabs.sendMessage(tabId, { type: "leadflow:ping" }); }
  catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tabId, { type: "leadflow:ping" });
  }
}

function usernameFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "www.instagram.com") return "";
    const name = parsed.pathname.split("/").filter(Boolean)[0] || "";
    return /^(accounts|direct|explore|p|reel|stories)$/i.test(name) ? "" : name;
  } catch { return ""; }
}
function updateStartAvailability() {
  const username = usernameFromUrl(currentTab?.url);
  if (username) {
    $("#start").disabled = false;
    return;
  }
  const mode = document.querySelector('input[name="mode"]:checked')?.value;
  const isApiMode = mode === "api";
  $("#start").disabled = !isApiMode;
  $("#pageStatus").textContent = isApiMode ? "Direct API mode is ready" : "Open a public Instagram profile";
  $("#hint").textContent = isApiMode
    ? "Open the API workspace, then enter a public Instagram username or profile URL."
    : "Browser-assisted mode requires an open public Instagram profile.";
}
if (window.layui) {
  layui.use("form", () => {
    initialize();
    layui.form.render();
  });
} else {
  initialize();
}

function renderTask(task, currentUsername) {
  const matchingTask = task?.sourceProfile === currentUsername ? task : null;
  if (!matchingTask) {
    $("#taskActions").hidden = true;
    $("#clearData").hidden = true;
    $("#pageStatus").textContent = `Ready: @${currentUsername}`;
    $("#hint").textContent = "Browser-assisted mode opens the selected list automatically. Keep the tab and list dialog open while it runs.";
    return;
  }
  const count = matchingTask.records?.length || 0;
  $("#clearData").hidden = count === 0;
  $("#taskActions").hidden = !["starting", "running", "paused"].includes(matchingTask.status);
  $("#pageStatus").textContent = `${matchingTask.status} · ${count} collected`;
  $("#pause").textContent = matchingTask.status === "paused" ? "Resume" : "Pause";
  $("#hint").textContent = matchingTask.reason || (matchingTask.status === "running" || matchingTask.status === "starting"
    ? "Collection is running. Do not close the Instagram list dialog."
    : "Open the profile and start a new collection when ready.");
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes[TASK_KEY]) return;
  const username = usernameFromUrl(currentTab?.url);
  if (username) renderTask(changes[TASK_KEY].newValue, username);
});

async function controlCollection(action) {
  const task = (await chrome.storage.local.get(TASK_KEY))[TASK_KEY];
  if (!task?.id) return setHint("There is no local collection to control.");
  try {
    await ensureContentScript(currentTab.id);
    if (action === "pause" && task.status === "paused") {
      await chrome.tabs.sendMessage(currentTab.id, { type: "leadflow:collector-resume" });
    } else {
      await chrome.tabs.sendMessage(currentTab.id, { type: action === "stop" ? "leadflow:collector-stop" : "leadflow:collector-pause" });
    }
  } catch (error) { setHint(error.message || "Could not control the active collection."); }
}

async function exportTask(format) {
  const task = (await chrome.storage.local.get(TASK_KEY))[TASK_KEY];
  const records = task?.records || [];
  if (!records.length) return setHint("No collected records are available to export yet.");
  const columns = ["platform", "sourceProfile", "username", "displayName", "profileUrl", "avatarUrl", "isVerified", "collectedAt"];
  let content; let mimeType; let extension;
  if (format === "json") {
    content = JSON.stringify(records, null, 2); mimeType = "application/json"; extension = "json";
  } else if (format === "xls") {
    const rows = records.map((record) => `<tr>${columns.map((key) => `<td>${htmlCell(record[key])}</td>`).join("")}</tr>`).join("");
    content = `<html><head><meta charset="utf-8"></head><body><table><tr>${columns.map((key) => `<th>${key}</th>`).join("")}</tr>${rows}</table></body></html>`;
    mimeType = "application/vnd.ms-excel"; extension = "xls";
  } else {
    content = [columns.join(","), ...records.map((record) => columns.map((key) => csvCell(record[key])).join(","))].join("\n");
    mimeType = "text/csv;charset=utf-8"; extension = "csv";
  }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  await chrome.downloads.download({ url, filename: `leadflow-${task.sourceProfile}-${new Date().toISOString().slice(0, 10)}.${extension}`, saveAs: true });
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function htmlCell(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function setHint(value) { $("#hint").textContent = value; }

async function clearLocalData() {
  const task = (await chrome.storage.local.get(TASK_KEY))[TASK_KEY];
  if (!task) return;
  if (!confirm(`Clear ${task.records?.length || 0} locally collected records? This cannot be undone.`)) return;
  try {
    if (currentTab?.id && ["starting", "running", "paused"].includes(task.status)) {
      await ensureContentScript(currentTab.id);
      await chrome.tabs.sendMessage(currentTab.id, { type: "leadflow:collector-stop" });
    }
  } catch { /* Clear data even if the original tab was closed. */ }
  await chrome.storage.local.remove(TASK_KEY);
  renderTask(null, usernameFromUrl(currentTab?.url));
}
