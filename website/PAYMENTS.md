# Dodo Payments setup

## Architecture

The website creates Dodo hosted Checkout Sessions. Monthly, quarterly and yearly products are recurring; Lifetime is a one-time product. Dodo generates and emails license keys through its License Key entitlement and owns renewal, expiry and revocation. There is no separate license database or custom key generator.

The extension stores only its key and activation instance ID in `chrome.storage.local`, restricted to trusted extension contexts. It calls this website's licensing proxy. The proxy checks the business and product allowlist and validates the key-instance pair against Dodo. No Instagram records, usernames, session cookies or export files are sent to the licensing service.

Free allows up to 100 records per collection and CSV/JSON export. Pro permits larger collections and existing Excel (.xls), HTML and Markdown exports where supported by the interface. Start/resume and export gates validate paid access online; Direct API mode additionally validates before each page. An already-running browser-assisted collection can finish after revocation, but paid export requires a fresh check. Network errors never grant paid access and never erase a saved key. No offline grace period is implemented.

## 1. Create products in Dodo

Create these products in **Test Mode** first:

| Environment variable | Product type | Payment frequency |
| --- | --- | --- |
| `DODO_PAYMENTS_PRODUCT_MONTHLY` | Recurring | 1 Month |
| `DODO_PAYMENTS_PRODUCT_QUARTERLY` | Recurring | 3 Months |
| `DODO_PAYMENTS_PRODUCT_YEARLY` | Recurring | 1 Year (or 12 Months) |
| `DODO_PAYMENTS_PRODUCT_LIFETIME` | One-time | Not applicable |

Choose the amounts/currency in Dodo. No price is hardcoded in the site and no client-supplied amount/product ID is accepted. The catalog reads base product prices; local currency, discounts and taxes are finalized by Dodo at checkout. Use fixed prices, not usage-based or pay-what-you-want products. Configure subscription duration/renewals as intended in the dashboard; payment frequency and total subscription duration are different settings.

In **Entitlements**, create a **License Key** entitlement and attach it under each product's Advanced Settings → Entitlements & Credits. Set the desired activation limit (e.g. one browser). For subscriptions, leave key duration blank so the subscription lifecycle controls validity. For Lifetime, leave duration blank for a non-expiring key. Review the dashboard's cancellation and refund lifecycle settings and verify them in Test Mode.

Suggested email activation instructions:

> Open IG Export → License & plans. Paste this license key and select Activate license. Deactivate this browser before moving to another browser.

The website disables plans without product configuration and rejects mismatched billing intervals or products without license delivery.

## 2. Configure the website

Copy `.env.example` to `.env.local` for development. Set the same variables in the Vercel project (root directory `website/`) for deployment.

| Variable | Value |
| --- | --- |
| `APP_URL` | `http://localhost:3000` in local Test Mode; `https://igexport.auraflame.tech` in production |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode`, explicitly required |
| `DODO_PAYMENTS_API_KEY` | Server API key from the matching Dodo environment |
| `DODO_PAYMENTS_BUSINESS_ID` | Your Dodo business ID |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Signing secret for this webhook endpoint |
| `DODO_PAYMENTS_CHECKOUT_SECRET` | Random secret, at least 32 characters; generate with `openssl rand -hex 32` |
| Four `DODO_PAYMENTS_PRODUCT_*` variables | Matching product IDs from the table above |
| `CHROME_EXTENSION_IDS` | Comma-separated published and unpacked extension IDs from `chrome://extensions` |

None of these variables use `NEXT_PUBLIC_`. Never put the API key or webhook secret in the extension. Grant the server API key access to product retrieval, checkout sessions, license key/instance retrieval and license operations. Builds do not need populated credentials; unavailable billing configuration disables purchasing without breaking other pages.

## 3. Register the webhook

Endpoint: `https://igexport.auraflame.tech/api/payments/webhook`

