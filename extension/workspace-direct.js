const TASK_KEY = "free-ig-export.currentTask";
const $ = (selector) => document.querySelector(selector);
let activeRun = null;
const launchParams = new URLSearchParams(location.search);

async function getTask() {
  const value = await chrome.storage.local.get(TASK_KEY);
  return value[TASK_KEY] || null;
}

async function saveTask(task) {
  await chrome.storage.local.set({ [TASK_KEY]: task });
  await render(task);
}

async function render(task) {
  if (typeof task === "undefined") task = await getTask();
  const records = task?.records || [];
  $("#count").textContent = records.length;
  $("#taskSource").textContent = task?.sourceProfile || "—";
  $("#updated").textContent = task?.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : "—";
  $("#status").textContent = task ? `${task.status || "running"} · ${records.length} leads` : "No active task";
  $("#reason").textContent = task?.reason || (task ? "Collection is running locally in this extension." : "No task has started.");
  $("#rows").innerHTML = records.length
    ? records.map((record) => `<tr><td>@${escapeHtml(record.username)}</td><td>${escapeHtml(record.displayName || "—")}</td><td><a href="${escapeAttr(record.profileUrl)}" target="_blank">Open</a></td><td>${record.isVerified ? "Yes" : "—"}</td><td>${new Date(record.collectedAt).toLocaleString()}</td></tr>`).join("")
    : '<tr><td colspan="5" class="empty">No local records yet.</td></tr>';
}

$("#useCurrent").addEventListener("click", async () => {
  try {
    const tabs = await chrome.tabs.query({ url: "https://www.instagram.com/*" });
    const tab = tabs.sort((left, right) => (right.lastAccessed || 0) - (left.lastAccessed || 0))[0];
    if (!tab?.url) throw new Error("Open an Instagram profile tab first, or paste a username/URL.");
    $("#source").value = tab.url;
  } catch (error) { showError(error); }
});

$("#start").addEventListener("click", async () => {
  try {
    const username = FreeIgExportInstagramApi.normalizeUsername($("#source").value);
    if (!username) throw new Error("Enter a public Instagram username or profile URL.");
    if (activeRun) activeRun.stopped = true;
    const task = { id: crypto.randomUUID(), status: "starting", reason: null, sourceProfile: username, listType: $("#listType").value, limit: Number($("#limit").value), records: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await saveTask(task);
    runCollection(task);
  } catch (error) { showError(error); }
});

function applyLaunchParams() {
  const source = launchParams.get("source");
  const listType = launchParams.get("listType");
  const limit = launchParams.get("limit");
  if (source) $("#source").value = source;
  if (listType === "followers" || listType === "following") $("#listType").value = listType;
  if (["100", "300", "500"].includes(limit)) $("#limit").value = limit;
}

$("#pause").addEventListener("click", async () => {
  if (activeRun) activeRun.stopped = true;
  const task = await getTask();
  if (task && ["starting", "running"].includes(task.status)) await saveTask({ ...task, status: "paused", reason: "Paused by user", updatedAt: new Date().toISOString() });
});

$("#clear").addEventListener("click", async () => {
  if (!confirm("Remove the current local task and its records?")) return;
  if (activeRun) activeRun.stopped = true;
  await chrome.storage.local.remove(TASK_KEY);
  render(null);
});
$("#csv").addEventListener("click", () => exportFile("csv"));
$("#json").addEventListener("click", () => exportFile("json"));

async function runCollection(task) {
  const run = { taskId: task.id, stopped: false };
  activeRun = run;
  try {
    const profile = await FreeIgExportInstagramApi.getProfile(task.sourceProfile);
    let cursor = null;
    let records = [];
    await saveTask({ ...task, status: "running", sourceProfile: profile.username, updatedAt: new Date().toISOString() });
    while (!run.stopped && records.length < task.limit) {
      const page = await FreeIgExportInstagramApi.getPage({ profileId: profile.id, listType: task.listType, cursor });
      const seen = new Set(records.map((record) => record.username));
      records.push(...page.records.filter((record) => !seen.has(record.username)).slice(0, task.limit - records.length).map((record) => ({ ...record, platform: "instagram", sourceProfile: profile.username, collectedAt: new Date().toISOString() })));
      await saveTask({ ...task, status: "running", sourceProfile: profile.username, records, updatedAt: new Date().toISOString() });
      cursor = page.nextCursor;
      if (!cursor || records.length >= task.limit) break;
      await sleep(5000);
    }
    const latest = await getTask();
    if (latest?.id === task.id && !run.stopped) await saveTask({ ...latest, status: "completed", reason: cursor ? "Reached the selected collection limit" : "No additional accessible pages", updatedAt: new Date().toISOString() });
  } catch (error) {
    const latest = await getTask();
    if (latest?.id === task.id) await saveTask({ ...latest, status: "paused", reason: error.message || "Instagram collection stopped", updatedAt: new Date().toISOString() });
  } finally {
    if (activeRun === run) activeRun = null;
  }
}

async function exportFile(format) {
  const records = (await getTask())?.records || [];
  if (!records.length) return showError(new Error("There are no local records to export yet."));
  let content; let type; let suffix;
  if (format === "json") { content = JSON.stringify(records, null, 2); type = "application/json"; suffix = "json"; }
  else { const columns = ["platform", "sourceProfile", "username", "displayName", "profileUrl", "avatarUrl", "isVerified", "collectedAt"]; content = [columns.join(","), ...records.map((record) => columns.map((key) => csvCell(record[key])).join(","))].join("\n"); type = "text/csv;charset=utf-8"; suffix = "csv"; }
  const url = URL.createObjectURL(new Blob([content], { type }));
  await chrome.downloads.download({ url, filename: `free-ig-export-instagram-${new Date().toISOString().slice(0, 10)}.${suffix}`, saveAs: true });
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function escapeAttr(value) { return escapeHtml(value); }
function showError(error) { $("#reason").textContent = error.message || "Unexpected error"; }

applyLaunchParams();
render();
