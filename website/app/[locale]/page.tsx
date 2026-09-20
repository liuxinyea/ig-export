import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
const SITE_URL = "https://igexport.auraflame.tech";
const CHROME_STORE_URL = "https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh ? "IG Export — Instagram 粉丝导出工具" : "IG Export — Export Instagram Followers to CSV",
    description: isZh
      ? "本地优先的 Chrome 扩展，一键导出 Instagram 粉丝和关注列表到 CSV、JSON、Excel。数据不出浏览器。"
      : "Local-first Chrome extension to export Instagram followers & following lists to CSV, JSON and Excel. Your data never leaves your browser.",
    alternates: {
      canonical: `/${locale}`,
    },
  };
}

const FAQ_EN: [string, string][] = [
  [
    "How do I export Instagram followers to CSV?",
    "Install the IG Export Chrome extension, open any public Instagram profile, choose followers or following, and click Export. Your list downloads as a clean CSV file — no account or spreadsheet cleanup needed.",
  ],
  [
    "Can I export an Instagram following list to Excel?",
    "Yes. IG Export supports CSV, JSON, HTML, Markdown and Excel (.xls) formats, so you can open your exported follower lists directly in Excel, Google Sheets or Numbers.",
  ],
  [
    "Is IG Export free?",
    "Yes, there is a free plan with limited exports that never expires. Pro unlocks unlimited exports, all formats, complete data fields, and project management with tags.",
  ],
  [
    "Does my Instagram data leave my browser?",
    "No. IG Export is local-first: all parsing and export happen inside your browser. Your exported files and lead projects are stored locally, never uploaded to a server.",
  ],
  [
    "What data fields can I export about each follower?",
    "Username, full name, bio, profile link, website, follower count, following count, post count, verified status, private/public status, and more on Pro.",
  ],
  [
    "Is it safe to use an Instagram export tool?",
    "IG Export reads only public profile data from your own logged-in browser session, processes it locally, and requires no passwords or API keys. Use it responsibly and in line with Instagram's terms.",
  ],
  [
    "Can I use exported follower lists for lead generation?",
    "Yes. Marketers use IG Export to build prospect lists — export a competitor's or niche audience, filter by bio keywords and websites, then organize leads with tags and projects.",
  ],
  [
    "Do I need an Instagram account to export data?",
    "You browse Instagram as usual in your own browser; IG Export needs no separate account, login, or password — and no IG Export account is required to start on the free plan.",
  ],
];

