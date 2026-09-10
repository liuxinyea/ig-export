import type { Product } from "dodopayments/resources/products/products";
import { BillingError, billingConfig, type Plan } from "./config.ts";
import { dodo } from "./dodo.ts";

export function checkProduct(product: Product, plan: Plan) {
  const price = product.price;
  const months = { monthly: 1, quarterly: 3, yearly: 12 };
  if (plan === "lifetime") {
    if (price.type !== "one_time_price" || price.pay_what_you_want) throw new BillingError("Plan configuration needs attention.", 503);
  } else {
    if (price.type !== "recurring_price") throw new BillingError("Plan configuration needs attention.", 503);
    const intervalMonths = price.payment_frequency_interval === "Year" ? price.payment_frequency_count * 12 : price.payment_frequency_interval === "Month" ? price.payment_frequency_count : 0;
    if (intervalMonths !== months[plan]) throw new BillingError("Plan billing interval does not match.", 503);
  }
  if (product.business_id !== billingConfig().businessId) throw new BillingError("Plan configuration needs attention.", 503);
  if (!product.license_key_enabled && !product.entitlements?.some((item) => item.integration_type === "license_key")) {
    throw new BillingError("License delivery is not configured for this plan.", 503);
  }
  return price;
}

export async function getProduct(plan: Plan) {
  const id = billingConfig().products[plan];
  if (!id) throw new BillingError("This plan is not available yet.", 503);
  const product = await dodo().products.retrieve(id);
  checkProduct(product, plan);
  return product;
}
