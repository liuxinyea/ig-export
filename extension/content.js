// Localized Instagram UI labels live in i18n/<locale>.json, registered in
// i18n/index.json. They are loaded on demand and merged across all locales:
// stat labels become { followers: { suffix, stem }, following: { suffix, stem } }
// (suffix = count precedes label, matched via endsWith; stem = label may wrap
// or precede the count, matched via includes) plus a flat verifiedMarkers list.
// All values are pre-normalized (whitespace stripped, lowercased) to match the
// whitespace-stripped page text. Add a language by dropping in a JSON file and
// registering it in i18n/index.json — no code changes needed.
let labelsPromise = null;

function loadLabels() {
  if (!labelsPromise) labelsPromise = (async () => {
    const merged = {
      followers: { suffix: [], stem: [] },
      following: { suffix: [], stem: [] },
      verifiedMarkers: []
    };
    const manifest = await fetch(chrome.runtime.getURL("i18n/index.json")).then((response) => response.json());
    await Promise.all(manifest.locales.map(async (locale) => {
      try {
        const data = await fetch(chrome.runtime.getURL(`i18n/${locale}.json`)).then((response) => response.json());
        for (const listType of ["followers", "following"]) {
          for (const kind of ["suffix", "stem"]) {
            const values = data.statLabels?.[listType]?.[kind] || [];
            merged[listType][kind].push(...values.map(normalizeLabel));
          }
        }
        merged.verifiedMarkers.push(...(data.verifiedMarkers || []).map(normalizeLabel));
      } catch {
        // A missing or malformed locale file must not break collection.
      }
    }));
    return merged;
  })();
  return labelsPromise;
}

function normalizeLabel(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

// `var` deliberately permits a fresh injection after the extension itself has
// been reloaded while the Instagram tab stayed open.
var collector = globalThis.__leadflowCollector || null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "leadflow:ping") {
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:collector-start") {
    startCollector(message.payload);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:browser-collection-start") {
    startBrowserCollection(message.payload);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:collector-stop") {
    stopCollector("reason.stopped", "stopped");
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:collector-pause") {
    pauseCollector();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:collector-resume") {
    resumeCollector();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "leadflow:scan-profile") {
    sendResponse({ profile: scanProfile() });
  }
});

function startCollector(payload) {
  stopCollector();
  collector = {
    ...payload,
    emptyCycles: 0,
    seen: new Set(),
    timer: null
  };
  globalThis.__leadflowCollector = collector;
  if (!collector.labels) {
    loadLabels().then((labels) => { if (collector) collector.labels = labels; });
  }
  collectOnce();
}

function pauseCollector() {
  if (!collector || collector.paused) return;
  if (collector.timer) clearTimeout(collector.timer);
  collector.timer = null;
  collector.paused = true;
  chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: collector.taskId, status: "paused", reasonKey: "reason.paused" } });
}

function resumeCollector() {
  if (!collector || !collector.paused) return;
  collector.paused = false;
  chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: collector.taskId, status: "running", reason: null } });
  collectOnce();
}

async function startBrowserCollection(payload) {
  stopCollector();
  const labels = await loadLabels();
  const trigger = findListTrigger(payload.listType, labels);
  if (!trigger) {
    chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: payload.taskId, status: "paused", reasonKey: "reason.profileControlMissing", reasonParams: { listType: payload.listType } } });
    return;
  }
  trigger.click();
  const dialog = await waitForDialog();
  if (!dialog) {
    chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: payload.taskId, status: "paused", reasonKey: "reason.dialogMissing" } });
    return;
  }
  startCollector({ ...payload, labels });
}

function findListTrigger(listType, labels) {
  const pathPart = listType === "followers" ? "/followers" : "/following";
  const link = [...document.querySelectorAll("a[href]")].find((element) => element.getAttribute("href")?.includes(pathPart));
  if (link) return link;

  // New Instagram profile pages use <a href="#" role="link"> for their
  // profile stats. Search the full document because the profile shell does not
  // consistently use a <main> or <header> ancestor across experiments.
  const { suffix: suffixLabels, stem: stemLabels } = labels[listType];
  const matchStat = (element) => {
    const text = normalizeStatText(element.textContent);
    if (text.length > 40 || !hasDigit(text)) return false;
    return matchesStatLabel(text, suffixLabels, stemLabels);
  };
  const directStat = [...document.querySelectorAll('a[role="link"], [role="link"]')].find(matchStat);
  if (directStat) return directStat;

  // Fallback for older layouts where the statistic is nested under another
  // interactive element. The digit requirement excludes the follow button.
  const profileRoot = document.querySelector("main") || document;
  const stat = [...profileRoot.querySelectorAll('a[role="link"], a, button, [role=button], span, div')].find(matchStat);
  return stat?.closest("a, button, [role=button]") || null;
}

