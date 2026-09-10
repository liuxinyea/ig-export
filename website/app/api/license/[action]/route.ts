import { BillingError } from "@/lib/payments/config";
import { activateLicense, validateLicense } from "@/lib/payments/licenses";
import { dodo } from "@/lib/payments/dodo";
import { checkOrigin, failure, json, readJson, textField } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function OPTIONS(request: Request) {
  try {
    checkOrigin(request, true);
    return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin",
    } });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  let allowed = false;
  let response: Response;
  try {
    checkOrigin(request, true);
    allowed = true;
    const { action } = await context.params;
    const body = await readJson(request);
    const key = textField(body, "key");
    if (action === "activate") {
      response = json(await activateLicense(key, textField(body, "name", 100)));
    } else if (action === "validate") {
      response = json(await validateLicense(key, textField(body, "instanceId")));
    } else if (action === "deactivate") {
      // Permit release even after expiry/revocation. Dodo verifies key-instance ownership.
      await dodo().licenses.deactivate({ license_key: key, license_key_instance_id: textField(body, "instanceId") });
      response = json({ deactivated: true });
    } else throw new BillingError("Unknown license action.", 404);
  } catch (error) { response = failure(error); }
  if (allowed && request.headers.get("origin")) {
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin")!);
    response.headers.set("Vary", "Origin");
  }
  return response;
}
