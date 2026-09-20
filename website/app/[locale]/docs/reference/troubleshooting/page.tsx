import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { DocLayout } from "@/app/[locale]/docs/overview/introduction/page";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://igexport.auraflame.tech";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "troubleshootingPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `/${locale}/docs/reference/troubleshooting` },
  };
}

export default async function TroubleshootingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "troubleshootingPage" });
  const itemIds = ["11", "12", "13", "14", "21", "22", "23", "31", "32", "33", "41", "42", "43"];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: itemIds.map((id) => ({
            "@type": "Question",
            name: t(`ts${id}Question`),
            acceptedAnswer: { "@type": "Answer", text: t(`ts${id}Answer`) },
          })),
        }}
      />
      <DocLayout>
        <TroubleshootingContent />
      </DocLayout>
    </>
  );
}

function TroubleshootingContent() {
  const t = useTranslations("troubleshootingPage");
  return (
    <article>
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{t("title")}</h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">{t("description")}</p>
      </header>

      {/* Section 1: Export issues */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("section1Title")}</h2>
        <p className="text-gray-600 mb-6">{t("section1Intro")}</p>
        <div className="space-y-3">{renderFaqs(["11", "12", "13", "14"], t)}</div>
      </section>

      {/* Section 2: License */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("section2Title")}</h2>
        <p className="text-gray-600 mb-6">{t("section2Intro")}</p>
        <div className="space-y-3">{renderFaqs(["21", "22", "23"], t)}</div>
      </section>

      {/* Section 3: Formats */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("section3Title")}</h2>
        <div className="space-y-3">{renderFaqs(["31", "32", "33"], t)}</div>
      </section>

      {/* Section 4: Privacy */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("section4Title")}</h2>
        <div className="space-y-3">{renderFaqs(["41", "42", "43"], t)}</div>
      </section>

      <section className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-sm text-gray-700 leading-relaxed">
          <Link href="/support" className="text-blue-700 font-semibold hover:text-blue-800">
            {t("contactCta")} →
          </Link>
        </p>
      </section>
    </article>
  );
}

function renderFaqs(ids: string[], t: ReturnType<typeof useTranslations>) {
  return ids.map((id) => (
    <details key={id} className="group rounded-2xl border border-gray-200 bg-white open:border-blue-200 open:shadow-lg open:shadow-blue-100/50 transition-all">
      <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
        {t(`ts${id}Question`)}
        <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </summary>
      <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{t(`ts${id}Answer`)}</div>
    </details>
  ));
}