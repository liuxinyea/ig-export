import { billingConfig, required } from "@/lib/payments/config";
import { dodo } from "@/lib/payments/dodo";
import { json, failure } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    required("DODO_PAYMENTS_WEBHOOK_KEY");
    const client = dodo();
    const payload = await request.text();
    if (Buffer.byteLength(payload) > 1_000_000) return json({ error: "Payload too large." }, 413);
    let event;
    try {
      event = client.webhooks.unwrap(payload, { headers: {
        "webhook-id": request.headers.get("webhook-id") || "",
        "webhook-signature": request.headers.get("webhook-signature") || "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
      } });
    } catch { return json({ error: "Invalid webhook signature." }, 401); }
    if (event.business_id !== billingConfig().businessId) return json({ error: "Wrong business." }, 403);
    // Dodo owns issuance/revocation. No local grants or duplicate emails are made.
    // Each paid operation queries Dodo, so late/replayed events cannot restore access.
    console.info("Dodo event acknowledged", { id: request.headers.get("webhook-id"), type: event.type });
    return json({ received: true });
  } catch (error) { return failure(error); }
}