function matchesStatLabel(text, suffixLabels, stemLabels) {
  // Labels are pre-normalized (whitespace stripped, lowercased) at load time,
  // matching the whitespace-stripped page text.
  return suffixLabels.some((label) => text.endsWith(label)) ||
    stemLabels.some((label) => text.includes(label));
}

function normalizeStatText(value) {
  return (value || "").replace(/\s+/g, "").trim();
}

function hasDigit(text) {
  // Also accept Arabic-Indic (٠-٩) and extended Arabic-Indic (۰-۹) digits, plus fullwidth digits (０-９).
  return /[0-9٠-٩۰-۹０-９]/.test(text);
}

function waitForDialog(timeoutMs = 8000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) { clearInterval(timer); resolve(dialog); }
      else if (Date.now() - startedAt >= timeoutMs) { clearInterval(timer); resolve(null); }
    }, 200);
  });
}

function stopCollector(reasonKey, status = "paused") {
  if (!collector) return;
  if (collector.timer) clearTimeout(collector.timer);
  const finished = collector;
  collector = null;
  globalThis.__leadflowCollector = null;
  if (reasonKey) {
    chrome.runtime.sendMessage({
      type: "leadflow:collector-status",
      payload: { taskId: finished.taskId, status, reasonKey }
    });
  }
}

function collectOnce() {
  if (!collector || collector.paused) return;
  const records = collectVisibleProfiles();
  const fresh = records.filter((record) => !collector.seen.has(record.username));
  fresh.forEach((record) => collector.seen.add(record.username));

  if (fresh.length) {
    collector.emptyCycles = 0;
    chrome.runtime.sendMessage({
      type: "leadflow:collector-batch",
      payload: { taskId: collector.taskId, records: fresh, sourceProfile: collector.sourceProfile }
    });
  } else {
    collector.emptyCycles += 1;
  }

  if (collector.seen.size >= collector.limit) {
    stopCollector("reason.limitReached", "completed");
    return;
  }

  const container = getScrollableList();
  if (!container) {
    stopCollector("reason.dialogClosed");
    return;
  }

  if (collector.emptyCycles >= 4) {
    stopCollector("reason.noProfiles", "completed");
    return;
  }

  container.scrollTop += Math.max(360, Math.round(container.clientHeight * 0.75));
  collector.timer = setTimeout(collectOnce, Math.max(1500, collector.delayMs));
}

function getScrollableList() {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return null;
  const candidates = [dialog, ...dialog.querySelectorAll("div")];
  return candidates.find((element) => {
    const style = getComputedStyle(element);
    return element.scrollHeight > element.clientHeight + 40 &&
      ["auto", "scroll"].includes(style.overflowY);
  }) || null;
}

function collectVisibleProfiles() {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return [];
  const links = [...dialog.querySelectorAll('a[href^="/"]')];
  const unique = new Map();
  for (const link of links) {
    const username = normalizeUsername(link.getAttribute("href"));
    if (!username || username === "explore" || username === "accounts") continue;
    const row = link.closest("div[role], li") || link.parentElement?.parentElement || link;
    const text = (row?.innerText || "").trim().split("\n").filter(Boolean);
    unique.set(username, {
      username,
      displayName: text.find((item) => item !== username) || "",
      profileUrl: `https://www.instagram.com/${username}/`,
      avatarUrl: row?.querySelector("img")?.currentSrc || "",
      isVerified: Boolean(row?.querySelector('svg[aria-label], svg[title]')) &&
        [...row.querySelectorAll('svg[aria-label], svg[title]')].some((svg) => {
          const label = normalizeLabel(svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent || "");
          return label && (collector?.labels?.verifiedMarkers || []).some((marker) => label.includes(marker));
        })
    });
  }
  return [...unique.values()];
}

function normalizeUsername(href) {
  if (!href) return null;
  const match = href.match(/^\/([^/?#]+)\/?/);
  if (!match || /^(p|reel|stories|direct|accounts|explore)$/i.test(match[1])) return null;
  return match[1];
}

function scanProfile() {
  const username = normalizeUsername(location.pathname) || "";
  const header = document.querySelector("main header") || document.querySelector("header");
  return {
    username,
    profileUrl: location.href.split("?")[0],
    displayName: header?.querySelector("h1, h2")?.textContent?.trim() || ""
  };
}
