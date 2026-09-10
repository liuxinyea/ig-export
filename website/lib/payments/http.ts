import DodoPayments from "dodopayments";
import { BillingError, billingConfig } from "./config.ts";

export function checkOrigin(request: Request, extension = false) {
  const origin = request.headers.get("origin");
  const site = billingConfig().origin;
  const ids = (process.env.CHROME_EXTENSION_IDS || "").split(",").map((id) => id.trim()).filter((id) => /^[a-p]{32}$/.test(id));
  if (origin !== site && !(extension && (!origin || ids.some((id) => origin === `chrome-extension://${id}`)))) {
    throw new BillingError("Request origin is not allowed.", 403);
  }
}

export function json(data: unknown, status = 200, origin?: string | null) {
  return Response.json(data, { status, headers: {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  } });
}

export function failure(error: unknown) {
  if (error instanceof BillingError) return json({ error: error.message }, error.status);
  if (error instanceof DodoPayments.APIError) {
    if (error.status === 429) return json({ error: "Too many requests. Please wait before trying again." }, 429);
    if ([400, 404, 409, 422].includes(error.status || 0)) return json({ error: "The request could not be completed. Check your license and activation limit." }, 400);
  }
  // Never return/log upstream bodies: they can contain keys or customer details.
  return json({ error: "Billing service is temporarily unavailable. Please try again later." }, 503);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BillingError("Expected JSON.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new BillingError("Missing body.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new BillingError("Request is too large.", 413); }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new BillingError("Invalid JSON."); }
}

export function textField(body: Record<string, unknown>, key: string, max = 256) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new BillingError(`Invalid ${key}.`);
  return value.trim();
}
