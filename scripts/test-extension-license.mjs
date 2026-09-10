import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const clientSource = await readFile(new URL("../extension/license-client.js", import.meta.url), "utf8");
test("free exports stay local; all paid formats and larger runs require authorization", async () => {
  const calls = [];
  const context = vm.createContext({ chrome: { runtime: { sendMessage: async (message) => { calls.push(message); return { ok: false, error: "Revoked" }; } } } });
  vm.runInContext(clientSource, context);
  const client = context.FreeIgExportLicense;
  await client.requireCollection(100);
  await client.requireExport("csv", 100);
  await client.requireExport("json", 100);
  assert.equal(calls.length, 0);
  await assert.rejects(client.requireCollection(101), /Revoked/);
  for (const format of ["xls", "excel", "html", "markdown"]) await assert.rejects(client.requireExport(format, 1), /Revoked/);
  await assert.rejects(client.requireExport("csv", 101), /Revoked/);
  await assert.rejects(client.requireCollection(Infinity));
  assert.equal(calls.length, 6);
  assert.ok(calls.every((item) => item.type === "free-ig-export:license" && item.action === "authorize"));
});

test("license service serializes activation and refuses offline paid access", async () => {
  const store = {};
  const calls = [];
  let offline = false;
  globalThis.chrome = { storage: { local: {
    get: async (key) => ({ [key]: store[key] }),
    set: async (value) => { Object.assign(store, value); },
    remove: async (key) => { delete store[key]; },
  } } };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (offline) throw new Error("Offline");
    const action = new URL(url).pathname.split("/").at(-1);
    calls.push({ action, body: JSON.parse(options.body) });
    return Response.json(action === "activate" ? { valid: true, plan: "monthly", instanceId: "lki_test" } : action === "validate" ? { valid: true, plan: "monthly" } : { deactivated: true });
  };
  try {
    const { handleLicense } = await import("../extension/license-service.js");
    await Promise.all([handleLicense("activate", { key: "test-key" }), handleLicense("activate", { key: "test-key" })]);
    assert.equal(calls.filter((item) => item.action === "activate").length, 1);
    await assert.rejects(handleLicense("activate", { key: "different-key" }));
    offline = true;
    await assert.rejects(handleLicense("authorize"));
    const status = await handleLicense("status");
    assert.equal(status.saved, true); assert.equal(status.valid, false);
    offline = false;
    await handleLicense("deactivate");
    assert.deepEqual(await handleLicense("status"), { saved: false, valid: false });
    assert.ok(calls.every((item) => !Object.keys(item.body).includes("records")));
  } finally { globalThis.fetch = originalFetch; delete globalThis.chrome; }
});
