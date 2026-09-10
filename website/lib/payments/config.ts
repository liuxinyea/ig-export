export const planNames = ["monthly", "quarterly", "yearly", "lifetime"] as const;
export type Plan = (typeof planNames)[number];

export class BillingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingError("Billing is not configured yet.", 503);
  return value;
}

export function billingConfig() {
  const environment = required("DODO_PAYMENTS_ENVIRONMENT");
  if (environment !== "test_mode" && environment !== "live_mode") {
    throw new BillingError("Invalid billing environment.", 503);
  }
  const url = new URL(required("APP_URL"));
  if (url.protocol !== "https:" && !(environment === "test_mode" && url.hostname === "localhost" && url.protocol === "http:")) {
    throw new BillingError("Billing requires an HTTPS site URL.", 503);
  }
  return {
    environment: environment as "test_mode" | "live_mode",
    origin: url.origin,
    businessId: required("DODO_PAYMENTS_BUSINESS_ID"),
    products: Object.fromEntries(planNames.map((plan) => [plan, process.env[`DODO_PAYMENTS_PRODUCT_${plan.toUpperCase()}`]?.trim() || ""])) as Record<Plan, string>,
  };
}

export function parsePlan(value: unknown): Plan {
  if (!planNames.includes(value as Plan)) throw new BillingError("Unknown plan.");
  return value as Plan;
}

export function planForProduct(productId: string): Plan {
  const match = planNames.find((plan) => billingConfig().products[plan] === productId && productId);
  if (!match) throw new BillingError("This license is not for IG Export.", 403);
  return match;
}
