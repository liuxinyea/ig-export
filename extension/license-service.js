import { BILLING_ORIGIN } from "./license-config.js";

const LICENSE_KEY = "free-ig-export.license";
let mutation = Promise.resolve();

async function api(action, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${BILLING_ORIGIN}/api/license/${action}`, {
      method: "POST", credentials: "omit", cache: "no-store",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "License service is unavailable.");
    return data;
  } finally { clearTimeout(timer); }
}

async function stored() { return (await chrome.storage.local.get(LICENSE_KEY))[LICENSE_KEY]; }

async function validate() {
  const license = await stored();
  if (!license?.key || !license.instanceId) return { valid: false };
  // Never use a stored paid flag as authorization. Recheck with the provider.
  return api("validate", { key: license.key, instanceId: license.instanceId });
}

export async function handleLicense(action, payload = {}) {
  if (action === "config") return { origin: BILLING_ORIGIN };
  if (action === "status") {
    const license = await stored();
    if (!license) return { saved: false, valid: false };
    try { return { saved: true, ...await validate() }; }
    catch { return { saved: true, valid: false, unavailable: true }; }
  }
  if (action === "authorize") {
    const result = await validate();
    if (!result.valid) throw new Error("Activate a valid Pro license in License & plans to use this feature.");
    return result;
  }
  if (!["activate", "deactivate"].includes(action)) throw new Error("Unknown license action.");
  // Serialize key changes to avoid consuming two activation slots on double click.
  const operation = mutation.then(async () => {
    const previous = await stored();
    if (action === "deactivate") {
      if (previous) await api("deactivate", { key: previous.key, instanceId: previous.instanceId });
      await chrome.storage.local.remove(LICENSE_KEY);
      return { saved: false, valid: false };
    }
    const key = String(payload.key || "").trim();
    if (!key || key.length > 256) throw new Error("Enter a valid license key.");
    if (previous) {
      if (previous.key === key) return { saved: true, ...await validate() };
      throw new Error("Deactivate the current license before using another key.");
    }
    const result = await api("activate", { key, name: "IG Export Chrome extension" });
    if (!result.valid || !result.instanceId) throw new Error("License activation failed.");
    try { await chrome.storage.local.set({ [LICENSE_KEY]: { key, instanceId: result.instanceId } }); }
    catch (error) {
      // Release a slot if activation succeeded but local persistence failed.
      await api("deactivate", { key, instanceId: result.instanceId });
      throw error;
    }
    return { saved: true, ...result };
  });
  mutation = operation.catch(() => {});
  return operation;
}
