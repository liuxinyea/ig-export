import { cookies } from "next/headers";
import { checkoutCookie, readCheckout } from "@/lib/payments/checkout-state";
import { dodo } from "@/lib/payments/dodo";
import { json, failure } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function GET() {
  try {
    const id = readCheckout((await cookies()).get(checkoutCookie)?.value);
    const session = await dodo().checkoutSessions.retrieve(id);
    return json({ status: session.payment_status || "pending" });
  } catch (error) { return failure(error); }
}
