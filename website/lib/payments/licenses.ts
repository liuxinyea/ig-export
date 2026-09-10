import { timingSafeEqual } from "node:crypto";
import { BillingError, billingConfig, planForProduct } from "./config.ts";
import { dodo } from "./dodo.ts";

export async function validateLicense(key: string, instanceId: string, client = dodo()) {
  const instance = await client.licenseKeyInstances.retrieve(instanceId);
  if (instance.business_id !== billingConfig().businessId) throw new BillingError("Invalid license.", 403);
  const license = await client.licenseKeys.retrieve(instance.license_key_id);
  const a = Buffer.from(key), b = Buffer.from(license.key);
  if (a.length !== b.length || !timingSafeEqual(a, b) || license.business_id !== billingConfig().businessId) throw new BillingError("Invalid license.", 403);
  const plan = planForProduct(license.product_id);
  const validation = await client.licenses.validate({ license_key: key, license_key_instance_id: instanceId });
  const valid = validation.valid && license.status === "active" && (!license.expires_at || Date.parse(license.expires_at) > Date.now());
  return { valid, plan, expiresAt: license.expires_at || null, instanceId };
}

export async function activateLicense(key: string, name: string, client = dodo()) {
  const result = await client.licenses.activate({ license_key: key, name });
  // Public Dodo endpoints can accept other merchants' keys. Scope every activation.
  if (result.business_id !== billingConfig().businessId || !Object.values(billingConfig().products).includes(result.product?.product_id)) {
    await client.licenses.deactivate({ license_key: key, license_key_instance_id: result.id });
    throw new BillingError("This license is not for IG Export.", 403);
  }
  return { valid: true, plan: planForProduct(result.product.product_id), instanceId: result.id };
}
