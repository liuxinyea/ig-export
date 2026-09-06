(() => {
  const SETTINGS_KEY = "free-ig-export.locale";
  const FALLBACK = "en";
  const supported = ["en", "zh-cn", "zh-tw"];
  let messages = {};
  let locale = FALLBACK;

  function normalize(value) {
    const normalized = String(value || "").replace(/_/g, "-").toLowerCase();
    if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hant")) return "zh-tw";
    if (normalized.startsWith("zh")) return "zh-cn";
    return supported.includes(normalized) ? normalized : FALLBACK;
  }
  async function init() {
    const stored = await chrome.storage.local.get(SETTINGS_KEY);
    locale = stored[SETTINGS_KEY] === "auto" || !stored[SETTINGS_KEY]
      ? normalize(chrome.i18n.getUILanguage()) : normalize(stored[SETTINGS_KEY]);
    const [fallback, selected] = await Promise.all([
      fetch(chrome.runtime.getURL("locales/en.json")).then((r) => r.json()),
      locale === FALLBACK ? Promise.resolve({}) : fetch(chrome.runtime.getURL(`locales/${locale}.json`)).then((r) => r.json())
    ]);
    messages = { ...fallback, ...selected };
    apply(document);
    document.documentElement.lang = locale;
    return locale;
  }
  function t(key, params = {}) {
    return String(messages[key] || key).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
  }
  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
    const title = root.querySelector("title[data-i18n]"); if (title) document.title = t(title.dataset.i18n);
  }
  async function setPreference(value) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: value });
    return init();
  }
  globalThis.FreeIgExportI18n = { init, t, apply, setPreference, get locale() { return locale; }, SETTINGS_KEY };
})();
