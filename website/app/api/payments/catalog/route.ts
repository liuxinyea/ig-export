import { planNames } from "@/lib/payments/config";
import { getProduct } from "@/lib/payments/catalog";
import { json } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function GET() {
  const plans = await Promise.all(planNames.map(async (plan) => {
    try {
      const { price } = await getProduct(plan);
      if (price.type === "usage_based_price") throw new Error();
      return { plan, available: true, amount: price.price, currency: price.currency, taxInclusive: price.tax_inclusive === true };
    } catch { return { plan, available: false }; }
  }));
  return json({ plans });
}
