const TASK_KEY = "free-ig-export.currentTask";
const $ = (selector) => document.querySelector(selector);

async function getTask() {
  const value = await chrome.storage.local.get(TASK_KEY);
  return value[TASK_KEY] || null;
}

async function render(task) {
  if (typeof task === "undefined") task = await getTask();
  const records = task?.records || [];
  $("#count").textContent = records.length;
  $("#taskSource").textContent = task?.sourceProfile || "—";
  $("#updated").textContent = task?.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : "—";
  $("#status").textContent = task ? `${task.status || "running"} · ${records.length} leads` : "No active task";
  $("#reason").textContent = task?.reason || (task ? "Collection is running in the active Instagram tab." : "No task has started.");
  $("#rows").innerHTML = records.length ? records.map((record) => `<tr><td>@${escapeHtml(record.username)}</td><td>${escapeHtml(record.displayName || "—")}</td><td><a href="${escapeAttr(record.profileUrl)}" target="_blank">Open</a></td><td>${record.isVerified ? "Yes" : "—"}</td><td>${new Date(record.collectedAt).toLocaleString()}</td></tr>`).join("") : '<tr><td colspan="5" class="empty">No local records yet.</td></tr>';
}

async function getInstagramTab() {
  const tabs = await chrome.tabs.query({ url: "https://www.instagram.com/*" });
  const tab = tabs.sort((left, right) => (right.lastAccessed || 0) - (left.lastAccessed || 0))[0];
  if (!tab?.id) throw new Error("Open Instagram and the target Followers or Following dialog first.");
  return tab;
}

async function ensureCollector(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "free-ig-export:ping" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
}

$("#useCurrent").addEventListener("click", async () => {
  try {
    const tab = await getInstagramTab();
    await ensureCollector(tab.id);
    const response = await chrome.tabs.sendMessage(tab.id, { type: "free-ig-export:scan-profile" });
    $("#source").value = response?.profile?.profileUrl || tab.url;
  } catch (error) { alert(error.message); }
});

$("#start").addEventListener("click", async () => {
  try {
    const tab = await getInstagramTab();
    await ensureCollector(tab.id);
    const source = $("#source").value.trim() || tab.url;
    const task = { id: crypto.randomUUID(), status: "running", reason: null, sourceProfile: source, listType: $("#listType").value, limit: Number($("#limit").value), records: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await chrome.storage.local.set({ [TASK_KEY]: task });
    await chrome.tabs.sendMessage(tab.id, { type: "free-ig-export:collector-start", payload: { taskId: task.id, sourceProfile: source, limit: task.limit, delayMs: 2500 } });
    await render(task);
  } catch (error) { alert(error.message); }
});

$("#pause").addEventListener("click", async () => {
  try { const tab = await getInstagramTab(); await ensureCollector(tab.id); await chrome.tabs.sendMessage(tab.id, { type: "free-ig-export:collector-stop" }); } catch (error) { alert(error.message); }
});

$("#clear").addEventListener("click", async () => { if (confirm("Remove the current local task and its records?")) { await chrome.storage.local.remove(TASK_KEY); render(null); } });
$("#csv").addEventListener("click", () => exportFile("csv"));
$("#json").addEventListener("click", () => exportFile("json"));

async function exportFile(format) {
  const task = await getTask(); const records = task?.records || [];
  if (!records.length) return alert("There are no local records to export yet.");
  let content; let type; let suffix;
  if (format === "json") { content = JSON.stringify(records, null, 2); type = "application/json"; suffix = "json"; }
  else { const columns = ["platform", "sourceProfile", "username", "displayName", "profileUrl", "avatarUrl", "isVerified", "collectedAt"]; content = [columns.join(","), ...records.map((record) => columns.map((key) => csvCell(record[key])).join(","))].join("\n"); type = "text/csv;charset=utf-8"; suffix = "csv"; }
  const url = URL.createObjectURL(new Blob([content], { type }));
  await chrome.downloads.download({ url, filename: `free-ig-export-instagram-${new Date().toISOString().slice(0, 10)}.${suffix}`, saveAs: true });
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function escapeAttr(value) { return escapeHtml(value); }
chrome.runtime.onMessage.addListener((message) => { if (message.type === "free-ig-export:task-updated") render(message.task); });
render();
