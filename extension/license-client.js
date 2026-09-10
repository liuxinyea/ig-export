globalThis.FreeIgExportLicense = (() => {
  const FREE_LIMIT = 100;
  async function call(action, payload) {
    const response = await chrome.runtime.sendMessage({ type: "free-ig-export:license", action, payload });
    if (!response?.ok) throw new Error(response?.error || "License service is unavailable.");
    return response.data;
  }
  async function requireCollection(limit) {
    if (!Number.isFinite(limit) || limit < 1) throw new Error("Enter a valid collection limit.");
    if (limit > FREE_LIMIT) await call("authorize");
  }
  async function requireExport(format, count) {
    if (count > FREE_LIMIT || !["csv", "json"].includes(format)) await call("authorize");
  }
  return { call, requireCollection, requireExport, FREE_LIMIT };
})();
