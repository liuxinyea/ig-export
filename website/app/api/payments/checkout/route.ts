import { cookies } from "next/headers";
import { billingConfig, parsePlan, BillingError } from "@/lib/payments/config";
import { dodo } from "@/lib/payments/dodo";
import { getProduct } from "@/lib/payments/catalog";
import { checkoutCookie, signCheckout } from "@/lib/payments/checkout-state";
import { checkOrigin, readJson, json, failure } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = await readJson(request);
    const plan = parsePlan(body.plan);
    const locale = body.locale === "zh" ? "zh" : "en";
    const { origin } = billingConfig();
    // Validate configuration before creating an external session.
    signCheckout("configuration-check");
    const product = await getProduct(plan);
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: product.product_id, quantity: 1 }],
      return_url: `${origin}/${locale}/checkout/return`,
      cancel_url: `${origin}/${locale}/pricing`,
      customization: { force_language: locale },
      metadata: { app: "igexport", plan },
    });
    if (!session.checkout_url || new URL(session.checkout_url).protocol !== "https:") throw new BillingError("Checkout is unavailable.", 503);
    (await cookies()).set(checkoutCookie, signCheckout(session.session_id), {
      httpOnly: true, secure: origin.startsWith("https:"), sameSite: "lax", path: "/", maxAge: 86400,
    });
    return json({ checkoutUrl: session.checkout_url });
  } catch (error) { return failure(error); }
}