const FAQ_ZH: [string, string][] = [
  [
    "如何把 Instagram 粉丝导出为 CSV？",
    "安装 IG Export Chrome 扩展，打开任意公开的 Instagram 主页，选择粉丝或关注列表，点击导出，即可获得结构化的 CSV 文件，无需手动整理。",
  ],
  [
    "可以把 Instagram 关注列表导出到 Excel 吗？",
    "可以。IG Export 支持 CSV、JSON、HTML、Markdown 和 Excel（.xls）格式，导出的粉丝列表可以直接在 Excel、Google Sheets 或 Numbers 中打开。",
  ],
  [
    "IG Export 是免费的吗？",
    "是的。免费版永久有效，包含限额内的导出次数。Pro 版解锁无限导出、全部格式、完整字段以及标签和项目管理能力。",
  ],
  [
    "我的 Instagram 数据会离开浏览器吗？",
    "不会。IG Export 采用本地优先架构：解析和导出全部在你的浏览器内完成，导出文件和线索项目仅存储在本地，绝不上传到服务器。",
  ],
  [
    "每个粉丝可以导出哪些字段？",
    "用户名、姓名、简介、主页链接、网站、粉丝数、关注数、帖子数、认证状态、公开/私密状态，Pro 版包含更多字段。",
  ],
  [
    "使用 Instagram 导出工具安全吗？",
    "IG Export 只读取你当前浏览器会话中的公开主页数据，全程本地处理，无需密码或 API Key。请合理使用并遵守 Instagram 的服务条款。",
  ],
  [
    "导出的粉丝列表可以用来获客吗？",
    "可以。营销人员常用 IG Export 建立潜客名单：导出竞品或垂直领域的受众，按简介关键词和网站筛选，再用标签和项目整理线索。",
  ],
  [
    "导出数据需要注册账号吗？",
    "不需要。你只需像平时一样在自己浏览器中浏览 Instagram，IG Export 无需单独注册账号、登录或密码，免费版开箱即用。",
  ],
];

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const faq = locale === "zh" ? FAQ_ZH : FAQ_EN;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "IG Export",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          url: SITE_URL,
          description:
            "Local-first Chrome extension to export Instagram followers & following lists to CSV, JSON and Excel.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Export Instagram followers & following lists",
            "CSV, JSON, Excel, HTML and Markdown export",
            "Local-first data processing",
            "Multi-language Instagram UI support",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }}
      />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-pink-200/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              {t("heroBadge")}
            </div>

            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              {t("heroTitle1")}
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("heroDescription")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t("installCta")}
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                {t("learnMore")}
              </a>
            </div>
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t("trustLocal")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t("trustFree")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t("trustNoAccount")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t("featuresTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t("featuresDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "bolt", color: "blue", title: "feature1Title", desc: "feature1Desc" },
              { icon: "table", color: "green", title: "feature2Title", desc: "feature2Desc" },
              { icon: "tag", color: "purple", title: "feature3Title", desc: "feature3Desc" },
              { icon: "download", color: "orange", title: "feature4Title", desc: "feature4Desc" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group text-center p-8 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${feature.color === "blue" ? "bg-blue-100" : feature.color === "green" ? "bg-green-100" : feature.color === "purple" ? "bg-purple-100" : "bg-orange-100"} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon === "bolt" && (
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {feature.icon === "table" && (
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  )}
                  {feature.icon === "tag" && (
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  )}
                  {feature.icon === "download" && (
                    <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(feature.title as never)}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t(feature.desc as never)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t("howItWorksTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("howItWorksDescription")}
            </p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="text-center relative">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-blue-600/25 mx-auto mb-5">
                    {step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`step${step}Title` as never)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`step${step}Desc` as never)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases — SEO long-tail coverage */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t("useCasesTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t("useCasesDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "megaphone", title: "useCase1Title", desc: "useCase1Desc" },
              { icon: "search", title: "useCase2Title", desc: "useCase2Desc" },
              { icon: "target", title: "useCase3Title", desc: "useCase3Desc" },
              { icon: "chart", title: "useCase4Title", desc: "useCase4Desc" },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="flex gap-5 p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
                  {useCase.icon === "megaphone" && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.7a2 2 0 01-3.414 1.414L4 17.7M7.586 8.7l7.5-7.5M11 5.882l4.62 1.67a2 2 0 001.234 1.964l3.328 1.204a1 1 0 01.364 1.641l-9.5 9.5a1 1 0 01-1.641-.364l-1.204-3.328a2 2 0 00-1.964-1.234l-1.67-4.62z" /></svg>
                  )}
                  {useCase.icon === "search" && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  )}
                  {useCase.icon === "target" && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  {useCase.icon === "chart" && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(useCase.title as never)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(useCase.desc as never)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Fields — captures "what data can I export" searches */}
      <section className="py-20 sm:py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {t("dataFieldsTitle")}
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t("dataFieldsDescription")}
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t("dataFieldsNote")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "field1", "field2", "field3", "field4", "field5", "field6", "field7", "field8",
              ].map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
                >
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {t(`dataFields.${field}` as never)}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/docs/reference/supported-fields" className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700">
                {t("fieldsLink")} →
              </Link>
              <Link href="/ig-follower-export-tool" className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700">
                {t("toolLink")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — long-tail question keywords + FAQPage schema */}
      <section id="faq" className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t("faqTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("faqDescription")}
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <details
                key={item}
                className="group rounded-2xl border border-gray-200 bg-gray-50/50 open:bg-white open:border-blue-200 open:shadow-lg open:shadow-blue-100/50 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {t(`faq${item}Question` as never)}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                  {t(`faq${item}Answer` as never)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" aria-hidden="true" />
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t("ctaDescription")}
          </p>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            {t("ctaButton")}
          </a>
        </div>
      </section>
    </div>
  );
}
