import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://igexport.auraflame.tech";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fieldsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `/${locale}/docs/reference/supported-fields` },
  };
}

export default async function FieldsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "fieldsPage" });
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "IG Export", item: `${SITE_URL}/${locale}` },
            { "@type": "ListItem", position: 2, name: "Docs", item: `${SITE_URL}/${locale}/docs/reference/supported-fields` },
            { "@type": "ListItem", position: 3, name: "Supported Fields", item: `${SITE_URL}/${locale}/docs/reference/supported-fields` },
          ],
        }}
      />
      <FieldsContent />
    </>
  );
}

function FieldsContent() {
  const t = useTranslations("fieldsPage");
  const rows = t.raw("rows") as [string, string, string, string][];

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-5 text-lg text-gray-600">{t("description")}</p>
          <p className="mt-4 text-gray-600 leading-relaxed">{t("intro")}</p>
        </div>

        {/* Fields table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-900">
                <th className="px-5 py-4 font-semibold border-b border-gray-200">{t("tableField")}</th>
                <th className="px-5 py-4 font-semibold border-b border-gray-200">{t("tableDescription")}</th>
                <th className="px-5 py-4 font-semibold border-b border-gray-200">{t("tableExample")}</th>
                <th className="px-5 py-4 font-semibold border-b border-gray-200 whitespace-nowrap">{t("tablePlan")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([field, description, example, plan]) => (
                <tr key={field} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-mono text-blue-700 font-medium border-b border-gray-100 whitespace-nowrap">
                    {field}
                  </td>
                  <td className="px-5 py-4 text-gray-600 border-b border-gray-100">{description}</td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs border-b border-gray-100 break-all">{example}</td>
                  <td className="px-5 py-4 border-b border-gray-100">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                        plan === "pro"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {plan === "pro" ? t("planPro") : t("planAll")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formats */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("formatsTitle")}</h2>
          <p className="text-gray-600 mb-8">{t("formatsDescription")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100/50 transition-all">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t(`format${n}Title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`format${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("notesTitle")}</h2>
          <ul className="space-y-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t(`note${n}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
