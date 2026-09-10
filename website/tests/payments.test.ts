import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import DodoPayments from "dodopayments";
import type { Product } from "dodopayments/resources/products/products";
import { activateLicense, validateLicense } from "../lib/payments/licenses.ts";
import { checkProduct } from "../lib/payments/catalog.ts";
import { parsePlan, planForProduct } from "../lib/payments/config.ts";
import { signCheckout, readCheckout } from "../lib/payments/checkout-state.ts";
import { checkOrigin, readJson } from "../lib/payments/http.ts";

Object.assign(process.env, {
  APP_URL: "http://localhost:3000", DODO_PAYMENTS_ENVIRONMENT: "test_mode",
  DODO_PAYMENTS_BUSINESS_ID: "bus_ours", DODO_PAYMENTS_PRODUCT_MONTHLY: "pdt_monthly",
  DODO_PAYMENTS_PRODUCT_QUARTERLY: "pdt_quarterly", DODO_PAYMENTS_PRODUCT_YEARLY: "pdt_yearly",
  DODO_PAYMENTS_PRODUCT_LIFETIME: "pdt_lifetime", DODO_PAYMENTS_CHECKOUT_SECRET: "test-secret-only-012345678901234567890123456789",
  CHROME_EXTENSION_IDS: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});

function mockClient(responses: Record<string, unknown>, calls: { path: string; body: unknown }[] = []) {
  return new DodoPayments({ bearerToken: "test-only", environment: "test_mode", maxRetries: 0,
    fetch: async (input, init) => {
      const path = new URL(String(input)).pathname;
      calls.push({ path, body: init?.body ? JSON.parse(String(init.body)) : null });
      assert.ok(path in responses, `Unexpected request ${path}`);
      if (responses[path] === null) return new Response(null, { status: 204 });
      return Response.json(responses[path]);
    },
  });
}

const license = { key: "secret-license", business_id: "bus_ours", product_id: "pdt_monthly", status: "active", expires_at: null };
const instance = { id: "lki_ours", business_id: "bus_ours", license_key_id: "lic_ours" };
const validResponses = { "/license_key_instances/lki_ours": instance, "/license_keys/lic_ours": license, "/licenses/validate": { valid: true } };

test("only four server-configured plans are accepted", () => {
  for (const value of ["monthly", "quarterly", "yearly", "lifetime"]) assert.equal(parsePlan(value), value);
  for (const value of ["__proto__", "constructor", "pdt_attacker", null, {}]) assert.throws(() => parsePlan(value));
  assert.throws(() => planForProduct("foreign"));
});

test("checkout state rejects forged, expired and missing cookies", () => {
  const cookie = signCheckout("cks_ours");
  assert.equal(readCheckout(cookie), "cks_ours");
  assert.throws(() => readCheckout(cookie + "x"));
  assert.throws(() => readCheckout());
  const payload = Buffer.from(JSON.stringify({ session: "cks_ours", expires: 1 })).toString("base64url");
  const sig = createHmac("sha256", process.env.DODO_PAYMENTS_CHECKOUT_SECRET!).update(payload).digest("base64url");
  assert.throws(() => readCheckout(`${payload}.${sig}`));
});

test("license validation binds the key, instance, merchant and product", async () => {
  const calls: { path: string; body: unknown }[] = [];
  const result = await validateLicense("secret-license", "lki_ours", mockClient(validResponses, calls));
  assert.equal(result.valid, true);
  assert.equal(result.plan, "monthly");
  assert.deepEqual(calls.at(-1)?.body, { license_key: "secret-license", license_key_instance_id: "lki_ours" });
  assert.ok(!JSON.stringify(result).includes("secret-license"));
  await assert.rejects(validateLicense("wrong-key", "lki_ours", mockClient(validResponses)));
  await assert.rejects(validateLicense("secret-license", "lki_ours", mockClient({ ...validResponses, "/license_keys/lic_ours": { ...license, product_id: "foreign" } })));
  await assert.rejects(validateLicense("secret-license", "lki_ours", mockClient({ ...validResponses, "/license_key_instances/lki_ours": { ...instance, business_id: "foreign" } })));
});

