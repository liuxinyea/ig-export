"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function PricingContent() {
  const t = useTranslations("pricing");
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: t("freePlan"),
      price: t("freePrice"),
      period: t("freePeriod"),
      description: t("freeDescription"),
      features: [
        t("freeFeature1"),
        t("freeFeature2"),
        t("freeFeature3"),
        t("freeFeature4"),
        t("freeFeature5"),
      ],
      cta: t("freeCta"),
      ctaLink: "https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID",
      popular: false,
    },
    {
      name: t("proPlan"),
      price: isAnnual ? "$6.6" : "$9.9",
      period: isAnnual ? t("proAnnualPeriod") : t("proPeriod"),
      annualPrice: !isAnnual ? t("proAnnualPrice") : undefined,
      description: t("proDescription"),
      features: [
        t("proFeature1"),
        t("proFeature2"),
        t("proFeature3"),
        t("proFeature4"),
        t("proFeature5"),
        t("proFeature6"),
        t("proFeature7"),
      ],
      cta: t("proCta"),
      ctaLink: "#",
      popular: true,
    },
    {
      name: t("lifetimePlan"),
      price: t("lifetimePrice"),
      period: t("lifetimePeriod"),
      description: t("lifetimeDescription"),
      features: [
        t("lifetimeFeature1"),
        t("lifetimeFeature2"),
        t("lifetimeFeature3"),
        t("lifetimeFeature4"),
        t("lifetimeFeature5"),
        t("lifetimeFeature6"),
      ],
      cta: t("lifetimeCta"),
      ctaLink: "#",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("description")}
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}
            >
              {t("monthly")}
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}
            >
              {t("annual")}
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t("savePercent", { percent: 33 })}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.popular
                  ? "border-blue-500 shadow-xl scale-105"
                  : "border-gray-200 hover:border-gray-300"
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                    {t("mostPopular")}
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>
                {plan.annualPrice && (
                  <p className="mt-2 text-sm text-gray-500">
                    {plan.annualPrice}
                  </p>
                )}
                <p className="mt-4 text-gray-600">{plan.description}</p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href={plan.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t("faqTitle")}
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("faq1Question")}
              </h3>
              <p className="text-gray-600">{t("faq1Answer")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("faq2Question")}
              </h3>
              <p className="text-gray-600">{t("faq2Answer")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("faq3Question")}
              </h3>
              <p className="text-gray-600">{t("faq3Answer")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("faq4Question")}
              </h3>
              <p className="text-gray-600">{t("faq4Answer")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
