const TASK_KEY = "free-ig-export.currentTask";
const $ = (s) => document.querySelector(s);
const t = (key, params) => FreeIgExportI18n.t(key, params);
const params = new URLSearchParams(location.search);
let activeRun = null;
let page = 1;
const pageSize = 50;
let avatarHydrationInFlight = false;

async function getTask() { return (await chrome.storage.local.get(TASK_KEY))[TASK_KEY] || null; }
async function saveTask(task) { await chrome.storage.local.set({ [TASK_KEY]: task }); await render(task); }

async function render(task) {
  if (typeof task === "undefined") task = await getTask();
  const records = task?.records || [];
  if (task) void hydrateStoredAvatars(task);
  const pages = Math.max(1, Math.ceil(records.length / pageSize));
  page = Math.min(page, pages);
  $("#count").textContent = records.length;
  $("#taskSource").textContent = task?.sourceProfile || "鈥?;
  $("#updated").textContent = task?.updatedAt ? new Date(task.updatedAt).toLocaleTimeString(FreeIgExportI18n.locale) : "鈥?;
  $("#status").textContent = task ? t("status.leads", { status: task.status, count: records.length }) : t("status.none");
  $("#reason").textContent = task?.reasonKey ? t(task.reasonKey, task.reasonParams) : (task?.reason || (task ? t("reason.directRunning") : t("reason.noTask")));
  const active = ["starting", "running", "paused"].includes(task?.status);
  $("#pause").hidden = !active; $("#stop").hidden = !active;
  $("#pause").textContent = task?.status === "paused" ? t("action.resume") : t("action.pause");
  $("#pageInfo").textContent = t("workspace.page", { page, pages, count: records.length });
  $("#previous").disabled = page <= 1; $("#next").disabled = page >= pages;
  const visible = records.slice((page - 1) * pageSize, page * pageSize);
  $("#rows").innerHTML = visible.length ? visible.map(row).join("") : `<tr><td colspan="6" class="empty">${t("workspace.empty")}</td></tr>`;
}
function avatarMarkup(record, className = "avatar") {
  const alt = t("workspace.avatarAlt", { username: record.username || "Instagram" });
  if (record.avatarDataUrl) return `<img class="${className}" src="${esc(record.avatarDataUrl)}" alt="${esc(alt)}">`;
  return `<span class="${className} avatar-placeholder" aria-label="${esc(alt)}">${esc((record.username || "?").slice(0, 1).toUpperCase())}</span>`;
}
function row(record) { return `<tr><td class="avatar-cell">${avatarMarkup(record)}</td><td>@${esc(record.username)}</td><td>${esc(record.displayName || "鈥?)}</td><td><a href="${esc(record.profileUrl)}" target="_blank" rel="noreferrer">${t("workspace.open")}</a></td><td>${record.isVerified ? t("workspace.yes") : "鈥?}</td><td>${new Date(record.collectedAt).toLocaleString(FreeIgExportI18n.locale)}</td></tr>`; }

