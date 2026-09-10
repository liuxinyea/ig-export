import DodoPayments from "dodopayments";
import { billingConfig, required } from "./config.ts";

// Construct lazily: builds and non-billing pages do not require credentials.
export function dodo() {
  return new DodoPayments({
    bearerToken: required("DODO_PAYMENTS_API_KEY"),
    environment: billingConfig().environment,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    timeout: 15_000,
    maxRetries: 0,
  });
}
