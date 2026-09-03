// Followers/following stat labels per Instagram UI language, all lowercase.
// `suffix` matches via endsWith on the digit-bearing stat text; `stem`
// matches via includes for languages whose label inflects with the count
// (Russian genitive forms, Arabic tanwin, Polish case forms).
const LIST_LABELS = {
  followers: {
    suffix: [
      "followers",        // en
      "粉丝", "粉絲",      // zh-cn / zh-tw
      "フォロワー",        // ja
      "팔로워",            // ko
      "seguidores",       // es, pt
      "abonnés",          // fr
      "follower",         // de, it
      "volgers",          // nl
      "pengikut",         // id
      "takipçi",          // tr
      "ผู้ติดตาม",         // th
      "người theo dõi",   // vi
      "फ़ॉलोअर्स", "फ़ॉलोअर"  // hi
    ],
    stem: [
      "подписчик",        // ru: подписчик / подписчика / подписчиков
      "obserwując",       // pl: obserwujący / obserwujących
      "متابع"             // ar: متابعون / متابعين / متابعًا
    ]
  },
  following: {
    suffix: [
      "following",        // en
      "关注", "追蹤中", "追蹤", // zh-cn / zh-tw
      "フォロー中",        // ja
      "팔로잉",            // ko
      "seguidos", "siguiendo", // es
      "seguindo",         // pt
      "abonnements",      // fr
      "gefolgt",          // de
      "seguiti",          // it
      "volgend",          // nl
      "mengikuti",        // id
      "takip",            // tr
      "กำลังติดตาม",       // th
      "đang theo dõi",    // vi
      "फ़ॉलोइंग"           // hi
    ],
    stem: [
      "подписк",          // ru: подписка / подписки / подписок
      "obserwowan",       // pl: obserwowane / obserwowanych
      "يتابع"             // ar
    ]
  }
};

// Localized labels of Instagram's verified badge (aria-label / <title>).
const VERIFIED_MARKERS = [
  "verified",           // en
  "认证", "認證",        // zh-cn / zh-tw
  "認証済み",            // ja
  "인증",               // ko
  "verificado",         // es, pt
  "vérifié",            // fr
  "verifiziert",        // de
  "verificato",         // it
  "подтвержд", "верифиц", // ru
  "موثق",               // ar
  "doğrulan",           // tr
  "terverifikasi",      // id
  "geverifieerd",       // nl
  "zweryfikow",         // pl
  "सत्यापित",            // hi
  "xác minh",           // vi
  "ยืนยัน"               // th
];

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
    stopCollector("Stopped by user", "stopped");
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
  collectOnce();
}

function pauseCollector() {
  if (!collector || collector.paused) return;
  if (collector.timer) clearTimeout(collector.timer);
  collector.timer = null;
  collector.paused = true;
  chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: collector.taskId, status: "paused", reason: "Paused by user" } });
}

function resumeCollector() {
  if (!collector || !collector.paused) return;
  collector.paused = false;
  chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: collector.taskId, status: "running", reason: null } });
  collectOnce();
}

async function startBrowserCollection(payload) {
  stopCollector();
  const trigger = findListTrigger(payload.listType);
  if (!trigger) {
    chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: payload.taskId, status: "paused", reason: `Could not find the ${payload.listType} control on this profile page.` } });
    return;
  }
  trigger.click();
  const dialog = await waitForDialog();
  if (!dialog) {
    chrome.runtime.sendMessage({ type: "leadflow:collector-status", payload: { taskId: payload.taskId, status: "paused", reason: "Instagram did not open the list dialog. Refresh the profile and try again." } });
    return;
  }
  startCollector(payload);
}

function findListTrigger(listType) {
  const pathPart = listType === "followers" ? "/followers" : "/following";
  const link = [...document.querySelectorAll("a[href]")].find((element) => element.getAttribute("href")?.includes(pathPart));
  if (link) return link;

  // New Instagram profile pages use <a href="#" role="link"> for their
  // profile stats. Search the full document because the profile shell does not
  // consistently use a <main> or <header> ancestor across experiments.
  const { suffix: suffixLabels, stem: stemLabels } = LIST_LABELS[listType];
  const directStat = [...document.querySelectorAll('a[role="link"], [role="link"]')]
    .find((element) => {
      const text = normalizeStatText(element.textContent);
      if (text.length > 40 || !hasDigit(text)) return false;
      const lower = text.toLowerCase();
      return suffixLabels.some((label) => lower.endsWith(label.toLowerCase())) ||
        stemLabels.some((label) => lower.includes(label.toLowerCase()));
    });
  if (directStat) return directStat;

  // Fallback for older layouts where the statistic is nested under another
  // interactive element. The digit requirement excludes the follow button.
  const profileRoot = document.querySelector("main") || document;
  const stat = [...profileRoot.querySelectorAll('a[role="link"], a, button, [role=button], span, div')]
    .find((element) => {
      const text = normalizeStatText(element.textContent);
      if (text.length > 40 || !hasDigit(text)) return false;
      const lower = text.toLowerCase();
      return suffixLabels.some((label) => lower.endsWith(label.toLowerCase())) ||
        stemLabels.some((label) => lower.includes(label.toLowerCase()));
    });
  return stat?.closest("a, button, [role=button]") || null;
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

function stopCollector(reason, status = "paused") {
  if (!collector) return;
  if (collector.timer) clearTimeout(collector.timer);
  const finished = collector;
  collector = null;
  globalThis.__leadflowCollector = null;
  if (reason) {
    chrome.runtime.sendMessage({
      type: "leadflow:collector-status",
      payload: { taskId: finished.taskId, status, reason }
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
    stopCollector("Reached the selected collection limit", "completed");
    return;
  }

  const container = getScrollableList();
  if (!container) {
    stopCollector("Instagram list dialog was closed. Collection interrupted; reopen it and start a new task.");
    return;
  }

  if (collector.emptyCycles >= 4) {
    stopCollector("No new visible profiles were loaded; the list may be complete or unavailable", "completed");
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
          const label = (svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent || "").toLowerCase();
          return label && VERIFIED_MARKERS.some((marker) => label.includes(marker.toLowerCase()));
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
