import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { DocLayout } from "@/app/[locale]/docs/overview/introduction/page";

const SITE_URL = "https://igexport.auraflame.tech";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quickStartPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `/${locale}/docs/overview/quick-start` },
  };
}

export default async function QuickStartPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "IG Export", item: `${SITE_URL}/${locale}` },
            { "@type": "ListItem", position: 2, name: "Quick Start", item: `${SITE_URL}/${locale}/docs/overview/quick-start` },
          ],
        }}
      />
      <DocLayout>
        <QuickStartContent />
      </DocLayout>
    </>
  );
}

function QuickStartContent() {
  const t = useTranslations("quickStartPage");
  return (
    <article>
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{t("title")}</h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">{t("description")}</p>
      </header>

      <ol className="space-y-6 mb-16">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className="flex gap-5">
            <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg shadow-md shadow-blue-600/20">
              {n}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(`step${n}Title`)}</h3>
              <p className="text-gray-600 leading-relaxed">{t(`step${n}Body`)}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("nextTitle")}</h2>
        <ul className="space-y-2 text-gray-700">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {t(`next${n}Body`)}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}