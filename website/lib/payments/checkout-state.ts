import { createHmac, timingSafeEqual } from "node:crypto";
import { BillingError, required } from "./config.ts";

export const checkoutCookie = "igexport_checkout";
function signature(value: string) {
  const secret = required("DODO_PAYMENTS_CHECKOUT_SECRET");
  if (secret.length < 32) throw new BillingError("Checkout secret must be at least 32 characters.", 503);
  return createHmac("sha256", secret).update(value).digest("base64url");
}
export function signCheckout(session: string) {
  const payload = Buffer.from(JSON.stringify({ session, expires: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
export function readCheckout(value?: string) {
  if (!value || value.length > 2048) throw new BillingError("No recent checkout found in this browser.", 401);
  const [payload, sig, extra] = value.split(".");
  if (extra || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(sig || "")) throw new BillingError("Invalid checkout session.", 401);
  const expected = signature(payload);
  if (extra || !sig || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw new BillingError("Invalid checkout session.", 401);
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.session !== "string" || typeof data.expires !== "number" || data.expires < Date.now()) throw new Error();
    return data.session as string;
  } catch { throw new BillingError("Checkout session expired.", 401); }
}
