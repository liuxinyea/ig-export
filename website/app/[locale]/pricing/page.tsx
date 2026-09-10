"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Plan = "monthly" | "quarterly" | "yearly" | "lifetime";
type Offer = { plan: Plan; available: boolean; amount?: number; currency?: string; taxInclusive?: boolean };
const plans: Plan[] = ["monthly", "quarterly", "yearly", "lifetime"];

export default function PricingPage() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [busy, setBusy] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/payments/catalog", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { if (mounted) setOffers(data.plans); })
      .catch(() => { if (mounted) { setOffers([]); setError(t("unavailable")); } });
    return () => { mounted = false; };
  }, [t]);

  async function checkout(plan: Plan) {
    setBusy(plan); setError("");
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, locale }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error();
      window.location.assign(data.checkoutUrl);
    } catch { setError(t("checkoutError")); setBusy(null); }
  }

  function price(offer?: Offer) {
    if (!offers) return t("loading");
    if (!offer?.available || offer.amount === undefined || !offer.currency) return t("unavailable");
    const formatter = new Intl.NumberFormat(locale, { style: "currency", currency: offer.currency });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(offer.amount / 10 ** digits);
  }

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/40 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-blue-600 font-semibold mb-3">IG Export Pro</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mt-5 text-lg text-gray-600">{t("description")}</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const offer = offers?.find((item) => item.plan === plan);
            return (
              <article key={plan} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">{t(plan)}</h2>
                <p className="mt-6 text-3xl font-bold text-gray-900">{price(offer)}</p>
                <p className="mt-2 text-sm text-gray-500">{t(`${plan}Period`)}</p>
                <ul className="my-8 space-y-3 text-sm text-gray-600 flex-1">
                  <li>{t("featureLimit")}</li><li>{t("featureFormats")}</li><li>{t("featureLocal")}</li><li>{t("featureLicense")}</li>
                </ul>
                <button disabled={!offer?.available || busy !== null} onClick={() => checkout(plan)} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
                  {busy === plan ? t("redirecting") : t("buy")}
                </button>
                <p className="mt-3 text-xs text-gray-500">{offer?.available ? t(offer.taxInclusive ? "taxIncluded" : "taxCheckout") : t("notConfigured")}</p>
              </article>
            );
          })}
        </div>
        {error && <p role="alert" className="mt-6 text-center text-red-700">{error}</p>}
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-7">
          <h2 className="text-xl font-semibold text-gray-900">{t("freeTitle")}</h2>
          <p className="mt-2 text-gray-600">{t("freeDescription")}</p>
        </section>
        <div className="max-w-3xl mx-auto mt-14 space-y-8">
          <section><h2 className="text-xl font-semibold">{t("activationTitle")}</h2><p className="mt-2 text-gray-600">{t("activationDescription")}</p></section>
          <section><h2 className="text-xl font-semibold">{t("renewalTitle")}</h2><p className="mt-2 text-gray-600">{t("renewalDescription")}</p></section>
          <p className="text-sm text-gray-500">{t("limitsNote")}</p>
        </div>
      </div>
    </div>
  );
}
