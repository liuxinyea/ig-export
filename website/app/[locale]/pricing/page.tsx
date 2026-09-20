"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Plan = "monthly" | "quarterly" | "yearly";
type Offer = { plan: Plan; available: boolean; amount?: number; currency?: string; taxInclusive?: boolean };
const paidPlans: Plan[] = ["monthly", "quarterly", "yearly"];

const CHROME_STORE_URL = "https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID";
const tierKey = { monthly: "tierMonthly", quarterly: "tierQuarterly", yearly: "tierYearly" } as const;

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

  function formatPrice(offer?: Offer) {
    if (!offers) return t("loading");
    if (!offer?.available || offer.amount === undefined || !offer.currency) return t("unavailable");
    const formatter = new Intl.NumberFormat(locale, { style: "currency", currency: offer.currency });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(offer.amount / 10 ** digits);
  }

  function offerFor(plan: Plan): Offer | undefined {
    return offers?.find((o) => o.plan === plan);
  }

  const freePlan = {
    key: "free" as const,
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
    iconBg: "bg-gray-100 text-gray-600",
    price: t("freePrice"),
    period: t("freePeriod"),
    description: t("freeDescription"),
    features: t.raw("freeFeatures") as string[],
    checkColor: "text-gray-400",
    cta: t("freeCta"),
  };

  const paidMeta: Record<Plan, { badge?: string; badgeClass?: string; featured?: boolean; icon: React.ReactNode; iconBg: string }> = {
    monthly: {
      badge: t("mostPopular"), badgeClass: "bg-blue-600", featured: true,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      iconBg: "bg-blue-100 text-blue-600",
    },
    quarterly: {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      iconBg: "bg-purple-100 text-purple-600",
    },
    yearly: {
      badge: t("bestValue"), badgeClass: "bg-amber-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      iconBg: "bg-amber-100 text-amber-600",
    },
  };

  const paidPlansData = paidPlans.map((plan) => ({
    key: plan,
    title: t(tierKey[plan] as never),
    description: t(`${plan}Description` as never),
    price: formatPrice(offerFor(plan)),
    period: t("oneTimePayment"),
    features: t.raw("paidFeatures") as string[],
    checkColor: "text-blue-500",
    cta: t("buyCta"),
    offer: offerFor(plan),
    ...paidMeta[plan],
  }));

  const allPlans = [freePlan, ...paidPlansData];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-5 text-lg text-gray-600">{t("description")}</p>
        </div>

        {/* 4-Tier Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {allPlans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl p-8 ${
                "featured" in plan && plan.featured
                  ? "border-2 border-blue-600 bg-white shadow-xl shadow-blue-600/8 ring-1 ring-blue-600/10"
                  : "border border-gray-200 bg-white shadow-sm"
              }`}
            >
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`inline-block rounded-full ${plan.badgeClass} px-4 py-1 text-xs font-semibold text-white tracking-wide uppercase shadow-md`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-1 mt-1">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${plan.iconBg}`}>
                  {plan.icon}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{plan.key === "free" ? t("tierFree") : plan.title}</h2>
              </div>
              <p className="text-sm text-gray-500 mt-2 mb-4">{plan.description}</p>

              <p className="mt-2">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="ml-1 block text-sm text-gray-500 mt-1">{plan.period}</span>
              </p>

              <ul className="mt-8 space-y-3 text-sm text-gray-600 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plan.checkColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.key === "free" ? (
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  {plan.cta}
                </a>
              ) : "offer" in plan ? (
                <>
                  <button
                    disabled={!plan.offer?.available || busy !== null}
                    onClick={() => checkout(plan.key as Plan)}
                    className={`mt-8 w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed ${
                      "featured" in plan && plan.featured
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                        : "border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 disabled:border-gray-200"
                    }`}
                  >
                    {busy === plan.key ? t("redirecting") : plan.cta}
                  </button>
                  <p className="mt-3 text-xs text-center text-gray-500">
                    {plan.offer?.available ? t(plan.offer.taxInclusive ? "taxIncluded" : "taxCheckout") : t("notConfigured")}
                  </p>
                </>
              ) : (
                <div className="mt-8" />
              )}
            </div>
          ))}
        </div>

        {error && <p role="alert" className="mt-6 text-center text-red-700">{error}</p>}

        {/* Activation / Validity / Limits */}
        <div className="max-w-3xl mx-auto mt-16 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">{t("activationTitle")}</h2>
            <p className="mt-2 text-gray-600">{t("activationDescription")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900">{t("validityTitle")}</h2>
            <p className="mt-2 text-gray-600">{t("validityDescription")}</p>
          </section>
          <p className="text-sm text-gray-500">{t("limitsNote")}</p>
        </div>
      </div>
    </div>
  );
}
