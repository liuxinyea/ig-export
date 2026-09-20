import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://igexport.auraflame.tech";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "introPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `/${locale}/docs/overview/introduction` },
  };
}

export default async function IntroductionPage({ params }: PageProps) {
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
            { "@type": "ListItem", position: 2, name: "Docs", item: `${SITE_URL}/${locale}/docs/overview/introduction` },
            { "@type": "ListItem", position: 3, name: "Introduction", item: `${SITE_URL}/${locale}/docs/overview/introduction` },
          ],
        }}
      />
      <DocLayout>
        <IntroductionContent />
      </DocLayout>
    </>
  );
}

export function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}

function IntroductionContent() {
  const t = useTranslations("introPage");
  return (
    <article className="prose-doc">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{t("title")}</h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">{t("description")}</p>
      </header>

      <Section title={t("whatTitle")}>
        <p className="text-gray-600 leading-relaxed">{t("whatBody")}</p>
      </Section>

      <Section title={t("conceptsTitle")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{t(`concept${n}Title`)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(`concept${n}Body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("audienceTitle")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-6 rounded-2xl border border-gray-100 bg-white">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{t(`audience${n}Title`)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(`audience${n}Body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("nextTitle")}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NextLink href="/docs/overview/quick-start" title={t("next1Title")} body={t("next1Body")} />
          <NextLink href="/docs/reference/supported-fields" title={t("next2Title")} body={t("next2Body")} />
          <NextLink href="/pricing" title={t("next3Title")} body={t("next3Body")} />
        </div>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{title}</h2>
      {children}
    </section>
  );
}

function NextLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href as never}
      className="group p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">→</span>
    </Link>
  );
}