$("#start").addEventListener("click", async () => {
  const username = FreeIgExportInstagramApi.normalizeUsername($("#source").value);
  if (!username) return showError(t("reason.invalidSource"));
  await ensureAvatarPermission();
  if (activeRun) activeRun.stopped = true;
  page = 1;
  const task = { id: crypto.randomUUID(), status: "starting", reason: null, sourceProfile: username, listType: $("#listType").value, limit: Math.max(1, Number($("#limit").value) || 300), delayMs: Math.max(1000, Number($("#delay").value) || 5000), records: [], nextCursor: "", profileId: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await saveTask(task); runCollection(task);
});

$("#pause").addEventListener("click", async () => {
  const task = await getTask(); if (!task) return;
  if (task.status === "paused") {
    if (activeRun) activeRun.paused = false;
    else runCollection({ ...task, status: "running", reason: null });
    await saveTask({ ...task, status: "running", reason: null, updatedAt: new Date().toISOString() });
  } else {
    if (activeRun) activeRun.paused = true;
    await saveTask({ ...task, status: "paused", reason: null, reasonKey: "reason.paused", reasonParams: {}, updatedAt: new Date().toISOString() });
  }
});

$("#stop").addEventListener("click", async () => { if (activeRun) activeRun.stopped = true; const task = await getTask(); if (task) await saveTask({ ...task, status: "stopped", reason: null, reasonKey: "reason.stopped", reasonParams: {}, updatedAt: new Date().toISOString() }); });
$("#clear").addEventListener("click", async () => { if (confirm(t("workspace.clearConfirm"))) { if (activeRun) activeRun.stopped = true; await chrome.storage.local.remove(TASK_KEY); page = 1; render(null); } });
$("#previous").addEventListener("click", () => { page--; render(); });
$("#next").addEventListener("click", () => { page++; render(); });
["csv", "excel", "html", "markdown"].forEach((format) => $(`#${format}`).addEventListener("click", () => exportFile(format)));

async function runCollection(initial) {
  const run = { id: initial.id, stopped: false, paused: initial.status === "paused" };
  activeRun = run;
  try {
    let task = await getTask(); if (!task || task.id !== run.id) return;
    let profileId = task.profileId; let username = task.sourceProfile;
    if (!profileId) { const profile = await FreeIgExportInstagramApi.getProfile(username); profileId = profile.id; username = profile.username; }
    let cursor = task.nextCursor || ""; let records = task.records || [];
    while (!run.stopped && records.length < task.limit) {
      while (run.paused && !run.stopped) await sleep(200);
      if (run.stopped) break;
      const result = await FreeIgExportInstagramApi.getPage({ profileId, listType: task.listType, cursor });
      const seen = new Set(records.map((r) => r.username));
      const incoming = result.records.filter((r) => !seen.has(r.username)).slice(0, task.limit - records.length).map((r) => ({ ...r, platform: "instagram", sourceProfile: username, collectedAt: new Date().toISOString() }));
      await hydrateAvatars(incoming);
      records.push(...incoming);
      cursor = result.nextCursor || "";
      task = { ...task, status: "running", reason: null, profileId, sourceProfile: username, records, nextCursor: cursor, updatedAt: new Date().toISOString() };
      await saveTask(task);
      if (!cursor || records.length >= task.limit) break;
      await sleep(task.delayMs || 5000);
    }
    const latest = await getTask();
    if (latest?.id === run.id && !run.stopped && !run.paused) await saveTask({ ...latest, status: "completed", reason: null, reasonKey: cursor ? "reason.limitReached" : "reason.noPages", reasonParams: {}, updatedAt: new Date().toISOString() });
  } catch (error) { const task = await getTask(); if (task?.id === run.id) await saveTask({ ...task, status: "paused", reason: null, reasonKey: error.reasonKey || "reason.apiPaused", reasonParams: error.reasonParams || {}, updatedAt: new Date().toISOString() }); }
  finally { if (activeRun === run) activeRun = null; }
}

async function exportFile(format) {
  await ensureAvatarPermission();
  let task = await getTask();
  if (task) {
    await hydrateStoredAvatars(task);
    task = await getTask();
  }
  const records = task?.records || [];
  if (!records.length) return showError(t("workspace.noExport"));
  const cols = ["platform", "sourceProfile", "username", "displayName", "profileUrl", "avatarUrl", "isVerified", "collectedAt"];
  const headings = cols.map((column) => t(`export.${column}`));
  let content, type, suffix;
  if (format === "excel" || format === "html") {
    const table = `<table><thead><tr>${headings.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${records.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    content = format === "excel" ? `<html><meta charset="utf-8">${table}</html>` : buildHtmlExport(task, records);
    type = format === "excel" ? "application/vnd.ms-excel" : "text/html";
    suffix = format === "excel" ? "xls" : "html";
  }
  else if (format === "markdown") { content = `| ${cols.join(" | ")} |\n| ${cols.map(() => "---").join(" | ")} |\n${records.map((r) => `| ${cols.map((c) => String(r[c] ?? "").replaceAll("|", "\\|").replaceAll("\n", " ")).join(" | ")} |`).join("\n")}`; type = "text/markdown"; suffix = "md"; }
  else { content = [headings.join(","), ...records.map((r) => cols.map((c) => csv(r[c])).join(","))].join("\n"); type = "text/csv;charset=utf-8"; suffix = "csv"; }
  const url = URL.createObjectURL(new Blob([content], { type })); await chrome.downloads.download({ url, filename: `free-ig-export-${task.sourceProfile}-${new Date().toISOString().slice(0,10)}.${suffix}`, saveAs: true }); setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
function applyParams() { const source = params.get("source"), type = params.get("listType"), limit = params.get("limit"), delay = params.get("delay"); if (source) $("#source").value = source; if (["followers","following"].includes(type)) $("#listType").value = type; if (Number(limit) > 0) $("#limit").value = limit; if (Number(delay) >= 1000) $("#delay").value = delay; }
async function hydrateStoredAvatars(task) {
  if (avatarHydrationInFlight) return;
  const pending = (task.records || []).filter((record) => record.avatarUrl && !record.avatarDataUrl && !record.avatarFetchAttempted);
  if (!pending.length) return;
  avatarHydrationInFlight = true;
  try {
    await hydrateAvatars(pending);
    const latest = await getTask();
    if (!latest || latest.id !== task.id) return;
    const hydrated = new Map(pending.map((record) => [record.username, record]));
    latest.records = latest.records.map((record) => hydrated.has(record.username) ? { ...record, ...hydrated.get(record.username) } : record);
    await chrome.storage.local.set({ [TASK_KEY]: latest });
    await render(latest);
  } finally {
    avatarHydrationInFlight = false;
  }
}
async function hydrateAvatars(records) {
  let next = 0;
  const worker = async () => {
    while (next < records.length) {
      const record = records[next++];
      record.avatarDataUrl = await fetchAvatarDataUrl(record.avatarUrl);
      record.avatarFetchAttempted = true;
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, records.length) }, worker));
}
async function fetchAvatarDataUrl(url) {
  try {
    const response = await chrome.runtime.sendMessage({ type: "free-ig-export:avatar-fetch", url });
    if (!response?.ok || !response.dataUrl) return "";
    const objectUrl = response.dataUrl;
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = reject;
        element.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const x = (image.naturalWidth - side) / 2;
      const y = (image.naturalHeight - side) / 2;
      canvas.getContext("2d").drawImage(image, x, y, side, side, 0, 0, 64, 64);
      const thumbnail = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
      if (!thumbnail) return "";
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(thumbnail);
      });
    } finally {
      if (objectUrl.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return "";
  }
}
async function ensureAvatarPermission() {
  const origins = ["https://*.cdninstagram.com/*", "https://*.fbcdn.net/*"];
  try {
    if (await chrome.permissions.contains({ origins })) return true;
    return await chrome.permissions.request({ origins });
  } catch {
    return false;
  }
}
function buildHtmlExport(task, records) {
  const exportedAt = new Date().toLocaleString();
  const rows = records.map((record) => `<tr><td>${avatarMarkup(record, "export-avatar")}</td><td><strong>@${esc(record.username)}</strong><span class="name">${esc(record.displayName || "No display name")}</span></td><td><a href="${esc(record.profileUrl)}" target="_blank" rel="noreferrer">View profile</a></td><td>${record.isVerified ? '<span class="verified">Verified</span>' : '<span class="muted">鈥?/span>'}</td><td>${new Date(record.collectedAt).toLocaleString()}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>free-ig-export 路 ${esc(task.sourceProfile)} export</title><style>body{margin:0;background:#f4f7fb;color:#20304a;font:14px/1.5 Inter,system-ui,-apple-system,sans-serif}.page{max-width:1120px;margin:0 auto;padding:40px 24px 64px}.hero{padding:30px 32px;border-radius:18px;background:linear-gradient(135deg,#1d4ed8,#2563eb 58%,#4f8cff);color:#fff;box-shadow:0 16px 34px rgb(37 99 235 / .22)}.eyebrow{font-size:11px;font-weight:750;letter-spacing:.14em;opacity:.78}.hero h1{margin:6px 0 4px;font-size:30px;letter-spacing:-.8px}.hero p{margin:0;opacity:.88}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}.metric{padding:17px 18px;border:1px solid #dce4ef;border-radius:12px;background:#fff;box-shadow:0 3px 10px rgb(32 52 87 / .04)}.metric span{display:block;color:#71819a;font-size:12px}.metric strong{display:block;margin-top:5px;color:#1e2d47;font-size:20px}.card{overflow:hidden;border:1px solid #dce4ef;border-radius:14px;background:#fff;box-shadow:0 3px 10px rgb(32 52 87 / .04)}.card-head{padding:20px 22px;border-bottom:1px solid #e3e9f1}.card-head h2{margin:0;color:#1b2942;font-size:18px}.card-head p{margin:3px 0 0;color:#71819a;font-size:12px}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{padding:13px 18px;border-bottom:1px solid #e8edf4;text-align:left;vertical-align:middle}th{background:#f8faff;color:#71819a;font-size:11px;letter-spacing:.06em;text-transform:uppercase}tr:last-child td{border-bottom:0}.export-avatar{display:inline-grid;width:38px;height:38px;place-items:center;border-radius:50%;background:#e8f0ff;color:#315cc7;font-size:14px;font-weight:700;object-fit:cover}.name{display:block;margin-top:2px;color:#71819a;font-size:12px}a{color:#2563eb;font-weight:650;text-decoration:none}.verified{display:inline-block;padding:3px 8px;border-radius:999px;background:#e8f7ef;color:#16834a;font-size:11px;font-weight:700}.muted{color:#9aa7ba}.footer{margin:18px 0 0;color:#8491a5;font-size:12px;text-align:center}@media(max-width:640px){.page{padding:20px 14px 40px}.hero{padding:24px}.summary{grid-template-columns:1fr}.hero h1{font-size:25px}}</style></head><body><main class="page"><header class="hero"><div class="eyebrow">free-ig-export 路 LOCAL-FIRST RESEARCH</div><h1>Instagram lead export</h1><p>Collected from @${esc(task.sourceProfile)} 路 ${esc(task.listType)}</p></header><section class="summary"><div class="metric"><span>Collected leads</span><strong>${records.length}</strong></div><div class="metric"><span>Source profile</span><strong>@${esc(task.sourceProfile)}</strong></div><div class="metric"><span>Exported</span><strong>${esc(exportedAt)}</strong></div></section><section class="card"><div class="card-head"><h2>Collected leads</h2><p>Public profile data gathered locally in free-ig-export.</p></div><div class="table-wrap"><table><thead><tr><th>Avatar</th><th>Profile</th><th>Link</th><th>Verified</th><th>Collected at</th></tr></thead><tbody>${rows}</tbody></table></div></section><p class="footer">Generated locally by free-ig-export 路 Avatar images remain hosted at their original public URLs.</p></main></body></html>`;
}
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); } function csv(v) { return `"${String(v ?? "").replaceAll('"','""')}"`; } function esc(v) { return String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); } function showError(message) { $("#reason").textContent = message; }
FreeIgExportI18n.init().then(() => { applyParams(); if (window.layui) layui.use("form", () => { layui.form.render(); render(); }); else render(); });