For localhost, forward a public HTTPS development tunnel to `/api/payments/webhook` and configure that URL in Dodo's Test Mode dashboard. Keep `APP_URL` on the website origin where checkout is initiated.

Subscribe to `entitlement_grant.delivered`, `entitlement_grant.revoked`, payment success/failure, subscription lifecycle events and refund events available in the dashboard. Copy the endpoint signing key to `DODO_PAYMENTS_WEBHOOK_KEY`.

The endpoint verifies the **raw body** with the official SDK, including timestamp/signature validation, and checks the business ID. It logs only event ID/type and acknowledges receipt. Dodo already updates license status; the handler deliberately does not create another grant, send a duplicate email or maintain an in-memory subscription database. Repeated/out-of-order events are harmless because paid operations query the authoritative Dodo state. The webhook does not push changes to open extension pages.

Configure request rate limits for `/api/payments/checkout` and `/api/license/*` in the hosting provider's firewall before public launch. The application enforces small JSON bodies and validates inputs, but does not implement a distributed rate-limit store.

## 4. Configure the extension

The checked-in billing origin is `https://igexport.auraflame.tech`. It is an **optional** host permission requested when a user activates Pro, used exclusively for licensing. Payment itself occurs on the website.

For local development, from the repository root:

```sh
EXTENSION_BILLING_ORIGIN=http://localhost:3000 node scripts/configure-extension-billing.mjs
```

Reload the unpacked extension and copy its ID into `CHROME_EXTENSION_IDS`. Reload the website after editing environment variables. After a test purchase, use the emailed key in the extension's **License & plans** page. The key is a credential; do not put it in issue trackers or analytics.

Before packaging for production, restore the production origin and reload:

```sh
EXTENSION_BILLING_ORIGIN=https://igexport.auraflame.tech node scripts/configure-extension-billing.mjs
```

Do not ship a localhost origin or Test Mode website configuration. Deactivate test licenses before switching the extension's origin. This script updates only public config and the matching optional host permission.

## 5. Verify end to end

Automated checks (Node.js 22.18+ / 24 recommended):

```sh
# From website/
npm run test:payments
npm run lint
npm run build

# From repository root
node --test scripts/test-extension-license.mjs
```

These tests use mocked provider responses and real SDK signature verification. They do not charge cards or prove dashboard configuration.

Before enabling Live Mode, exercise each of the four products:

1. Confirm the base price and billing period, then complete a Dodo Test Mode checkout.
2. Verify `/checkout/return` confirms payment using the signed HttpOnly checkout cookie and the Checkout Session API. Editing `status=succeeded` in the URL must not grant access. The return page ignores/removes provider query parameters, including any key/email, and directs customers to their email.
3. Verify key delivery, activation, paid collection and export. Free CSV/JSON of at most 100 records should require no licensing network request.
4. Verify an invalid key, a foreign product/merchant key and an exhausted activation limit are rejected. Repeated activation of the same saved key must not consume another slot.
5. Deactivate and reactivate on another browser. A lost activation response can leave a provider-side slot occupied; release that instance in the Dodo dashboard before retrying if needed.
6. Test renewal, cancellation at period end, expiry, refund and manual revocation. Confirm Dodo transitions the key as intended and the next paid check denies inactive access. Do not infer revocation solely from receiving a webhook.
7. Test network failure, webhook retry, bad signature and a pending/failed payment. Existing local data must remain intact; no failed/unverified flow may activate Pro.
8. Create matching Live Mode products and credentials, register the live webhook and update production environment variables. Replace the existing Web Store placeholder links once the extension ID is available.

## Official references

- [Checkout Sessions](https://docs.dodopayments.com/developer-resources/checkout-session)
- [License Keys and entitlements](https://docs.dodopayments.com/features/license-keys)
- [Webhook verification](https://docs.dodopayments.com/developer-resources/webhooks)
- [License validation](https://docs.dodopayments.com/api-reference/licenses/validate-license)
