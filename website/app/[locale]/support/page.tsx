import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";

const SUPPORT_EMAIL = "support@igexport.auraflame.tech";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "supportPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `/${locale}/support` },
  };
}

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "supportPage" });
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [1, 2, 3, 4, 5].map((i) => ({
            "@type": "Question",
            name: t(`ts${i}Question`),
            acceptedAnswer: { "@type": "Answer", text: t(`ts${i}Answer`) },
          })).concat(
            [1, 2, 3, 4].map((i) => ({
              "@type": "Question",
              name: t(`bill${i}Question`),
              acceptedAnswer: { "@type": "Answer", text: t(`bill${i}Answer`) },
            }))
          ),
        }}
      />
      <SupportContent />
    </>
  );
}

function SupportContent() {
  const t = useTranslations("supportPage");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">{t("description")}</p>
        </div>

        {/* Getting Started */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("gettingStartedTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold mb-4">
                  {n}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t(`gs${n}Title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`gs${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("troubleshootingTitle")}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <details key={i} className="group rounded-2xl border border-gray-200 bg-white open:border-blue-200 open:shadow-lg open:shadow-blue-100/50 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {t(`ts${i}Question`)}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{t(`ts${i}Answer`)}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Billing & Licenses */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("billingTitle")}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <details key={i} className="group rounded-2xl border border-gray-200 bg-white open:border-blue-200 open:shadow-lg open:shadow-blue-100/50 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {t(`bill${i}Question`)}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{t(`bill${i}Answer`)}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-center">
          <h2 className="text-2xl font-bold">{t("contactTitle")}</h2>
          <p className="mt-3 text-blue-100 text-sm leading-relaxed max-w-2xl mx-auto">{t("contactDescription")}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 text-base font-semibold hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {t("contactCta")}
          </a>
        </section>
      </div>
    </div>
  );
}