test("disabled, expired and revoked instance licenses never grant access", async () => {
  for (const change of [{ status: "disabled" }, { expires_at: "2000-01-01T00:00:00Z" }]) {
    const result = await validateLicense("secret-license", "lki_ours", mockClient({ ...validResponses, "/license_keys/lic_ours": { ...license, ...change } }));
    assert.equal(result.valid, false);
  }
  assert.equal((await validateLicense("secret-license", "lki_ours", mockClient({ ...validResponses, "/licenses/validate": { valid: false } }))).valid, false);
});

test("foreign activation is released and never returned as Pro", async () => {
  const calls: { path: string; body: unknown }[] = [];
  await assert.rejects(activateLicense("foreign", "browser", mockClient({
    "/licenses/activate": { id: "lki_foreign", business_id: "other", product: { product_id: "pdt_other" } },
    "/licenses/deactivate": null,
  }, calls)));
  assert.deepEqual(calls.at(-1)?.body, { license_key: "foreign", license_key_instance_id: "lki_foreign" });
});

test("own activation returns only the activation reference and plan", async () => {
  const result = await activateLicense("secret-license", "browser", mockClient({ "/licenses/activate": {
    id: "lki_ours", business_id: "bus_ours", product: { product_id: "pdt_lifetime" }, customer: { email: "private@example.com" },
  } }));
  assert.deepEqual(result, { valid: true, plan: "lifetime", instanceId: "lki_ours" });
});

test("catalog checks billing intervals and license delivery before checkout", () => {
  const base = { business_id: "bus_ours", license_key_enabled: false, entitlements: [{ integration_type: "license_key" }] };
  for (const [plan, interval, count] of [["monthly", "Month", 1], ["quarterly", "Month", 3], ["yearly", "Year", 1]] as const) {
    const product = { ...base, price: { type: "recurring_price", price: 1000, currency: "USD", payment_frequency_interval: interval, payment_frequency_count: count } } as Product;
    assert.equal(checkProduct(product, plan).price, 1000);
    assert.throws(() => checkProduct(product, "lifetime"));
    assert.throws(() => checkProduct({ ...product, entitlements: [] }, plan));
  }
  const lifetime = { ...base, price: { type: "one_time_price", price: 10000, currency: "USD", pay_what_you_want: false } } as Product;
  assert.equal(checkProduct(lifetime, "lifetime").type, "one_time_price");
});

test("billing mutations reject foreign origins and oversized input", async () => {
  checkOrigin(new Request("http://localhost:3000", { headers: { origin: "http://localhost:3000" } }));
  checkOrigin(new Request("http://localhost:3000", { headers: { origin: "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" } }), true);
  assert.throws(() => checkOrigin(new Request("http://localhost:3000", { headers: { origin: "https://attacker.example" } }), true));
  assert.throws(() => checkOrigin(new Request("http://localhost:3000")));
  await assert.rejects(readJson(new Request("http://localhost:3000", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: "x".repeat(5000) }) })));
});

test("official webhook verifier rejects tampering and stale signatures", () => {
  const secretBytes = Buffer.from("test-webhook-secret-0123456789012345");
  const client = new DodoPayments({ bearerToken: "test", webhookKey: `whsec_${secretBytes.toString("base64")}` });
  const payload = JSON.stringify({ type: "payment.succeeded", business_id: "bus_ours", data: {} });
  const id = "msg_test", timestamp = String(Math.floor(Date.now() / 1000));
  function headers(time: string) {
    const sig = createHmac("sha256", secretBytes).update(`${id}.${time}.${payload}`).digest("base64");
    return { "webhook-id": id, "webhook-timestamp": time, "webhook-signature": `v1,${sig}` };
  }
  assert.equal(client.webhooks.unwrap(payload, { headers: headers(timestamp) }).type, "payment.succeeded");
  assert.throws(() => client.webhooks.unwrap(payload + " ", { headers: headers(timestamp) }));
  assert.throws(() => client.webhooks.unwrap(payload, { headers: headers("1") }));
});
